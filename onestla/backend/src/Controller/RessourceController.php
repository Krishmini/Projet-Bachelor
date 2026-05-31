<?php

namespace App\Controller;

use App\Entity\Ressource;
use App\Repository\RessourceRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api')]
class RessourceController extends AbstractController
{
    /**
     * GET /api/ressources
     * Retourne les ressources validées, filtrables par ?categorie=psychologique|sociale|financiere
     */
    #[Route('/ressources', name: 'api_ressources_list', methods: ['GET'])]
    public function list(Request $request, RessourceRepository $repo): JsonResponse
    {
        $categorie = $request->query->get('categorie');
        $ressources = $repo->findValidated($categorie ?: null);

        return $this->json(array_map(fn(Ressource $r) => $this->serialize($r), $ressources));
    }

    /**
     * GET /api/ressources/{id}
     * Détail d'une ressource validée
     */
    #[Route('/ressources/{id}', name: 'api_ressource_show', methods: ['GET'])]
    public function show(int $id, RessourceRepository $repo): JsonResponse
    {
        $ressource = $repo->find($id);

        if (!$ressource || !$ressource->isValidated()) {
            return $this->json(['error' => 'Ressource introuvable.'], 404);
        }

        return $this->json($this->serialize($ressource));
    }

    // ─── ADMIN endpoints ──────────────────────────────────────────────────────

    /**
     * GET /api/admin/ressources
     * Toutes les ressources (admin only)
     */
    #[Route('/admin/ressources', name: 'api_admin_ressources_list', methods: ['GET'])]
    public function adminList(RessourceRepository $repo): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');
        $ressources = $repo->findAllOrderedByDate();
        return $this->json(array_map(fn(Ressource $r) => $this->serialize($r), $ressources));
    }

    /**
     * POST /api/admin/ressources
     * Créer une ressource
     */
    #[Route('/admin/ressources', name: 'api_admin_ressource_create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');
        $data = json_decode($request->getContent(), true);

        if (!$data || !isset($data['titre'], $data['description'], $data['categorie'])) {
            return $this->json(['error' => 'Données manquantes (titre, description, categorie).'], 400);
        }

        $ressource = new Ressource();
        $ressource->setTitre($data['titre']);
        $ressource->setDescription($data['description']);
        $ressource->setContenu($data['contenu'] ?? null);
        $ressource->setCategorie($data['categorie']);
        $ressource->setIsValidated($data['isValidated'] ?? false);
        $ressource->setCreatedBy($this->getUser());

        $em->persist($ressource);
        $em->flush();

        return $this->json($this->serialize($ressource), 201);
    }

    /**
     * PUT /api/admin/ressources/{id}
     * Modifier une ressource
     */
    #[Route('/admin/ressources/{id}', name: 'api_admin_ressource_update', methods: ['PUT'])]
    public function update(int $id, Request $request, EntityManagerInterface $em, RessourceRepository $repo): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');
        $ressource = $repo->find($id);

        if (!$ressource) {
            return $this->json(['error' => 'Ressource introuvable.'], 404);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['titre']))       $ressource->setTitre($data['titre']);
        if (isset($data['description'])) $ressource->setDescription($data['description']);
        if (isset($data['contenu']))     $ressource->setContenu($data['contenu']);
        if (isset($data['categorie']))   $ressource->setCategorie($data['categorie']);
        if (isset($data['isValidated'])) $ressource->setIsValidated($data['isValidated']);

        $em->flush();

        return $this->json($this->serialize($ressource));
    }

    /**
     * PATCH /api/admin/ressources/{id}/validate
     * Valider / dévalider une ressource
     */
    #[Route('/admin/ressources/{id}/validate', name: 'api_admin_ressource_validate', methods: ['PATCH'])]
    public function validate(int $id, EntityManagerInterface $em, RessourceRepository $repo): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');
        $ressource = $repo->find($id);

        if (!$ressource) {
            return $this->json(['error' => 'Ressource introuvable.'], 404);
        }

        $ressource->setIsValidated(!$ressource->isValidated());
        $em->flush();

        return $this->json(['validated' => $ressource->isValidated()]);
    }

    /**
     * DELETE /api/admin/ressources/{id}
     */
    #[Route('/admin/ressources/{id}', name: 'api_admin_ressource_delete', methods: ['DELETE'])]
    public function delete(int $id, EntityManagerInterface $em, RessourceRepository $repo): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');
        $ressource = $repo->find($id);

        if (!$ressource) {
            return $this->json(['error' => 'Ressource introuvable.'], 404);
        }

        $em->remove($ressource);
        $em->flush();

        return $this->json(['message' => 'Ressource supprimée.']);
    }

    /**
     * GET /api/admin/users
     * Liste des utilisateurs (admin only)
     */
    #[Route('/admin/users', name: 'api_admin_users_list', methods: ['GET'])]
    public function adminUsers(\App\Repository\UserRepository $userRepo): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');
        $users = $userRepo->findAll();

        return $this->json(array_map(fn(\App\Entity\User $u) => [
            'id'         => $u->getId(),
            'email'      => $u->getEmail(),
            'nom'        => $u->getNom(),
            'prenom'     => $u->getPrenom(),
            'roles'      => $u->getRoles(),
            'isVerified' => $u->isVerified(),
            'createdAt'  => $u->getCreatedAt()?->format('Y-m-d'),
        ], $users));
    }

    /**
     * PATCH /api/admin/users/{id}/validate
     */
    #[Route('/admin/users/{id}/validate', name: 'api_admin_user_validate', methods: ['PATCH'])]
    public function validateUser(int $id, EntityManagerInterface $em, \App\Repository\UserRepository $userRepo): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');
        $user = $userRepo->find($id);

        if (!$user) {
            return $this->json(['error' => 'Utilisateur introuvable.'], 404);
        }

        $user->setIsVerified(!$user->isVerified());
        $em->flush();

        return $this->json(['isVerified' => $user->isVerified()]);
    }

    /**
     * DELETE /api/admin/users/{id}
     */
    #[Route('/admin/users/{id}', name: 'api_admin_user_delete', methods: ['DELETE'])]
    public function deleteUser(int $id, EntityManagerInterface $em, \App\Repository\UserRepository $userRepo): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');
        $user = $userRepo->find($id);

        if (!$user) {
            return $this->json(['error' => 'Utilisateur introuvable.'], 404);
        }

        $em->remove($user);
        $em->flush();

        return $this->json(['message' => 'Utilisateur supprimé.']);
    }

    // ─── Contact ──────────────────────────────────────────────────────────────

    /**
     * POST /api/contact
     * Formulaire de contact (stocké en log pour l'instant, extensible avec Mailer)
     */
    #[Route('/contact', name: 'api_contact', methods: ['POST'])]
public function contact(
    Request $request,
    \Symfony\Component\Mailer\MailerInterface $mailer
): JsonResponse {
    $data = json_decode($request->getContent(), true);

    if (!$data || !isset($data['nom'], $data['prenom'], $data['sujet'], $data['message'])) {
        return $this->json(['error' => 'Données manquantes.'], 400);
    }

    // Récupère l'email de l'utilisateur connecté
    $user = $this->getUser();
    $userEmail = $user ? $user->getEmail() : 'non connecté';

    $email = (new \Symfony\Component\Mime\Email())
        ->from('krimini2005@gmail.com')
        ->to('krimini2005@gmail.com')
        ->subject('[OnEstLà] ' . $data['sujet'])
        ->text(sprintf(
            "Nouveau message de %s %s\nEmail du compte : %s\n\n%s",
            $data['nom'],
            $data['prenom'],
            $userEmail,
            $data['message']
        ));

    $mailer->send($email);

    return $this->json(['message' => 'Message envoyé avec succès.']);
}

    // ─── Helper ───────────────────────────────────────────────────────────────

    private function serialize(Ressource $r): array
    {
        return [
            'id'          => $r->getId(),
            'titre'       => $r->getTitre(),
            'description' => $r->getDescription(),
            'contenu'     => $r->getContenu(),
            'categorie'   => $r->getCategorie(),
            'isValidated' => $r->isValidated(),
            'createdAt'   => $r->getCreatedAt()?->format('Y-m-d'),
            'createdBy'   => $r->getCreatedBy() ? [
                'id'     => $r->getCreatedBy()->getId(),
                'nom'    => $r->getCreatedBy()->getNom(),
                'prenom' => $r->getCreatedBy()->getPrenom(),
            ] : null,
        ];
    }
}
