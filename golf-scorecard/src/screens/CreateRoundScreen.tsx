import React from "react";
import { openDb, Db } from "../db/db";
import { createRound, DEFAULT_PARS } from "../db/repo";

interface Props {
    onRoundCreated: (roundId: string) => void;
    onCancel: () => void;
}

function uuid(): string {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const TEE_BOXES = ["Championship", "Back", "Middle", "Forward", "Junior"];

export function CreateRoundScreen({ onRoundCreated, onCancel }: Props) {
    const [db, setDb] = React.useState<Db | null>(null);
    const [name, setName] = React.useState("");
    const [playerInput, setPlayerInput] = React.useState("");
    const [players, setPlayers] = React.useState<string[]>([]);
    const [teeBox, setTeeBox] = React.useState("Middle");
    const [pars, setPars] = React.useState<number[]>([...DEFAULT_PARS]);
    const [showParsEditor, setShowParsEditor] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        (async () => {
            const d = await openDb();
            setDb(d);
        })();
    }, []);

    function addPlayer() {
        const trimmed = playerInput.trim();
        if (trimmed && !players.includes(trimmed)) {
            setPlayers([...players, trimmed]);
            setPlayerInput("");
        }
    }

    function removePlayer(index: number) {
        setPlayers(players.filter((_, i) => i !== index));
    }

    function updatePar(hole: number, value: string) {
        const num = parseInt(value);
        if (!isNaN(num) && num >= 3 && num <= 6) {
            const newPars = [...pars];
            newPars[hole] = num;
            setPars(newPars);
        }
    }

    async function handleSubmit() {
        if (!db) return;

        if (players.length === 0) {
            setError("Please add at least one player");
            return;
        }

        const roundId = uuid();
        await createRound(db, {
            id: roundId,
            name: name.trim() || undefined,
            players,
            pars,
            tee_box: teeBox,
        });

        onRoundCreated(roundId);
    }

    return (
        <div className="flex flex-col min-h-screen bg-slate-950">
            <div className="px-4 pt-14 pb-4 bg-emerald-900 border-b border-emerald-700">
                <div className="flex items-center justify-between">
                    <button onClick={onCancel} className="text-emerald-300 text-lg">
                        ← Back
                    </button>
                    <h1 className="text-white text-xl font-bold">New Round</h1>
                    <div className="w-16" />
                </div>
            </div>

            {error && (
                <div className="mx-4 mt-4 p-3 bg-red-900/50 border border-red-600 rounded-lg">
                    <p className="text-red-300 text-center">{error}</p>
                </div>
            )}

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
                {/* Round Name */}
                <div>
                    <label className="text-slate-400 text-sm block mb-2">Round Name (optional)</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Saturday Morning Round"
                        className="w-full bg-slate-900 text-white px-4 py-3 rounded-lg border border-slate-700 placeholder-slate-500"
                    />
                </div>

                {/* Players */}
                <div>
                    <label className="text-slate-400 text-sm block mb-2">Players</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={playerInput}
                            onChange={(e) => setPlayerInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && addPlayer()}
                            placeholder="Enter player name"
                            className="flex-1 bg-slate-900 text-white px-4 py-3 rounded-lg border border-slate-700 placeholder-slate-500"
                        />
                        <button
                            onClick={addPlayer}
                            className="bg-emerald-600 px-4 rounded-lg text-white font-semibold"
                        >
                            Add
                        </button>
                    </div>
                    {players.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {players.map((player, i) => (
                                <span
                                    key={i}
                                    className="bg-slate-800 text-white px-3 py-1 rounded-full flex items-center gap-2"
                                >
                                    {player}
                                    <button
                                        onClick={() => removePlayer(i)}
                                        className="text-slate-400 hover:text-red-400"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Tee Box Selection */}
                <div>
                    <label className="text-slate-400 text-sm block mb-2">Tee Box</label>
                    <div className="grid grid-cols-3 gap-2">
                        {TEE_BOXES.map((box) => (
                            <button
                                key={box}
                                onClick={() => setTeeBox(box)}
                                className={`py-3 rounded-lg text-center transition-colors ${
                                    teeBox === box
                                        ? "bg-emerald-600 text-white"
                                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                }`}
                            >
                                {box}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Pars Configuration */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-slate-400 text-sm">Course Pars</label>
                        <button
                            onClick={() => setShowParsEditor(!showParsEditor)}
                            className="text-emerald-400 text-sm"
                        >
                            {showParsEditor ? "Hide" : "Customize"}
                        </button>
                    </div>

                    {!showParsEditor ? (
                        <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
                            <p className="text-slate-300 text-sm">
                                Total Par: {pars.reduce((a, b) => a + b, 0)} (Front: {pars.slice(0, 9).reduce((a, b) => a + b, 0)}, Back: {pars.slice(9).reduce((a, b) => a + b, 0)})
                            </p>
                        </div>
                    ) : (
                        <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                            <p className="text-slate-400 text-xs mb-3">Front 9</p>
                            <div className="grid grid-cols-9 gap-1 mb-4">
                                {pars.slice(0, 9).map((par, i) => (
                                    <div key={i} className="text-center">
                                        <span className="text-slate-500 text-xs block">{i + 1}</span>
                                        <input
                                            type="number"
                                            value={par}
                                            onChange={(e) => updatePar(i, e.target.value)}
                                            className="w-full bg-slate-800 text-white text-center py-2 rounded text-sm"
                                            min={3}
                                            max={6}
                                        />
                                    </div>
                                ))}
                            </div>
                            <p className="text-slate-400 text-xs mb-3">Back 9</p>
                            <div className="grid grid-cols-9 gap-1">
                                {pars.slice(9, 18).map((par, i) => (
                                    <div key={i} className="text-center">
                                        <span className="text-slate-500 text-xs block">{i + 10}</span>
                                        <input
                                            type="number"
                                            value={par}
                                            onChange={(e) => updatePar(i + 9, e.target.value)}
                                            className="w-full bg-slate-800 text-white text-center py-2 rounded text-sm"
                                            min={3}
                                            max={6}
                                        />
                                    </div>
                                ))}
                            </div>
                            <p className="text-slate-500 text-xs text-center mt-3">
                                Total: {pars.reduce((a, b) => a + b, 0)}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950">
                <button
                    onClick={handleSubmit}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 rounded-xl py-4 text-center transition-colors"
                >
                    <span className="text-white font-semibold text-lg">Start Round</span>
                </button>
            </div>
        </div>
    );
}

