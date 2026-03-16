-- Mise à jour du statut des factures quand la date d'échéance est passée
CREATE OR REPLACE FUNCTION update_invoice_due_date_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.due_date < NOW() THEN
        UPDATE invoices SET status = 'overdue' WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Mise à jour du statut des devis quand la date de fin est passée
CREATE OR REPLACE FUNCTION update_quote_valid_until_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.valid_until < NOW() THEN
        UPDATE quotes SET status = 'expired' WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Mise à jour du statut des rendez-vous quand l'heure de fin est passée
CREATE OR REPLACE FUNCTION update_appointment_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.end_time < NOW() THEN
        UPDATE appointments SET status = 'cancelled' WHERE id = NEW.id AND NEW.status = 'pending';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Mise à jour du statut des rendez-vous quand google_event_id est null
CREATE OR REPLACE FUNCTION update_appointment_status_if_google_event_id_is_null()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.google_event_id IS NULL THEN
        UPDATE appointments SET status = 'cancelled' WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
