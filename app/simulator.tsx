"use client";

import { useEffect, useMemo, useState } from "react";

type Phase = "brake" | "corner" | "accelerate" | "straight";

const phases: { id: Phase; label: string; hint: string }[] = [
  { id: "brake", label: "BRAKE", hint: "Kinetic energy → electricity" },
  { id: "corner", label: "CORNER", hint: "Turbo kept spinning" },
  { id: "accelerate", label: "ACCELERATE", hint: "Electric boost to the wheels" },
  { id: "straight", label: "FULL THROTTLE", hint: "Exhaust energy recovered" },
];

const phaseCopy: Record<Phase, { title: string; body: string; takeaway: string }> = {
  brake: {
    title: "MGU-K becomes a generator",
    body: "The rear wheels turn the MGU-K through the drivetrain. Its resistance helps slow the car and converts motion that would become brake heat into electrical energy.",
    takeaway: "Motion → MGU-K → Battery",
  },
  corner: {
    title: "MGU-H controls turbo speed",
    body: "With less exhaust flow, the MGU-H can use electrical energy as a motor to keep the turbo spinning. This reduces turbo lag when the driver accelerates.",
    takeaway: "Battery → MGU-H → Turbo",
  },
  accelerate: {
    title: "MGU-K becomes a motor",
    body: "Energy from the battery powers the MGU-K. It adds torque to the crankshaft, which helps drive the rear wheels and gives the car a burst of acceleration.",
    takeaway: "Battery → MGU-K → Wheels",
  },
  straight: {
    title: "MGU-H harvests exhaust energy",
    body: "Hot, fast exhaust spins the turbine. The MGU-H on the turbo shaft acts as a generator and can send electricity to the battery or directly to the MGU-K.",
    takeaway: "Exhaust → MGU-H → Battery / MGU-K",
  },
};

export default function Simulator() {
  const [phase, setPhase] = useState<Phase>("brake");
  const [battery, setBattery] = useState(58);
  const [running, setRunning] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  useEffect(() => {
    if (!running) return;
    const order: Phase[] = ["brake", "corner", "accelerate", "straight"];
    const timer = window.setInterval(() => {
      setPhase((p) => order[(order.indexOf(p) + 1) % order.length]);
    }, 2800);
    return () => window.clearInterval(timer);
  }, [running]);

  useEffect(() => {
    const delta = phase === "brake" ? 12 : phase === "straight" ? 7 : phase === "corner" ? -4 : -14;
    setBattery((value) => Math.max(8, Math.min(96, value + delta)));
  }, [phase]);

  const state = useMemo(() => ({
    harvesting: phase === "brake" || phase === "straight",
    kActive: phase === "brake" || phase === "accelerate",
    hActive: phase === "corner" || phase === "straight",
    kMode: phase === "brake" ? "GENERATING" : phase === "accelerate" ? "MOTORING" : "STANDBY",
    hMode: phase === "straight" ? "GENERATING" : phase === "corner" ? "MOTORING" : "STANDBY",
    speed: phase === "brake" ? 184 : phase === "corner" ? 126 : phase === "accelerate" ? 218 : 314,
  }), [phase]);

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#simulator" aria-label="ERS Lab home">
          <span className="brandMark">E</span><span>ERS LAB</span>
        </a>
        <div className="era">2014–2025 POWER UNIT</div>
        <button className="infoButton" onClick={() => setInfoOpen(true)}>HOW IT WORKS <span>↗</span></button>
      </header>

      <section className="hero" id="simulator">
        <div className="eyebrow"><span>◉</span> INTERACTIVE POWER FLOW</div>
        <h1>Turn wasted energy<br />into <em>lap time.</em></h1>
        <p className="intro">Choose a driving phase and watch how Formula 1&apos;s two motor-generator units move energy through the car.</p>

        <div className="phaseTabs" role="group" aria-label="Driving phase">
          {phases.map((item, i) => (
            <button key={item.id} className={phase === item.id ? "active" : ""} onClick={() => { setRunning(false); setPhase(item.id); }}>
              <b>0{i + 1}</b><span>{item.label}</span><small>{item.hint}</small>
            </button>
          ))}
        </div>

        <div className={`machine phase-${phase}`}>
          <div className="telemetry speed"><small>SPEED</small><strong>{state.speed}</strong><span>KM/H</span></div>
          <div className="telemetry status"><i /><small>SYSTEM</small><strong>{state.harvesting ? "HARVEST" : "DEPLOY"}</strong></div>

          <div className="powerUnit">
            <div className="exhaust labelTag">EXHAUST</div>
            <div className="flow exhaustFlow"><span>›</span><span>›</span><span>›</span></div>
            <div className={`unit hUnit ${state.hActive ? "lit" : ""}`}>
              <small>HEAT</small><b>H</b><span>MGU-H</span><em>{state.hMode}</em>
            </div>
            <div className="turbo"><span>TURBO</span><i /></div>
            <div className="engine"><small>1.6 L</small><b>V6</b><span>TURBO HYBRID</span><div className="pistons"><i /><i /><i /></div></div>
            <div className={`unit kUnit ${state.kActive ? "lit" : ""}`}>
              <small>KINETIC</small><b>K</b><span>MGU-K</span><em>{state.kMode}</em>
            </div>
            <div className="drivetrain"><span>DRIVETRAIN</span><i /></div>
            <div className="wheel leftWheel" /><div className="wheel rightWheel" />
            <div className="flow electricFlow"><span>•</span><span>•</span><span>•</span><span>•</span></div>
            <div className="battery">
              <div className="batteryTop"><span>ENERGY STORE</span><b>{battery}%</b></div>
              <div className="batteryBar"><i style={{ width: `${battery}%` }} /></div>
              <small>≈ {(battery * .04).toFixed(1)} MJ AVAILABLE</small>
            </div>
          </div>

          <aside className="explainCard">
            <span className="step">0{phases.findIndex(p => p.id === phase) + 1} / 04</span>
            <h2>{phaseCopy[phase].title}</h2>
            <p>{phaseCopy[phase].body}</p>
            <div className="takeaway"><small>ENERGY PATH</small><strong>{phaseCopy[phase].takeaway}</strong></div>
            <button className="play" onClick={() => setRunning(!running)}><span>{running ? "Ⅱ" : "▶"}</span>{running ? "PAUSE LAP" : "PLAY FULL LAP"}</button>
          </aside>
        </div>
      </section>

      <section className="compare">
        <div><span className="bigLetter cyan">K</span><h3>MGU-K</h3><p><b>K = Kinetic.</b> Connected to the crankshaft. It recovers energy while braking and adds power while accelerating.</p><dl><div><dt>MAX POWER</dt><dd>120 kW</dd></div><div><dt>≈ HORSEPOWER</dt><dd>161 hp</dd></div></dl></div>
        <div><span className="bigLetter orange">H</span><h3>MGU-H</h3><p><b>H = Heat.</b> Connected to the turbo shaft. It recovers exhaust energy and can spin the turbo to fight lag.</p><dl><div><dt>ENERGY LIMIT</dt><dd>Uncapped*</dd></div><div><dt>REMOVED</dt><dd>2026</dd></div></dl></div>
        <div className="nowCard"><span>RULES UPDATE</span><h3>What changed in 2026?</h3><p>The MGU-H was removed. The MGU-K became much more powerful, so current F1 cars recover electrical energy primarily through braking.</p><small>*The simulator represents the 2014–2025 regulations. Values are simplified for teaching.</small></div>
      </section>

      <footer><span>ERS LAB · SCIENCE CLASS SIMULATOR</span><span>ENERGY IS TRANSFORMED, NOT CREATED.</span></footer>

      {infoOpen && <div className="modalBackdrop" onClick={() => setInfoOpen(false)}>
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={e => e.stopPropagation()}>
          <button className="close" onClick={() => setInfoOpen(false)} aria-label="Close">×</button>
          <span className="eyebrow">THE BIG IDEA</span><h2 id="modal-title">One machine, two directions.</h2>
          <p>A motor-generator is reversible. When electricity goes in, it acts as a <b>motor</b> and creates motion. When motion goes in, it acts as a <b>generator</b> and creates electricity.</p>
          <div className="formula">KINETIC / HEAT ENERGY ⇄ ELECTRICAL ENERGY</div>
          <p>Real team software constantly decides whether to harvest, store, or deploy energy. This model slows those decisions down so you can see them.</p>
          <button className="play" onClick={() => setInfoOpen(false)}>GOT IT</button>
        </div>
      </div>}
    </main>
  );
}
