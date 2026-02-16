import React from "react";
import { View, Text, TextInput, Pressable, ScrollView, Alert, Switch } from "react-native";
import { openDb } from "../db/db";
import { createRound, listHoles, upsertHole } from "../db/repo";
import { parseLine } from "../input/parseLine";
import { startVoice, stopVoice } from "../input/voice";

function uuid(): string {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

interface HoleData {
    hole: number;
    strokes: number;
    putts: number;
    par?: number;
    within_100?: boolean;
    fairway?: boolean;
    gir?: boolean;
    hazard?: boolean;
    balls_lost?: number;
}

const DEFAULT_PARS = [4, 4, 3, 5, 4, 4, 3, 5, 4, 4, 4, 3, 5, 4, 4, 3, 5, 4];

export function RoundScreen() {
    const [db, setDb] = React.useState<any>(null);
    const [roundId] = React.useState<string>(() => uuid());
    const [holes, setHoles] = React.useState<HoleData[]>([]);
    const [line, setLine] = React.useState("");
    const [listening, setListening] = React.useState(false);
    const [selectedHole, setSelectedHole] = React.useState<number | null>(null);

    // Input state for selected hole
    const [holeInput, setHoleInput] = React.useState({
        strokes: "",
        putts: "",
        within100: false,
        fairway: false,
        gir: false,
        hazard: false,
        ballsLost: "",
    });

    React.useEffect(() => {
        (async () => {
            const d = await openDb();
            setDb(d);
            await createRound(d, roundId);
            setHoles(await listHoles(d, roundId));
        })();
    }, [roundId]);

    // Load existing hole data when selecting a hole
    React.useEffect(() => {
        if (selectedHole) {
            const data = getHoleData(selectedHole);
            setHoleInput({
                strokes: data?.strokes?.toString() ?? "",
                putts: data?.putts?.toString() ?? "",
                within100: data?.within_100 ?? false,
                fairway: data?.fairway ?? false,
                gir: data?.gir ?? false,
                hazard: data?.hazard ?? false,
                ballsLost: data?.balls_lost?.toString() ?? "",
            });
        }
    }, [selectedHole, holes]);

    async function refresh() {
        if (!db) return;
        setHoles(await listHoles(db, roundId));
    }

    async function saveFromText() {
        if (!db) return;
        const p = parseLine(line, selectedHole ?? undefined);
        if ("error" in p) return Alert.alert("Parse error", p.error);

        const existing = getHoleData(p.hole);
        const newBallsLost = (existing?.balls_lost ?? 0) + (p.ballsLostIncrement ?? 0);

        await upsertHole(db, {
            round_id: roundId,
            hole: p.hole,
            strokes: p.strokes ?? existing?.strokes ?? 0,
            putts: p.putts ?? existing?.putts ?? 0,
            within_100: p.within_100 ?? existing?.within_100 ?? false,
            fairway: p.fairway ?? existing?.fairway ?? false,
            gir: p.gir ?? existing?.gir ?? false,
            hazard: p.hazard ?? existing?.hazard ?? false,
            balls_lost: newBallsLost,
        });
        setLine("");
        await refresh();
    }


    async function saveHoleDetails() {
        if (!db || !selectedHole) return;
        const strokes = parseInt(holeInput.strokes);
        if (isNaN(strokes) || strokes < 1) {
            return Alert.alert("Invalid", "Please enter a valid stroke count");
        }
        await upsertHole(db, {
            round_id: roundId,
            hole: selectedHole,
            strokes,
            putts: parseInt(holeInput.putts) || 0,
            within_100: holeInput.within100,
            fairway: holeInput.fairway,
            gir: holeInput.gir,
            hazard: holeInput.hazard,
            balls_lost: parseInt(holeInput.ballsLost) || 0,
        });
        await refresh();
        setSelectedHole(null);
    }


    const getHoleData = (holeNum: number) => holes.find((h) => h.hole === holeNum);

    const getScore = (holeNum: number) => {
        const data = getHoleData(holeNum);
        return data?.strokes ?? "-";
    };

    const getScoreColor = (holeNum: number) => {
        const data = getHoleData(holeNum);
        if (!data?.strokes) return "text-slate-500";
        const par = DEFAULT_PARS[holeNum - 1];
        const diff = data.strokes - par;
        if (diff <= -2) return "text-amber-400";
        if (diff === -1) return "text-red-400";
        if (diff === 0) return "text-white";
        if (diff === 1) return "text-sky-400";
        return "text-sky-600";
    };

    const calcTotal = (start: number, end: number) => {
        let total = 0;
        for (let i = start; i <= end; i++) {
            const data = getHoleData(i);
            if (data?.strokes) total += data.strokes;
        }
        return total || "-";
    };

    const calcParTotal = (start: number, end: number) => {
        return DEFAULT_PARS.slice(start - 1, end).reduce((a, b) => a + b, 0);
    };

    const renderHoleRow = (start: number, end: number, label: string) => (
        <View className="mb-4">
            <View className="flex-row border-b border-slate-700 pb-2">
                <View className="w-12">
                    <Text className="text-slate-400 text-xs font-bold">{label}</Text>
                </View>
                {Array.from({ length: end - start + 1 }, (_, i) => (
                    <View key={i} className="flex-1 items-center">
                        <Text className="text-slate-400 text-xs font-bold">{start + i}</Text>
                    </View>
                ))}<View className="w-12 items-center">
                <Text className="text-slate-400 text-xs font-bold">TOT</Text>
            </View>
            </View>

            <View className="flex-row border-b border-slate-800 py-2">
                <View className="w-12">
                    <Text className="text-slate-500 text-xs">PAR</Text>
                </View>
                {Array.from({ length: end - start + 1 }, (_, i) => (
                    <View key={i} className="flex-1 items-center">
                        <Text className="text-slate-500 text-sm">{DEFAULT_PARS[start + i - 1]}</Text>
                    </View>
                ))}
                <View className="w-12 items-center">
                    <Text className="text-slate-500 text-sm">{calcParTotal(start, end)}</Text>
                </View>
            </View>

            <View className="flex-row py-2">
                <View className="w-12">
                    <Text className="text-white text-xs font-semibold">SCORE</Text>
                </View>
                {Array.from({ length: end - start + 1 }, (_, i) => {
                    const holeNum = start + i;
                    return (
                        <Pressable
                            key={i}
                            onPress={() => setSelectedHole(selectedHole === holeNum ? null : holeNum)}
                            className="flex-1 items-center"
                        >
                            <View
                                className={`w-8 h-8 rounded-full items-center justify-center ${
                                    selectedHole === holeNum ? "bg-emerald-600" : "bg-slate-800"
                                }`}
                            >
                                <Text className={`text-sm font-bold ${getScoreColor(holeNum)}`}>
                                    {getScore(holeNum)}
                                </Text>
                            </View>
                        </Pressable>
                    );
                })}
                <View className="w-12 items-center justify-center">
                    <Text className="text-white text-sm font-bold">{calcTotal(start, end)}</Text>
                </View>
            </View>
        </View>
    );

    const renderCheckboxRow = (label: string, value: boolean, onToggle: () => void) => (
        <View className="flex-row items-center justify-between py-3 border-b border-slate-800">
            <Text className="text-white text-base">{label}</Text>
            <Switch
                value={value}
                onValueChange={onToggle}
                trackColor={{ false: "#475569", true: "#059669" }}
                thumbColor={value ? "#10b981" : "#94a3b8"}
            />
        </View>
    );

    const renderNumberInput = (label: string, value: string, onChange: (v: string) => void) => (
        <View className="flex-row items-center justify-between py-3 border-b border-slate-800">
            <Text className="text-white text-base">{label}</Text>
            <TextInput
                value={value}
                onChangeText={onChange}
                keyboardType="number-pad"
                className="bg-slate-800 text-white text-center w-16 py-2 rounded-lg"
                placeholderTextColor="#64748b"
                placeholder="0"
            />
        </View>
    );

    return (
        <View className="flex-1 bg-slate-950">
            <View className="px-4 pt-14 pb-4 bg-emerald-900 border-b border-emerald-700">
                <Text className="text-white text-2xl font-bold text-center">⛳ Scorecard</Text>
                <Text className="text-emerald-300 text-center mt-1">Tap a hole to enter score</Text>
            </View>
            <ScrollView className="flex-1 px-3">
                <View className="mt-4 bg-slate-900 rounded-xl p-3 border border-slate-800">
                    {renderHoleRow(1, 9, "OUT")}
                    {renderHoleRow(10, 18, "IN")}

                    <View className="flex-row border-t border-slate-700 pt-3 mt-2">
                        <View className="flex-1">
                            <Text className="text-slate-400 text-sm">Front 9</Text>
                            <Text className="text-white text-xl font-bold">{calcTotal(1, 9)}</Text>
                        </View>
                        <View className="flex-1 items-center">
                            <Text className="text-slate-400 text-sm">Back 9</Text>
                            <Text className="text-white text-xl font-bold">{calcTotal(10, 18)}</Text>
                        </View>
                        <View className="flex-1 items-end">
                            <Text className="text-emerald-400 text-sm">Total</Text>
                            <Text className="text-emerald-400 text-2xl font-bold">
                                {typeof calcTotal(1, 9) === "number" && typeof calcTotal(10, 18) === "number"
                                    ? (calcTotal(1, 9) as number) + (calcTotal(10, 18) as number)
                                    : "-"}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Hole Details Panel */}
                {selectedHole && (
                    <View className="mt-4 bg-slate-900 rounded-xl p-4 border border-emerald-600">
                        <Text className="text-white text-lg font-bold mb-1">
                            Hole {selectedHole}
                        </Text>
                        <Text className="text-emerald-400 text-sm mb-4">
                            Par {DEFAULT_PARS[selectedHole - 1]}
                        </Text>

                        {renderNumberInput("Total Strokes", holeInput.strokes, (v) =>
                            setHoleInput({ ...holeInput, strokes: v })
                        )}
                        {renderNumberInput("Putts", holeInput.putts, (v) =>
                            setHoleInput({ ...holeInput, putts: v })
                        )}
                        {renderCheckboxRow("Within 100 yards", holeInput.within100, () =>
                            setHoleInput({ ...holeInput, within100: !holeInput.within100 })
                        )}
                        {renderCheckboxRow("Fairway Hit (FW)", holeInput.fairway, () =>
                            setHoleInput({ ...holeInput, fairway: !holeInput.fairway })
                        )}
                        {renderCheckboxRow("Green in Regulation (GIR)", holeInput.gir, () =>
                            setHoleInput({ ...holeInput, gir: !holeInput.gir })
                        )}
                        {renderCheckboxRow("Hazard", holeInput.hazard, () =>
                            setHoleInput({ ...holeInput, hazard: !holeInput.hazard })
                        )}
                        {renderNumberInput("Balls Lost", holeInput.ballsLost, (v) =>
                            setHoleInput({ ...holeInput, ballsLost: v })
                        )}

                        <View className="flex-row gap-3 mt-4">
                            <Pressable
                                onPress={() => setSelectedHole(null)}
                                className="flex-1 bg-slate-700 rounded-lg py-3 items-center"
                            >
                                <Text className="text-white font-semibold">Cancel</Text>
                            </Pressable>
                            <Pressable
                                onPress={saveHoleDetails}
                                className="flex-1 bg-emerald-600 rounded-lg py-3 items-center"
                            >
                                <Text className="text-white font-semibold">Save</Text>
                            </Pressable>
                        </View>
                    </View>
                )}<View className="mt-4 mb-16">
                <TextInput
                    value={line}
                    onChangeText={setLine}
                    placeholder="e.g., hole 4 strokes 6 putts 2"
                    placeholderTextColor="#64748b"
                    className="bg-slate-900 text-white px-3 py-3 rounded-lg border border-slate-800"
                />
                <Pressable onPress={saveFromText} className="mt-2 bg-emerald-600 rounded-lg py-3 items-center">
                    <Text className="text-white font-semibold">Save</Text>
                </Pressable>
            </View>
            </ScrollView>
        </View>
    );
}
