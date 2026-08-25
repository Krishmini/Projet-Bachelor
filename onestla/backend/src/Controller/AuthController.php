<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;

#[Route('/api')]
class AuthController extends AbstractController
{
    #[Route('/register', name: 'api_register', methods: ['POST'])]
    public function register(
        Request $request,
        EntityManagerInterface $em,
        UserPasswordHasherInterface $hasher,
        ValidatorInterface $validator
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (!$data || !isset($data['email'], $data['password'], $data['nom'], $data['prenom'])) {
            return $this->json(['error' => 'Données manquantes (email, password, nom, prenom requis).'], 400);
        }

        // Vérifier si l'email existe déjà
        $existing = $em->getRepository(User::class)->findOneBy(['email' => $data['email']]);
        if ($existing) {
            return $this->json(['error' => 'Cet email est déjà utilisé.'], 409);
        }

        $user = new User();
        $user->setEmail($data['email']);
        $user->setNom($data['nom']);
        $user->setPrenom($data['prenom']);
        $user->setPassword($hasher->hashPassword($user, $data['password']));

        $errors = $validator->validate($user);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = $error->getMessage();
            }
            return $this->json(['errors' => $errorMessages], 400);
        }

        $em->persist($user);
        $em->flush();

        return $this->json([
            'message' => 'Compte créé avec succès.',
            'user' => [
                'id'     => $user->getId(),
                'email'  => $user->getEmail(),
                'nom'    => $user->getNom(),
                'prenom' => $user->getPrenom(),
                'roles'  => $user->getRoles(),
            ],
        ], 201);
    }

    /**
     * Le vrai endpoint /api/login est géré automatiquement par lexik/jwt-authentication-bundle
     * via security.yaml (json_login). Ce endpoint /api/me retourne le profil courant.
     */
    #[Route('/me', name: 'api_me', methods: ['GET'])]
    public function me(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Non authentifié.'], 401);
        }

        return $this->json([
            'id'         => $user->getId(),
            'email'      => $user->getEmail(),
            'nom'        => $user->getNom(),
            'prenom'     => $user->getPrenom(),
            'roles'      => $user->getRoles(),
            'isVerified' => $user->isVerified(),
        ]);
    }

    #[Route('/profile', name: 'api_profile_update', methods: ['PUT'])]
    public function updateProfile(
        Request $request,
        EntityManagerInterface $em,
        UserPasswordHasherInterface $hasher
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Non authentifié.'], 401);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['nom']))    $user->setNom($data['nom']);
        if (isset($data['prenom'])) $user->setPrenom($data['prenom']);
        if (isset($data['email']))  $user->setEmail($data['email']);
        if (isset($data['password']) && $data['password'] !== '') {
            $user->setPassword($hasher->hashPassword($user, $data['password']));
        }

        $em->flush();

        return $this->json(['message' => 'Profil mis à jour avec succès.']);
    }

    #[Route(
    '/forgot-password',
    name: 'api_forgot_password',
    methods: ['POST']
)]
public function forgotPassword(
    Request $request,
    UserRepository $userRepository,
    EntityManagerInterface $entityManager,
    MailerInterface $mailer,
    #[Autowire('%env(FRONTEND_URL)%')]
    string $frontendUrl
): JsonResponse {
    $data = json_decode($request->getContent(), true);
    $emailAddress = trim($data['email'] ?? '');

    if (
        $emailAddress === '' ||
        !filter_var($emailAddress, FILTER_VALIDATE_EMAIL)
    ) {
        return $this->json([
            'error' => 'Veuillez saisir une adresse e-mail valide.'
        ], 400);
    }

    $user = $userRepository->findOneBy([
        'email' => $emailAddress
    ]);

    if (!$user) {
        return $this->json([
            'message' =>
                'Si un compte correspond à cette adresse, un lien de réinitialisation a été envoyé.'
        ]);
    }

    // Token envoyé par e-mail
    $rawToken = bin2hex(random_bytes(32));

    // Seule la version hachée est conservée en base de données
    $hashedToken = hash('sha256', $rawToken);

    $user->setResetToken($hashedToken);
    $user->setResetTokenExpiresAt(
        new \DateTimeImmutable('+1 hour')
    );

    $entityManager->flush();

    $resetLink = sprintf(
        '%s/reinitialiser-mot-de-passe?token=%s',
        rtrim($frontendUrl, '/'),
        urlencode($rawToken)
    );

    $email = (new Email())
        ->from('krimini2005@gmail.com')
        ->to($user->getEmail())
        ->subject('Réinitialisation de votre mot de passe - OnEstLà')
        ->text(
            "Bonjour {$user->getPrenom()},\n\n" .
            "Vous avez demandé à réinitialiser votre mot de passe.\n\n" .
            "Cliquez sur ce lien :\n{$resetLink}\n\n" .
            "Ce lien est valable pendant une heure.\n\n" .
            "Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.\n\n" .
            "L'équipe OnEstLà"
        );

    $mailer->send($email);

    return $this->json([
        'message' =>
            'Si un compte correspond à cette adresse, un lien de réinitialisation a été envoyé.'
    ]);
}

#[Route(
    '/reset-password',
    name: 'api_reset_password',
    methods: ['POST']
)]
public function resetPassword(
    Request $request,
    UserRepository $userRepository,
    EntityManagerInterface $entityManager,
    UserPasswordHasherInterface $passwordHasher
): JsonResponse {
    $data = json_decode($request->getContent(), true);

    $rawToken = trim($data['token'] ?? '');
    $newPassword = $data['password'] ?? '';

    if ($rawToken === '' || $newPassword === '') {
        return $this->json([
            'error' => 'Le token et le nouveau mot de passe sont obligatoires.'
        ], 400);
    }

    if (strlen($newPassword) < 8) {
        return $this->json([
            'error' =>
                'Le mot de passe doit contenir au minimum 8 caractères.'
        ], 400);
    }

    $hashedToken = hash('sha256', $rawToken);

    $user = $userRepository->findOneBy([
        'resetToken' => $hashedToken
    ]);

    if (
        !$user ||
        !$user->getResetTokenExpiresAt() ||
        $user->getResetTokenExpiresAt() < new \DateTimeImmutable()
    ) {
        return $this->json([
            'error' =>
                'Ce lien de réinitialisation est invalide ou a expiré.'
        ], 400);
    }

    $user->setPassword(
        $passwordHasher->hashPassword(
            $user,
            $newPassword
        )
    );

    // Le token ne peut plus être réutilisé
    $user->setResetToken(null);
    $user->setResetTokenExpiresAt(null);

    $entityManager->flush();

    return $this->json([
        'message' =>
            'Votre mot de passe a bien été modifié. Vous pouvez maintenant vous connecter.'
    ]);
}

#[Route('/profile', name: 'api_profile_delete', methods: ['DELETE'])]
public function deleteProfile(EntityManagerInterface $em): JsonResponse
{
    /** @var User|null $user */
    $user = $this->getUser();

    if (!$user) {
        return $this->json(['error' => 'Non authentifié.'], 401);
    }

    // Les demandes doivent être supprimées avant le compte,
    // car leur relation avec l'utilisateur n'accepte pas null.
    foreach ($user->getDemandesAide()->toArray() as $demande) {
        $em->remove($demande);
    }

    $em->remove($user);
    $em->flush();

    return $this->json([
        'message' => 'Votre compte et vos demandes ont été supprimés.'
    ]);
}
}
