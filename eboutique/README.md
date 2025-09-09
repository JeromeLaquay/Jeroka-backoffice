# Jeroka Boutique - Frontend

Frontend de l'eboutique Jeroka, développé avec Vue 3, Vite et Tailwind CSS.

## 🚀 Fonctionnalités

- **Catalogue de produits** avec filtres et recherche
- **Panier d'achat** avec gestion des quantités
- **Authentification utilisateur** (connexion/inscription)
- **Processus de commande** complet
- **Gestion du profil utilisateur**
- **Suivi des commandes**
- **Design responsive** optimisé mobile/desktop
- **Interface moderne** avec Tailwind CSS

## 🛠️ Technologies utilisées

- **Vue 3** - Framework JavaScript réactif
- **Vite** - Outil de build rapide
- **Vue Router** - Routage côté client
- **Pinia** - Gestion d'état
- **Tailwind CSS** - Framework CSS utilitaire
- **Axios** - Client HTTP
- **Heroicons** - Icônes SVG

## 📦 Installation

```bash
# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp env.example .env

# Configurer les variables d'environnement
# VITE_API_URL=http://localhost:3002/api/v1
```

## 🚀 Démarrage

```bash
# Mode développement
npm run dev

# Build de production
npm run build

# Prévisualisation du build
npm run preview
```

## 🔧 Configuration

### Variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
# URL de l'API Dashboard
VITE_API_URL=http://localhost:3002/api/v1

# Configuration de l'application
VITE_APP_NAME=Jeroka Boutique
VITE_APP_VERSION=1.0.0
```

### API Backend

L'eboutique se connecte à l'API Dashboard Jeroka. Assurez-vous que l'API est démarrée et accessible à l'URL configurée.

## 📁 Structure du projet

```
src/
├── api/                 # Clients API
│   ├── client.js       # Configuration Axios
│   ├── auth.js         # API d'authentification
│   ├── products.js     # API des produits
│   └── orders.js       # API des commandes
├── components/         # Composants réutilisables
│   ├── Layout/         # Composants de layout
│   ├── ProductCard.vue # Carte de produit
│   └── LoadingSpinner.vue
├── stores/             # Stores Pinia
│   ├── auth.js         # Gestion de l'authentification
│   ├── cart.js         # Gestion du panier
│   └── products.js     # Gestion des produits
├── views/              # Pages de l'application
│   ├── Home.vue        # Page d'accueil
│   ├── Products.vue    # Catalogue produits
│   ├── ProductDetail.vue
│   ├── Cart.vue        # Panier
│   ├── Checkout.vue    # Commande
│   ├── Login.vue       # Connexion
│   ├── Register.vue    # Inscription
│   ├── Profile.vue     # Profil utilisateur
│   ├── Orders.vue      # Liste des commandes
│   └── OrderDetail.vue # Détail d'une commande
├── router/             # Configuration du routage
├── style.css           # Styles globaux
├── App.vue             # Composant racine
└── main.js             # Point d'entrée
```

## 🎨 Design System

L'application utilise un design system cohérent avec :

- **Couleurs primaires** : Bleu (#3b82f6)
- **Couleurs secondaires** : Gris (#64748b)
- **Typographie** : Inter (Google Fonts)
- **Composants** : Tailwind CSS + composants personnalisés

## 🔐 Authentification

L'authentification est gérée via JWT avec :

- Connexion/Inscription
- Gestion des tokens
- Protection des routes
- Persistance de session

## 🛒 Panier et commandes

- Ajout/suppression de produits
- Gestion des quantités
- Persistance locale
- Processus de commande complet

## 📱 Responsive Design

L'interface s'adapte automatiquement :

- **Mobile** : < 768px
- **Tablet** : 768px - 1024px
- **Desktop** : > 1024px

## 🚀 Déploiement

```bash
# Build de production
npm run build

# Les fichiers générés sont dans le dossier dist/
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit les changements (`git commit -am 'Ajouter nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Créer une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.
