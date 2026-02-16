import type {Db} from "./db";
import type {HoleStats, Round} from "./types";

export const DEFAULT_PARS = [4, 4, 3, 5, 4, 4, 3, 5, 4, 4, 4, 3, 5, 4, 4, 3, 5, 4];

export async function createRound(db: Db, data: {
    id: string;
    name?: string;
    players: string[];
    pars?: number[];
    tee_box?: string;
}): Promise<Round> {
    const created_at = new Date().toISOString();
    const pars = data.pars ?? DEFAULT_PARS;
    await db.runAsync(
        `INSERT OR IGNORE INTO rounds (id, created_at, name, players, pars, tee_box)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [data.id, created_at, data.name ?? null, JSON.stringify(data.players), JSON.stringify(pars), data.tee_box ?? null]
    );
    return { id: data.id, created_at, name: data.name, players: data.players, pars, tee_box: data.tee_box };
}

export async function listRounds(db: Db): Promise<Round[]> {
    const rows = await db.getAllAsync(
        `SELECT id, created_at, name, players, pars, tee_box FROM rounds ORDER BY created_at DESC`,
        []
    );
    return rows.map((r: any) => ({
        id: r.id,
        created_at: r.created_at,
        name: r.name ?? undefined,
        players: r.players ? JSON.parse(r.players) : [],
        pars: r.pars ? JSON.parse(r.pars) : DEFAULT_PARS,
        tee_box: r.tee_box ?? undefined,
    }));
}

export async function getRound(db: Db, id: string): Promise<Round | null> {
    const rows = await db.getAllAsync(
        `SELECT id, created_at, name, players, pars, tee_box FROM rounds WHERE id = ?`,
        [id]
    );
    if (rows.length === 0) return null;
    const r: any = rows[0];
    return {
        id: r.id,
        created_at: r.created_at,
        name: r.name ?? undefined,
        players: r.players ? JSON.parse(r.players) : [],
        pars: r.pars ? JSON.parse(r.pars) : DEFAULT_PARS,
        tee_box: r.tee_box ?? undefined,
    };
}

export async function deleteRound(db: Db, id: string): Promise<void> {
    await db.runAsync(`DELETE FROM holes WHERE round_id = ?`, [id]);
    await db.runAsync(`DELETE FROM rounds WHERE id = ?`, [id]);
}

export async function upsertHole(db: Db, s: {
    round_id: string;
    hole: number;
    strokes: number;
    putts: number,
    balls_lost?: number;
    within_100?: boolean;
    fairway?: boolean;
    gir?: boolean;
    hazard?: boolean;
}): Promise<void> {
    const updated_at = new Date().toISOString();
    await db.runAsync(
        `INSERT INTO holes (round_id, hole, strokes, putts, within_100, fairway, gir, hazard, balls_lost, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(round_id,hole) DO UPDATE SET strokes=excluded.strokes,
                                                  putts=excluded.putts,
                                                  within_100=excluded.within_100,
                                                  fairway=excluded.fairway,
                                                  gir=excluded.gir,
                                                  hazard=excluded.hazard,
                                                  balls_lost=excluded.balls_lost,
                                                  updated_at=excluded.updated_at`,
        [
            s.round_id,
            s.hole,
            s.strokes,
            s.putts,
            s.within_100 ? 1 : 0,
            s.fairway ? 1 : 0,
            s.gir ? 1 : 0,
            s.hazard ? 1 : 0,
            s.balls_lost ?? 0,
            updated_at,
        ]
    );
}

export async function listHoles(db: Db, roundId: string): Promise<HoleStats[]> {
    const rows = await db.getAllAsync(
        `SELECT round_id,
                hole,
                strokes,
                putts,
                within_100,
                fairway,
                gir,
                hazard,
                balls_lost,
                updated_at
         FROM holes
         WHERE round_id = ?
         ORDER BY hole ASC`,
        [roundId]
    );

    return rows.map((r: any) => ({
        round_id: r.round_id,
        hole: Number(r.hole),
        strokes: Number(r.strokes),
        putts: Number(r.putts),
        within_100: !!r.within_100,
        fairway: !!r.fairway,
        gir: !!r.gir,
        hazard: !!r.hazard,
        balls_lost: Number(r.balls_lost),
        updated_at: String(r.updated_at),
    }));
}