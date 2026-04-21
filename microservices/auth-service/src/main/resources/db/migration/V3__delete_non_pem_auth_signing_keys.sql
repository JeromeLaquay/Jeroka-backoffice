-- Supprime les enregistrements de clés non parsables (ex. seed historique avec PEM factice).
-- JwksKeyService régénère une clé RSA valide si aucune ligne ACTIVE restante.
DELETE FROM auth_signing_keys
WHERE private_pem IS NULL
   OR btrim(private_pem) = ''
   OR private_pem NOT LIKE '-----BEGIN%';
