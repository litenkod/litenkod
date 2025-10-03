import { useEffect, useMemo, useRef, useState } from "react";
import { getList, saveList } from "../db.js";
import { usePageTitle } from "../hooks/usePageTitle";

type Legend = {
  name: string;
  class: "Assault" | "Skirmisher" | "Recon" | "Support" | "Controller";
};

const DEFAULT_LEGENDS: Legend[] = [
  { name: "Ash", class: "Assault" },
  { name: "Bangalore", class: "Assault" },
  { name: "Fuse", class: "Assault" },
  { name: "Mad Maggie", class: "Assault" },
  { name: "Ballistic", class: "Assault" },

  { name: "Revenant", class: "Skirmisher" },
  { name: "Wraith", class: "Skirmisher" },
  { name: "Octane", class: "Skirmisher" },
  { name: "Mirage", class: "Skirmisher" },
  { name: "Pathfinder", class: "Skirmisher" },
  { name: "Horizon", class: "Skirmisher" },
  { name: "Alter", class: "Skirmisher" },

  { name: "Bloodhound", class: "Recon" },
  { name: "Crypto", class: "Recon" },
  { name: "Seer", class: "Recon" },
  { name: "Vantage", class: "Recon" },
  { name: "Sparrow", class: "Recon" },
  { name: "Valkyrie", class: "Recon" },

  { name: "Gibraltar", class: "Support" },
  { name: "Lifeline", class: "Support" },
  { name: "Loba", class: "Support" },
  { name: "Newcastle", class: "Support" },
  { name: "Conduit", class: "Support" },

  { name: "Caustic", class: "Controller" },
  { name: "Wattson", class: "Controller" },
  { name: "Rampart", class: "Controller" },
  { name: "Catalyst", class: "Controller" },
];

type ChosenLegend = Legend & { id: string };

const LEGEND_SOURCE_URL = "/api/legends.json";
const VALID_CLASSES = new Set<Legend["class"]>([
  "Assault",
  "Skirmisher",
  "Recon",
  "Support",
  "Controller",
]);

function coerceLegendList(value: unknown): Legend[] | null {
  if (!Array.isArray(value)) return null;
  const sanitized: Legend[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== "object") continue;
    const candidate = entry as Partial<Legend>;
    if (typeof candidate.name !== "string") continue;
    if (typeof candidate.class !== "string") continue;
    if (!VALID_CLASSES.has(candidate.class as Legend["class"])) continue;
    sanitized.push({
      name: candidate.name,
      class: candidate.class as Legend["class"],
    });
  }
  return sanitized.length > 0 ? sanitized : null;
}

// Hjälpfunktion: slumpa utan återläggning
function sampleWithoutReplacement<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

function slugify(name: string) {
  return name.toLowerCase().replace(/\s+/g, "");
}

export default function RandomLegendPicker() {
  usePageTitle("litenkod – Apex");

  const [legends, setLegends] = useState<Legend[]>(DEFAULT_LEGENDS);
  const dataSourceRef = useRef<"default" | "cache" | "remote">("default");
  const [isSyncing, setIsSyncing] = useState(false);
  const [dataStatus, setDataStatus] = useState<string | null>(null);
  const [count, setCount] = useState(1);
  const [chosen, setChosen] = useState<ChosenLegend[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [excluded, setExcluded] = useState<string[]>([]);

  const maxCount = 4;
  const options = useMemo(
    () => Array.from({ length: maxCount }, (_, i) => i + 1),
    [maxCount]
  );
  const availableLegends = useMemo(
    () => legends.filter((legend) => !excluded.includes(legend.name)),
    [excluded, legends]
  );

  useEffect(() => {
    let active = true;

    const applyData = (list: Legend[], source: "cache" | "remote") => {
      if (!active) return;
      setLegends(list);
      dataSourceRef.current = source;
      setDataStatus(source === "cache" ? "Visar cachelagrad data." : null);
    };

    const fetchLatest = async () => {
      setIsSyncing(true);
      try {
        const response = await fetch(LEGEND_SOURCE_URL, { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const payload = await response.json();
        const next = coerceLegendList(payload);
        if (next && active) {
          applyData(next, "remote");
          try {
            await saveList(next);
          } catch (cacheError) {
            console.warn("Failed to cache legends", cacheError);
          }
        }
      } catch (error) {
        console.warn("Failed to refresh legends", error);
        if (active && dataSourceRef.current === "default") {
          setDataStatus(
            "Showing pre-installed list – network could not be reached."
          );
        } else if (active && dataSourceRef.current === "cache") {
          setDataStatus("Showing cached data (most recent known list).");
        }
      } finally {
        if (active) {
          setIsSyncing(false);
        }
      }
    };

    (async () => {
      try {
        const cached = await getList();
        const parsed = coerceLegendList(cached ?? undefined);
        if (parsed) {
          applyData(parsed, "cache");
        }
      } catch (error) {
        console.warn("Failed to read cached legends", error);
      } finally {
        fetchLatest().catch((error) => {
          console.warn("Initial legend fetch failed", error);
        });
      }
    })();

    const handleOnline = () => {
      fetchLatest().catch((error) => {
        console.warn("Legend refresh after reconnect failed", error);
      });
    };

    window.addEventListener("online", handleOnline);
    return () => {
      active = false;
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  useEffect(() => {
    if (!settingsOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSettingsOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [settingsOpen]);

  useEffect(() => {
    if (availableLegends.length === 0) return;
    if (count > availableLegends.length) {
      setCount(availableLegends.length);
    }
  }, [availableLegends, count]);
  function toggleExcluded(name: string) {
    setExcluded((prev) =>
      prev.includes(name)
        ? prev.filter((entry) => entry !== name)
        : [...prev, name]
    );
  }

  function draw() {
    if (availableLegends.length === 0) {
      setChosen([]);
      return;
    }
    const n = Math.min(Math.max(1, count), availableLegends.length);
    if (n !== count) {
      setCount(n);
    }
    const timestamp = Date.now();
    const picks = sampleWithoutReplacement(availableLegends, n).map(
      (legend, index) => ({
        ...legend,
        id: `${legend.name}-${timestamp}-${index}`,
      })
    );
    setChosen(picks);
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-900 to-slate-800 text-white flex md:items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-4">
          <h1 className="text-2xl md:text-4xl font-display">Apex Legends</h1>
          <h2 className="text-lg md:text-4xl font-display text-slate-300">
            Randomize Your Squad for your next adventure!
          </h2>
        </div>

        <div className="mb-6 flex justify-end">
          <button
            onClick={() => setSettingsOpen(true)}
            className="fixed top-5 right-4 inline-flex items-center gap-2 rounded-full border border-indigo-300/40 bg-indigo-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-indigo-100 transition hover:bg-indigo-500/30"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 640 640"
              className="h-4 w-4"
              fill="currentColor"
            >
              <path d="M96 128c-17.7 0-32 14.3-32 32s14.3 32 32 32h86.7c12.3 28.3 40.5 48 73.3 48s61-19.7 73.3-48H544c17.7 0 32-14.3 32-32s-14.3-32-32-32H329.3C317 99.7 288.8 80 256 80s-61 19.7-73.3 48zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32h246.7c12.3 28.3 40.5 48 73.3 48s61-19.7 73.3-48H544c17.7 0 32-14.3 32-32s-14.3-32-32-32h-54.7c-12.3-28.3-40.5-48-73.3-48s-61 19.7-73.3 48zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32h54.7c12.3 28.3 40.5 48 73.3 48s61-19.7 73.3-48H544c17.7 0 32-14.3 32-32s-14.3-32-32-32H297.3c-12.3-28.3-40.5-48-73.3-48s-61 19.7-73.3 48z" />
            </svg>
          </button>
        </div>

        {/* Kort */}
        <div className="relative bg-slate-950/40 border border-white/10  shadow-xl overflow-hidden">
          {/* Valrad */}
          <div className="p-4 flex flex-col md:flex-row items-center gap-2 justify-between">
            <label className="flex items-center gap-3 text-sm md:text-base">
              <span className="text-slate-300">Squad members</span>
              <select
                className="bg-slate-900 border border-white/10 rounded-lg px-1 py-2"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value, 10))}
              >
                {options.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>

            <button
              onClick={draw}
              disabled={availableLegends.length === 0}
              className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 font-display text-2xl shadow disabled:cursor-not-allowed disabled:opacity-40"
            >
              Random
            </button>
          </div>

          {(isSyncing || dataStatus) && (
            <div className="px-4 pb-3 text-xs text-slate-400 flex items-center gap-2">
              {isSyncing && (
                <span
                  aria-hidden="true"
                  className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"
                />
              )}
              <span>{isSyncing ? "Updating legend list..." : dataStatus}</span>
            </div>
          )}

          {/* Resultatlista */}
          <div className="border-t border-white/10 p-1">
            {chosen.length > 0 ? (
              <ul className="md:grid grid-row-3 sm:grid-cols-2 md:grid-cols-3 md:grid-row-1 gap-3">
                {chosen.map((legend, index) => (
                  <li
                    key={legend.id}
                    className="fade-in flex items-center gap-3 rounded-xl bg-slate-900/60 p-3"
                    style={{ animationDelay: `${index * 250}ms` }}
                  >
                    <img
                      src={`/images/apex/${slugify(legend.name)}.png`}
                      alt={legend.name}
                      className="h-20 w-20 md:h-24 md:w-24"
                    />
                    <div className="flex flex-col font-display">
                      <span className="text-lg font-semibold">
                        {legend.name}
                      </span>
                      <span className="text-xs uppercase tracking-widest text-slate-400">
                        {legend.class}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="md:grid grid-row-3 sm:grid-cols-2 md:grid-cols-3 md:grid-row-1 gap-3">
                {Array.from(
                  {
                    length:
                      availableLegends.length === 0
                        ? count
                        : Math.min(count, availableLegends.length),
                  },
                  (_, index) => (
                    <li
                      key={`placeholder-${index}`}
                      className="flex items-center gap-3 rounded-xl bg-slate-900/40 p-3"
                    >
                      <div className="h-20 w-20 rounded-xl bg-slate-800/70 animate-pulse md:h-20 md:w-20" />
                      <div className="flex w-full flex-col gap-2">
                        <span className="h-4 w-24 rounded bg-slate-800/70 animate-pulse" />
                        <span className="h-3 w-16 rounded bg-slate-800/50 animate-pulse" />
                      </div>
                    </li>
                  )
                )}
              </ul>
            )}
          </div>
        </div>

        <div className="text-center text-xs text-slate-400 mt-4">
          <p>Gear up and conquer the arena. Your next adventure awaits!</p>
        </div>
      </div>

      {settingsOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setSettingsOpen(false)}
          />
          <aside className="drawer-enter fixed inset-y-0 right-0 z-50 w-[90vw] max-w-md border-l border-white/10 bg-slate-950/95 shadow-xl md:w-full">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-indigo-300">
                  Settings
                </p>
                <h3 className="font-display text-xl text-white">
                  Legender &amp; Roller
                </h3>
              </div>
              <button
                onClick={() => setSettingsOpen(false)}
                className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm text-white transition hover:bg-white/20"
              >
                Stäng
              </button>
            </div>

            {/* exclude  */}
            <div className="h-full overflow-y-auto px-5 py-4">
              <p className="text-xs text-slate-100 mb-3">
                Select which legends to exclude from the draw:
              </p>
              <ul className="grid grid-cols-4 gap-3 sm:grid-cols-5">
                {legends.map((legend) => {
                  const isExcluded = excluded.includes(legend.name);
                  return (
                    <li key={`drawer-${legend.name}`}>
                      <button
                        type="button"
                        onClick={() => toggleExcluded(legend.name)}
                        className={`flex w-full items-center gap-1 relative border border-white/10 bg-slate-900 p-2 text-left transition focus:outline-none focus:ring-2 focus:ring-indigo-400/70 focus:ring-offset-2 focus:ring-offset-slate-950 ${
                          isExcluded
                            ? "border border-dashed border-indigo-600 bg-slate-900/10 opacity-60"
                            : "hover:border-indigo-300/40 hover:bg-indigo-500/10"
                        }`}
                        aria-pressed={isExcluded}
                      >
                        <img
                          src={`/images/apex/${slugify(legend.name)}.png`}
                          alt={legend.name}
                          className="h-12 w-12  object-contain"
                        />
                        <div className="absolute top-0.5 right-2">
                          <p className="font-display text-[10px] text-indigo-100/80">
                            {legend.name}
                          </p>
                          {/* <p className="text-xs uppercase tracking-widest text-slate-400">
                            {legend.class}
                          </p>
                          {isExcluded && (
                            <p className="text-[0.65rem] uppercase tracking-widest text-indigo-300">
                              Exkluderad
                            </p>
                          )} */}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
