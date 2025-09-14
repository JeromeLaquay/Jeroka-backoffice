# Services de Réseaux Sociaux

Ce module permet la publication automatique de contenu sur Facebook, LinkedIn et Twitter.

## Configuration

### Variables d'environnement

Ajoutez les variables suivantes à votre fichier `.env` :

```bash
# Facebook
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_ACCESS_TOKEN=your_facebook_access_token
FACEBOOK_PAGE_ID=your_facebook_page_id  # Optionnel

# LinkedIn
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_ACCESS_TOKEN=your_linkedin_access_token
LINKEDIN_ORGANIZATION_ID=your_linkedin_organization_id  # Optionnel

# Twitter
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
TWITTER_ACCESS_TOKEN=your_twitter_access_token
TWITTER_ACCESS_TOKEN_SECRET=your_twitter_access_token_secret
```

## Utilisation

### Service principal

```typescript
import { socialNetworkManager } from '../services/socialNetworkService';

// Publier sur plusieurs plateformes
const content = {
  text: 'Mon contenu de publication',
  imageUrl: 'https://example.com/image.jpg',
  hashtags: ['#jeroka', '#digitalisation'],
  linkUrl: 'https://jeroka.com'
};

const results = await socialNetworkManager.publishToMultiplePlatforms(
  ['facebook', 'linkedin', 'twitter'], 
  content
);
```

### API Endpoints

#### Récupérer les plateformes disponibles
```http
GET /api/v1/social-networks/platforms
```

#### Tester les connexions
```http
GET /api/v1/social-networks/test-connections
```

#### Publier sur plusieurs plateformes
```http
POST /api/v1/social-networks/publish
Content-Type: application/json

{
  "platforms": ["facebook", "linkedin", "twitter"],
  "content": {
    "text": "Mon contenu",
    "imageUrl": "https://example.com/image.jpg",
    "hashtags": ["#jeroka"],
    "linkUrl": "https://jeroka.com"
  }
}
```

#### Publier sur une plateforme spécifique
```http
POST /api/v1/social-networks/facebook/publish
Content-Type: application/json

{
  "content": {
    "text": "Mon contenu pour Facebook",
    "imageUrl": "https://example.com/image.jpg"
  }
}
```

## Fonctionnalités

### Facebook
- Publication de texte avec images
- Support des hashtags
- Publication programmée
- Gestion des pages Facebook

### LinkedIn
- Publication sur profil personnel ou page d'organisation
- Upload d'images
- Support des hashtags
- Gestion des organisations

### Twitter
- Publication de tweets avec images
- Support des hashtags
- Limite de 280 caractères
- Authentification OAuth 1.0a

## Gestion des erreurs

Tous les services retournent un objet `PublishResult` :

```typescript
interface PublishResult {
  success: boolean;
  postId?: string;
  url?: string;
  error?: string;
  platform: string;
}
```

## Limitations

- **Twitter** : Limite de 280 caractères par tweet
- **LinkedIn** : Nécessite une application LinkedIn approuvée
- **Facebook** : Nécessite des permissions spécifiques pour les pages
- **Images** : Taille maximale recommandée de 5MB

## Sécurité

- Tous les tokens d'accès sont stockés dans les variables d'environnement
- Les requêtes sont authentifiées via JWT
- Validation stricte des paramètres d'entrée
- Gestion des erreurs sécurisée

## Tests

Pour tester les connexions :

```bash
# Tester toutes les connexions
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3002/api/v1/social-networks/test-connections

# Tester une plateforme spécifique
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3002/api/v1/social-networks/facebook/test
```
