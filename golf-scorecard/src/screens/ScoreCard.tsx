import React from "react";
import { openDb, Db } from "../db/db";
import { getRound, listHoles, upsertHole } from "../db/repo";
import { parseLine } from "../input/parseLine";
import type { Round } from "../db/types";

interface Props {
    roundId: string;
    onBack: () => void;
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

const DEFAULT_PARS_FALLBACK = [4, 4, 3, 5, 4, 4, 3, 5, 4, 4, 4, 3, 5, 4, 4, 3, 5, 4];

export function RoundScreen({ roundId, onBack }: Props) {
    const [db, setDb] = React.useState<Db | null>(null);
    const [round, setRound] = React.useState<Round | null>(null);
    const [holes, setHoles] = React.useState<HoleData[]>([]);
    const [line, setLine] = React.useState("");
    const [selectedHole, setSelectedHole] = React.useState<number | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(true);

    // Use round pars or fallback
    const pars = round?.pars ?? DEFAULT_PARS_FALLBACK;

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
            const roundData = await getRound(d, roundId);
            setRound(roundData);
            setHoles(await listHoles(d, roundId));
            setLoading(false);
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
        if ("error" in p) {
            setError(p.error);
            return;
        }

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
        setError(null);
        await refresh();
    }

    async function saveHoleDetails() {
        if (!db || !selectedHole) return;
        const strokes = parseInt(holeInput.strokes);
        if (isNaN(strokes) || strokes < 1) {
            setError("Please enter a valid stroke count");
            return;
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
        setError(null);
    }

    const getHoleData = (holeNum: number) => holes.find((h) => h.hole === holeNum);

    const getScore = (holeNum: number) => {
        const data = getHoleData(holeNum);
        return data?.strokes ?? "-";
    };

    const getScoreColor = (holeNum: number) => {
        const data = getHoleData(holeNum);
        if (!data?.strokes) return "text-gold-400/50";
        const par = pars[holeNum - 1];
        const diff = data.strokes - par;
        if (diff <= -2) return "text-amber-400";
        if (diff === -1) return "text-red-400";
        if (diff === 0) return "text-gold-100";
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
        return pars.slice(start - 1, end).reduce((a, b) => a + b, 0);
    };

    const renderHoleRow = (start: number, end: number, label: string) => (
        <div className="mb-4">
            <div className="flex flex-row border-b border-gold-700/30 pb-2">
                <div className="w-12">
                    <span className="text-gold-400/60 text-xs font-bold">{label}</span>
                </div>
                {Array.from({ length: end - start + 1 }, (_, i) => (
                    <div key={i} className="flex-1 flex items-center justify-center">
                        <span className="text-gold-400/60 text-xs font-bold">{start + i}</span>
                    </div>
                ))}
                <div className="w-12 flex items-center justify-center">
                    <span className="text-gold-400/60 text-xs font-bold">TOT</span>
                </div>
            </div>

            <div className="flex flex-row border-b border-gold-700/20 py-2">
                <div className="w-12">
                    <span className="text-gold-400/50 text-xs">PAR</span>
                </div>
                {Array.from({ length: end - start + 1 }, (_, i) => (
                    <div key={i} className="flex-1 flex items-center justify-center">
                        <span className="text-gold-400/50 text-sm">{pars[start + i - 1]}</span>
                    </div>
                ))}
                <div className="w-12 flex items-center justify-center">
                    <span className="text-gold-400/50 text-sm">{calcParTotal(start, end)}</span>
                </div>
            </div>

            <div className="flex flex-row py-2">
                <div className="w-12">
                    <span className="text-gold-100 text-xs font-semibold">SCORE</span>
                </div>
                {Array.from({ length: end - start + 1 }, (_, i) => {
                    const holeNum = start + i;
                    return (
                        <button
                            key={i}
                            onClick={() => setSelectedHole(selectedHole === holeNum ? null : holeNum)}
                            className="flex-1 flex items-center justify-center"
                        >
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    selectedHole === holeNum ? "bg-gold-400" : "bg-ink-800"
                                }`}
                            >
                                <span className={`text-sm font-bold ${getScoreColor(holeNum)}`}>
                                    {getScore(holeNum)}
                                </span>
                            </div>
                        </button>
                    );
                })}
                <div className="w-12 flex items-center justify-center">
                    <span className="text-gold-100 text-sm font-bold">{calcTotal(start, end)}</span>
                </div>
            </div>
        </div>
    );

    const renderCheckboxRow = (label: string, value: boolean, onToggle: () => void) => (
        <div className="flex flex-row items-center justify-between py-3 border-b border-gold-700/20">
            <span className="text-gold-100 text-base">{label}</span>
            <button
                onClick={onToggle}
                className={`w-12 h-6 rounded-full transition-colors ${
                    value ? "bg-fairway-600" : "bg-gray-800 border-gold-400 hover:bg-gold-700"
                }`}
            >
                <div
                    className={`w-5 h-5 rounded-full bg-gold-100 shadow transition-transform ${
                        value ? "translate-x-6" : "translate-x-0.5"
                    }`}
                />
            </button>
        </div>
    );

    const renderNumberInput = (label: string, value: string, onChange: (v: string) => void) => (
        <div className="flex flex-row items-center justify-between py-3 border-b border-gold-700/20">
            <span className="text-gold-100 text-base">{label}</span>
            <input
                type="number"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="bg-gold-100 text-ink-950 text-center w-16 py-2 rounded-lg border border-gold-700/30 placeholder-ink-950/40"
                placeholder="0"
            />
        </div>
    );

    if (loading) {
        return (
            <div className="flex flex-col min-h-screen bg-ink-950 items-center justify-center">
                <p className="text-gold-400/60">Loading round...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-ink-950">
            <div className="px-4 pt-14 pb-4 bg-crest-radial border-b border-gold-700/30">
                <div className="flex items-center justify-between mb-2">
                    <button onClick={onBack} className="text-gold-400 text-lg">
                        ← Back
                    </button>
                    <img src="/all_of_each_golf_logo.png" alt="All of Each Golf" className="h-10" />
                    <div className="w-16" />
                </div>
                <h1 className="text-gold-100 text-2xl font-bold text-center">
                    {round?.name || "⛳ Scorecard"}
                </h1>
                {round?.players && round.players.length > 0 && (
                    <p className="text-gold-400 text-center mt-1">
                        {round.players.join(", ")}
                        {round.tee_box && ` • ${round.tee_box} tees`}
                    </p>
                )}
                {(!round?.players || round.players.length === 0) && (
                    <p className="text-gold-400 text-center mt-1">Tap a hole to enter score</p>
                )}
            </div>

            {error && (
                <div className="mx-3 mt-4 p-3 bg-red-900/50 border border-red-600 rounded-lg">
                    <p className="text-red-300 text-center">{error}</p>
                    <button onClick={() => setError(null)} className="text-red-400 text-sm underline block mx-auto mt-1">
                        Dismiss
                    </button>
                </div>
            )}

            <div className="flex-1 overflow-y-auto px-3">
                <div className="mt-4 rounded-card bg-ink-900 p-3 border border-gold-700/30 shadow-lift">
                    {renderHoleRow(1, 9, "OUT")}
                    {renderHoleRow(10, 18, "IN")}

                    <div className="flex flex-row border-t border-gold-700/30 pt-3 mt-2">
                        <div className="flex-1">
                            <span className="text-gold-400/60 text-sm block">Front 9</span>
                            <span className="text-gold-100 text-xl font-bold">{calcTotal(1, 9)}</span>
                        </div>
                        <div className="flex-1 text-center">
                            <span className="text-gold-400/60 text-sm block">Back 9</span>
                            <span className="text-gold-100 text-xl font-bold">{calcTotal(10, 18)}</span>
                        </div>
                        <div className="flex-1 text-right">
                            <span className="text-gold-400 text-sm block">Total</span>
                            <span className="text-gold-400 text-2xl font-bold">
                                {typeof calcTotal(1, 9) === "number" && typeof calcTotal(10, 18) === "number"
                                    ? (calcTotal(1, 9) as number) + (calcTotal(10, 18) as number)
                                    : "-"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Hole Details Panel */}
                {selectedHole && (
                    <div className="mt-4 rounded-card bg-ink-900 p-4 border border-gold-400/50 shadow-lift">
                        <h2 className="text-gold-100 text-lg font-bold mb-1">
                            Hole {selectedHole}
                        </h2>
                        <p className="text-gold-400 text-sm mb-4">
                            Par {pars[selectedHole - 1]}
                        </p>

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

                        <div className="flex flex-row gap-3 mt-4">
                            <button
                                onClick={() => setSelectedHole(null)}
                                className="flex-1 bg-ink-700 rounded-lg py-3 text-center border border-gold-700/30"
                            >
                                <span className="text-gold-100 font-semibold">Cancel</span>
                            </button>
                            <button
                                onClick={saveHoleDetails}
                                className="flex-1 rounded-badge bg-ink-950 ring-2 ring-gold-400/70 shadow-badge py-3 text-center"
                            >
                                <span className="text-gold-100 font-semibold">Save</span>
                            </button>
                        </div>
                    </div>
                )}

                <div className="mt-4 mb-16">
                    <input
                        type="text"
                        value={line}
                        onChange={(e) => setLine(e.target.value)}
                        placeholder="e.g., hole 4 strokes 6 putts 2"
                        className="w-full bg-gold-100 text-ink-950 px-3 py-3 rounded-lg border border-gold-700/30 placeholder-ink-950/40"
                    />
                    <button
                        onClick={saveFromText}
                        className="mt-2 w-full rounded-badge bg-ink-950 text-gold-100 ring-2 ring-gold-400/70 shadow-badge hover:shadow-lift py-3 text-center transition-all"
                    >
                        <span className="font-semibold">Save</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
