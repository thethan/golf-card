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
        <div className="flex flex-col min-h-screen bg-ink-950">
            <div className="px-4 pt-14 pb-4 bg-crest-radial border-b border-gold-700/30">
                <div className="flex items-center justify-between">
                    <button onClick={onCancel} className="text-gold-400 text-lg">
                        ← Back
                    </button>
                    <img src="/all_of_each_golf_logo.png" alt="All of Each Golf" className="h-10" />
                    <h1 className="text-gold-100 text-xl font-bold">New Round</h1>
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
                    <label className="text-gold-400/60 text-sm block mb-2">Round Name (optional)</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Saturday Morning Round"
                        className="w-full bg-ink-900 text-gold-100 px-4 py-3 rounded-lg border border-gold-700/30 placeholder-gold-400/40"
                    />
                </div>

                {/* Players */}
                <div>
                    <label className="text-gold-400/60 text-sm block mb-2">Players</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={playerInput}
                            onChange={(e) => setPlayerInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && addPlayer()}
                            placeholder="Enter player name"
                            className="flex-1 bg-ink-900 text-gold-100 px-4 py-3 rounded-lg border border-gold-700/30 placeholder-gold-400/40"
                        />
                        <button
                            onClick={addPlayer}
                            className="bg-fairway-600 px-4 rounded-lg text-gold-100 font-semibold"
                        >
                            Add
                        </button>
                    </div>
                    {players.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {players.map((player, i) => (
                                <span
                                    key={i}
                                    className="bg-ink-950 text-gold-100 px-3 py-1 rounded-full flex items-center gap-2 ring-1 ring-gold-400/50"
                                >
                                    {player}
                                    <button
                                        onClick={() => removePlayer(i)}
                                        className="text-gold-400/60 hover:text-red-400"
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
                    <label className="text-gold-400/60 text-sm block mb-2">Tee Box</label>
                    <div className="grid grid-cols-3 gap-2">
                        {TEE_BOXES.map((box) => (
                            <button
                                key={box}
                                onClick={() => setTeeBox(box)}
                                className={`py-3 rounded-lg text-center transition-colors ${
                                    teeBox === box
                                        ? "bg-fairway-600 text-gold-100"
                                        : "bg-ink-900 text-gold-400/70 hover:bg-ink-800 border border-gold-700/30"
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
                        <label className="text-gold-400/60 text-sm">Course Pars</label>
                        <button
                            onClick={() => setShowParsEditor(!showParsEditor)}
                            className="text-gold-400 text-sm"
                        >
                            {showParsEditor ? "Hide" : "Customize"}
                        </button>
                    </div>

                    {!showParsEditor ? (
                        <div className="bg-ink-900 p-3 rounded-lg border border-gold-700/30">
                            <p className="text-gold-100/80 text-sm">
                                Total Par: {pars.reduce((a, b) => a + b, 0)} (Front: {pars.slice(0, 9).reduce((a, b) => a + b, 0)}, Back: {pars.slice(9).reduce((a, b) => a + b, 0)})
                            </p>
                        </div>
                    ) : (
                        <div className="bg-ink-900 p-4 rounded-lg border border-gold-700/30">
                            <p className="text-gold-400/60 text-xs mb-3">Front 9</p>
                            <div className="grid grid-cols-9 gap-1 mb-4">
                                {pars.slice(0, 9).map((par, i) => (
                                    <div key={i} className="text-center">
                                        <span className="text-gold-400/50 text-xs block">{i + 1}</span>
                                        <input
                                            type="number"
                                            value={par}
                                            onChange={(e) => updatePar(i, e.target.value)}
                                            className="w-full bg-ink-950 text-gold-100 text-center py-2 rounded text-sm border border-gold-700/30"
                                            min={3}
                                            max={6}
                                        />
                                    </div>
                                ))}
                            </div>
                            <p className="text-gold-400/60 text-xs mb-3">Back 9</p>
                            <div className="grid grid-cols-9 gap-1">
                                {pars.slice(9, 18).map((par, i) => (
                                    <div key={i} className="text-center">
                                        <span className="text-gold-400/50 text-xs block">{i + 10}</span>
                                        <input
                                            type="number"
                                            value={par}
                                            onChange={(e) => updatePar(i + 9, e.target.value)}
                                            className="w-full bg-ink-950 text-gold-100 text-center py-2 rounded text-sm border border-gold-700/30"
                                            min={3}
                                            max={6}
                                        />
                                    </div>
                                ))}
                            </div>
                            <p className="text-gold-400/50 text-xs text-center mt-3">
                                Total: {pars.reduce((a, b) => a + b, 0)}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-4 border-t border-gold-700/30 bg-ink-950">
                <button
                    onClick={handleSubmit}
                    className="w-full rounded-badge bg-ink-950 text-gold-100 ring-2 ring-gold-400/70 shadow-badge hover:shadow-lift py-4 text-center transition-all"
                >
                    <span className="font-semibold text-lg">Start Round</span>
                </button>
            </div>
        </div>
    );
}

