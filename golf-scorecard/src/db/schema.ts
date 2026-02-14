export const SCHEMA_SQL = `
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS rounds (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS holes (
  round_id TEXT NOT NULL,
  hole INTEGER NOT NULL,
  strokes INTEGER NOT NULL,
  putts INTEGER NOT NULL,
  within_100 INTEGER NOT NULL,
  fairway INTEGER NOT NULL,
  gir INTEGER NOT NULL,
  hazard INTEGER NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (round_id, hole),
  FOREIGN KEY (round_id) REFERENCES rounds(id) ON DELETE CASCADE
);
`;