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
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Ressource::class);
    }

    /**
     * Retourne les ressources validées, filtrables par catégorie.
     */
    public function findValidated(?string $categorie = null): array
    {
        $qb = $this->createQueryBuilder('r')
            ->where('r.isValidated = true')
            ->orderBy('r.createdAt', 'DESC');

        if ($categorie) {
            $qb->andWhere('r.categorie = :categorie')
               ->setParameter('categorie', $categorie);
        }

        return $qb->getQuery()->getResult();
    }

    /**
     * Toutes les ressources (admin).
     */
    public function findAllOrderedByDate(): array
    {
        return $this->createQueryBuilder('r')
            ->orderBy('r.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }
}
