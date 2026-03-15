# Jeroka API Dashboard (Spring Boot)

API backend Java Spring Boot, en remplacement / parallèle de l’API Node (`api-dashboard`).

## Stack

- **Java 21**, **Spring Boot 3.4**
- **PostgreSQL** (même schéma que `api-dashboard`)
- **JWT** (accès), **Spring Security**
- **Virtual threads** (Java 21) pour la montée en charge
- **AOP** : logging des entrées/sorties, convention « max 3 paramètres » en warning
- **Records** pour la config (`ApiProperties`), les DTOs et les réponses d’erreur
- **Architecture** : Controller → **MappingService** → Service → Repository (DTO & entités séparés)

## Prérequis

- **JDK 21+**
- Maven 3.9+
- PostgreSQL (même BDD que l’API Node, `ddl-auto: validate`)

## Configuration

Variables d’environnement (ou `application.yml`) :

- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` : connexion PostgreSQL
- `JWT_SECRET` : secret JWT (min. 32 caractères en prod)
- `PORT` : port du serveur (défaut 3002)
- `SPRING_PROFILES_ACTIVE` : `dev` ou `prod`
- `CORS_ORIGINS` : origines autorisées (en YAML préférer une liste ; en env, séparer par des virgules)
- `VIRTUAL_THREADS` : `true` (défaut) pour activer les virtual threads Java 21

## Lancement

**Avec Maven** (JDK 21 + Maven dans le PATH) :

```bash
cd api-java
mvn spring-boot:run
```

**Sans Maven sur la machine** (recompilation et démarrage via Docker) :

```bash
docker compose -f api-java/docker-compose.yml up -d --build
```

Cela reconstruit l’image (Maven tourne dans le conteneur) et redémarre l’API. Utile après des changements dans le code Java.

- Health : `GET http://localhost:3002/health`
- API : préfixe `http://localhost:3002/api/v1`
- Auth : `POST /api/v1/auth/login`, `POST /api/v1/auth/register`
- Users (admin) : `GET/POST/PUT/DELETE /api/v1/users`, `GET /api/v1/users/stats`, `PUT /api/v1/users/:id/status`
- Persons (clients) : `GET/POST/PUT/DELETE /api/v1/persons`, `GET /api/v1/persons/:id`, `GET /api/v1/persons/stats`
- Messages : `GET/POST/PUT/DELETE /api/v1/messages`, `GET /api/v1/messages/:id`, `GET /api/v1/messages/stats`, `POST /api/v1/messages/:id/mark-read`
- Products : `GET/POST/PUT/DELETE /api/v1/products`, `GET /api/v1/products/:id`, `GET /api/v1/products/stats`, `GET /api/v1/products/categories`
- Quotes (devis) : `GET/POST/PUT/DELETE /api/v1/quotes`, `GET /api/v1/quotes/:id`, `GET /api/v1/quotes/stats`, `GET /api/v1/quotes/next-number`
- Invoices (factures) : `GET/POST/PUT/DELETE /api/v1/invoices`, `GET /api/v1/invoices/:id`, `GET /api/v1/invoices/stats`, `GET /api/v1/invoices/next-number`, `POST /api/v1/invoices/:id/mark-paid`
- Appointments (rendez-vous) : `GET/POST/PUT/DELETE /api/v1/appointments`, `GET /api/v1/appointments/:id` (filtrés par utilisateur connecté)
- Publications (articles/actualités) : `GET/POST/PUT/DELETE /api/v1/publications`, `GET /api/v1/publications/:id`
- Dashboard : `GET /api/v1/dashboard/stats` (clients, messages, factures, devis, nouveaux ce mois/semaine)

## Architecture (4 couches)

- **Controller** : REST uniquement, validation des DTOs, délègue au MappingService.
- **MappingService** : conversion DTO ↔ entités, appelle le Service, retourne des DTOs.
- **Service** : logique métier sur les entités, utilise les Repository.
- **Repository** : accès données (JPA).

## Structure

- `config/` : CORS, Security, propriétés API (records)
- `controller/` : REST (Auth, User, Person, Message, Product, Quote, Invoice, Appointment, Publication, Dashboard, Health)
- `mapping/` : AuthMappingService, UserMappingService, PersonMappingService, MessageMappingService, ProductMappingService, QuoteMappingService, InvoiceMappingService, AppointmentMappingService, PublicationMappingService, DashboardMappingService
- `service/` : métier (Auth, User, Person, Message, Product, Quote, Invoice, Appointment, Publication, Dashboard + agrégats UserStats, DashboardStats)
- `repository/` : JPA (User, Company, Person, Message, Product, Quote, Invoice, Appointment, Publication)
- `entity/` : entités JPA (User, Company, Person, Message, Product, Quote, Invoice, Appointment, Publication)
- `dto/` : requêtes / réponses (records), `common/PageDto`
- `exception/` : `ApiException`, `GlobalExceptionHandler` (record `ErrorBody`)
- `aop/` : `LoggingAspect`, `ServiceContractAspect`, `@LogExecution`
- `security/` : JWT filter (avec ROLE_), JwtService (UserPrincipal avec companyId)
- **api/** : intégrations externes (interfaces + stubs) — **api/google** (Gmail, Drive, Calendar), **api/ia** (IaService, Chatgpt, DocumentIA), **api/docs** (AnalyzeDocuments), **api/socialnetwork** (Facebook, LinkedIn, Twitter)

## Conventions (règles projet)

- **Méthodes** : 30 lignes max, 3 paramètres max (l’AOP signale un warning au-delà).
- **Transactions** : `@Transactional` sur les services qui modifient les données.
- **Java 21** : usage de `var`, records, pattern matching pour `instanceof`, virtual threads.

## État du transfert (api-dashboard → api-java)

### Migrés (équivalents fonctionnels)

| Module | Endpoints |
|--------|-----------|
| **Auth** | POST login, POST register, GET /me |
| **Users** | CRUD, GET /stats, PUT /:id/status (par companyId) |
| **Persons** | CRUD, GET /:id, GET /stats |
| **Messages** | CRUD, GET /:id, GET /stats, POST /:id/mark-read |
| **Products** | CRUD, GET /:id, GET /stats, GET /categories |
| **Quotes** | CRUD, GET /:id, GET /stats, GET /next-number |
| **Invoices** | CRUD, GET /:id, GET /stats, GET /next-number, POST /:id/mark-paid |
| **Appointments** | CRUD, GET /:id (filtrés par userId JWT) |
| **Publications** | CRUD, GET /:id |
| **Dashboard** | GET /stats (clients, messages, factures, devis, périodes) |

### Non migrés (api-dashboard uniquement)

- **Auth** : GET/PUT /profile, POST /refresh, POST /logout, POST /change-password
- **Emails** : senders, categories, sync, recents-documents
- **Announcements** : CRUD annonces
- **Credentials / Social-networks** : gestion identifiants et réseaux sociaux
- **Settings** : config (dont Google connect/callback/status)
- **Admin** : companies, users, stats (super-admin)
- **Drive** : list, file, create (fichiers)
- **Externes (sans login)** : create-message, get-appointment-slots, reserve-appointment, get-publications

### Intégrations externes (`api-dashboard/src/api`) — structure api/ en place (stubs)

Les **appels vers des APIs externes** de `api-dashboard/src/api/` ont un **équivalent en interfaces + stubs** dans `fr.jeroka.apijava.api` ; les implémentations réelles restent à brancher.

| Dossier / Fichier (api-dashboard) | Rôle | Utilisé par (routes / services) |
|-----------------------------------|------|----------------------------------|
| **google/googleMailService.ts** | OAuth2 Gmail, list/send messages, pièces jointes | `routes/emails`, `services/googleDocumentService` |
| **google/googleDriveService.ts** | OAuth2 Drive, list/download/upload fichiers, arborescence | `routes/drive`, `api/docs/analyzeDocuments`, `googleDocumentService` |
| **google/calendar/googleCalendarService.ts** | Événements Google Calendar (list, create, update) | `googleCalendarAvailabilityRuleService` |
| **google/calendar/googleCalendarAvailabilityRuleService.ts** | RDV ↔ événements Calendar + rappels réseaux sociaux | `routes/appointments`, `services/appointmentService` |
| **ia/iaService.ts** + **chatgptService.ts** | Appels OpenAI (texte + image) | `publicationIAService`, `messageIAService` |
| **ia/DocumentIAService.ts** | Analyse de documents (factures, etc.) via IA | `routes/drive`, `api/docs/analyzeDocuments`, `googleDocumentService` |
| **docs/analyzeDocuments.ts** | Orchestration Drive + IA pour analyse de docs | `routes/drive`, `googleDocumentService` |
| **social-network/socialNetworkService.ts** + facebook/twitter/linkedin | Publication sur Facebook, Twitter, LinkedIn | `companySocialNetworkService`, `googleCalendarAvailabilityRuleService` |

**Structure `api/` créée dans api-java** (interfaces + implémentations stub, à remplacer par les vrais clients) :

- **api/google** : `GoogleOAuthCredentials`, `GmailMessageSimple`, `DriveFileSummary` ; `GoogleMailService` / `GoogleDriveService` (interfaces + Stub) ; **api/google/calendar** : `CalendarEvent`, `GoogleCalendarColors`, `GoogleCalendarService`, `GoogleCalendarAvailabilityRuleService` (interfaces + Stub).
- **api/ia** : `IaProvider`, `IaConfig`, `EmailDraftOptions` ; `ChatgptService`, `IaService`, `DocumentIAService`, `AnalyseResultIaDocument` (interfaces + Stub). Config Spring : `IaApiConfig` (provider par défaut `app.ia.provider=chatgpt`).
- **api/docs** : `AnalyzeDocuments` (orchestration Drive + IA) (interface + Stub).
- **api/socialnetwork** : `PublishContent`, `PublishResult`, `AccountInfo`, `SocialNetworkConfig` ; `SocialNetworkProvider`, `SocialNetworkService` ; `FacebookService`, `LinkedInService`, `TwitterService` (interfaces + Stub).

Pour activer les vraies intégrations : implémenter les interfaces (ex. avec Google API Client, client HTTP OpenAI, API Graph Facebook/Twitter/LinkedIn) et remplacer les Stub par des `@Primary` ou `@Qualifier` selon le besoin.
