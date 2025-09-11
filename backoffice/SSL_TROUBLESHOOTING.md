# Résolution des problèmes SSL - ERR_CERT_COMMON_NAME_INVALID

## Problème
L'erreur `ERR_CERT_COMMON_NAME_INVALID` se produit lorsque le certificat SSL du domaine `apibackoffice.jerokaxperience.fr` ne correspond pas au nom de domaine utilisé.

## Solutions implémentées

### 1. Configuration automatique par environnement
Le fichier `src/services/api.ts` a été modifié pour :
- Utiliser automatiquement `http://localhost:3002/api/v1` en développement
- Utiliser `https://apibackoffice.jerokaxperience.fr/api/v1` en production

### 2. Basculement manuel d'environnement
Un composant `EnvironmentSwitcher.vue` a été créé pour permettre de basculer manuellement entre les environnements.

### 3. Méthodes de l'API Service
Nouvelles méthodes disponibles :
- `apiService.switchToLocal()` - Bascule vers l'environnement local
- `apiService.switchToProduction()` - Bascule vers l'environnement de production
- `apiService.setBaseURL(url)` - Définit une URL personnalisée
- `apiService.getBaseURL()` - Retourne l'URL actuelle

## Utilisation

### En développement
```typescript
import { apiService } from '@/services/api'

// Bascule vers l'environnement local
apiService.switchToLocal()
```

### En production
```typescript
import { apiService } from '@/services/api'

// Bascule vers l'environnement de production
apiService.switchToProduction()
```

### Avec le composant EnvironmentSwitcher
```vue
<template>
  <EnvironmentSwitcher />
</template>

<script setup>
import EnvironmentSwitcher from '@/components/EnvironmentSwitcher.vue'
</script>
```

## Solutions alternatives

### 1. Créer un fichier .env.local
Créez un fichier `.env.local` dans le dossier `backoffice/` :
```
VITE_API_URL=http://localhost:3002/api/v1
```

### 2. Utiliser un proxy de développement
Ajoutez dans `vite.config.ts` :
```typescript
export default defineConfig({
  // ... autres configurations
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true
      }
    }
  }
})
```

### 3. Corriger le certificat SSL (côté serveur)
Pour résoudre définitivement le problème SSL :
1. Vérifiez que le certificat SSL inclut le bon nom de domaine
2. Utilisez un certificat wildcard ou multi-domaine
3. Renouvelez le certificat si nécessaire

## Vérification
Pour vérifier que la configuration fonctionne :
1. Ouvrez la console du navigateur
2. Vérifiez l'URL utilisée dans les requêtes réseau
3. L'erreur SSL ne devrait plus apparaître en mode local
