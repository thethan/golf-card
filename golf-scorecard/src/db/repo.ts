import type {Db} from "./db";
import type {HoleStats, Round} from "./types";

export async function createRound(db: Db, id: string): Promise<Round> {
    const created_at = new Date().toISOString();
    await db.runAsync(`INSERT OR IGNORE INTO rounds (id, created_at)
                       VALUES (?, ?)`, [id, created_at]);
    return {id, created_at};
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
    const rows = await db.getAllAsync<any>(
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