export const SCHEMA_SQL = `
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS rounds (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS holes (
    round_id TEXT NOT NULL,
    hole INTEGER NOT NULL,
    strokes INTEGER,
    putts INTEGER,
    within_100 INTEGER,
    fairway INTEGER,
    gir INTEGER,
    hazard INTEGER,
    balls_lost INTEGER,
    updated_at TEXT NOT NULL,
    PRIMARY KEY (round_id, hole),
    FOREIGN KEY (round_id) REFERENCES rounds(id)
  );
`;