export type ParsedHole = {
  hole: number;
  strokes?: number;
  putts?: number;
  within_100?: boolean;
  fairway?: boolean;
  gir?: boolean;
  hazard?: boolean;ballsLostIncrement?: number;
};

function pickInt(s: string): number | null {
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}
export function parseLine(line: string, selectedHole?: number): ParsedHole | { error: string } {
  const raw = line.trim().toLowerCase();
  if (!raw) return { error: "Empty input" };

  const within_100 = raw.includes("within 100") || raw.includes("within100") || raw.includes("w100");
  const fairway = raw.includes("fairway") || raw.includes("fw") || raw.includes("fairways");
  const gir = raw.includes("gir") || raw.includes("green in reg") || raw.includes("greens in reg");
  const hazard = raw.includes("hazard") || raw.includes("water") || raw.includes("penalty") || raw.includes("haz");

  // Match "balls lost", "ball lost", "lost ball", "lost balls" with optional number before or after
  const ballsLostMatch = raw.match(/(\d+)?\s*(?:balls?\s*lost|lost\s*balls?)\s*(\d+)?/);
  let ballsLostIncrement: number | undefined = undefined;
  if (ballsLostMatch) {
    const num = ballsLostMatch[1] ?? ballsLostMatch[2];
    ballsLostIncrement = num ? pickInt(num) ?? 1 : 1;
  }

  const holeMatch = raw.match(/(?:hole\s*)(\d{1,2})/);

  // Support both "strokes 4" and "4 strokes"
  const strokesMatch = raw.match(/(?:(?:strokes?|score)\s*(\d{1,2})|(\d{1,2})\s*(?:strokes?|score))/);
  const puttsMatch = raw.match(/(?:putts?\s*(\d{1,2})|(\d{1,2})\s*putts?)/);

  let hole = holeMatch?.[1] ? pickInt(holeMatch[1]) : selectedHole ?? null;
  let strokes = (strokesMatch?.[1] ?? strokesMatch?.[2]) ? pickInt(strokesMatch[1] ?? strokesMatch[2]) ?? undefined : undefined;
  let putts = (puttsMatch?.[1] ?? puttsMatch?.[2]) ? pickInt(puttsMatch[1] ?? puttsMatch[2]) ?? undefined : undefined;

  // Only use fallback if explicit keywords not found
  if (hole == null && strokes === undefined && putts === undefined) {
    const ints = raw.match(/\b\d{1,2}\b/g)?.map((x) => Number(x)) ?? [];
    if (ints.length >= 3) {
      hole = ints[0];
      strokes = ints[1] ?? undefined;
      putts = ints[2] ?? undefined;
    }
  }

  if (hole == null) {
    return { error: "Please select a hole or specify one (e.g. 'hole 4')" };
  }
  if (hole < 1 || hole > 18) return { error: "Hole must be 1-18" };
  if (strokes !== undefined && (strokes < 1 || strokes > 30)) return { error: "Strokes looks off" };
  if (putts !== undefined && (putts < 0 || putts > 10)) return { error: "Putts looks off" };

  const result: ParsedHole = { hole };
  if (strokes !== undefined) result.strokes = strokes;
  if (putts !== undefined) result.putts = putts;
  if (within_100) result.within_100 = true;
  if (fairway) result.fairway = true;
  if (gir) result.gir = true;
  if (hazard) result.hazard = true;
  if (ballsLostIncrement !== undefined) result.ballsLostIncrement = ballsLostIncrement;

  return result;
}
