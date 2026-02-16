import React from "react";
import { openDb, Db } from "../db/db";
import { listRounds, deleteRound } from "../db/repo";
import type { Round } from "../db/types";

interface Props {
    onSelectRound: (roundId: string) => void;
    onCreateRound: () => void;
}

export function RoundsListScreen({ onSelectRound, onCreateRound }: Props) {
    const [db, setDb] = React.useState<Db | null>(null);
    const [rounds, setRounds] = React.useState<Round[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        (async () => {
            const d = await openDb();
            setDb(d);
            setRounds(await listRounds(d));
            setLoading(false);
        })();
    }, []);

    async function handleDelete(id: string) {
        if (!db) return;
        if (!confirm("Delete this round?")) return;
        await deleteRound(db, id);
        setRounds(await listRounds(db));
    }

    function formatDate(dateStr: string) {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    }

    return (
        <div className="flex flex-col min-h-screen bg-slate-950">
            <div className="px-4 pt-14 pb-4 bg-emerald-900 border-b border-emerald-700">
                <h1 className="text-white text-2xl font-bold text-center">⛳ Golf Rounds</h1>
                <p className="text-emerald-300 text-center mt-1">Your scorecard history</p>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
                {loading ? (
                    <div className="text-center text-slate-400 py-8">Loading...</div>
                ) : rounds.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🏌️</div>
                        <p className="text-slate-400 text-lg mb-2">No rounds yet</p>
                        <p className="text-slate-500 text-sm">Start your first round to track your game</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {rounds.map((round) => (
                            <div
                                key={round.id}
                                className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden"
                            >
                                <button
                                    onClick={() => onSelectRound(round.id)}
                                    className="w-full p-4 text-left"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h3 className="text-white font-semibold text-lg">
                                                {round.name || "Untitled Round"}
                                            </h3>
                                            <p className="text-slate-400 text-sm mt-1">
                                                {formatDate(round.created_at)}
                                            </p>
                                            {round.players.length > 0 && (
                                                <p className="text-emerald-400 text-sm mt-2">
                                                    👤 {round.players.join(", ")}
                                                </p>
                                            )}
                                            {round.tee_box && (
                                                <p className="text-slate-500 text-xs mt-1">
                                                    📍 {round.tee_box} tees
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-slate-500 text-2xl">›</div>
                                    </div>
                                </button>
                                <div className="border-t border-slate-800 px-4 py-2 flex justify-end">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(round.id);
                                        }}
                                        className="text-red-400 text-sm hover:text-red-300"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950">
                <button
                    onClick={onCreateRound}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 rounded-xl py-4 text-center transition-colors"
                >
                    <span className="text-white font-semibold text-lg">+ New Round</span>
                </button>
            </div>
        </div>
    );
}

