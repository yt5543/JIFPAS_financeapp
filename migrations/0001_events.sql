-- 匿名イベント。個人情報・金額の列は作らない
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts INTEGER NOT NULL,
  ref TEXT NOT NULL DEFAULT '',
  mode TEXT NOT NULL DEFAULT 'unknown',
  event TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_events_ref_ts ON events (ref, ts);
