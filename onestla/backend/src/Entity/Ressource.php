<?php

namespace App\Entity;

use App\Repository\RessourceRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: RessourceRepository::class)]
class Ressource
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['ressource:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['ressource:read'])]
    private ?string $titre = null;

    #[ORM\Column(type: 'text')]
    #[Groups(['ressource:read'])]
    private ?string $description = null;

    #[ORM\Column(type: 'text', nullable: true)]
    #[Groups(['ressource:read'])]
    private ?string $contenu = null;

    /**
     * Catégorie : psychologique | sociale | financiere
     */
    #[ORM\Column(length: 50)]
    #[Groups(['ressource:read'])]
    private ?string $categorie = null;

    #[ORM\Column]
    #[Groups(['ressource:read'])]
    private bool $isValidated = false;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: true)]
    #[Groups(['ressource:read'])]
    private ?User $createdBy = null;

    #[ORM\Column(type: 'datetime_immutable')]
    #[Groups(['ressource:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    /**
     * @var Collection<int, DemandeAide>
     */
    #[ORM\OneToMany(targetEntity: DemandeAide::class, mappedBy: 'ressource')]
    private Collection $demandesAide;

    #[ORM\Column(length: 150, nullable: true)]
    private ?string $ville = null;

    #[ORM\Column(length: 10, nullable: true)]
    private ?string $codePostal = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->demandesAide = new ArrayCollection();
    }

    public function getId(): ?int { return $this->id; }

    public function getTitre(): ?string { return $this->titre; }
    public function setTitre(string $titre): static { $this->titre = $titre; return $this; }

    public function getDescription(): ?string { return $this->description; }
    public function setDescription(string $description): static { $this->description = $description; return $this; }

    public function getContenu(): ?string { return $this->contenu; }
    public function setContenu(?string $contenu): static { $this->contenu = $contenu; return $this; }

    public function getCategorie(): ?string { return $this->categorie; }
    public function setCategorie(string $categorie): static { $this->categorie = $categorie; return $this; }

    public function isValidated(): bool { return $this->isValidated; }
    public function setIsValidated(bool $isValidated): static { $this->isValidated = $isValidated; return $this; }

    public function getCreatedBy(): ?User { return $this->createdBy; }
    public function setCreatedBy(?User $createdBy): static { $this->createdBy = $createdBy; return $this; }

    public function getCreatedAt(): ?\DateTimeImmutable { return $this->createdAt; }

    /**
     * @return Collection<int, DemandeAide>
     */
    public function getDemandesAide(): Collection
    {
        return $this->demandesAide;
    }

    public function addDemandesAide(DemandeAide $demandesAide): static
    {
        if (!$this->demandesAide->contains($demandesAide)) {
            $this->demandesAide->add($demandesAide);
            $demandesAide->setRessource($this);
        }

        return $this;
    }

    public function removeDemandesAide(DemandeAide $demandesAide): static
    {
        if ($this->demandesAide->removeElement($demandesAide)) {
            // set the owning side to null (unless already changed)
            if ($demandesAide->getRessource() === $this) {
                $demandesAide->setRessource(null);
            }
        }

        return $this;
    }

    public function getVille(): ?string
    {
        return $this->ville;
    }

    public function setVille(?string $ville): static
    {
        $this->ville = $ville;

        return $this;
    }

    public function getCodePostal(): ?string
    {
        return $this->codePostal;
    }

    public function setCodePostal(?string $codePostal): static
    {
        $this->codePostal = $codePostal;

        return $this;
    }
}
