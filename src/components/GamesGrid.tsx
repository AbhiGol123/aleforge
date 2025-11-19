import React, { useEffect, useMemo, useState } from "react";
import { API_BASE } from "../lib/config";

type ServerConfig = {
    ramPerPlayer: number;
    cpuPerPlayer: number;
    diskPerPlayer: number;
    minRam: number;
    minCPU: number;
    standard_PID: number;
    premium_PID: number;
    standard_RAM_CID: number;
    premium_RAM_CID: number;
    standard_Location_CID: number;
    premium_Location_CID: number;
};

type Game = {
    id: string;                // "minecraft"
    name: string;              // "Minecraft"
    startingPrice?: number;    // optional, for "Starting at"
    image?: string;            // optional card image
    minPlayers: number;
    maxPlayers: number;
    minMods: number;
    maxMods: number;
    serverConfig?: ServerConfig; // Detailed server configuration
    // you can keep extra fields from your API; they're ignored here
};

const fetchJSON = async <T,>(path: string): Promise<T> => {
    const url = `${API_BASE}${path}`;
    const res = await fetch(url, {
        cache: "no-store",
        mode: "cors",
        credentials: "omit"
    });

    if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);

    const response = await res.json();

    // Handle the wrapped response format {ok: boolean, data: T}
    const data = response.ok ? response.data : response;

    return data;
};

export default function GamesGrid() {
    const [games, setGames] = useState<Game[]>([]);
    const [q, setQ] = useState("");
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const data = await fetchJSON<Game[]>("/?handler=pulldata&file=games.json");

                // Validate data
                if (!Array.isArray(data)) {
                    throw new Error('Games data is not an array');
                }

                setGames(data);
            } catch (e: any) {
                setErr(e.message || "Error");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const filtered = useMemo(() => {
        const term = q.trim().toLowerCase();
        return term ? games.filter(g => g.name.toLowerCase().includes(term)) : games;
    }, [games, q]);

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    if (err) return <div className="text-red-400 text-center py-10">{err}</div>;

    if (!games.length) return <div className="text-center py-10 text-gray-500">No games found.</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-white mb-4">Game Server Hosting</h1>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                    Launch your perfect gaming experience with our high-performance servers
                </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-4xl mx-auto mb-12">
                <div className="relative">
                    <input
                        className="w-full rounded-2xl bg-[#1a2238] border border-gray-700 px-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Get Your Favorite Game Server...."
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                    />
                    <button className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-2 transition-colors">
                        Search
                    </button>
                </div>
            </div>


            {/* Games Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filtered.map((g) => (
                    <a
                        key={g.id}
                        href={`/game/${encodeURIComponent(g.name)}`}
                        className="group relative bg-[#1a2238] rounded-2xl border border-gray-700 
            hover:border-blue-500 transition-all duration-300 overflow-hidden 
            shadow-lg hover:shadow-2xl hover:-translate-y-1 flex flex-col"
                    >
                        {/* Game Image */}
                        <div className="h-48 bg-gradient-to-r from-blue-900/30 to-purple-900/30 relative">
                            {g.image ? (
                                <img
                                    src={g.image}
                                    alt={g.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <div className="bg-gray-700 border-2 border-dashed rounded-xl w-16 h-16" />
                                </div>
                            )}

                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                        </div>

                        {/* Game Info */}
                        <div className="p-6 pb-6 mt-auto">
                            <h3 className="text-xl font-bold text-white truncate">{g.name}</h3>

                            <div className="mt-4 flex items-end justify-between">
                                <div>
                                    <div className="text-md text-gray-400">Starting At $160</div>
                                </div>
                            </div>
                        </div>

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </a>
                ))}
            </div>



            {/* Empty State */}
            {filtered.length === 0 && q && (
                <div className="text-center py-16">
                    <div className="text-6xl mb-4">🎮</div>
                    <h3 className="text-2xl font-bold text-white mb-2">No games found</h3>
                    <p className="text-gray-400 mb-6">Try adjusting your search terms</p>
                    <button
                        onClick={() => setQ("")}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                    >
                        View All Games
                    </button>
                </div>
            )}
        </div>
    );
}