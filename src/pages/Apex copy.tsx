
import React, { useMemo, useRef, useState } from "react";

const LEGENDS = [
  "Ash", "Bangalore", "Fuse", "Mad Maggie", "Ballistic", "Revenant",
  "Wraith", "Octane", "Mirage", "Pathfinder", "Horizon", "Valkyrie", "Alter",
  "Bloodhound", "Crypto", "Seer", "Vantage", "Sparrow",
  "Caustic", "Wattson", "Rampart", "Catalyst",
  "Gibraltar", "Lifeline", "Loba", "Newcastle", "Conduit"
];

function Apex() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [finalIndex, setFinalIndex] = useState<number | null>(null);
  const [spinning, setSpinning] = useState(false);
  const queueRef = useRef<number[]>([]);
  const timeoutsRef = useRef<number[]>([]);

  const currentName = LEGENDS[currentIndex];
  const chosenName = finalIndex != null ? LEGENDS[finalIndex] : null;

  const previewList = useMemo(() => {
    // Skapa en "bläddrings"-vy på ~10 namn runt nuvarande index
    const window = 10;
    const items: string[] = [];
    for (let i = -3; i < window; i++) {
      const idx = (currentIndex + i + LEGENDS.length) % LEGENDS.length;
      items.push(LEGENDS[idx]);
    }
    return items;
  }, [currentIndex]);

  function clearTimers() {
    timeoutsRef.current.forEach((id) => clearTimeout(id));
    timeoutsRef.current = [];
  }

  function spin() {
    if (spinning) return;
    setSpinning(true);
    setFinalIndex(null);
    clearTimers();

    // Skapa en trappa av fördröjningar (snabbt -> långsammare) för att ge slotmaskin-känsla
    const steps = 40; // fler steg = längre spinn
    const startDelay = 30; // ms
    const endDelay = 220; // ms

    // Easing: quad out för att öka fördröjningarna mjukt
    const delays: number[] = [];
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      const easeOutQuad = 1 - (1 - t) * (1 - t);
      const d = startDelay + (endDelay - startDelay) * easeOutQuad;
      delays.push(d);
    }

    // Välj målnamn slumpmässigt, men vi låter hjulet passera flera varv
    const passes = 2 * LEGENDS.length; // antal extra tick innan landning
    const target = Math.floor(Math.random() * LEGENDS.length);
    setFinalIndex(target);

    // Skapa en kö av index att ticka igenom
    queueRef.current = [];
    const totalTicks = passes + ((target - currentIndex + LEGENDS.length) % LEGENDS.length);
    for (let i = 1; i <= totalTicks; i++) {
      queueRef.current.push((currentIndex + i) % LEGENDS.length);
    }

    // Fördela ticks över fördröjningarna (om fler ticks än delays -> förläng med sista delayen)
    const schedule: number[] = [];
    let acc = 0;
    for (let i = 0; i < queueRef.current.length; i++) {
      const d = delays[Math.min(i, delays.length - 1)];
      acc += d;
      schedule.push(acc);
    }

    schedule.forEach((ms, i) => {
      const id = window.setTimeout(() => {
        setCurrentIndex(queueRef.current[i]);
        if (i === schedule.length - 1) {
          setSpinning(false);
        }
      }, ms);
      timeoutsRef.current.push(id);
    });
  return (
    <div className="flex h-screen w-screen bg-slate-900 text-slate-100">
      <div className="mx-auto flex w-full max-w-xl flex-col items-center justify-center gap-6 px-6 text-center">
        <h1 className="font-display text-5xl">Apex</h1>
        <p className="font-sans text-lg">
          Vår scen för experiment med nästa generations webblösningar. Här samlar vi
          prototyper, reflektioner och verktyg för dig som vill ligga steget före.
        </p>
        <p className="font-mono text-sm text-slate-400">
          liten kod. stark strategi.
        </p>
      </div>
    </div>
  );
}

export default Apex;
