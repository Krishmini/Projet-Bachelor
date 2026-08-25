<?php

namespace App\Repository;

use App\Entity\Ressource;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Ressource>
 */
class RessourceRepository extends ServiceEntityRepository
{
    public function __construct(
        ManagerRegistry $registry
    ) {
        parent::__construct(
            $registry,
            Ressource::class
        );
    }

    /**
     * Ressources publiées, filtrées par catégorie
     * et par localisation.
     */
    public function findValidated(
        ?string $categorie = null,
        ?string $localisation = null
    ): array {
        $qb = $this->createQueryBuilder('r')
            ->where('r.isValidated = true')
            ->orderBy('r.createdAt', 'DESC');

        if ($categorie) {
            $qb
                ->andWhere('r.categorie = :categorie')
                ->setParameter(
                    'categorie',
                    $categorie
                );
        }

        if ($localisation) {
            $localisation = trim($localisation);

            $qb
                ->andWhere(
                    'LOWER(r.ville) = LOWER(:localisation)
                    OR r.codePostal = :localisation
                    OR LOWER(r.ville) = LOWER(:national)'
                )
                ->setParameter(
                    'localisation',
                    $localisation
                )
                ->setParameter(
                    'national',
                    'France entière'
                );
        }

        return $qb
            ->getQuery()
            ->getResult();
    }

    /**
     * Toutes les ressources pour l’administration.
     */
    public function findAllOrderedByDate(): array
    {
        return $this
            ->createQueryBuilder('r')
            ->orderBy('r.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }
}