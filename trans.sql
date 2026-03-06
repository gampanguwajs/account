-- Update statistics
ANALYZE users;
ANALYZE sessions;

-- Reindex fragmented indexes
REINDEX INDEX idx_users_email;

-- Vacuum to reclaim space
VACUUM ANALYZE users;

-- Table partitioning for large tables
CREATE TABLE users_2024 PARTITION OF users
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');