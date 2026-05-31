<?php

namespace App\DataFixtures;

use App\Entity\Ressource;
use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class AppFixtures extends Fixture
{
    public function __construct(private UserPasswordHasherInterface $hasher) {}

    public function load(ObjectManager $manager): void
    {
        // ── Admin ───────────────────────────────────────────────
        $admin = new User();
        $admin->setEmail('admin@onestla.fr');
        $admin->setNom('Admin');
        $admin->setPrenom('OnEstLà');
        $admin->setPassword($this->hasher->hashPassword($admin, 'admin1234'));
        $admin->setRoles(['ROLE_ADMIN']);
        $admin->setIsVerified(true);
        $manager->persist($admin);

        // ── Users de test ────────────────────────────────────────
        $users = [
            ['Krishmini', 'Kulakrishna', 'krishmini@test.fr', 'password123'],
            ['Marie',     'Dupont',      'marie@test.fr',     'password123'],
            ['Jean',      'Martin',      'jean@test.fr',      'password123'],
        ];

        foreach ($users as [$nom, $prenom, $email, $pwd]) {
            $u = new User();
            $u->setEmail($email);
            $u->setNom($nom);
            $u->setPrenom($prenom);
            $u->setPassword($this->hasher->hashPassword($u, $pwd));
            $u->setIsVerified(true);
            $manager->persist($u);
        }

        // ── Ressources ───────────────────────────────────────────
        $ressources = [
            [
                'titre'       => 'Soutien psychologique',
                'description' => 'Besoin de parler ? Des professionnels et bénévoles sont disponibles pour vous. Soutien gratuitment et en toute confidentialité.',
                'contenu'     => "Vous traversez une période difficile et avez besoin d'une oreille attentive ?\n\n**Ligne d'écoute nationale** — 3114 (numéro national prévention suicide, 24h/24)\n\n**Croix-Rouge Écoute** — 0800 858 858 (lundi-vendredi 9h–18h, gratuit)\n\n**SOS Amitié** — 09 72 39 40 50\n\nCes services sont gratuits, anonymes et confidentiels. N'hésitez pas à appeler.",
                'categorie'   => 'psychologique',
            ],
            [
                'titre'       => 'Aide financière et sociale',
                'description' => 'Vous avez des difficultés pour payer vos factures, votre logement ou vos repas ? Des organismes peuvent vous accompagner.',
                'contenu'     => "Si vous traversez une période difficile, vous pouvez contacter gratuitement ces services pour être écouté et soutenu :\n\n**Caisse d'Allocations Familiales** — Aide financière (RSA, APL, allocations familiales). Aide financière mensuelle destinée à garantir un revenu minimum aux personnes en difficulté.\n\n**Secours Catholique** — Aide alimentaire et accompagnement social. Aide sous forme de colis alimentaires et accompagnement social.\n\nCes services sont accessibles sur rendez-vous dans votre département.",
                'categorie'   => 'financiere',
            ],
            [
                'titre'       => 'Aide sociale et logement',
                'description' => 'Vous cherchez un hébergement d\'urgence ou une aide pour votre logement ? Voici les ressources disponibles.',
                'contenu'     => "**115 — SAMU Social** : Numéro d'urgence hébergement, disponible 24h/24.\n\n**Action Logement** : Aides à l'accès au logement pour les salariés.\n\n**Fonds de Solidarité Logement (FSL)** : Aide aux impayés de loyer et charges.\n\nContactez le 115 en cas d'urgence absolue.",
                'categorie'   => 'sociale',
            ],
            [
                'titre'       => 'Aide alimentaire',
                'description' => 'Restos du Coeur, Banques Alimentaires, épiceries sociales : trouvez l\'aide alimentaire près de chez vous.',
                'contenu'     => "**Les Restos du Cœur** : Distribution de repas chauds et de colis alimentaires. Réseau national, trouver le restaurant le plus proche sur restosducoeur.org.\n\n**Banques Alimentaires** : Collecte et redistribution de denrées alimentaires.\n\n**Épiceries sociales** : Accès à des produits alimentaires à prix réduits sous conditions de ressources.",
                'categorie'   => 'sociale',
            ],
            [
                'titre'       => 'Gestion du stress et anxiété',
                'description' => 'Techniques et ressources pour mieux gérer le stress au quotidien et retrouver un équilibre émotionnel.',
                'contenu'     => "**Techniques de relaxation** :\n- Respiration 4-7-8 : inspirez 4 sec, retenez 7 sec, expirez 8 sec\n- Cohérence cardiaque : 6 respirations par minute, 5 minutes par jour\n- Méditation de pleine conscience : applications Calm, Headspace, Petit Bambou\n\n**Ressources en ligne gratuites** :\n- Psycom.org : portail d'information sur la santé mentale\n- France Dépression : soutien aux personnes dépressives et leur entourage",
                'categorie'   => 'psychologique',
            ],
            [
                'titre'       => 'RSA et minima sociaux',
                'description' => 'Tout savoir sur le RSA, la prime d\'activité et les autres aides de la CAF auxquelles vous pouvez avoir droit.',
                'contenu'     => "**RSA (Revenu de Solidarité Active)** : Aide financière mensuelle pour les personnes sans ressources ou à faibles revenus. Demande sur caf.fr ou à votre CAF.\n\n**Prime d'Activité** : Complément de revenus pour les travailleurs à faibles salaires. Simulateur disponible sur caf.fr.\n\n**Allocation de Solidarité Spécifique (ASS)** : Pour les demandeurs d'emploi ayant épuisé leurs droits à l'ARE.\n\nContactez votre CAF au 3230 pour être guidé.",
                'categorie'   => 'financiere',
            ],
        ];

        foreach ($ressources as $data) {
            $r = new Ressource();
            $r->setTitre($data['titre']);
            $r->setDescription($data['description']);
            $r->setContenu($data['contenu']);
            $r->setCategorie($data['categorie']);
            $r->setIsValidated(true);
            $r->setCreatedBy($admin);
            $manager->persist($r);
        }

        $manager->flush();
    }
}
