-- Données complémentaires pour les tables vides (démo / dev).
-- Réutilise les companies et users de V5.

-- =============================================
-- message_replies (réponses aux messages existants)
-- =============================================
INSERT INTO message_replies (message_id, content, is_from_customer, author_name)
SELECT m.id, 'Merci pour votre message. Nous vous recontacterons sous 48h.', false, 'Support Jeroka'
FROM messages m
WHERE m.company_id = '11111111-1111-1111-1111-111111111111' AND m.email = 'jean.dupont@example.com'
LIMIT 1;

INSERT INTO message_replies (message_id, content, is_from_customer, author_name)
SELECT m.id, 'Voici nos tarifs : consultation 150€/h, formation 800€/session.', false, 'Support Jeroka'
FROM messages m
WHERE m.company_id = '11111111-1111-1111-1111-111111111111' AND m.email = 'marie.martin@example.com'
LIMIT 1;

INSERT INTO message_replies (message_id, content, is_from_customer, author_name)
SELECT m.id, 'Pouvez-vous préciser le problème rencontré ?', false, 'Support Jeroka'
FROM messages m
WHERE m.company_id = '11111111-1111-1111-1111-111111111111' AND m.email = 'pierre.durand@example.com'
LIMIT 1;

INSERT INTO message_replies (message_id, content, is_from_customer, author_name)
SELECT m.id, 'Nous sommes disponibles la semaine prochaine.', false, 'Équipe Instant Ludique'
FROM messages m
WHERE m.company_id = '22222222-2222-2222-2222-222222222222' AND m.email = 'sophie.leroy@example.com'
LIMIT 1;

-- =============================================
-- publications
-- =============================================
INSERT INTO publications (id, company_id, title, content, excerpt, type, status, category, slug, published_at) VALUES
('a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Les tendances SEO 2024', 'Contenu sur les tendances SEO et bonnes pratiques.', 'Résumé tendances SEO', 'standard', 'published', 'Marketing', 'tendances-seo-2024', NOW() - INTERVAL '5 days'),
('a2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Création de site web : par où commencer ?', 'Guide pour bien démarrer un projet web.', 'Guide démarrage projet web', 'tutorial', 'published', 'Développement', 'creation-site-web-guide', NOW() - INTERVAL '3 days'),
('a3333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'Organiser un tournoi de jeux en entreprise', 'Conseils pour animer un team building ludique.', 'Team building jeux', 'announcement', 'published', 'Événement', 'tournoi-jeux-entreprise', NOW() - INTERVAL '2 days'),
('a4444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'Nos nouveaux jeux en location', 'Découvrez notre catalogue de jeux à louer.', 'Catalogue location jeux', 'promotion', 'draft', 'Catalogue', 'nouveaux-jeux-location', NULL)
ON CONFLICT (company_id, slug) DO NOTHING;

-- =============================================
-- publication_platforms (liens publications → plateformes)
-- =============================================
INSERT INTO publication_platforms (publication_id, platform, status, published_at) VALUES
('a1111111-1111-1111-1111-111111111111', 'linkedin', 'published', NOW() - INTERVAL '5 days'),
('a1111111-1111-1111-1111-111111111111', 'website', 'published', NOW() - INTERVAL '5 days'),
('a2222222-2222-2222-2222-222222222222', 'website', 'published', NOW() - INTERVAL '3 days'),
('a3333333-3333-3333-3333-333333333333', 'facebook', 'published', NOW() - INTERVAL '2 days'),
('a3333333-3333-3333-3333-333333333333', 'website', 'published', NOW() - INTERVAL '2 days')
ON CONFLICT (publication_id, platform) DO NOTHING;

-- =============================================
-- google_documents (documents Google Drive liés)
-- =============================================
INSERT INTO google_documents (id, company_id, person_id, name, mime_type, web_view_link) VALUES
('b1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', NULL, 'Devis_Dupont_2024.pdf', 'application/pdf', 'https://drive.google.com/file/d/demo1/view'),
('b2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Contrat_Jean_Dupont.pdf', 'application/pdf', 'https://drive.google.com/file/d/demo2/view'),
('b3333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 'Devis_Animation_Sophie.pdf', 'application/pdf', 'https://drive.google.com/file/d/demo3/view')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- history_logs (historique d'actions)
-- =============================================
INSERT INTO history_logs (id, user_id, invoice_id, quote_id, person_id, action, status, created_at) VALUES
('e1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', NULL, NULL, 'invoice.created', 'success', NOW() - INTERVAL '10 days'),
('e2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', NULL, '11111111-1111-1111-1111-111111111111', NULL, 'quote.sent', 'success', NOW() - INTERVAL '15 days'),
('e3333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', NULL, NULL, '11111111-1111-1111-1111-111111111111', 'person.updated', 'success', NOW() - INTERVAL '2 days'),
('e4444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', NULL, NULL, 'invoice.paid', 'success', NOW() - INTERVAL '5 days'),
('e5555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', NULL, NULL, '55555555-5555-5555-5555-555555555555', 'person.created', 'success', NOW() - INTERVAL '20 days')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- email_categories (catégories d'emails par utilisateur)
-- =============================================
INSERT INTO email_categories (id, user_id, name, download_attachments) VALUES
('c1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Clients', true),
('c2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Fournisseurs', true),
('c3333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'Réservations', true),
('c4444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'Partenaires', false)
ON CONFLICT (id) DO NOTHING;
