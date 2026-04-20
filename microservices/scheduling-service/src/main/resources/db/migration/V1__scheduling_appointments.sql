-- Rendez-vous (sans FK vers users / persons).
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    person_id UUID,
    google_event_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending',
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sched_appointments_user ON appointments(user_id);
CREATE INDEX idx_sched_appointments_person ON appointments(person_id);
CREATE INDEX idx_sched_appointments_start ON appointments(start_time);
CREATE INDEX idx_sched_appointments_status ON appointments(status);
