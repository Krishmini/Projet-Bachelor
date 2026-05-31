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

# 2. Générer les clés JWT
mkdir -p config/jwt
php bin/console lexik:jwt:generate-keypair

# 3. Configurer la base de données
# Modifier .env si besoin (DATABASE_URL)
# Avec Docker MySQL :
docker-compose up -d db

# 4. Créer la BDD + migrations + données
php bin/console doctrine:database:create
php bin/console make:migration
php bin/console doctrine:migrations:migrate --no-interaction
php bin/console doctrine:fixtures:load --no-interaction

# 5. Lancer le serveur
symfony server:start
# ou
php -S localhost:8080 -t public/
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

| Rôle  | Email                 | Mot de passe |
|-------|-----------------------|-------------|
| Admin | admin@onestla.fr      | admin1234   |
| User  | krishmini@test.fr     | password123 |
| User  | marie@test.fr         | password123 |

---

## 🌐 API Endpoints

### Public (sans authentification)
| Méthode | Route                          | Description                          |
|---------|--------------------------------|--------------------------------------|
| POST    | `/api/login`                   | Connexion → retourne JWT             |
| POST    | `/api/register`                | Inscription                          |
| GET     | `/api/ressources`              | Liste ressources validées            |
| GET     | `/api/ressources?categorie=X`  | Filtrer par catégorie                |
| GET     | `/api/ressources/{id}`         | Détail d'une ressource               |
| POST    | `/api/contact`                 | Formulaire de contact                |

### Authentifié (JWT requis)
| Méthode | Route           | Description              |
|---------|-----------------|--------------------------|
| GET     | `/api/me`       | Profil courant           |
| PUT     | `/api/profile`  | Modifier son profil      |

### Admin (ROLE_ADMIN requis)
| Méthode | Route                                | Description              |
|---------|--------------------------------------|--------------------------|
| GET     | `/api/admin/ressources`              | Toutes les ressources    |
| POST    | `/api/admin/ressources`              | Créer une ressource      |
| PUT     | `/api/admin/ressources/{id}`         | Modifier une ressource   |
| PATCH   | `/api/admin/ressources/{id}/validate`| Valider/dépublier        |
| DELETE  | `/api/admin/ressources/{id}`         | Supprimer                |
| GET     | `/api/admin/users`                   | Liste des utilisateurs   |
| PATCH   | `/api/admin/users/{id}/validate`     | Vérifier un utilisateur  |
| DELETE  | `/api/admin/users/{id}`              | Supprimer un utilisateur |

---

## 🧪 Tests

### Backend (PHPUnit)
```bash
cd backend
# D'abord : créer la BDD de test et charger les fixtures
php bin/console doctrine:database:create --env=test
php bin/console doctrine:migrations:migrate --no-interaction --env=test
php bin/console doctrine:fixtures:load --no-interaction --env=test

# Lancer les tests
php bin/phpunit --testdox
```

### Frontend (Vitest)
```bash
cd frontend
npm run test          # run une fois
npm run test:watch    # mode watch
```

---

## 🗄️ Base de données — Entités

### User
| Champ      | Type    | Description                    |
|------------|---------|--------------------------------|
| id         | int     | PK auto-increment              |
| email      | string  | Unique, identifiant JWT        |
| password   | string  | Hashé (bcrypt)                 |
| nom        | string  | Nom de famille                 |
| prenom     | string  | Prénom                         |
| roles      | json    | ['ROLE_USER'] ou ['ROLE_ADMIN']|
| isVerified | bool    | Vérifié par admin              |
| createdAt  | datetime| Date d'inscription             |

### Ressource
| Champ       | Type    | Description                                |
|-------------|---------|---------------------------------------------|
| id          | int     | PK auto-increment                          |
| titre       | string  | Titre de la ressource                      |
| description | text    | Description courte (card)                  |
| contenu     | text    | Contenu détaillé (page détail)             |
| categorie   | string  | psychologique / sociale / financiere       |
| isValidated | bool    | Visible publiquement si true               |
| createdBy   | User    | ManyToOne → User (admin qui a créé)        |
| createdAt   | datetime| Date de création                           |

---

## 🐳 Docker

```bash
cd backend
docker-compose up -d     # Lance MySQL sur le port 3306
docker-compose down      # Arrêter
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
