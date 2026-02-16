import type { HoleStats } from "../db/types";

export function Scorecard({ holes }: { holes: HoleStats[] }) {
  const totalStrokes = holes.reduce((a, h) => a + h.strokes, 0);
  const totalPutts = holes.reduce((a, h) => a + h.putts, 0);

  return (
    <div className="bg-slate-950">
      <div className="flex flex-row justify-between">
        <span className="text-white font-semibold">Total</span>
        <span className="text-slate-200">Strokes {totalStrokes} • Putts {totalPutts}</span>
      </div>

      <div className="mt-3">
        {holes.map((h) => (
          <div key={h.hole} className="py-3 border-b border-slate-800">
            <span className="text-white font-semibold block">Hole {h.hole}</span>
            <span className="text-slate-300 mt-1 block">
              St {h.strokes} • P {h.putts} • W100 {h.within_100 ? "✓" : "—"} •
              FW {h.fairway ? "✓" : "—"} • GIR {h.gir ? "✓" : "—"} • Haz {h.hazard ? "⚠" : "—"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}