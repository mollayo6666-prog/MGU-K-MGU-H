"use client";

import { useEffect, useMemo, useState } from "react";

type Mode = "heat" | "brake" | "boost";

const modes: { id: Mode; label: string; sub: string }[] = [
  { id: "heat", label: "HARVEST HEAT", sub: "Full throttle" },
  { id: "brake", label: "HARVEST MOTION", sub: "Braking" },
  { id: "boost", label: "DEPLOY ENERGY", sub: "Acceleration" },
];

const modeData = {
  heat: {
    number: "01",
    title: "Heat becomes motion",
    summary: "Exhaust spins the turbo and MGU-H. The electricity can be stored, or sent across the car to the MGU-K to help turn the wheels.",
    equation: "THERMAL → MECHANICAL → ELECTRICAL → KINETIC",
    source: "HOT EXHAUST",
    destination: "REAR WHEELS",
  },
  brake: {
    number: "02",
    title: "Motion is recovered",
    summary: "During braking, the wheels drive the MGU-K as a generator. The car slows while part of its kinetic energy becomes electricity instead of brake heat.",
    equation: "KINETIC → MECHANICAL → ELECTRICAL → CHEMICAL",
    source: "REAR WHEELS",
    destination: "BATTERY",
  },
  boost: {
    number: "03",
    title: "Stored energy returns",
    summary: "The battery releases electrical energy. The MGU-K acts as a motor, adding torque to the crankshaft and increasing the kinetic energy of the car.",
    equation: "CHEMICAL → ELECTRICAL → MECHANICAL → KINETIC",
    source: "BATTERY",
    destination: "REAR WHEELS",
  },
};

export default function Simulator() {
  const [mode, setMode] = useState<Mode>("heat");
  const [battery, setBattery] = useState(62);
  const [playing, setPlaying] = useState(false);
  const data = modeData[mode];

  useEffect(() => {
    if (!playing) return;
    const order: Mode[] = ["heat", "brake", "boost"];
    const timer = window.setInterval(() => {
      setMode((current) => order[(order.indexOf(current) + 1) % order.length]);
    }, 3500);
    return () => window.clearInterval(timer);
  }, [playing]);

  useEffect(() => {
    setBattery((value) => Math.max(15, Math.min(94, value + (mode === "heat" ? 7 : mode === "brake" ? 13 : -18))));
  }, [mode]);

  const active = useMemo(() => ({
    heat: mode === "heat",
    battery: mode === "heat" || mode === "brake" || mode === "boost",
    wheels: mode === "brake" || mode === "boost" || mode === "heat",
    reverse: mode === "brake",
  }), [mode]);

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#flow"><span className="brandMark">E</span><span>ERS LAB</span></a>
        <span className="era">2014–2025 F1 HYBRID SYSTEM</span>
        <span className="law">ENERGY IS TRANSFORMED, NOT CREATED</span>
      </header>

      <section className="hero" id="flow">
        <div className="heroCopy">
          <div className="eyebrow">INTERACTIVE ENERGY FLOW</div>
          <h1>FOLLOW THE<br /><em>ENERGY.</em></h1>
          <p>Select a driving moment. The bright path shows where energy starts, how it changes form, and where it ends.</p>
        </div>

        <div className="modePicker" role="group" aria-label="Choose energy flow">
          {modes.map((item, index) => (
            <button key={item.id} className={mode === item.id ? "active" : ""} onClick={() => { setPlaying(false); setMode(item.id); }}>
              <span>0{index + 1}</span><b>{item.label}</b><small>{item.sub}</small>
            </button>
          ))}
        </div>

        <section className={`flowStage mode-${mode} ${active.reverse ? "reverse" : ""}`} aria-live="polite">
          <div className="stageHeader">
            <div><span>ACTIVE CONVERSION</span><strong>{data.equation}</strong></div>
            <button onClick={() => setPlaying(!playing)}>{playing ? "PAUSE" : "PLAY ALL FLOWS"} <b>{playing ? "Ⅱ" : "▶"}</b></button>
          </div>

          <div className="energyMap">
            <div className="sourceFlag"><small>ENERGY STARTS HERE</small><b>{data.source}</b></div>
            <div className="destinationFlag"><small>ENERGY ENDS HERE</small><b>{data.destination}</b></div>

            <div className={`energyNode heatNode ${active.heat ? "on" : ""}`}>
              <div className="nodeIcon heatIcon"><i /><i /><i /></div>
              <span>THERMAL ENERGY</span><b>HOT EXHAUST</b><small>Fast gas carries heat away from the engine</small>
            </div>

            <div className="connector first"><div className="energyDots"><i /><i /><i /><i /></div><span>spins</span></div>

            <div className={`machineNode hNode ${mode === "heat" ? "on" : ""}`}>
              <div className="rotor">H</div><span>MGU-H</span><b>GENERATOR</b><small>Turbo rotation becomes electricity</small>
            </div>

            <div className="connector second"><div className="energyDots"><i /><i /><i /><i /></div><span>electric current</span></div>

            <div className={`energyNode batteryNode ${active.battery ? "on" : ""}`}>
              <div className="charge"><i style={{ height: `${battery}%` }} /></div>
              <span>ELECTRICAL ENERGY</span><b>ENERGY STORE</b><strong>{battery}%</strong><small>Electricity is stored as chemical energy</small>
            </div>

            <div className="connector third"><div className="energyDots"><i /><i /><i /><i /></div><span>electric current</span></div>

            <div className={`machineNode kNode ${mode === "brake" || mode === "boost" || mode === "heat" ? "on" : ""}`}>
              <div className="rotor">K</div><span>MGU-K</span><b>{mode === "brake" ? "GENERATOR" : "MOTOR"}</b><small>{mode === "brake" ? "Rotation becomes electricity" : "Electricity becomes rotation"}</small>
            </div>

            <div className="connector fourth"><div className="energyDots"><i /><i /><i /><i /></div><span>{mode === "brake" ? "slows" : "turns"}</span></div>

            <div className={`energyNode wheelNode ${active.wheels ? "on" : ""}`}>
              <div className="wheelIcon"><i /><i /></div>
              <span>KINETIC ENERGY</span><b>REAR WHEELS</b><small>Rotation changes the car&apos;s motion</small>
            </div>
          </div>

          <div className="flowExplanation">
            <span>{data.number}</span>
            <div><h2>{data.title}</h2><p>{data.summary}</p></div>
            <div className="key"><small>THE SIMPLE VERSION</small><strong>{mode === "heat" ? "Heat → Electricity → Motion" : mode === "brake" ? "Motion → Electricity → Stored energy" : "Stored energy → Electricity → Motion"}</strong></div>
          </div>
        </section>
      </section>

      <section className="lesson">
        <div className="lessonTitle"><span>THE TWO REVERSIBLE MACHINES</span><h2>Motor when energy goes in.<br />Generator when motion goes in.</h2></div>
        <div className="lessonCard k"><b>K</b><div><span>MGU-K · KINETIC</span><h3>Wheels ⇄ Electricity</h3><p>Connected to the crankshaft. It harvests kinetic energy under braking, then reverses direction to add power during acceleration.</p></div></div>
        <div className="lessonCard h"><b>H</b><div><span>MGU-H · HEAT</span><h3>Turbo ⇄ Electricity</h3><p>Connected to the turbo shaft. It harvests energy from exhaust-driven rotation, then can act as a motor to keep the turbo spinning.</p></div></div>
      </section>

      <section className="losses">
        <span className="lossIcon">≈</span>
        <div><small>REAL-WORLD SCIENCE</small><h2>No conversion is 100% efficient.</h2></div>
        <p>Some energy always spreads to the surroundings as heat and sound. The ERS does not create energy—it recovers part of the energy that would otherwise be wasted.</p>
      </section>

      <section className="update"><span>2026 UPDATE</span><p>Current Formula 1 removed the MGU-H. This simulator shows the two-unit hybrid system used from 2014 through 2025.</p></section>
      <footer><span>ERS LAB · SCIENCE CLASS SIMULATOR</span><span>THERMAL · ELECTRICAL · CHEMICAL · KINETIC</span></footer>
    </main>
  );
}
