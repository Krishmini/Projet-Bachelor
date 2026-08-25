#  OnEstLà — Plateforme d'aide sociale, psychologique et financière

> Stack : **Symfony 7** (backend API REST + JWT) · **React + Vite** (frontend) · **MySQL 8** (BDD) · **PHPUnit + Vitest** (tests) · **GitHub Actions** (CI)

---

## 🏗️ Architecture

```
onestla/
├── backend/          # Symfony 7 — API REST
│   ├── src/
│   │   ├── Entity/           User, Ressource
│   │   ├── Controller/       AuthController, RessourceController
│   │   ├── Repository/       UserRepository, RessourceRepository
│   │   └── DataFixtures/     AppFixtures (admin + 6 ressources)
│   ├── config/packages/
│   │   ├── security.yaml     JWT firewalls + access_control
│   │   ├── nelmio_cors.yaml  CORS pour le frontend
│   │   └── lexik_jwt_authentication.yaml
│   ├── tests/Controller/ApiTest.php
│   ├── docker-compose.yml    MySQL 8 + PHP
│   └── .env
├── frontend/         # React 18 + Vite
│   ├── src/
│   │   ├── pages/    Home, Ressources, RessourceDetail, Connexion,
│   │   │             Inscription, Contact, Profil, Admin
│   │   ├── components/ Navbar, RessourceCard
│   │   ├── context/  AuthContext (JWT + état global)
│   │   ├── services/ api.js (axios avec intercepteurs JWT)
│   │   └── test/     App.test.jsx (Vitest + Testing Library)
│   └── .env
└── .github/workflows/ci.yml  CI backend + frontend
```

---

## 🚀 Installation

### Backend (Symfony)

```bash
cd backend

# 1. Installer les dépendances
composer install

# 2. Créer la configuration locale
# Copier le fichier .env en .env.local si nécessaire
# Puis configurer DATABASE_URL, MAILER_DSN et FRONTEND_URL

# 3. Générer les clés JWT
php bin/console lexik:jwt:generate-keypair

# 4. Démarrer MySQL avec Docker
docker compose up -d db

# 5. Créer la base de données
php bin/console doctrine:database:create

# 6. Exécuter les migrations existantes
php bin/console doctrine:migrations:migrate --no-interaction

# 7. Charger les données de démonstration
php bin/console doctrine:fixtures:load --no-interaction

# 8. Vérifier le schéma
php bin/console doctrine:schema:validate

# 9. Lancer le serveur Symfony
symfony server:start
```
Le backend est normalement disponible sur :

```text
http://127.0.0.1:8000
```

### Frontend (React)

```bash
cd frontend

# 1. Installer les dépendances
npm install

# 2. Lancer en développement
npm run dev
# → http://localhost:3000
```

---

## 🔑 Comptes de test

Les comptes de démonstration sont créés localement avec les fixtures Symfony.

| Rôle | Compte |
|---|---|
| Administrateur | Compte créé dans les fixtures locales |
| Utilisateur | Compte créé dans les fixtures locales |
| Utilisateur | Compte créé dans les fixtures locales |

Les mots de passe ne sont pas publiés dans ce dépôt.

Pour tester le projet :

1. charger les fixtures avec `doctrine:fixtures:load` ;
2. utiliser les identifiants définis dans le fichier local de fixtures ;
3. transmettre les identifiants de démonstration au professeur séparément si nécessaire.

---

## 🌐 API Endpoints

### Routes publiques — Sans authentification

| Méthode | Route | Description |
|---|---|---|
| POST | `/api/login` | Connexion et récupération du JWT |
| POST | `/api/register` | Création d’un compte |
| POST | `/api/forgot-password` | Demander un lien de réinitialisation |
| POST | `/api/reset-password` | Définir un nouveau mot de passe |
| POST | `/api/contact` | Envoyer un message de contact |

La page de contact reste publique afin qu’une personne non connectée ou dont le compte est désactivé puisse contacter l’administrateur.

### Routes authentifiées — JWT requis

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/me` | Récupérer le profil courant |
| PUT | `/api/profile` | Modifier son profil ou son mot de passe |
| DELETE | `/api/profile` | Supprimer son propre compte |
| GET | `/api/ressources` | Liste des ressources publiées |
| GET | `/api/ressources?categorie=X` | Filtrer les ressources par catégorie |
| GET | `/api/ressources/{id}` | Consulter le détail d’une ressource |
| POST | `/api/demandes` | Créer une demande d’aide |
| GET | `/api/demandes` | Consulter ses propres demandes |

### Administration des ressources — `ROLE_ADMIN` requis

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/admin/ressources` | Consulter toutes les ressources |
| POST | `/api/admin/ressources` | Créer une ressource |
| PUT | `/api/admin/ressources/{id}` | Modifier une ressource |
| PATCH | `/api/admin/ressources/{id}/validate` | Publier ou dépublier une ressource |
| DELETE | `/api/admin/ressources/{id}` | Supprimer une ressource |

### Administration des utilisateurs — `ROLE_ADMIN` requis

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/admin/users` | Consulter les utilisateurs |
| PATCH | `/api/admin/users/{id}/validate` | Vérifier une inscription |
| PATCH | `/api/admin/users/{id}/status` | Activer ou désactiver un compte |
| PATCH | `/api/admin/users/{id}/role` | Modifier le rôle d’un utilisateur |
| DELETE | `/api/admin/users/{id}` | Supprimer un utilisateur |

### Administration des demandes — `ROLE_ADMIN` requis

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/demandes/admin` | Consulter toutes les demandes |
| PATCH | `/api/demandes/admin/{id}` | Modifier le statut et la réponse |

---

## 🗺️ API externe utilisée

Le projet utilise l’API publique du gouvernement français :

```text
https://geo.api.gouv.fr/communes
```

Elle permet de rechercher une commune à partir :

- du nom de la ville ;
- du code postal.

Elle est utilisée dans le tableau de bord administrateur pour associer une localisation à une ressource.

Exemple :

```http
GET https://geo.api.gouv.fr/communes?nom=Paris&fields=nom,codesPostaux
```

Cette API ne nécessite pas de clé d’authentification.

Une ressource nationale peut également être enregistrée comme :

```text
France entière
```

---

## 🧪 Tests

### Backend (PHPUnit)
```bash
cd backend

# Créer la base de données de test
php bin/console doctrine:database:create --env=test

# Exécuter les migrations
php bin/console doctrine:migrations:migrate --no-interaction --env=test

# Charger les fixtures de test
php bin/console doctrine:fixtures:load --no-interaction --env=test

# Lancer les tests
php bin/phpunit --testdox
```

### Frontend (Vitest)
```bash
cd frontend

# Exécuter les tests une fois
npm run test

# Exécuter les tests en mode surveillance
npm run test:watch

# Vérifier le build de production
npm run build
```

## 🗄️ Base de données — Entités

### User

| Champ | Type | Description |
|---|---|---|
| `id` | int | Clé primaire auto-incrémentée |
| `email` | varchar(180) | Adresse unique et identifiant JWT |
| `password` | varchar(255) | Mot de passe haché |
| `nom` | varchar(100) | Nom de famille |
| `prenom` | varchar(100) | Prénom |
| `roles` | json | `ROLE_USER` ou `ROLE_ADMIN` |
| `isVerified` | boolean | Inscription vérifiée par un administrateur |
| `isActive` | boolean | Compte actif ou désactivé |
| `createdAt` | datetime | Date de création |
| `resetToken` | varchar(255), nullable | Jeton de réinitialisation haché |
| `resetTokenExpiresAt` | datetime, nullable | Date d’expiration du jeton |

Le mot de passe est traité avec le composant `PasswordHasher` de Symfony configuré en mode `auto`.

Le jeton de réinitialisation est haché avant son enregistrement et possède une durée de validité limitée.

### Ressource

| Champ | Type | Description |
|---|---|---|
| `id` | int | Clé primaire auto-incrémentée |
| `titre` | varchar(255) | Titre de la ressource |
| `description` | text | Description courte |
| `contenu` | text, nullable | Contenu détaillé |
| `categorie` | varchar(100) | `psychologique`, `sociale` ou `financiere` |
| `ville` | varchar(150), nullable | Ville ou zone de disponibilité |
| `codePostal` | varchar(10), nullable | Code postal |
| `isValidated` | boolean | Ressource publiée ou dépubliée |
| `createdBy` | User, nullable | Administrateur ayant créé la ressource |
| `createdAt` | datetime | Date de création |

### DemandeAide

| Champ | Type | Description |
|---|---|---|
| `id` | int | Clé primaire auto-incrémentée |
| `message` | text | Message envoyé par l’utilisateur |
| `statut` | varchar(50) | État d’avancement de la demande |
| `reponseAdmin` | text, nullable | Réponse transmise par l’administrateur |
| `createdAt` | datetime | Date de création |
| `utilisateur` | User | Utilisateur ayant envoyé la demande |
| `ressource` | Ressource | Ressource concernée |


### Relations

- Un utilisateur peut créer plusieurs ressources.
- Une ressource peut être créée par un utilisateur administrateur.
- Un utilisateur peut effectuer plusieurs demandes.
- Une demande appartient à un seul utilisateur.
- Une ressource peut concerner plusieurs demandes.
- Une demande concerne une seule ressource.

Les messages envoyés depuis le formulaire de contact sont transmis par e-mail et ne sont pas enregistrés dans la base de données actuelle.
---

## 🐳 Docker

```bash
cd backend

# Démarrer les services
docker compose up -d

# Afficher les conteneurs
docker compose ps

# Consulter les journaux
docker compose logs

# Arrêter les services
docker compose down
```

---

## ⚙️ CI/CD (GitHub Actions)

Le workflow `.github/workflows/ci.yml` se déclenche sur push/PR vers `main` :
1. **Backend** : installe PHP, crée la BDD de test, lance les migrations + fixtures, exécute PHPUnit
2. **Frontend** : installe Node, lance Vitest, build de production

---

## 📦 Packages utilisés

### Backend
- `symfony/webapp-pack` — Doctrine ORM, Twig, Validator, Serializer...
- `lexik/jwt-authentication-bundle` — Authentification JWT
- `nelmio/cors-bundle` — CORS pour les requêtes du frontend
- `doctrine/doctrine-fixtures-bundle` — Données de test

### Frontend
- `react-router-dom` — Routing SPA
- `axios` — Client HTTP avec intercepteurs JWT
- `vitest` + `@testing-library/react` — Tests unitaires

---
## 📝 Remarques
Ce projet a été réalisé dans le cadre d’un projet scolaire.
---