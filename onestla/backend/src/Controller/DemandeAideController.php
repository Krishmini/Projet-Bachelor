<?php

namespace App\Controller;

use App\Entity\DemandeAide;
use App\Entity\Ressource;
use App\Entity\User;
use App\Repository\RessourceRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/demandes')]
class DemandeAideController extends AbstractController
{
    
    #[Route('', name: 'api_demande_create', methods: ['POST'])]
    public function create(
        Request $request,
        RessourceRepository $ressourceRepository,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        /** @var User|null $user */
        $user = $this->getUser();

        if (!$user) {
            return $this->json([
                'error' => 'Vous devez être connecté.'
            ], 401);
        }

        $data = json_decode($request->getContent(), true);

        if (
            !$data ||
            empty($data['ressourceId']) ||
            empty(trim($data['message'] ?? ''))
        ) {
            return $this->json([
                'error' => 'La ressource et le message sont obligatoires.'
            ], 400);
        }

        /** @var Ressource|null $ressource */
        $ressource = $ressourceRepository->find($data['ressourceId']);

        if (!$ressource || !$ressource->isValidated()) {
            return $this->json([
                'error' => 'Cette ressource est introuvable.'
            ], 404);
        }

        $demande = new DemandeAide();
        $demande->setUtilisateur($user);
        $demande->setRessource($ressource);
        $demande->setMessage(trim($data['message']));

        $entityManager->persist($demande);
        $entityManager->flush();

        return $this->json([
            'message' => 'Votre demande a bien été envoyée.',
            'demande' => [
                'id' => $demande->getId(),
                'message' => $demande->getMessage(),
                'statut' => $demande->getStatut(),
                'createdAt' => $demande->getCreatedAt()?->format('Y-m-d H:i:s'),
                'ressource' => [
                    'id' => $ressource->getId(),
                    'titre' => $ressource->getTitre(),
                    'categorie' => $ressource->getCategorie(),
                ],
            ],
        ], 201);
    }

    /**
 * Récupérer les demandes de l’utilisateur connecté.
 */
#[Route('', name: 'api_mes_demandes', methods: ['GET'])]
public function list(
    EntityManagerInterface $entityManager
): JsonResponse {
    /** @var User|null $user */
    $user = $this->getUser();

    if (!$user) {
        return $this->json([
            'error' => 'Vous devez être connecté.'
        ], 401);
    }

    $demandes = $entityManager
        ->getRepository(DemandeAide::class)
        ->findBy(
            ['utilisateur' => $user],
            ['createdAt' => 'DESC']
        );

    return $this->json(array_map(
        static function (DemandeAide $demande): array {
            $ressource = $demande->getRessource();

            return [
                'id' => $demande->getId(),
                'message' => $demande->getMessage(),
                'statut' => $demande->getStatut(),
                'reponseAdmin' => $demande->getReponseAdmin(),
                'createdAt' => $demande->getCreatedAt()?->format('Y-m-d H:i:s'),
                'ressource' => [
                    'id' => $ressource?->getId(),
                    'titre' => $ressource?->getTitre(),
                    'categorie' => $ressource?->getCategorie(),
                    'description' => $ressource?->getDescription(),
                ],
            ];
        },
        $demandes
    ));
}

#[Route(
    '/admin',
    name: 'api_admin_demandes',
    methods: ['GET']
)]
public function adminList(
    EntityManagerInterface $entityManager
): JsonResponse {
    $this->denyAccessUnlessGranted('ROLE_ADMIN');

    $demandes = $entityManager
        ->getRepository(DemandeAide::class)
        ->findBy([], ['createdAt' => 'DESC']);

    return $this->json(array_map(
        static function (DemandeAide $demande): array {
            $user = $demande->getUtilisateur();
            $ressource = $demande->getRessource();

            return [
                'id' => $demande->getId(),
                'message' => $demande->getMessage(),
                'statut' => $demande->getStatut(),
                'reponseAdmin' => $demande->getReponseAdmin(),
                'createdAt' => $demande->getCreatedAt()?->format('Y-m-d H:i:s'),

                'utilisateur' => [
                    'id' => $user?->getId(),
                    'nom' => $user?->getNom(),
                    'prenom' => $user?->getPrenom(),
                    'email' => $user?->getEmail(),
                ],

                'ressource' => [
                    'id' => $ressource?->getId(),
                    'titre' => $ressource?->getTitre(),
                    'categorie' => $ressource?->getCategorie(),
                ],
            ];
        },
        $demandes
    ));
}

#[Route(
    '/admin/{id}',
    name: 'api_admin_demande_update',
    methods: ['PATCH']
)]
public function adminUpdate(
    int $id,
    Request $request,
    EntityManagerInterface $entityManager
): JsonResponse {
    $this->denyAccessUnlessGranted('ROLE_ADMIN');

    $demande = $entityManager
        ->getRepository(DemandeAide::class)
        ->find($id);

    if (!$demande) {
        return $this->json([
            'error' => 'Demande introuvable.'
        ], 404);
    }

    $data = json_decode($request->getContent(), true);

    $statutsAutorises = [
        'ENVOYEE',
        'EN_COURS',
        'TRAITEE',
        'REFUSEE',
    ];

    if (isset($data['statut'])) {
        if (!in_array($data['statut'], $statutsAutorises, true)) {
            return $this->json([
                'error' => 'Statut incorrect.'
            ], 400);
        }

        $demande->setStatut($data['statut']);
    }

    if (array_key_exists('reponseAdmin', $data)) {
        $reponse = trim($data['reponseAdmin']);

        $demande->setReponseAdmin(
            $reponse !== '' ? $reponse : null
        );
    }

    $entityManager->flush();

    return $this->json([
        'message' => 'La demande a bien été mise à jour.',
        'demande' => [
            'id' => $demande->getId(),
            'statut' => $demande->getStatut(),
            'reponseAdmin' => $demande->getReponseAdmin(),
        ],
    ]);
}
}