-- Add index for efficient cleanup on captured_at
CREATE INDEX IF NOT EXISTS idx_signal_snapshots_captured_at
ON signal_snapshots (captured_at);

-- Drop useless indexes that waste storage
DROP INDEX IF EXISTS idx_signal_snapshot_city_time;
DROP INDEX IF EXISTS ix_signal_snapshots_city;
