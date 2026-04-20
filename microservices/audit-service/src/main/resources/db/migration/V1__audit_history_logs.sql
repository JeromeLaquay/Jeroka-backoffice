CREATE TABLE history_logs (
    id UUID PRIMARY KEY,
    topic VARCHAR(255) NOT NULL,
    event_id UUID,
    correlation_id VARCHAR(255),
    payload TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_history_logs_topic_created ON history_logs (topic, created_at DESC);
