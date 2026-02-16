import { Capacitor } from "@capacitor/core";
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from "@capacitor-community/sqlite";
import { SCHEMA_SQL } from "./schema";

export type Db = {
    runAsync: (sql: string, params?: unknown[]) => Promise<void>;
    getAllAsync: (sql: string, params?: unknown[]) => Promise<unknown[]>;
    execAsync: (sql: string) => Promise<void>;
};

const WEB_KEY = "golf_scorecard_db";

function loadWebDb() {
    const raw = globalThis.localStorage?.getItem(WEB_KEY);
    if (!raw) {
        const init = { rounds: [], holes: [] };
        globalThis.localStorage?.setItem(WEB_KEY, JSON.stringify(init));
        return init;
    }
    return JSON.parse(raw);
}

function saveWebDb(data: unknown) {
    globalThis.localStorage?.setItem(WEB_KEY, JSON.stringify(data));
}

function createWebDb(): Db {
    return {
        execAsync: async () => {},

        runAsync: async (sql: string, params: unknown[] = []) => {
            const db = loadWebDb();

            // INSERT OR IGNORE INTO rounds (with new fields)
            if (sql.includes("INSERT OR IGNORE INTO rounds")) {
                const [id, created_at, name, players, pars, tee_box] = params as [string, string, string | null, string, string, string | null];
                if (!db.rounds.find((r: { id: string }) => r.id === id)) {
                    db.rounds.push({ id, created_at, name, players, pars, tee_box });
                }
                saveWebDb(db);
                return;
            }

            // DELETE FROM holes WHERE round_id = ?
            if (sql.includes("DELETE FROM holes WHERE round_id")) {
                const [roundId] = params;
                db.holes = db.holes.filter((h: { round_id: string }) => h.round_id !== roundId);
                saveWebDb(db);
                return;
            }

            // DELETE FROM rounds WHERE id = ?
            if (sql.includes("DELETE FROM rounds WHERE id")) {
                const [id] = params;
                db.rounds = db.rounds.filter((r: { id: string }) => r.id !== id);
                saveWebDb(db);
                return;
            }

            // INSERT INTO holes (with upsert behavior)
            if (sql.includes("INSERT INTO holes")) {
                const [
                    round_id,
                    hole,
                    strokes,
                    putts,
                    within_100,
                    fairway,
                    gir,
                    hazard,
                    balls_lost,
                    updated_at,
                ] = params;

                const existingIndex = db.holes.findIndex(
                    (h: { round_id: string; hole: number }) => h.round_id === round_id && h.hole === hole
                );

                const record = {
                    round_id,
                    hole,
                    strokes,
                    putts,
                    within_100,
                    fairway,
                    gir,
                    hazard,
                    balls_lost,
                    updated_at,
                };

                if (existingIndex >= 0) {
                    db.holes[existingIndex] = record;
                } else {
                    db.holes.push(record);
                }

                saveWebDb(db);
                return;
            }
        },
        getAllAsync: async (sql: string, params: unknown[] = []) => {
            const db = loadWebDb();

            // SELECT rounds by id
            if (sql.includes("FROM rounds WHERE id")) {
                const [id] = params;
                return db.rounds.filter((r: { id: string }) => r.id === id);
            }

            // SELECT all rounds (ordered by created_at desc)
            if (sql.includes("FROM rounds")) {
                return [...db.rounds].sort((a: { created_at: string }, b: { created_at: string }) =>
                    b.created_at.localeCompare(a.created_at)
                );
            }

            // SELECT holes by round_id
            if (sql.includes("FROM holes")) {
                const [roundId] = params;
                return db.holes
                    .filter((h: { round_id: string }) => h.round_id === roundId)
                    .sort((a: { hole: number }, b: { hole: number }) => a.hole - b.hole);
            }

            return [];
        },
    };
}

let sqliteConnection: SQLiteConnection | null = null;
let dbConnection: SQLiteDBConnection | null = null;

async function createNativeDb(): Promise<Db> {
    if (!sqliteConnection) {
        sqliteConnection = new SQLiteConnection(CapacitorSQLite);
    }

    if (!dbConnection) {
        const ret = await sqliteConnection.checkConnectionsConsistency();
        const isConn = (await sqliteConnection.isConnection("golf", false)).result;

        if (ret.result && isConn) {
            dbConnection = await sqliteConnection.retrieveConnection("golf", false);
        } else {
            dbConnection = await sqliteConnection.createConnection(
                "golf",
                false,
                "no-encryption",
                1,
                false
            );
        }

        await dbConnection.open();

        // Run schema
        const statements = SCHEMA_SQL.split(";")
            .map(s => s.trim())
            .filter(s => s.length > 0);

        for (const stmt of statements) {
            await dbConnection.execute(stmt);
        }
    }

    return {
        execAsync: async (sql: string) => {
            await dbConnection!.execute(sql);
        },
        runAsync: async (sql: string, params: unknown[] = []) => {
            await dbConnection!.run(sql, params as (string | number | boolean)[]);
        },
        getAllAsync: async (sql: string, params: unknown[] = []) => {
            const result = await dbConnection!.query(sql, params as (string | number | boolean)[]);
            return result.values ?? [];
        },
    };
}

export async function openDb(): Promise<Db> {
    const platform = Capacitor.getPlatform();

    if (platform === "web") {
        return createWebDb();
    }

    // Native platforms (iOS/Android) use Capacitor SQLite
    return createNativeDb();
}