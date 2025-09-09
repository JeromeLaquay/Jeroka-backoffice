# 📮 Postman Collection - Jeroka API Dashboard

Collection complète pour tester l'API backend Jeroka avec tous les endpoints et fonctionnalités.

## 🚀 **Installation**

### **1. Importer dans Postman**
1. **Ouvrir Postman**
2. **Import** → `File` → Sélectionner :
   - `Jeroka-API-Dashboard.postman_collection.json`
   - `Jeroka-Environment.postman_environment.json`
3. **Sélectionner l'environnement** "Jeroka Development"

### **2. Configuration automatique**
- ✅ **Variables d'environnement** pré-configurées
- ✅ **Tokens JWT** sauvegardés automatiquement
- ✅ **IDs des ressources** extraits automatiquement

## 📋 **Endpoints disponibles**

### **🏥 Health & Status**
- `GET /health` - Vérification de l'état de l'API
- `GET /dashboard/stats` - Statistiques du dashboard
- `GET /dashboard/recent-activity` - Activité récente

### **🔐 Authentication**
- `POST /auth/register` - Inscription utilisateur
- `POST /auth/login` - Connexion (auto-save token)
- `GET /auth/profile` - Profil utilisateur
- `PUT /auth/profile` - Modifier le profil
- `PUT /auth/change-password` - Changer le mot de passe
- `POST /auth/refresh` - Rafraîchir le token
- `POST /auth/logout` - Déconnexion

### **📧 Messages**
- `GET /messages` - Lister les messages
- `POST /messages` - Créer un message (public)
- `PUT /messages/:id/status` - Modifier le statut
- `DELETE /messages/:id` - Supprimer un message

### **🤝 Clients**
- `GET /clients` - Lister les clients
- `POST /clients` - Créer un client (entreprise/particulier)
- `PUT /clients/:id` - Modifier un client
- `DELETE /clients/:id` - Supprimer un client

### **📱 Publications**
- `GET /publications` - Lister les publications
- `POST /publications` - Créer une publication
- `PUT /publications/:id` - Modifier une publication
- `POST /publications/:id/publish` - Publier sur les plateformes
- `DELETE /publications/:id` - Supprimer une publication

### **📦 Products, 📄 Quotes, 🧾 Invoices**
- Endpoints de base pour les produits, devis et factures

## 🔑 **Variables d'environnement**

| Variable | Description | Auto-set |
|----------|-------------|----------|
| `baseUrl` | URL de base de l'API | ❌ |
| `accessToken` | Token JWT d'authentification | ✅ |
| `userId` | ID de l'utilisateur connecté | ✅ |
| `messageId` | ID du dernier message créé | ✅ |
| `clientId` | ID du dernier client créé | ✅ |
| `publicationId` | ID de la dernière publication créée | ✅ |

## 🚀 **Ordre de test recommandé**

### **1. Vérification de base**
```
1. Health Check
2. Dashboard Stats (sans auth)
```

### **2. Authentification**
```
3. Login (admin@jeroka.com / admin123)
4. Get Profile
5. Update Profile (optionnel)
```

### **3. Fonctionnalités métier**
```
6. Create Message (public - test du formulaire de contact)
7. Get All Messages (privé - voir le message créé)
8. Create Client (Company)
9. Create Client (Individual)
10. Create Publication
11. Publish to Platforms
```

### **4. Tests avancés**
```
12. Update Message Status
13. Update Client
14. Update Publication
15. Change Password
16. Logout
```

## 🔧 **Scripts automatiques inclus**

### **🔄 Auto-save des tokens**
```javascript
// Dans Login et Register
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    if (jsonData.success && jsonData.data.accessToken) {
        pm.environment.set('accessToken', jsonData.data.accessToken);
        pm.environment.set('userId', jsonData.data.user.id);
    }
}
```

### **🆔 Auto-save des IDs**
```javascript
// Dans Create Client, Message, Publication
if (pm.response.code === 201) {
    const jsonData = pm.response.json();
    if (jsonData.success && jsonData.data.id) {
        pm.environment.set('clientId', jsonData.data.id);
    }
}
```

## 💡 **Conseils d'utilisation**

### **✅ Bonnes pratiques**
1. **Commencer par Login** pour obtenir le token
2. **Vérifier l'environnement** sélectionné
3. **Suivre l'ordre** recommandé pour les tests
4. **Vérifier les réponses** dans l'onglet Tests

### **🔧 Dépannage**
- **Token expiré** → Refaire un Login
- **API non accessible** → Vérifier que Docker est démarré
- **Variables manquantes** → Réimporter l'environnement

### **🌐 URLs importantes**
- **API** : http://localhost:3002
- **Health** : http://localhost:3002/health
- **Adminer** : http://localhost:8080
- **Backoffice** : http://localhost:3001

## 📊 **Données de test incluses**

### **👤 Utilisateurs**
- **Admin** : `admin@jeroka.com` / `admin123`
- **Test** : `test@jeroka.com` / `Test123!`

### **📧 Messages**
- Contact depuis formulaire web
- Demandes de devis
- Messages d'information

### **🤝 Clients**
- Entreprise : Tech Innovations SARL
- Particulier : Pierre Martin

### **📱 Publications**
- Annonces produits
- Articles blog
- Posts réseaux sociaux

---

🎯 **Collection prête à l'emploi pour tester toute l'API Jeroka !** 🚀


