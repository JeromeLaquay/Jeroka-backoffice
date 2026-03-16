-- Données initiales (démo / dev). ON CONFLICT pour éviter les doublons si rejoué.
INSERT INTO companies (id, name, legal_name, siret, email, phone, address_line1, city, postal_code, country, subscription_plan, google_calendar_id, google_drive_folder_id, website, description, industry)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Jeroka Xperience',
    'Jeroka Xperience',
    '12345678901234',
    'contact@jeroka-demo.com',
    '+33123456789',
    '123 Rue de la Démo',
    'Paris',
    '75001',
    'France',
    'premium',
    'c63d2465ed5e47c30e0253bfa96748a438bf315e3d1fe62d730d7738ad4e18aa@group.calendar.google.com',
    '1UH36qfO64XkTKVBf-RlSXeoEs9dQqBWs',
    'https://www.jeroka-demo.com',
    'Cabinet de conseil en marketing digital et stratégie web.',
    'Conseil / Marketing'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, company_id, email, password_hash, first_name, last_name, role, is_active, is_company_admin, email_verified, google_calendar_id, google_drive_folder_id)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'laquay.jerome@gmail.com',
    '$2a$10$dCIw/ziFvZk6MNxtjVtKquJOmK8bAxdj98hH6wV3DnoHa9C1D6m4K',
    'Laquay',
    'Jerome',
    'admin',
    true,
    true,
    true,
    'c63d2465ed5e47c30e0253bfa96748a438bf315e3d1fe62d730d7738ad4e18aa@group.calendar.google.com',
    '1UH36qfO64XkTKVBf-RlSXeoEs9dQqBWs'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO companies (id, name, legal_name, siret, email, phone, address_line1, city, postal_code, country, subscription_plan, google_calendar_id, google_drive_folder_id, website, description, industry)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    'Instant Ludique',
    'Instant Ludique',
    '12345678909876',
    'contact@instant-ludique.com',
    '+33123456789',
    '123 Rue de la Démo',
    'Béthune',
    '62200',
    'France',
    'premium',
    'c63d2465ed5e47c30e0253bfa96748a438bf315e3d1fe62d730d7738ad4e18aa@group.calendar.google.com',
    '1UH36qfO64XkTKVBf-RlSXeoEs9dQqBWs',
    'https://www.instant-ludique.com',
    'Animation et location de jeux de société pour événements et team building.',
    'Loisirs / Animation'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, company_id, email, password_hash, first_name, last_name, role, is_active, is_company_admin, email_verified, google_calendar_id, google_drive_folder_id)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    'patelka.fabien@gmail.com',
    '$2a$10$dCIw/ziFvZk6MNxtjVtKquJOmK8bAxdj98hH6wV3DnoHa9C1D6m4K',
    'Patelka',
    'Fabien',
    'user',
    true,
    true,
    true,
    'c63d2465ed5e47c30e0253bfa96748a438bf315e3d1fe62d730d7738ad4e18aa@group.calendar.google.com',
    '1UH36qfO64XkTKVBf-RlSXeoEs9dQqBWs'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO persons (id, company_id, first_name, last_name, email, phone, address_line1, city, postal_code, country, siret, vat_number, website, notes, source, type, type_client) VALUES
('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Jean', 'Dupont', 'jerome.laquay@hotmail.fr', '+33123456789', '123 Rue de la Démo', 'Paris', '75001', 'France', '12345678901234', 'FR12345678901', 'https://www.example.com', 'Notes client 1', 'website', 'client', 'individual'),
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Marie', 'Martin', 'laquay.jerome@gmail.com', '+33987654321', '456 Rue de la Démo', 'Paris', '75001', 'France', '12345678901234', 'FR12345678901', 'https://www.example.com', 'Notes client 2', 'website', 'client', 'company'),
('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Pierre', 'Durand', 'pierre.durand@example.com', '+33111222333', '789 Rue de la Démo', 'Paris', '75001', 'France', '12345678901234', 'FR12345678901', 'https://www.example.com', 'Notes client 3', 'website', 'supplier', NULL),
('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'Sophie', 'Sophie', 'sophie.sophie@example.com', '+33444555666', '123 Rue de la Démo', 'Paris', '75001', 'France', '12345678901234', 'FR12345678901', 'https://www.example.com', 'Notes client 1', 'website', 'client', 'individual'),
('55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'Sophie', 'Leroy', 'sophie.leroy@example.com', '+33987654321', '456 Rue de la Démo', 'Paris', '75001', 'France', '12345678901234', 'FR12345678901', 'https://www.example.com', 'Notes client 2', 'website', 'client', 'individual'),
('66666666-6666-6666-6666-666666666666', '22222222-2222-2222-2222-222222222222', 'Thomas', 'Moreau', 'thomas.moreau@example.com', '+33777888999', '789 Rue de la Démo', 'Paris', '75001', 'France', '12345678901234', 'FR12345678901', 'https://www.example.com', 'Notes client 3', 'website', 'supplier', NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO messages (id, company_id, first_name, last_name, email, phone, company, subject, message, status, priority, source) VALUES
('0e111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Jean', 'Dupont', 'jean.dupont@example.com', '+33123456789', 'Entreprise Dupont', 'Demande de devis', 'Bonjour, je souhaiterais obtenir un devis pour vos services.', 'new', 'medium', 'website'),
('0e222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Marie', 'Martin', 'marie.martin@example.com', '+33987654321', 'Société Martin', 'Question sur vos produits', 'Pouvez-vous me renseigner sur vos tarifs ?', 'read', 'low', 'email'),
('0e333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Pierre', 'Durand', 'pierre.durand@example.com', '+33111222333', 'Durand & Co', 'Problème technique', 'Nous rencontrons un problème avec votre service.', 'replied', 'high', 'phone'),
('0e444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'Sophie', 'Leroy', 'sophie.leroy@example.com', '+33444555666', 'Leroy Consulting', 'Demande de rendez-vous', 'Je souhaiterais prendre rendez-vous pour discuter de votre offre.', 'new', 'medium', 'website'),
('0e555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'Thomas', 'Moreau', 'thomas.moreau@example.com', '+33777888999', 'Moreau Industries', 'Commande urgente', 'Nous avons besoin d une commande express.', 'read', 'high', 'email'),
('0e666666-6666-6666-6666-666666666666', '22222222-2222-2222-2222-222222222222', 'Julie', 'Petit', 'julie.petit@example.com', '+33000111222', 'Petit & Associés', 'Question facturation', 'Pouvez-vous m expliquer votre système de facturation ?', 'replied', 'low', 'website')
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, company_id, name, description, sku, category, subcategory, price_ht, vat_number, cost_price, stock_quantity, min_stock_level, unit, is_active) VALUES
('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Consultation Marketing Digital', 'Accompagnement personnalisé en marketing digital', 'CONS-MD-001', 'Services', 'Consultation', 150.00, 20.00, 75.00, 999, 0, 'heure', true),
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Création de Site Web', 'Développement de site web sur mesure', 'DEV-WEB-001', 'Services', 'Développement', 2500.00, 20.00, 1250.00, 999, 0, 'projet', true),
('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Formation SEO', 'Formation complète aux techniques SEO', 'FORM-SEO-001', 'Formation', 'SEO', 800.00, 20.00, 400.00, 999, 0, 'session', true),
('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Audit Marketing', 'Audit complet de votre stratégie marketing', 'AUDIT-MK-001', 'Services', 'Audit', 500.00, 20.00, 250.00, 999, 0, 'audit', true),
('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'Maintenance Site Web', 'Maintenance et mise à jour de site web', 'MAINT-WEB-001', 'Services', 'Maintenance', 120.00, 20.00, 60.00, 999, 0, 'mois', true),
('66666666-6666-6666-6666-666666666666', '22222222-2222-2222-2222-222222222222', 'Animation Jeux de Société', 'Animation d événements avec jeux de société', 'ANIM-JS-001', 'Services', 'Animation', 200.00, 20.00, 100.00, 999, 0, 'heure', true),
('77777777-7777-7777-7777-777777777777', '22222222-2222-2222-2222-222222222222', 'Location Jeux', 'Location de jeux de société', 'LOC-JEUX-001', 'Location', 'Jeux', 15.00, 20.00, 5.00, 50, 10, 'jeu', true),
('88888888-8888-8888-8888-888888888888', '22222222-2222-2222-2222-222222222222', 'Organisation Tournoi', 'Organisation complète de tournois', 'ORG-TOUR-001', 'Services', 'Organisation', 300.00, 20.00, 150.00, 999, 0, 'tournoi', true),
('99999999-9999-9999-9999-999999999999', '22222222-2222-2222-2222-222222222222', 'Formation Jeux', 'Formation aux règles de jeux', 'FORM-JEUX-001', 'Formation', 'Jeux', 80.00, 20.00, 40.00, 999, 0, 'session', true),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'Conseil Achat Jeux', 'Conseil pour l achat de jeux', 'CONS-ACH-001', 'Services', 'Conseil', 50.00, 20.00, 25.00, 999, 0, 'conseil', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO quotes (id, company_id, quote_number, person_id, status, title, description, subtotal_ht, total_ht, total_vat, total_ttc, valid_until, notes, created_at) VALUES
('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'DV24-0001', '11111111-1111-1111-1111-111111111111', 'sent', 'Devis Site Web', 'Développement d un site web e-commerce', 2500.00, 2500.00, 500.00, 3000.00, '2024-02-15', 'Devis pour site e-commerce avec paiement en ligne', '2024-01-15 10:00:00'),
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'DV24-0002', '22222222-2222-2222-2222-222222222222', 'accepted', 'Devis Marketing Digital', 'Stratégie marketing digital complète', 1800.00, 1800.00, 360.00, 2160.00, '2024-02-20', 'Inclut SEO, réseaux sociaux et publicités', '2024-01-10 14:30:00'),
('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'DV24-0003', '33333333-3333-3333-3333-333333333333', 'draft', 'Devis Formation', 'Formation SEO pour équipe', 800.00, 800.00, 160.00, 960.00, '2024-02-25', 'Formation de 8h pour 5 personnes', '2024-01-20 09:15:00'),
('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'DV24-0001', '44444444-4444-4444-4444-444444444444', 'sent', 'Devis Animation Anniversaire', 'Animation jeux pour anniversaire enfant', 400.00, 400.00, 80.00, 480.00, '2024-02-18', 'Animation 2h pour 15 enfants', '2024-01-12 16:45:00'),
('55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'DV24-0002', '55555555-5555-5555-5555-555555555555', 'accepted', 'Devis Tournoi Entreprise', 'Organisation tournoi jeux entreprise', 600.00, 600.00, 120.00, 720.00, '2024-02-22', 'Tournoi pour 30 employés', '2024-01-08 11:20:00'),
('66666666-6666-6666-6666-666666666666', '22222222-2222-2222-2222-222222222222', 'DV24-0003', '66666666-6666-6666-6666-666666666666', 'draft', 'Devis Location Jeux', 'Location jeux pour événement', 150.00, 150.00, 30.00, 180.00, '2024-02-28', 'Location 20 jeux pour 3 jours', '2024-01-18 13:10:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO quote_items (quote_id, product_id, description, quantity, unit, unit_price_ht, discount_percent, vat_number, sort_order) VALUES
('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Développement site e-commerce', 1, 'projet', 2500.00, 0, 20.00, 1),
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Consultation marketing digital', 8, 'heure', 150.00, 0, 20.00, 1),
('22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 'Audit marketing', 1, 'audit', 500.00, 0, 20.00, 2),
('33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'Formation SEO', 1, 'session', 800.00, 0, 20.00, 1),
('44444444-4444-4444-4444-444444444444', '66666666-6666-6666-6666-666666666666', 'Animation jeux de société', 2, 'heure', 200.00, 0, 20.00, 1),
('55555555-5555-5555-5555-555555555555', '88888888-8888-8888-8888-888888888888', 'Organisation tournoi', 1, 'tournoi', 300.00, 0, 20.00, 1),
('55555555-5555-5555-5555-555555555555', '66666666-6666-6666-6666-666666666666', 'Animation jeux', 3, 'heure', 200.00, 0, 20.00, 2),
('66666666-6666-6666-6666-666666666666', '77777777-7777-7777-7777-777777777777', 'Location jeux de société', 20, 'jeu', 15.00, 0, 20.00, 1);

INSERT INTO invoices (id, company_id, invoice_number, person_id, status, title, description, subtotal_ht, total_ht, total_vat, total_ttc, issue_date, due_date, payment_terms, created_at) VALUES
('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'FAC24-0001', '11111111-1111-1111-1111-111111111111', 'paid', 'Facture Site Web', 'Développement site e-commerce', 2500.00, 2500.00, 500.00, 3000.00, '2024-01-15', '2024-02-15', '30 jours', '2024-01-15 10:00:00'),
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'FAC24-0002', '22222222-2222-2222-2222-222222222222', 'sent', 'Facture Marketing Digital', 'Stratégie marketing digital', 1800.00, 1800.00, 360.00, 2160.00, '2024-01-20', '2024-02-20', '30 jours', '2024-01-20 14:30:00'),
('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'FAC24-0003', '44444444-4444-4444-4444-444444444444', 'paid', 'Facture Animation', 'Animation anniversaire', 400.00, 400.00, 80.00, 480.00, '2024-01-12', '2024-02-12', '30 jours', '2024-01-12 16:45:00'),
('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'FAC24-0004', '55555555-5555-5555-5555-555555555555', 'overdue', 'Facture Tournoi', 'Organisation tournoi entreprise', 600.00, 600.00, 120.00, 720.00, '2024-01-08', '2024-02-08', '30 jours', '2024-01-08 11:20:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO invoice_items (invoice_id, product_id, description, quantity, unit, unit_price_ht, discount_percent, vat_number, sort_order) VALUES
('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Développement site e-commerce', 1, 'projet', 2500.00, 0, 20.00, 1),
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Consultation marketing digital', 8, 'heure', 150.00, 0, 20.00, 1),
('22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 'Audit marketing', 1, 'audit', 500.00, 0, 20.00, 2),
('33333333-3333-3333-3333-333333333333', '66666666-6666-6666-6666-666666666666', 'Animation jeux de société', 2, 'heure', 200.00, 0, 20.00, 1),
('44444444-4444-4444-4444-444444444444', '88888888-8888-8888-8888-888888888888', 'Organisation tournoi', 1, 'tournoi', 300.00, 0, 20.00, 1),
('44444444-4444-4444-4444-444444444444', '66666666-6666-6666-6666-666666666666', 'Animation jeux', 3, 'heure', 200.00, 0, 20.00, 2);

INSERT INTO appointments (user_id, person_id, google_event_id, start_time, end_time, status, notes) VALUES
('11111111-1111-1111-1111-111111111111', NULL, '11111111-1111-1111-1111-111111111111', '2025-09-16 10:00:00', '2025-09-16 11:00:00', 'pending', 'Présentation des services marketing digital'),
('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '2025-09-17 14:30:00', '2025-09-17 15:30:00', 'reserved', 'Discussion projet site web'),
('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', '2025-09-18 16:00:00', '2025-09-18 17:00:00', 'cancelled', 'Formation SEO'),
('22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', '2025-09-17 15:00:00', '2025-09-17 17:00:00', 'cancelled_by_client', 'Animation anniversaire enfant'),
('22222222-2222-2222-2222-222222222222', NULL, '55555555-5555-5555-5555-555555555555', '2025-09-18 19:00:00', '2025-09-18 22:00:00', 'pending', 'Tournoi entreprise'),
('22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666666', '2025-09-19 14:00:00', '2025-09-19 16:00:00', 'reserved', 'Formation jeux de société');
