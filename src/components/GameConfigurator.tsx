// src/components/GameConfigurator.tsx
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

type GameInfo = {
  id: string; // e.g. "minecraft"
  name: string; // e.g. "Minecraft"
  minPlayers: number;
  maxPlayers: number;
  minMods: number; // 0 => no mods required
  maxMods: number; // 0 => mods not supported
  image?: string;
  serverConfig?: ServerConfig;
};

type LocationInfo = {
  id: string;
  name: string;
  ping?: string;
};

type BuildLinkResponse = {
  link?: string;
  url?: string;
  checkout?: string;
};

const fetchJSON = async <T,>(path: string): Promise<T> => {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    cache: "no-store",
    mode: "cors",
    credentials: "omit",
  });

  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);

  const response = await res.json();
  const data = response.ok ? response.data : response;
  return data;
};

export default function GameConfigurator({
  initialGameName,
  initialPlan,
}: {
  initialGameName?: string;
  initialPlan?: string;
}) {
  // remote data
  const [games, setGames] = useState<GameInfo[]>([]); // will typically be length=1 now
  const [locations, setLocations] = useState<LocationInfo[]>([]);

  // selection
  const [gameId, setGameId] = useState<string>("");
  const [players, setPlayers] = useState<number | "">("");
  const [locationId, setLocationId] = useState<string>("");

  // mods
  const [mods, setMods] = useState<string[]>([]);
  const [modDraft, setModDraft] = useState("");

  // ui state
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [building, setBuilding] = useState(false);

  // billing state
  const pricingPlans = [
    { name: "Monthly", price: 5.0, discount: 0, info: "" },
    { name: "Quarterly", price: 2.7, discount: 10, info: "10% OFF" },
    { name: "Semi-annually", price: 2.55, discount: 15, info: "15% OFF" },
    { name: "Annually", price: 2.4, discount: 20, info: "20% OFF" },
  ];
  const [selectedPlan, setSelectedPlan] = useState(() => {
    if (initialPlan && pricingPlans.some((plan) => plan.name === initialPlan)) {
      return initialPlan;
    }
    return pricingPlans[0].name;
  });

  // Server tiers (performance): budget / standard / premium
  const serverTiers = [
    { id: "budget", label: "Budget", price: 1 },
    { id: "standard", label: "Standard", price: 2 },
    { id: "premium", label: "Premium", price: 3 },
  ];

  const [selectedTier, setSelectedTier] = useState<string>(() => {
    // allow passing initialPlan as a tier id (budget|standard|premium)
    const initial = initialPlan ? initialPlan.toLowerCase() : "";
    if (serverTiers.some((t) => t.id === initial)) return initial;
    return "standard";
  });

  const totalGB = 10; // example for banner
  const recommendedPrice = 69.9; // per month

  // Fetch helpers
  const fetchLocations = async () => {
    return await fetchJSON<LocationInfo[]>("/?handler=pulldata&file=locations.json");
  };

  const fetchGameByName = async (name?: string) => {
    const q = name ? `&game=${encodeURIComponent(name)}` : "";
    const path = `/?handler=pulldata&file=games.json${q}`;
    const resp = await fetchJSON<GameInfo | GameInfo[]>(path);
    if (Array.isArray(resp)) return resp;
    return [resp];
  };

  const dynamicPrice = useMemo(() => {
    const tier = serverTiers.find(t => t.id === selectedTier);
    return tier ? tier.price : 0;
  }, [selectedTier, serverTiers]);

  // load game (single) + locations on mount or when initialGameName changes
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [locs, g] = await Promise.all([
          fetchLocations(),
          fetchGameByName(initialGameName),
        ]);

        if (!Array.isArray(locs)) throw new Error("Locations data is not an array");

        // normalize game response and ensure we at least have one game
        const normalizedGames = Array.isArray(g) ? g : g ? [g] : [];

        if (normalizedGames.length === 0) {
          throw new Error("Requested game not found from API");
        }

        setGames(normalizedGames);
        setLocations(locs);

        // Set defaults
        const defaultGameId = normalizedGames[0].id;
        setGameId(defaultGameId);

        const defaultLocation = locs[0]?.id || "";
        setLocationId(defaultLocation);

        // set players default based on game minPlayers
        setPlayers(normalizedGames[0].minPlayers);
        setMods([]);
        setModDraft("");
      } catch (e: any) {
        setErr(e.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialGameName]);

  const currentGame = useMemo(
    () => games.find((g) => g.id === gameId) || games[0] || null,
    [games, gameId]
  );

  // normalize players/mods when game changes
  useEffect(() => {
    if (!currentGame) return;

    const p = typeof players === "number" ? players : currentGame.minPlayers;
    const bounded = Math.max(currentGame.minPlayers, Math.min(currentGame.maxPlayers, p));
    setPlayers(bounded);

    if (currentGame.maxMods === 0) {
      setMods([]);
      setModDraft("");
    } else if (mods.length > currentGame.maxMods) {
      setMods(mods.slice(0, currentGame.maxMods));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

  const modsSupported = (currentGame?.maxMods ?? 0) > 0;
  const modsRequired = (currentGame?.minMods ?? 0) > 0;

  // form validation
  const canSubmit = useMemo(() => {
    if (!currentGame) return false;
    if (!gameId || !locationId) return false;
    if (players === "" || typeof players !== "number") return false;
    if (players < currentGame.minPlayers || players > currentGame.maxPlayers) return false;

    if (modsSupported) {
      if (mods.length < currentGame.minMods) return false;
      if (mods.length > currentGame.maxMods) return false;
    } else if (mods.length > 0) {
      return false;
    }

    return true;
  }, [currentGame, gameId, locationId, players, mods, modsSupported]);

  // mod handlers
  const addMod = () => {
    if (!currentGame) return;
    const name = modDraft.trim();
    if (!name) return;
    if (mods.includes(name)) return;
    if (mods.length >= currentGame.maxMods) return;
    setMods((prev) => [...prev, name]);
    setModDraft("");
  };

  const removeMod = (index: number) => {
    setMods((prev) => prev.filter((_, i) => i !== index));
  };

  // Log selected configuration to console whenever it changes
  useEffect(() => {
    if (currentGame && locationId) {
      const config = {
        game: currentGame.name,
        gameId: currentGame.id,
        players: players,
        location: locations.find((loc) => loc.id === locationId)?.name,
        locationId,
        mods: mods.length,
        modList: mods,
        billingPlan: selectedPlan,
        serverConfig: currentGame.serverConfig,
      };
      console.log("Selected Configuration:", config);
    }
  }, [currentGame, players, locationId, mods, selectedPlan, locations]);

  // checkout
  const buildAndRedirect = async () => {
    if (!currentGame) {
      alert("Please select a game");
      return;
    }

    if (!players || typeof players !== "number") {
      alert("Please select the number of players");
      return;
    }

    if (players < currentGame.minPlayers || players > currentGame.maxPlayers) {
      alert(`Players must be between ${currentGame.minPlayers} and ${currentGame.maxPlayers}`);
      return;
    }

    if (!locationId) {
      alert("Please select a location");
      return;
    }

    if (modsSupported) {
      if (mods.length < currentGame.minMods) {
        alert(`Minimum ${currentGame.minMods} mods required`);
        return;
      }
      if (mods.length > currentGame.maxMods) {
        alert(`Maximum ${currentGame.maxMods} mods allowed`);
        return;
      }
    }

    const finalConfig = {
      game: currentGame.name,
      gameId: currentGame.id,
      players,
      location: locations.find((loc) => loc.id === locationId)?.name,
      locationId,
      mods: mods.length,
      modList: mods,
      billingPlan: selectedPlan,
      serverConfig: currentGame.serverConfig,
    };

    console.log("Final Configuration for Checkout:", finalConfig);

    try {
      setBuilding(true);
      const params = new URLSearchParams({
        handler: "buildlink",
        game: currentGame.name,
        players: String(players),
        location: locationId,
        mods: String(mods.length),
      });

      const apiUrl = `https://api.aleforge.net/?${params}`;
      console.log("Calling API:", apiUrl);

      const res = await fetch(apiUrl, {
        cache: "no-store",
        mode: "cors",
        credentials: "omit",
      });

      if (!res.ok) throw new Error(`buildlink failed: ${res.status}`);

      const response = await res.json();
      const data = response.ok ? response.data : response;

      console.log("API Response:", data);

      const redirectUrl = data.link || data.url || data || null;

      if (!redirectUrl) throw new Error("No checkout link returned.");

      // The API appears to return nested object; defensive access:
      const cartLink = redirectUrl['cart-link'] || redirectUrl['cart_link'] || (typeof redirectUrl === "string" ? redirectUrl : null);

      if (!cartLink) throw new Error("No cart link found on API response.");

      console.log("Redirecting to:", cartLink);
      window.location.href = cartLink;
    } catch (e: any) {
      console.error("Checkout error:", e);
      alert(e.message || "Failed to generate checkout link");
    } finally {
      setBuilding(false);
    }
  };

  // UI rendering
  if (loading)
    return (
      <div className="flex justify-center items-center h-64 bg-gradient-to-b from-[#07101a] to-[#0b1220]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  if (err)
    return (
      <div className="text-red-400 text-center py-10 bg-gradient-to-b from-[#07101a] to-[#0b1220]">
        {err}
      </div>
    );

  if (!currentGame)
    return (
      <div className="text-center py-10 text-gray-500 bg-gradient-to-b from-[#07101a] to-[#0b1220]">
        No game data available.
      </div>
    );

  return (
    <div className="min-h-screen py-12 px-1 md:px-12 from-[#07101a] to-[#0b1220] text-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Build Your Perfect Game Server</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">Configure your server settings to match your gaming needs</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Config Panel */}
          <div className="flex-1 bg-[#0f131b] rounded-2xl border border-white/10 p-6 shadow-[0_8px_30px_rgba(2,6,23,0.6)]">
            {/* Step 1: Game (single) */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white w-8 h-8 flex items-center justify-center font-bold text-sm">1</span>
                <h2 className="text-xl font-semibold">Game</h2>
              </div>

              <div className="bg-[#1a2238] rounded-xl p-4 mb-4 flex items-center gap-4">
                <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 w-16 h-16 rounded-lg flex items-center justify-center">
                  {currentGame.image ? (
                    <img src={currentGame.image} alt={currentGame.name} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <span className="text-white/40 text-xs">Game</span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{currentGame.name}</h3>
                  <p className="text-sm text-white/60">{currentGame.minPlayers}-{currentGame.maxPlayers} players</p>
                </div>
              </div>
            </div>

            {/* Step 2: Players */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white w-8 h-8 flex items-center justify-center font-bold text-sm">2</span>
                <h2 className="text-xl font-semibold">Players</h2>
              </div>
              <div className="bg-[#1a2238] rounded-xl p-4">
                <div className="flex flex-col sm:flex-row gap-4 items-center mb-2">
                  <input
                    type="range"
                    className="flex-1 accent-blue-500 w-full"
                    value={players}
                    min={currentGame?.minPlayers}
                    max={currentGame?.maxPlayers}
                    onChange={(e) => setPlayers(Number(e.target.value))}
                  />
                  <span className="font-bold text-lg w-12 text-center sm:text-left">{players}</span>
                </div>
                <p className="text-xs text-white/60">Allowed range: {currentGame?.minPlayers}–{currentGame?.maxPlayers}</p>
              </div>
            </div>

            {/* Step 3: Location */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white w-8 h-8 flex items-center justify-center font-bold text-sm">3</span>
                <h2 className="text-xl font-semibold">Choose a Location</h2>
              </div>
              <div className="bg-[#1a2238] rounded-xl p-4">
                <div className="relative">
                  <select
                    value={locationId}
                    onChange={(e) => setLocationId(e.target.value)}
                    className="w-full rounded-lg bg-[#0f131b] border border-white/10 px-3 py-3 text-white appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
                {locations.find((loc) => loc.id === locationId) && (
                  <div className="mt-2 text-sm text-white/60">Selected: {locations.find((loc) => loc.id === locationId)?.name}</div>
                )}
              </div>
            </div>

            {/* Step 4: Server Tier */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white w-8 h-8 flex items-center justify-center font-bold text-sm">4</span>
                <h2 className="text-xl font-semibold">Choose Your Server Tier</h2>
              </div>

              <div className="bg-[#1a2238] rounded-xl p-4">
                <p className="text-sm text-white/60 mb-4">Choose the performance level that best fits your gameplay needs and budget.</p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {serverTiers.map((t) => {
                    const active = selectedTier === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTier(t.id)}
                        aria-pressed={active}
                        className={`flex flex-col items-center rounded-lg px-4 py-3 text-center transition-all border-2 focus:outline-none ${active
                          ? "border-blue-500 bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg"
                          : "border-white/10 bg-[#0f131b] text-white/80 hover:border-white/20"
                          }`}
                      >
                        <div className="font-semibold">{t.label}</div>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-2 text-xs text-white/60">Selected tier: <span className="font-medium">{selectedTier}</span></div>
              </div>
            </div>

            {/* Mods Section */}
            {modsSupported && (
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white w-8 h-8 flex items-center justify-center font-bold text-sm">4</span>
                  <h2 className="text-xl font-semibold">Mods</h2>
                  {modsRequired && <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-300/20">Required</span>}
                </div>
                <div className="bg-[#1a2238] rounded-xl p-4">
                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <input
                      type="range"
                      className="flex-1 accent-blue-500 w-full"
                      value={mods.length}
                      min={currentGame?.minMods || 0}
                      max={currentGame?.maxMods || 10}
                      onChange={(e) => {
                        const newCount = Number(e.target.value);
                        if (newCount < mods.length) {
                          setMods((prev) => prev.slice(0, newCount));
                        } else if (newCount > mods.length) {
                          const newMods = [...mods];
                          for (let i = mods.length; i < newCount; i++) {
                            newMods.push(`mod${i + 1}`);
                          }
                          setMods(newMods);
                        }
                      }}
                    />
                    <span className="font-bold text-lg w-12 text-center sm:text-left">{mods.length}</span>
                  </div>
                  <p className="text-xs text-white/60 mt-2">Mods: {currentGame?.minMods || 0}–{currentGame?.maxMods || 10}</p>
                </div>
              </div>
            )}

            {/* Billing Options */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white w-8 h-8 flex items-center justify-center font-bold text-sm">5</span>
                <h2 className="text-xl font-semibold">Billing Options</h2>
              </div>
              <div className="bg-[#1a2238] rounded-xl p-4">
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {pricingPlans.map((p) => (
                    <button
                      key={p.name}
                      className={`rounded-lg border p-3 text-left transition-all ${selectedPlan === p.name ? "border-blue-500 bg-blue-500/10 shadow-lg" : "border-white/10 bg-[#0f131b] hover:border-white/20"}`}
                      onClick={() => setSelectedPlan(p.name)}
                    >
                      <div className="font-medium">{p.name}</div>
                      <div className="text-sm mt-1">${p.price.toFixed(2)}/GB</div>
                      {!!p.discount && <div className="text-xs text-blue-300 mt-1">{p.info}</div>}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <input type="text" placeholder="Enter promo code..." className="w-full rounded-lg bg-[#0f131b] border border-white/10 px-3 py-2 sm:py-3 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-lg px-3 sm:px-4 py-1 text-sm font-medium hover:opacity-90 transition-opacity">Apply</button>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Summary (Right Panel) */}
          <div className="w-full lg:w-[340px] self-stretch bg-gradient-to-b from-blue-900/90 to-blue-900/70 rounded-2xl border border-white/10 p-6 flex flex-col shadow-[0_8px_30px_rgba(2,6,23,0.6)]">
            <div className="w-full flex flex-col items-center">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white px-4 py-2 rounded-full font-semibold mb-6 shadow-lg">Recommended</div>
              <div className="text-4xl sm:text-5xl font-bold mb-4">{totalGB}GB</div>
              <ul className="text-sm text-white/90 mb-6 space-y-2 w-full text-left">
                <li className="flex items-center gap-2"><span className="w-2 h-2 bg-cyan-400 rounded-full"></span>Supports 80+ other games</li>
                <li className="flex items-center gap-2"><span className="w-2 h-2 bg-cyan-400 rounded-full"></span>Starbase games panel</li>
                <li className="flex items-center gap-2"><span className="w-2 h-2 bg-cyan-400 rounded-full"></span>24 / 7 / 365 Support</li>
                <li className="flex items-center gap-2"><span className="w-2 h-2 bg-cyan-400 rounded-full"></span>View all features</li>
              </ul>
              <div className="text-2xl sm:text-3xl font-bold mb-6">
                ${dynamicPrice.toFixed(2)}<span className="text-lg">/month</span>
              </div>

              <button className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white px-6 py-3 rounded-lg font-semibold w-full hover:opacity-90 transition-opacity shadow-lg" onClick={buildAndRedirect}>
                {building ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    Preparing…
                  </div>
                ) : (
                  "BUY PLAN"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
