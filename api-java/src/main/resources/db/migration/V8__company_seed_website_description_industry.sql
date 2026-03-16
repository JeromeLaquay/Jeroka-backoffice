-- Complète les infos entreprise (website, description, industry) pour les sociétés seed existantes
UPDATE companies SET
    website = 'https://www.jeroka-demo.com',
    description = 'Cabinet de conseil en marketing digital et stratégie web.',
    industry = 'Conseil / Marketing'
WHERE id = '11111111-1111-1111-1111-111111111111';

UPDATE companies SET
    website = 'https://www.instant-ludique.com',
    description = 'Animation et location de jeux de société pour événements et team building.',
    industry = 'Loisirs / Animation'
WHERE id = '22222222-2222-2222-2222-222222222222';
