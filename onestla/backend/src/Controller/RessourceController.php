<?php

namespace App\Controller;
use App\Entity\User;
use App\Entity\Ressource;
use App\Repository\RessourceRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api')]
class RessourceController extends AbstractController
{
    /**
     * GET /api/ressources
     * Retourne les ressources publiées.
     */
    #[Route(
        '/ressources',
        name: 'api_ressources_list',
        methods: ['GET']
    )]
    public function list(
        Request $request,
        RessourceRepository $repo
    ): JsonResponse {
        $categorie = $request->query->get('categorie');
        $localisation = $request->query->get('localisation');

        $ressources = $repo->findValidated(
            $categorie ?: null,
            $localisation ?: null
        );

        return $this->json(
            array_map(
                fn (Ressource $ressource) =>
                    $this->serialize($ressource),
                $ressources
            )
        );
    }

    /**
     * GET /api/ressources/{id}
     * Affiche le détail d’une ressource publiée.
     */
    #[Route(
        '/ressources/{id}',
        name: 'api_ressource_show',
        methods: ['GET']
    )]
    public function show(
        int $id,
        RessourceRepository $repo
    ): JsonResponse {
        $ressource = $repo->find($id);

        if (
            !$ressource ||
            !$ressource->isValidated()
        ) {
            return $this->json(
                ['error' => 'Ressource introuvable.'],
                404
            );
        }

        return $this->json(
            $this->serialize($ressource)
        );
    }

    // ADMIN : RESSOURCES

    /**
     * GET /api/admin/ressources
     * Liste toutes les ressources.
     */
    #[Route(
        '/admin/ressources',
        name: 'api_admin_ressources_list',
        methods: ['GET']
    )]
    public function adminList(
        RessourceRepository $repo
    ): JsonResponse {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $ressources = $repo->findAllOrderedByDate();

        return $this->json(
            array_map(
                fn (Ressource $ressource) =>
                    $this->serialize($ressource),
                $ressources
            )
        );
    }

    /**
     * POST /api/admin/ressources
     * Création d’une ressource.
     */
    #[Route(
        '/admin/ressources',
        name: 'api_admin_ressource_create',
        methods: ['POST']
    )]
    public function create(
        Request $request,
        EntityManagerInterface $em
    ): JsonResponse {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $data = json_decode(
            $request->getContent(),
            true
        );

        if (
            !$data ||
            !isset(
                $data['titre'],
                $data['description'],
                $data['categorie']
            )
        ) {
            return $this->json(
                [
                    'error' =>
                        'Données manquantes : titre, description ou catégorie.',
                ],
                400
            );
        }

        $ressource = new Ressource();

        $ressource->setTitre($data['titre']);
        $ressource->setDescription(
            $data['description']
        );
        $ressource->setContenu(
            $data['contenu'] ?? null
        );
        $ressource->setCategorie(
            $data['categorie']
        );
        $ressource->setIsValidated(
            $data['isValidated'] ?? false
        );

        /*
         * Localisation
         */
        $ressource->setVille(
            !empty($data['ville'])
                ? trim($data['ville'])
                : null
        );

        $ressource->setCodePostal(
            !empty($data['codePostal'])
                ? trim($data['codePostal'])
                : null
        );

        $ressource->setCreatedBy(
            $this->getUser()
        );

        $em->persist($ressource);
        $em->flush();

        return $this->json(
            $this->serialize($ressource),
            201
        );
    }

    /**
     * PUT /api/admin/ressources/{id}
     * Modification d’une ressource.
     */
    #[Route(
        '/admin/ressources/{id}',
        name: 'api_admin_ressource_update',
        methods: ['PUT']
    )]
    public function update(
        int $id,
        Request $request,
        EntityManagerInterface $em,
        RessourceRepository $repo
    ): JsonResponse {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $ressource = $repo->find($id);

        if (!$ressource) {
            return $this->json(
                ['error' => 'Ressource introuvable.'],
                404
            );
        }

        $data = json_decode(
            $request->getContent(),
            true
        );

        if (!is_array($data)) {
            return $this->json(
                ['error' => 'Données JSON invalides.'],
                400
            );
        }

        if (isset($data['titre'])) {
            $ressource->setTitre(
                $data['titre']
            );
        }

        if (isset($data['description'])) {
            $ressource->setDescription(
                $data['description']
            );
        }

        if (array_key_exists('contenu', $data)) {
            $ressource->setContenu(
                $data['contenu']
            );
        }

        if (isset($data['categorie'])) {
            $ressource->setCategorie(
                $data['categorie']
            );
        }

        if (isset($data['isValidated'])) {
            $ressource->setIsValidated(
                (bool) $data['isValidated']
            );
        }

        /*
         * Modification de la localisation
         */
        if (array_key_exists('ville', $data)) {
            $ville = trim(
                (string) ($data['ville'] ?? '')
            );

            $ressource->setVille(
                $ville !== '' ? $ville : null
            );
        }

        if (array_key_exists('codePostal', $data)) {
            $codePostal = trim(
                (string) ($data['codePostal'] ?? '')
            );

            $ressource->setCodePostal(
                $codePostal !== ''
                    ? $codePostal
                    : null
            );
        }

        $em->flush();

        return $this->json(
            $this->serialize($ressource)
        );
    }

    /**
     * PATCH /api/admin/ressources/{id}/validate
     * Publier ou dépublier une ressource.
     */
    #[Route(
        '/admin/ressources/{id}/validate',
        name: 'api_admin_ressource_validate',
        methods: ['PATCH']
    )]
    public function validate(
        int $id,
        EntityManagerInterface $em,
        RessourceRepository $repo
    ): JsonResponse {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $ressource = $repo->find($id);

        if (!$ressource) {
            return $this->json(
                ['error' => 'Ressource introuvable.'],
                404
            );
        }

        $ressource->setIsValidated(
            !$ressource->isValidated()
        );

        $em->flush();

        return $this->json([
            'validated' =>
                $ressource->isValidated(),
        ]);
    }

    /**
     * DELETE /api/admin/ressources/{id}
     */
    #[Route(
        '/admin/ressources/{id}',
        name: 'api_admin_ressource_delete',
        methods: ['DELETE']
    )]
    public function delete(
        int $id,
        EntityManagerInterface $em,
        RessourceRepository $repo
    ): JsonResponse {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $ressource = $repo->find($id);

        if (!$ressource) {
            return $this->json(
                ['error' => 'Ressource introuvable.'],
                404
            );
        }

        $em->remove($ressource);
        $em->flush();

        return $this->json([
            'message' =>
                'Ressource supprimée.',
        ]);
    }
    // ADMIN : UTILISATEURS

    /**
     * GET /api/admin/users
     */
    #[Route(
        '/admin/users',
        name: 'api_admin_users_list',
        methods: ['GET']
    )]
    public function adminUsers(
        UserRepository $userRepo
    ): JsonResponse {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $users = $userRepo->findAll();

        return $this->json(
            array_map(
                fn ($user) => [
                    'id' => $user->getId(),
                    'email' => $user->getEmail(),
                    'nom' => $user->getNom(),
                    'prenom' => $user->getPrenom(),
                    'roles' => $user->getRoles(),
                    'isVerified' => $user->isVerified(),
                    'isActive' => $user->isActive(),
                    'createdAt' =>
                        $user->getCreatedAt()
                            ?->format('Y-m-d'),
                ],
                $users
            )
        );
    }

    /**
     * PATCH /api/admin/users/{id}/validate
     */
    #[Route(
        '/admin/users/{id}/validate',
        name: 'api_admin_user_validate',
        methods: ['PATCH']
    )]
    public function validateUser(
        int $id,
        EntityManagerInterface $em,
        UserRepository $userRepo
    ): JsonResponse {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $user = $userRepo->find($id);

        if (!$user) {
            return $this->json(
                ['error' => 'Utilisateur introuvable.'],
                404
            );
        }

        $user->setIsVerified(
            !$user->isVerified()
        );

        $em->flush();

        return $this->json([
            'isVerified' =>
                $user->isVerified(),
        ]);
    }

    /**
     * DELETE /api/admin/users/{id}
     */
    #[Route(
        '/admin/users/{id}',
        name: 'api_admin_user_delete',
        methods: ['DELETE']
    )]
    public function deleteUser(
        int $id,
        EntityManagerInterface $em,
        UserRepository $userRepo
    ): JsonResponse {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $user = $userRepo->find($id);

        if (!$user) {
            return $this->json(
                ['error' => 'Utilisateur introuvable.'],
                404
            );
        }

        $em->remove($user);
        $em->flush();

        return $this->json([
            'message' =>
                'Utilisateur supprimé.',
        ]);
    }

    // CONTACT

    #[Route(
    '/contact',
    name: 'api_contact',
    methods: ['POST']
)]
public function contact(
    Request $request,
    MailerInterface $mailer
): JsonResponse {
    /** @var User|null $user */
    $user = $this->getUser();

    $data = json_decode(
        $request->getContent(),
        true
    );

    if (!is_array($data)) {
        return $this->json([
            'error' => 'Données JSON invalides.'
        ], 400);
    }

    /*
     * Si connecté : identité du compte.
     * Sinon : identité du formulaire.
     */
    if ($user) {
        $nom = trim((string) $user->getNom());
        $prenom = trim((string) $user->getPrenom());
        $emailAddress = trim(
            (string) $user->getEmail()
        );
    } else {
        $nom = trim(
            (string) ($data['nom'] ?? '')
        );

        $prenom = trim(
            (string) ($data['prenom'] ?? '')
        );

        $emailAddress = trim(
            (string) ($data['email'] ?? '')
        );
    }

    $sujet = trim(
        (string) ($data['sujet'] ?? '')
    );

    $message = trim(
        (string) ($data['message'] ?? '')
    );

    if (
        $nom === '' ||
        $prenom === '' ||
        $emailAddress === '' ||
        $sujet === '' ||
        $message === ''
    ) {
        return $this->json([
            'error' =>
                'Tous les champs sont obligatoires.'
        ], 400);
    }

    if (
        !filter_var(
            $emailAddress,
            FILTER_VALIDATE_EMAIL
        )
    ) {
        return $this->json([
            'error' =>
                'L’adresse e-mail est invalide.'
        ], 400);
    }

    if (mb_strlen($sujet) < 3) {
        return $this->json([
            'error' =>
                'Le sujet doit contenir au moins 3 caractères.'
        ], 400);
    }

    if (mb_strlen($message) < 10) {
        return $this->json([
            'error' =>
                'Le message doit contenir au moins 10 caractères.'
        ], 400);
    }

    $email = (new Email())
        ->from('krimini2005@gmail.com')
        ->to('krimini2005@gmail.com')
        ->replyTo($emailAddress)
        ->subject('[OnEstLà] ' . $sujet)
        ->text(
            sprintf(
                "Nouveau message reçu depuis OnEstLà\n\n"
                . "Nom : %s\n"
                . "Prénom : %s\n"
                . "E-mail : %s\n"
                . "Compte connecté : %s\n\n"
                . "Sujet : %s\n\n"
                . "Message :\n%s",
                $nom,
                $prenom,
                $emailAddress,
                $user ? 'Oui' : 'Non',
                $sujet,
                $message
            )
        );

    $mailer->send($email);

    return $this->json([
        'message' =>
            'Message envoyé avec succès.'
    ]);
}

    private function serialize(
        Ressource $ressource
    ): array {
        return [
            'id' =>
                $ressource->getId(),

            'titre' =>
                $ressource->getTitre(),

            'description' =>
                $ressource->getDescription(),

            'contenu' =>
                $ressource->getContenu(),

            'categorie' =>
                $ressource->getCategorie(),

            'isValidated' =>
                $ressource->isValidated(),

            /*
             * Localisation envoyée au frontend
             */
            'ville' =>
                $ressource->getVille(),

            'codePostal' =>
                $ressource->getCodePostal(),

            'createdAt' =>
                $ressource->getCreatedAt()
                    ?->format('Y-m-d'),

            'createdBy' =>
                $ressource->getCreatedBy()
                    ? [
                        'id' =>
                            $ressource
                                ->getCreatedBy()
                                ->getId(),

                        'nom' =>
                            $ressource
                                ->getCreatedBy()
                                ->getNom(),

                        'prenom' =>
                            $ressource
                                ->getCreatedBy()
                                ->getPrenom(),
                    ]
                    : null,
        ];
    }


    #[Route(
    '/admin/users/{id}/status',
    name: 'api_admin_user_status',
    methods: ['PATCH']
)]
public function updateUserStatus(
    int $id,
    Request $request,
    EntityManagerInterface $em,
    UserRepository $userRepo
): JsonResponse {
    $this->denyAccessUnlessGranted('ROLE_ADMIN');

    $user = $userRepo->find($id);

    if (!$user) {
        return $this->json([
            'error' => 'Utilisateur introuvable.'
        ], 404);
    }

    $currentAdmin = $this->getUser();

    if (
        $currentAdmin &&
        $currentAdmin->getId() === $user->getId()
    ) {
        return $this->json([
            'error' =>
                'Vous ne pouvez pas désactiver votre propre compte.'
        ], 400);
    }

    $data = json_decode(
        $request->getContent(),
        true
    );

    if (
        !is_array($data) ||
        !array_key_exists('isActive', $data)
    ) {
        return $this->json([
            'error' =>
                'Le champ isActive est obligatoire.'
        ], 400);
    }

    $user->setIsActive(
        (bool) $data['isActive']
    );

    $em->flush();

    return $this->json([
        'message' => $user->isActive()
            ? 'Le compte a été activé.'
            : 'Le compte a été désactivé.',

        'user' => [
            'id' => $user->getId(),
            'isActive' => $user->isActive(),
        ],
    ]);
}

#[Route(
    '/admin/users/{id}/role',
    name: 'api_admin_user_role',
    methods: ['PATCH']
)]
public function updateUserRole(
    int $id,
    Request $request,
    EntityManagerInterface $em,
    UserRepository $userRepo
): JsonResponse {
    $this->denyAccessUnlessGranted('ROLE_ADMIN');

    $user = $userRepo->find($id);

    if (!$user) {
        return $this->json([
            'error' => 'Utilisateur introuvable.'
        ], 404);
    }

    $data = json_decode(
        $request->getContent(),
        true
    );

    $role = $data['role'] ?? null;

    $rolesAutorises = [
        'ROLE_USER',
        'ROLE_ADMIN',
    ];

    if (
        !$role ||
        !in_array(
            $role,
            $rolesAutorises,
            true
        )
    ) {
        return $this->json([
            'error' => 'Rôle incorrect.'
        ], 400);
    }

    $currentAdmin = $this->getUser();

    if (
        $currentAdmin &&
        $currentAdmin->getId() === $user->getId() &&
        $role !== 'ROLE_ADMIN'
    ) {
        return $this->json([
            'error' =>
                'Vous ne pouvez pas retirer votre propre rôle administrateur.'
        ], 400);
    }

    if ($role === 'ROLE_ADMIN') {
        $user->setRoles([
            'ROLE_ADMIN',
        ]);
    } else {
        $user->setRoles([
            'ROLE_USER',
        ]);
    }

    $em->flush();

    return $this->json([
        'message' =>
            'Le rôle a été modifié.',

        'user' => [
            'id' => $user->getId(),
            'roles' => $user->getRoles(),
        ],
    ]);
}
}