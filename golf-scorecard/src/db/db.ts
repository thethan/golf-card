import {Platform} from "react-native";
import {SCHEMA_SQL} from "./schema";

export type Db = any;

const WEB_KEY = "golf_scorecard_db";

function loadWebDb() {
    const raw = globalThis.localStorage?.getItem(WEB_KEY);
    if (!raw) {
        const init = {rounds: [], holes: []};
        globalThis.localStorage?.setItem(WEB_KEY, JSON.stringify(init));
        return init;
    }
    return JSON.parse(raw);
}

function saveWebDb(data: any) {
    globalThis.localStorage?.setItem(WEB_KEY, JSON.stringify(data));
}

export async function openDb(): Promise<Db> {
    if (Platform.OS === "web") {
        return {
            execAsync: async () => {
            },

            runAsync: async (sql: string, params: any[] = []) => {
                const db = loadWebDb();

                // INSERT OR IGNORE INTO rounds
                if (sql.includes("INSERT OR IGNORE INTO rounds")) {
                    const [id, created_at] = params;
                    if (!db.rounds.find((r: any) => r.id === id)) {
                        db.rounds.push({id, created_at});
                    }
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
                        (h: any) => h.round_id === round_id && h.hole === hole
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
            getAllAsync: async (sql: string, params: any[] = []) => {
                const db = loadWebDb();

                // SELECT rounds
                if (sql.includes("FROM rounds")) {
                    return db.rounds;
                }

                // SELECT holes by round_id
                if (sql.includes("FROM holes")) {
                    const [roundId] = params;
                    return db.holes
                        .filter((h: any) => h.round_id === roundId)
                        .sort((a: any, b: any) => a.hole - b.hole);
                }

                return [];
            },
        };
    }

    // Native platforms use real SQLite
    const SQLite = require("expo-sqlite");
    const db = await SQLite.openDatabaseAsync("golf.db");
    await db.execAsync(SCHEMA_SQL);
    return db;
}