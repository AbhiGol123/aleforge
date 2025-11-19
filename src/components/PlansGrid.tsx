// src/components/PlansGrid.tsx
import React, { useMemo, useState } from "react";

/**
 * Responsive PlansGrid (updated)
 * - Proper spacing and centering
 * - Card responsive: w-full max-w-[360px] (keeps correct spacing on small screens)
 * - Grid uses gap-x-10 gap-y-12 and justify-items-center
 */

type Plan = {
  id: string;
  name: string;
  tier: "budget" | "standard" | "premium";
  priceMonthly: number;
  storage: string;
  cpuCores: string;
  backups: string;
  memory: string;
  databases: string;
  icon?: string;
  description?: string;
};

const plans: Plan[] = [
  {
    id: "iron-forge",
    name: "Iron Forge",
    tier: "budget",
    priceMonthly: 1.00,
    storage: "50 GB NVMe Storage",
    cpuCores: "3 vCPU Cores",
    backups: "1 Cloud Backups",
    memory: "2 GB Memory",
    databases: "0 Databases",
    icon: "🟩",
    description: "Stronger hosting for active communities.",
  },
  {
    id: "coal-engine",
    name: "Coal Engine",
    tier: "budget",
    priceMonthly: 1.00,
    storage: "50 GB NVMe Storage",
    cpuCores: "3 vCPU Cores",
    backups: "1 Cloud Backups",
    memory: "2 GB Memory",
    databases: "0 Databases",
    icon: "🟩",
    description: "Fuel your first multiplayer adventure.",
  },
  {
    id: "netherite-ultra",
    name: "Netherite Ultra",
    tier: "standard",
    priceMonthly: 2.00,
    storage: "50 GB NVMe Storage",
    cpuCores: "3 vCPU Cores",
    backups: "1 Cloud Backups",
    memory: "2 GB Memory",
    databases: "0 Databases",
    icon: "🟨",
    description: "Ultimate protection and unbeatable performance.",
  },
  {
    id: "netherite-ultra-2",
    name: "Netherite Ultra",
    tier: "premium",
    priceMonthly: 3.00,
    storage: "50 GB NVMe Storage",
    cpuCores: "3 vCPU Cores",
    backups: "1 Cloud Backups",
    memory: "2 GB Memory",
    databases: "0 Databases",
    icon: "🔺",
    description: "Ultimate protection and unbeatable performance.",
  },
];

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode; }> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full transition ${active ? "bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg" : "bg-white/0 text-white/80"
      }`}
  >
    {children}
  </button>
);

export default function PlansGrid({ initialGameName }: { initialGameName?: string }) {
  const [tab, setTab] = useState<"budget" | "standard" | "premium">("budget");
  const filtered = useMemo(() => plans.filter((p) => p.tier === tab), [tab]);
  const gameName = initialGameName || "My Game";
  return (
    <section className="min-h-screen py-12 px-4 md:px-12 bg-gradient-to-b from-[#07101a] to-[#0b1220] text-white">
      <div className="max-w-7xl mx-auto">
        {/* Header + Tabs */}
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold">Choose Your Perfect Server Plan</h2>

          <div className="mt-6 inline-flex gap-2 sm:gap-3 p-1 bg-white/5 rounded-full shadow-inner">
            <TabButton active={tab === "budget"} onClick={() => setTab("budget")}>Budget</TabButton>
            <TabButton active={tab === "standard"} onClick={() => setTab("standard")}>Standard</TabButton>
            <TabButton active={tab === "premium"} onClick={() => setTab("premium")}>Premium</TabButton>
          </div>
        </div>

        {/* Grid: responsive with spacing and centered items */}
        <div className="overflow-visible">
          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              md:grid-cols-2
              lg:grid-cols-3
              gap-x-10 gap-y-12
              justify-items-center
              items-start
            "
          >
            {filtered.map((p) => (
              <a
                key={p.id}
                href={`/plans?gamename=${encodeURIComponent(gameName)}&plan=${encodeURIComponent(tab)}`}
                className="w-full max-w-[360px]"
              >
                <article
                  key={p.id}
                  className="
                  bg-[#0f131b]
                  rounded-2xl
                  w-full max-w-[360px]
                  
                  pt-4 pb-2 px-4 sm:pt-5 sm:pb-2.5 sm:px-5
                  flex flex-col
                  border border-white/8
                  shadow-[0_8px_30px_rgba(2,6,23,0.6)]
                  transition-transform transform hover:-translate-y-1
                "
                >
                  {/* Icon (emoji fallback) */}
                  <div className="w-full flex justify-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center text-2xl sm:text-3xl select-none">
                      {p.icon}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-center text-lg sm:text-xl font-bold text-white mt-3">{p.name}</h3>

                  {/* Subtitle */}
                  <p className="text-center text-xs sm:text-sm text-white/60 mt-1 leading-snug">{`"${p.description}"`}</p>

                  {/* Features */}
                  <div className="mt-4 flex flex-col items-center text-[10px] sm:text-xs text-white/85 px-1">
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-6">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-cyan-400 rounded-full" />
                        <span className="text-xs sm:text-sm">{p.storage}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-cyan-400 rounded-full" />
                        <span className="text-xs sm:text-sm">{p.cpuCores}</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 mt-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-cyan-400 rounded-full" />
                        <span className="text-xs sm:text-sm">{p.backups}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-cyan-400 rounded-full" />
                        <span className="text-xs sm:text-sm">{p.memory}</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 mt-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-cyan-400 rounded-full" />
                        <span className="text-xs sm:text-sm">{p.databases}</span>
                      </div>
                    </div>
                  </div>

                  {/* Price */}
                  <div
                    className="
                    w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400
                    border border-white/30 text-center text-white font-semibold text-lg sm:text-xl
                    shadow-lg
                  "
                  >
                    ${p.priceMonthly.toFixed(2)}
                    <span className="text-xs sm:text-sm text-white/80 ml-1">/month</span>
                  </div>

                  <div className="mt-2 text-center text-xs sm:text-sm text-white/50">Save 20% with annual billing</div>
                </article>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
