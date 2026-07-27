"use client";

import { useEffect, useState } from "react";

type View = "together" | "h" | "k";

const views: { id: View; title: string; sub: string }[] = [
  { id: "together", title: "SEE BOTH WORK", sub: "Full-throttle energy flow" },
  { id: "h", title: "ONLY MGU-H", sub: "Exhaust and turbo" },
  { id: "k", title: "ONLY MGU-K", sub: "Braking and acceleration" },
];

export default function Simulator() {
  const [view, setView] = useState<View>("together");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [selected, setSelected] = useState("h");

  useEffect(() => {
    setStep(0);
    setPlaying(false);
    setSelected(view === "k" ? "k" : view === "h" ? "h" : "engine");
  }, [view]);

  useEffect(() => {
    if (!playing) return;
    const max = view === "together" ? 5 : view === "h" ? 3 : 4;
    const timer = window.setInterval(() => setStep((s) => (s + 1) % max), 1300);
    return () => window.clearInterval(timer);
  }, [playing, view]);

  const togetherSteps = ["Hot exhaust leaves the engine", "Exhaust spins the turbo", "MGU-H makes electricity", "Electricity reaches MGU-K", "MGU-K helps turn the rear wheels"];
  const hSteps = ["Hot exhaust flows from the engine", "The turbo shaft spins", "MGU-H turns the spinning shaft into electricity"];
  const kSteps = ["The rear wheels turn while braking", "MGU-K acts as a generator", "Electricity charges the battery", "Later, MGU-K uses that electricity to accelerate"];
  const steps = view === "together" ? togetherSteps : view === "h" ? hSteps : kSteps;
  const flowStages = view === "together"
    ? [
        { icon: "♨", type: "HEAT", label: "Hot exhaust" },
        { icon: "↻", type: "ROTATION", label: "Turbo shaft" },
        { icon: "⚡", type: "ELECTRICITY", label: "From MGU-H" },
        { icon: "↻", type: "ROTATION", label: "MGU-K motor" },
        { icon: "➜", type: "MOTION", label: "Rear wheels" },
      ]
    : view === "h"
      ? [
          { icon: "♨", type: "HEAT", label: "Hot exhaust" },
          { icon: "↻", type: "ROTATION", label: "Turbo shaft" },
          { icon: "⚡", type: "ELECTRICITY", label: "MGU-H output" },
        ]
      : [
          { icon: "➜", type: "MOTION", label: "Wheels braking" },
          { icon: "↻", type: "ROTATION", label: "MGU-K generator" },
          { icon: "⚡", type: "ELECTRICITY", label: "Battery charging" },
          { icon: "↻", type: "ROTATION", label: "MGU-K motor" },
          { icon: "➜", type: "MOTION", label: "Wheels boosted" },
        ];

  const partInfo: Record<string, { name: string; plain: string; detail: string; color: string }> = {
    engine: { name: "V6 ENGINE", plain: "Burns fuel", detail: "Hot exhaust gas leaves the cylinders and carries energy toward the turbo.", color: "white" },
    turbo: { name: "TURBO", plain: "Spun by exhaust", detail: "The turbine and compressor share a shaft. Exhaust makes that shaft rotate very quickly.", color: "orange" },
    h: { name: "MGU-H", plain: "Turbo ↔ electricity", detail: "The orange unit sits on the turbo shaft. It can generate electricity or motor the turbo.", color: "orange" },
    battery: { name: "BATTERY", plain: "Stores electricity", detail: "The energy store saves recovered electrical energy until the car needs it.", color: "yellow" },
    k: { name: "MGU-K", plain: "Wheels ↔ electricity", detail: "The blue unit connects to the crankshaft. It generates while braking and motors while accelerating.", color: "cyan" },
    wheels: { name: "REAR WHEELS", plain: "Move the car", detail: "The drivetrain carries engine and MGU-K torque to the rear wheels.", color: "cyan" },
  };

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#car"><span>E</span> ERS LAB</a>
        <div>F1 HYBRID POWER · 2014–2025</div>
        <small>BEGINNER MODE</small>
      </header>

      <section className="hero" id="car">
        <div className="heroCopy">
          <span className="eyebrow">LOOK INSIDE THE CAR</span>
          <h1>WHERE ARE THE<br /><em>MGU-H & MGU-K?</em></h1>
          <p>No engineering degree needed. Click the real parts, then press play to follow the energy through the car.</p>
        </div>

        <nav className="viewPicker" aria-label="Choose explanation">
          {views.map((item) => <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => setView(item.id)}><b>{item.title}</b><small>{item.sub}</small></button>)}
        </nav>

        <section className={`carLab view-${view}`}>
          <div className="carHeader">
            <div><span>NOW SHOWING</span><strong>{view === "together" ? "HOW BOTH UNITS WORK TOGETHER" : view === "h" ? "MGU-H · HEAT RECOVERY" : "MGU-K · KINETIC RECOVERY"}</strong></div>
            <div className="legend"><i className="heatDot" />HEAT / MGU-H <i className="electricDot" />ELECTRICITY / MGU-K</div>
          </div>

          <div className="carCanvas">
            <img src="/car-cutaway.png" alt="Illustrated cutaway of the rear half of a Formula-style hybrid race car showing its engine, turbo, motor-generators, battery, drivetrain and rear wheels" />
            <div className={`energyPath heatPath ${view !== "k" ? "show" : ""}`}><i /><i /><i /><i /></div>
            <div className={`energyPath electricPath ${view !== "h" ? "show" : ""}`}><i /><i /><i /><i /><i /></div>
            <div className={`carArrow exhaustArrow ${view !== "k" ? "show" : ""}`}><span>HEAT</span></div>
            <div className={`carArrow hToKArrow ${view === "together" ? "show" : ""}`}><span>ELECTRICITY</span></div>
            <div className={`carArrow kToWheelArrow ${view !== "h" ? "show" : ""}`}><span>{view === "k" ? "MOTION ⇄ ELECTRICITY" : "MOTION"}</span></div>

            <button className={`hotspot engineSpot ${selected === "engine" ? "selected" : ""}`} onClick={() => setSelected("engine")}><span>1</span><b>V6 ENGINE</b></button>
            <button className={`hotspot turboSpot ${selected === "turbo" ? "selected" : ""}`} onClick={() => setSelected("turbo")}><span>2</span><b>TURBO</b></button>
            <button className={`hotspot hSpot ${selected === "h" ? "selected" : ""} ${view === "k" ? "dim" : ""}`} onClick={() => setSelected("h")}><span>H</span><b>MGU-H</b></button>
            <button className={`hotspot batterySpot ${selected === "battery" ? "selected" : ""}`} onClick={() => setSelected("battery")}><span>3</span><b>BATTERY</b></button>
            <button className={`hotspot kSpot ${selected === "k" ? "selected" : ""} ${view === "h" ? "dim" : ""}`} onClick={() => setSelected("k")}><span>K</span><b>MGU-K</b></button>
            <button className={`hotspot wheelSpot ${selected === "wheels" ? "selected" : ""}`} onClick={() => setSelected("wheels")}><span>4</span><b>REAR WHEELS</b></button>

            <aside className={`partCard ${partInfo[selected].color}`}>
              <span>CLICKED PART</span><h2>{partInfo[selected].name}</h2><b>{partInfo[selected].plain}</b><p>{partInfo[selected].detail}</p>
            </aside>
          </div>

          <div className={`conversionRibbon ribbon-${view}`}>
            <div className="ribbonTitle"><small>WATCH THE ENERGY CHANGE FORM</small><b>Read left → right</b></div>
            <div className="ribbonFlow">
              {flowStages.map((stage, index) => (
                <div className="ribbonItem" key={`${stage.type}-${index}`}>
                  <div className={`energyStage type-${stage.type.toLowerCase()}`}><span>{stage.icon}</span><small>{stage.type}</small><b>{stage.label}</b></div>
                  {index < flowStages.length - 1 && <div className="bigArrow"><i /><span>changes into</span></div>}
                </div>
              ))}
            </div>
          </div>

          <div className="story">
            <div className="storyTop">
              <div><span>THE STORY IN ONE SENTENCE</span><strong>{view === "together" ? "Exhaust spins MGU-H → electricity powers MGU-K → wheels turn faster." : view === "h" ? "Exhaust spins the turbo → MGU-H turns that spin into electricity." : "Wheels spin MGU-K while braking → electricity is saved → MGU-K later boosts the wheels."}</strong></div>
              <button onClick={() => setPlaying(!playing)}>{playing ? "Ⅱ  PAUSE" : "▶  SHOW ME"}</button>
            </div>
            <ol>
              {steps.map((text, index) => <li key={text} className={index === step ? "active" : index < step ? "done" : ""}><span>{index + 1}</span><p>{text}</p></li>)}
            </ol>
          </div>
        </section>
      </section>

      <section className="cheatSheet">
        <div><span className="orange">H</span><h2>MGU-H</h2><b>Lives beside the turbo</b><p>Think: <strong>hot exhaust</strong>. It recovers energy from the spinning turbo shaft.</p></div>
        <div className="versus">AND</div>
        <div><span className="cyan">K</span><h2>MGU-K</h2><b>Lives beside the drivetrain</b><p>Think: <strong>moving wheels</strong>. It recovers braking energy and adds acceleration.</p></div>
      </section>

      <section className="truth"><b>ONE IMPORTANT DETAIL</b><p>The MGU units do not create free energy. Every conversion loses some energy as heat and sound; they simply rescue energy that would otherwise be wasted.</p></section>
      <footer><span>ERS LAB · SCIENCE CLASS SIMULATOR</span><span>MGU-H WAS REMOVED FROM F1 IN 2026</span></footer>
    </main>
  );
}
