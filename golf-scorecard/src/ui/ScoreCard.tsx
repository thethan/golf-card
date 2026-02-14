import React from "react";
import { View, Text } from "react-native";
import type { HoleStats } from "../db/types";

export function Scorecard({ holes }: { holes: HoleStats[] }) {
  const totalStrokes = holes.reduce((a, h) => a + h.strokes, 0);
  const totalPutts = holes.reduce((a, h) => a + h.putts, 0);

  return (
    <View className="bg-slate-950">
      <View className="flex-row justify-between">
        <Text className="text-white font-semibold">Total</Text>
        <Text className="text-slate-200">Strokes {totalStrokes} • Putts {totalPutts}</Text>
      </View>

      <View className="mt-3">
        {holes.map((h) => (
          <View key={h.hole} className="py-3 border-b border-slate-800">
            <Text className="text-white font-semibold">Hole {h.hole}</Text>
            <Text className="text-slate-300 mt-1">
              St {h.strokes} • P {h.putts} • W100 {h.within_100 ? "✓" : "—"} •
              FW {h.fairway ? "✓" : "—"} • GIR {h.gir ? "✓" : "—"} • Haz {h.hazard ? "⚠" : "—"}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}