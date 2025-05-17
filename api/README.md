<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# API Documentation

## Description
Cette API est construite avec NestJS, un framework Node.js progressif pour construire des applications serveur évolutives et efficaces.

## Technologies principales
- NestJS v11
- Prisma (ORM)
- TypeScript
- Socket.IO (pour les communications en temps réel)
- JWT pour l'authentification
- Swagger pour la documentation API

## Structure du projet

### Dossiers principaux
- `/src` : Code source principal
  - `/auth` : Gestion de l'authentification
  - `/user` : Gestion des utilisateurs
  - `/documents` : Gestion des documents
  - `/folders` : Gestion des dossiers
  - `/notifications` : Système de notifications
  - `/invitation` : Gestion des invitations
  - `/call` : Gestion des appels
  - `/2fa` : Authentification à deux facteurs
  - `/gateways` : WebSockets et communications en temps réel
  - `/prisma` : Configuration et schémas de base de données

### Configuration
- `package.json` : Dépendances et scripts
- `tsconfig.json` : Configuration TypeScript
- `prisma/` : Configuration de la base de données

## Base de données

### Configuration Prisma
Le projet utilise Prisma comme ORM pour interagir avec la base de données. La configuration se trouve dans le dossier `prisma/`.

### Modèles de données
Les principaux modèles de données incluent :
- Utilisateurs (User)
- Documents
- Dossiers
- Notifications
- Invitations
- Sessions d'appel

### Migrations
Les migrations de base de données sont gérées via Prisma. Pour appliquer les migrations :
```bash
npx prisma migrate dev
```

### Connexion à la base de données
La connexion à la base de données est configurée via les variables d'environnement dans le fichier `.env` :
```
DATABASE_URL="postgresql://user:password@localhost:5432/database_name"
```

## Configuration

### Variables d'environnement
Créez un fichier `.env` à la racine du projet en copiant le fichier `.env.example

## Installation

1. Installer les dépendances :
```bash
npm install
```

2. Lancer l'application en mode développement :
```bash
npm run start:dev
```

## Scripts disponibles

- `npm run build` : Compilation du projet
- `npm run start` : Démarrage de l'application
- `npm run start:dev` : Démarrage en mode développement avec rechargement automatique
- `npm run start:debug` : Démarrage en mode debug
- `npm run start:prod` : Démarrage en mode production
- `npm run lint` : Vérification du code avec ESLint

## Fonctionnalités principales

### Authentification
- JWT pour l'authentification
- Authentification à deux facteurs (2FA)
- Gestion des sessions

### Gestion des documents
- Upload et téléchargement de fichiers
- Organisation en dossiers
- Partage de documents

### Communication en temps réel
- Notifications
- Système d'appels
- Invitations

### Sécurité
- Validation des données
- Protection contre les attaques CSRF
- Gestion des permissions

## Documentation API
La documentation Swagger est disponible à l'URL : `/api-docs` lorsque l'application est en cours d'exécution.

## Configuration
L'API est accessible sur le port 8000 avec le préfixe `/api` :
- URL de base : http://localhost:8000/api
- Documentation Swagger : http://localhost:8000/api/docs

## Contribution
1. Créer une branche pour votre fonctionnalité
2. Commiter vos changements
3. Pousser vers la branche
4. Créer une Pull Request

## Auteurs
Groupe 10 :
- @Antonin
- @Aurélien Destailleur
- @Pierre Perdigues
- @Baptiste Nautré

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
