-- Clean existing garbage: delete snapshots older than 1 day
DELETE FROM signal_snapshots
WHERE captured_at < NOW() - INTERVAL '1 day';

-- reclaim disk space
VACUUM ANALYZE;
