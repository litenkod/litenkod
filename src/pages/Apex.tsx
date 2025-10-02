import { useMemo, useState } from "react";

// Lista på Apex Legends (namn). Lägg gärna till/ta bort vid behov.
const LEGENDS = [
  "Ash",
  "Bangalore",
  "Fuse",
  "Mad Maggie",
  "Ballistic",
  "Revenant",
  "Wraith",
  "Octane",
  "Mirage",
  "Pathfinder",
  "Horizon",
  "Valkyrie",
  "Alter",
  "Bloodhound",
  "Crypto",
  "Seer",
  "Vantage",
  "Sparrow",
  "Caustic",
  "Wattson",
  "Rampart",
  "Catalyst",
  "Gibraltar",
  "Lifeline",
  "Loba",
  "Newcastle",
  "Conduit",
];

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
  const [count, setCount] = useState(1);
  const [chosen, setChosen] = useState<string[]>([]);

  const maxCount = 4;
  const options = useMemo(
    () => Array.from({ length: maxCount }, (_, i) => i + 1),
    [maxCount]
  );

  function draw() {
    const n = Math.min(Math.max(1, count), maxCount);
    setChosen(sampleWithoutReplacement(LEGENDS, n));
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
              className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 font-display text-2xl shadow"
            >
              Random
            </button>
          </div>

          {/* Resultatlista */}
          <div className="border-t border-white/10 p-1">
            {chosen.length > 0 ? (
              <ul className="md:grid grid-row-3 sm:grid-cols-2 md:grid-cols-3 md:grid-row-1 gap-3">
                {chosen.map((name) => (
                  <li
                    key={name}
                    className="flex items-center gap-3 bg-slate-900/60 l p-1"
                  >
                    <img
                      src={`/images/apex/${slugify(name)}.png`}
                      alt={name}
                      className="w-25 h-25 md:w-30 md:h-30"
                    />
                    <span className="text-lg font-semibold">{name}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-slate-300 text-sm p-2 text-center">
                No legend selected yet.
              </div>
            )}
          </div>
        </div>

        <div className="text-center text-xs text-slate-400 mt-4">
          <p>Gear up and conquer the arena. Your next adventure awaits!</p>
        </div>
      </div>
    </div>
  );
}
