export type ParsedHole = {
  hole: number;
  strokes: number;
  putts: number;
  within_100: boolean;
  fairway: boolean;
  gir: boolean;
  hazard: boolean;
};

function pickInt(s: string): number | null {
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export function parseLine(line: string): ParsedHole | { error: string } {
  const raw = line.trim().toLowerCase();
  if (!raw) return { error: "Empty input" };

  const within_100 = raw.includes("within 100") || raw.includes("within100") || raw.includes("w100");
  const fairway = raw.includes("fairway") || raw.includes("fw");
  const gir = raw.includes("gir") || raw.includes("green in reg") || raw.includes("greens in reg");
  const hazard = raw.includes("hazard") || raw.includes("water") || raw.includes("penalty") || raw.includes("haz");

  const holeMatch = raw.match(/(?:hole\s*)?(\d{1,2})/);
  const strokesMatch = raw.match(/(?:strokes?|score)\s*(\d{1,2})/);
  const puttsMatch = raw.match(/putts?\s*(\d{1,2})/);

  let hole = holeMatch?.[1] ? pickInt(holeMatch[1]) : null;
  let strokes = strokesMatch?.[1] ? pickInt(strokesMatch[1]) : null;
  let putts = puttsMatch?.[1] ? pickInt(puttsMatch[1]) : null;

  // fallback: first 3 ints in string (e.g. "4 6 2 fw")
  if (hole == null || strokes == null || putts == null) {
    const ints = raw.match(/\b\d{1,2}\b/g)?.map((x) => Number(x)) ?? [];
    if (ints.length >= 3) {
      hole ??= ints[0];
      strokes ??= ints[1];
      putts ??= ints[2];
    }
  }

  if (hole == null || strokes == null || putts == null) {
    return { error: "Expected hole, strokes, putts (e.g. 'hole 4 strokes 6 putts 2')" };
  }
  if (hole < 1 || hole > 18) return { error: "Hole must be 1-18" };
  if (strokes < 1 || strokes > 30) return { error: "Strokes looks off" };
  if (putts < 0 || putts > 10) return { error: "Putts looks off" };

  return { hole, strokes, putts, within_100, fairway, gir, hazard };
}