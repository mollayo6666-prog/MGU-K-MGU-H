"use client";

import { useEffect, useState } from "react";

type Scene = "straight" | "brake" | "boost";

const scenes: { id: Scene; title: string; sub: string }[] = [
  { id: "straight", title: "ON THE STRAIGHT", sub: "Both units work together" },
  { id: "brake", title: "WHILE BRAKING", sub: "MGU-K recovers motion" },
  { id: "boost", title: "WHILE ACCELERATING", sub: "MGU-K powers the wheels" },
];

const copy = {
  straight: {
    hIn: "HOT EXHAUST",
    hOut: "ELECTRICITY",
    hText: "Exhaust spins the turbo. MGU-H turns that rotation into electricity.",
    kIn: "ELECTRICITY FROM MGU-H",
    kOut: "FASTER WHEELS",
    kText: "MGU-K receives that electricity and uses it as a motor to turn the drivetrain.",
    formula: "HEAT → MGU-H → ELECTRICITY → MGU-K → MOTION",
  },
  brake: {
    hIn: "LESS EXHAUST FLOW",
    hOut: "MGU-H STANDBY",
    hText: "MGU-H is not the main energy source during this braking example.",
    kIn: "SPINNING WHEELS",
    kOut: "ELECTRICITY TO BATTERY",
    kText: "The wheels drive MGU-K as a generator. The car slows and the battery charges.",
    formula: "MOTION → MGU-K → ELECTRICITY → BATTERY",
  },
  boost: {
    hIn: "TURBO ROTATION",
    hOut: "TURBO CONTROL",
    hText: "MGU-H can use electricity to keep the turbo spinning and reduce turbo lag.",
    kIn: "ELECTRICITY FROM BATTERY",
    kOut: "FASTER WHEELS",
    kText: "MGU-K receives stored electricity and uses it as a motor to add acceleration.",
    formula: "BATTERY → ELECTRICITY → MGU-K → MOTION",
  },
};

export default function Simulator() {
  const [scene, setScene] = useState<Scene>("straight");
  const [playing, setPlaying] = useState(false);
  const data = copy[scene];

  useEffect(() => {
    if (!playing) return;
    const order: Scene[] = ["straight", "brake", "boost"];
    const timer = window.setInterval(() => {
      setScene((current) => order[(order.indexOf(current) + 1) % order.length]);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [playing]);

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#simulator"><span>E</span> ERS LAB</a>
        <div>2014–2025 F1 HYBRID SYSTEM</div>
        <small>SCIENCE CLASS SIMULATOR</small>
      </header>

      <section className="hero" id="simulator">
        <div className="eyebrow">FOLLOW THE ENERGY</div>
        <h1>TWO UNITS.<br /><em>TWO SIMPLE LINES.</em></h1>
        <p className="intro">Pick a driving moment. Read each line from left to right: energy goes in, the MGU changes it, and useful energy comes out.</p>

        <nav className="scenePicker" aria-label="Driving moment">
          {scenes.map((item, index) => (
            <button key={item.id} className={scene === item.id ? "active" : ""} onClick={() => { setScene(item.id); setPlaying(false); }}>
              <span>0{index + 1}</span><b>{item.title}</b><small>{item.sub}</small>
            </button>
          ))}
          <button className="playAll" onClick={() => setPlaying(!playing)}>{playing ? "Ⅱ  PAUSE" : "▶  PLAY ALL"}</button>
        </nav>

        <section className={`twoLines scene-${scene}`} aria-live="polite">
          <header>
            <span>ENERGY FLOW</span>
            <strong>{data.formula}</strong>
          </header>

          <article className={`mguLine hLine ${scene === "brake" ? "quiet" : ""}`}>
            <div className="lineLabel">
              <span>H = HEAT</span>
              <b>MGU-H</b>
              <small>Connected to the turbo</small>
            </div>
            <div className="energyBox input">
              <small>ENERGY IN</small><b>{data.hIn}</b>
            </div>
            <div className="arrow orangeArrow"><div><i /><i /><i /><i /></div><span>{scene === "boost" ? "electric motor" : "spins generator"}</span></div>
            <div className="mguMachine hMachine"><span>H</span><b>MGU-H</b></div>
            <div className="arrow orangeArrow"><div><i /><i /><i /><i /></div><span>energy changes form</span></div>
            <div className="energyBox output">
              <small>ENERGY OUT</small><b>{data.hOut}</b>
            </div>
            <p>{data.hText}</p>
          </article>

          <div className={`transfer ${scene === "straight" ? "active" : ""}`}>
            <span>{scene === "straight" ? "MGU-H SENDS ELECTRICITY DIRECTLY TO MGU-K" : scene === "brake" ? "THE BATTERY RECEIVES ENERGY FROM MGU-K" : "THE BATTERY SENDS ELECTRICITY TO MGU-K"}</span>
            <i>↓</i>
          </div>

          <article className="mguLine kLine">
            <div className="lineLabel">
              <span>K = KINETIC</span>
              <b>MGU-K</b>
              <small>Connected to the crankshaft</small>
            </div>
            <div className="energyBox input">
              <small>ENERGY IN</small><b>{data.kIn}</b>
            </div>
            <div className="arrow cyanArrow"><div><i /><i /><i /><i /></div><span>{scene === "brake" ? "spins generator" : "powers motor"}</span></div>
            <div className="mguMachine kMachine"><span>K</span><b>MGU-K</b></div>
            <div className="arrow cyanArrow"><div><i /><i /><i /><i /></div><span>energy changes form</span></div>
            <div className="energyBox output">
              <small>ENERGY OUT</small><b>{data.kOut}</b>
            </div>
            <p>{data.kText}</p>
          </article>
        </section>

        <div className="plainEnglish">
          <span>IN PLAIN ENGLISH</span>
          <strong>{scene === "straight" ? "MGU-H collects energy. MGU-K receives it and powers the car." : scene === "brake" ? "MGU-K takes motion from the wheels and saves it in the battery." : "MGU-K takes electricity from the battery and returns it as wheel motion."}</strong>
        </div>
      </section>

      <section className="remember">
        <div><span>01</span><p><b>MGU-H</b> works with the turbo and exhaust.</p></div>
        <div><span>02</span><p><b>MGU-K</b> works with the crankshaft and wheels.</p></div>
        <div><span>03</span><p><b>Both are reversible:</b> they can be motors or generators.</p></div>
      </section>

      <section className="rules"><b>2026 NOTE</b><p>MGU-H was removed from current Formula 1. This simulator shows the two-unit system used from 2014 through 2025.</p></section>
      <footer><span>ERS LAB</span><span>ENERGY IS TRANSFORMED, NOT CREATED.</span></footer>
    </main>
  );
}
