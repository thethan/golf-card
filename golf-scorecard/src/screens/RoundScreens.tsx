import React from "react";
import { View, Text, TextInput, Pressable, ScrollView, Alert } from "react-native";
import { openDb } from "../db/db";
import { createRound, listHoles, upsertHole } from "../db/repo";
import { parseLine } from "../input/parseLine";
import { startVoice, stopVoice } from "../input/voice";
import { ToggleRow } from "../ui/ToggleRow";
import { Scorecard } from "../ui/ScoreCard";

function uuid(): string {
  // simple fallback UUID
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function RoundScreen() {
  const [db, setDb] = React.useState<any>(null);
  const [roundId] = React.useState<string>(() => uuid());
  const [holes, setHoles] = React.useState<any[]>([]);

  // quick manual inputs (optional, alongside text parser)
  const [hole, setHole] = React.useState("1");
  const [strokes, setStrokes] = React.useState("5");
  const [putts, setPutts] = React.useState("2");
  const [within100, setWithin100] = React.useState(false);
  const [fairway, setFairway] = React.useState(false);
  const [gir, setGir] = React.useState(false);
  const [hazard, setHazard] = React.useState(false);

  const [line, setLine] = React.useState("");
  const [listening, setListening] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const d = await openDb();
      setDb(d);
      await createRound(d, roundId);
      setHoles(await listHoles(d, roundId));
    })();
  }, [roundId]);

  async function refresh() {
    if (!db) return;
    setHoles(await listHoles(db, roundId));
  }

  async function saveFromText() {
    if (!db) return;
    const p = parseLine(line);
    if ("error" in p) return Alert.alert("Parse error", p.error);

    await upsertHole(db, { round_id: roundId, ...p });
    setLine("");
    await refresh();
  }

  async function saveManual() {
    if (!db) return;
    const h = Number(hole), s = Number(strokes), p = Number(putts);
    if (!Number.isFinite(h) || h < 1 || h > 18) return Alert.alert("Error", "Hole must be 1-18");

    await upsertHole(db, {
      round_id: roundId,
      hole: h,
      strokes: Number.isFinite(s) ? s : 0,
      putts: Number.isFinite(p) ? p : 0,
      within_100: within100,
      fairway,
      gir,
      hazard,
    });
    await refresh();
  }

  async function onStartVoice() {
    setListening(true);
    await startVoice(
      (t) => {
        setLine(t);
        setListening(false);
        stopVoice();
      },
      (e) => {
        setListening(false);
        stopVoice();
        Alert.alert("Voice error", e);
      }
    );
  }

  function onStopVoice() {
    setListening(false);
    stopVoice();
  }

  return (
    <View className="flex-1 bg-slate-950">
      <View className="px-4 pt-14 pb-4 border-b border-slate-800">
        <Text className="text-white text-xl font-semibold">Round</Text>
        <Text className="text-slate-400 mt-1">Round ID: {roundId}</Text>
      </View>

      <ScrollView className="flex-1 px-4">
        {/* Text / Voice */}
        <View className="mt-4">
          <Text className="text-slate-200 font-semibold mb-2">Quick input</Text>
          <TextInput
            value={line}
            onChangeText={setLine}
            placeholder="hole 4 strokes 6 putts 2 within 100 fairway gir hazard"
            placeholderTextColor="#64748b"
            className="bg-slate-900 text-white px-3 py-3 rounded-lg border border-slate-800"
          />
          <View className="flex-row gap-3 mt-3">
            <Pressable onPress={saveFromText} className="flex-1 bg-emerald-600 rounded-lg py-3 items-center">
              <Text className="text-white font-semibold">Save (text)</Text>
            </Pressable>

            <Pressable
              onPress={listening ? onStopVoice : onStartVoice}
              className={listening ? "flex-1 bg-rose-600 rounded-lg py-3 items-center" : "flex-1 bg-slate-800 rounded-lg py-3 items-center"}
            >
              <Text className="text-white font-semibold">{listening ? "Stop voice" : "Voice"}</Text>
            </Pressable>
          </View>
        </View>

        {/* Manual form */}
        <View className="mt-8">
          <Text className="text-slate-200 font-semibold mb-2">Manual form</Text>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="text-slate-400 mb-1">Hole</Text>
              <TextInput value={hole} onChangeText={setHole} keyboardType="number-pad"
                className="bg-slate-900 text-white px-3 py-3 rounded-lg border border-slate-800" />
            </View>
            <View className="flex-1">
              <Text className="text-slate-400 mb-1">Strokes</Text>
              <TextInput value={strokes} onChangeText={setStrokes} keyboardType="number-pad"
                className="bg-slate-900 text-white px-3 py-3 rounded-lg border border-slate-800" />
            </View>
            <View className="flex-1">
              <Text className="text-slate-400 mb-1">Putts</Text>
              <TextInput value={putts} onChangeText={setPutts} keyboardType="number-pad"
                className="bg-slate-900 text-white px-3 py-3 rounded-lg border border-slate-800" />
            </View>
          </View>

          <View className="mt-3 gap-2">
            <ToggleRow label="Within 100" value={within100} onChange={setWithin100} />
            <ToggleRow label="Fairway hit" value={fairway} onChange={setFairway} />
            <ToggleRow label="GIR" value={gir} onChange={setGir} />
            <ToggleRow label="Hazard" value={hazard} onChange={setHazard} />
          </View>

          <Pressable onPress={saveManual} className="mt-3 bg-slate-800 rounded-lg py-3 items-center">
            <Text className="text-white font-semibold">Save (manual)</Text>
          </Pressable>
        </View>

        {/* Scorecard */}
        <View className="mt-10 mb-16">
          <Text className="text-slate-200 font-semibold mb-2">Scorecard</Text>
          <View className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <Scorecard holes={holes} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}