import type { HoleStats } from "../db/types";

export function Scorecard({ holes }: { holes: HoleStats[] }) {
  const totalStrokes = holes.reduce((a, h) => a + h.strokes, 0);
  const totalPutts = holes.reduce((a, h) => a + h.putts, 0);

  return (
    <div className="bg-ink-950">
      <div className="flex flex-row justify-between">
        <span className="text-gold-100 font-semibold">Total</span>
        <span className="text-gold-400/80">Strokes {totalStrokes} • Putts {totalPutts}</span>
      </div>

      <div className="mt-3">
        {holes.map((h) => (
          <div key={h.hole} className="py-3 border-b border-gold-700/20">
            <span className="text-gold-100 font-semibold block">Hole {h.hole}</span>
            <span className="text-gold-400/70 mt-1 block">
              St {h.strokes} • P {h.putts} • W100 {h.within_100 ? "✓" : "—"} •
              FW {h.fairway ? "✓" : "—"} • GIR {h.gir ? "✓" : "—"} • Haz {h.hazard ? "⚠" : "—"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}