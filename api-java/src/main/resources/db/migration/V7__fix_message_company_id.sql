-- Correction : messages avec company_id inexistant (ex. 77777777) rattachés à Instant Ludique (22222222)
UPDATE messages
SET company_id = '22222222-2222-2222-2222-222222222222'
WHERE company_id = '77777777-7777-7777-7777-777777777777';
