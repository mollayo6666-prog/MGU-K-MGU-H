"use client";

import { useEffect, useState } from "react";

type Mode = "both" | "h" | "k";

const modes: { id: Mode; title: string; sub: string }[] = [
  { id: "both", title: "두 장치 함께 보기", sub: "직선 구간" },
  { id: "h", title: "MGU-H만 보기", sub: "배기·터보 에너지" },
  { id: "k", title: "MGU-K만 보기", sub: "제동·가속 에너지" },
];

const flow = {
  both: [
    { icon: "♨", type: "열", label: "뜨거운 배기가스" },
    { icon: "↻", type: "회전", label: "터보축" },
    { icon: "⚡", type: "전기", label: "MGU-H 발전" },
    { icon: "↻", type: "회전", label: "MGU-K 모터" },
    { icon: "➜", type: "운동", label: "뒷바퀴 가속" },
  ],
  h: [
    { icon: "♨", type: "열", label: "뜨거운 배기가스" },
    { icon: "↻", type: "회전", label: "터보축" },
    { icon: "⚡", type: "전기", label: "MGU-H 발전" },
  ],
  k: [
    { icon: "➜", type: "운동", label: "제동하는 바퀴" },
    { icon: "↻", type: "회전", label: "MGU-K 발전" },
    { icon: "⚡", type: "전기", label: "배터리 저장" },
    { icon: "↻", type: "회전", label: "MGU-K 모터" },
    { icon: "➜", type: "운동", label: "뒷바퀴 가속" },
  ],
};

const summaries = {
  both: { title: "버려질 에너지가 다시 가속력이 된다", text: "배기가스가 MGU-H에서 전기로 바뀌고, 그 전기를 받은 MGU-K가 뒷바퀴를 더 빠르게 돌립니다." },
  h: { title: "H는 Heat(열)", text: "터보축에 연결되어 배기가스가 만든 회전을 전기로 바꿉니다. 필요하면 반대로 터보를 돌려 지연도 줄입니다." },
  k: { title: "K는 Kinetic(운동)", text: "크랭크축에 연결되어 제동할 때는 발전기, 가속할 때는 모터로 작동합니다." },
};

export default function Simulator() {
  const [mode, setMode] = useState<Mode>("both");
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(0);
  const stages = flow[mode];

  useEffect(() => {
    setStep(0);
    setPlaying(false);
  }, [mode]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setStep((value) => (value + 1) % stages.length), 1200);
    return () => window.clearInterval(timer);
  }, [playing, stages.length]);

  return (
    <main className="slideApp">
      <header className="slideHeader">
        <div className="brand"><span>E</span> ERS 실험실</div>
        <div className="slideTitle"><small>F1 하이브리드 에너지 회수 시스템 · 2014–2025</small><h1>MGU-H와 MGU-K는 어떻게 작동할까?</h1></div>
        <div className="classTag">과학 발표용</div>
      </header>

      <section className="slideBody">
        <aside className="explainPanel">
          <nav className="modeTabs" aria-label="설명 선택">
            {modes.map((item) => <button key={item.id} className={mode === item.id ? "active" : ""} onClick={() => setMode(item.id)}><b>{item.title}</b><small>{item.sub}</small></button>)}
          </nav>

          <div className={`bigLetter modeLetter-${mode}`}>{mode === "both" ? "H+K" : mode.toUpperCase()}</div>
          <span className="panelEyebrow">핵심 한 문장</span>
          <h2>{summaries[mode].title}</h2>
          <p>{summaries[mode].text}</p>

          <div className="partsKey">
            <div className={mode === "k" ? "muted" : ""}><i className="orangeDot" /><span><b>MGU-H</b><small>터보 옆 · 열에너지 담당</small></span></div>
            <div className={mode === "h" ? "muted" : ""}><i className="cyanDot" /><span><b>MGU-K</b><small>구동계 옆 · 운동에너지 담당</small></span></div>
          </div>

          <button className="playButton" onClick={() => setPlaying(!playing)}>{playing ? "Ⅱ  잠시 멈추기" : "▶  에너지 흐름 재생"}</button>
        </aside>

        <div className={`carPanel mode-${mode}`}>
          <img src="/car-cutaway.png" alt="F1 하이브리드 파워유닛의 엔진, 터보, MGU-H, 배터리, MGU-K와 뒷바퀴 단면도" />
          <div className="carShade" />

          <div className="label engineLabel"><i>1</i><span><b>V6 엔진</b><small>연료를 태움</small></span></div>
          <div className={`label hLabel ${mode === "k" ? "dim" : ""}`}><i>H</i><span><b>MGU-H</b><small>터보 ↔ 전기</small></span></div>
          <div className="label batteryLabel"><i>2</i><span><b>배터리</b><small>전기 저장</small></span></div>
          <div className={`label kLabel ${mode === "h" ? "dim" : ""}`}><i>K</i><span><b>MGU-K</b><small>바퀴 ↔ 전기</small></span></div>
          <div className="label wheelLabel"><i>3</i><span><b>뒷바퀴</b><small>차를 움직임</small></span></div>

          <div className={`carArrow heatArrow ${mode === "k" ? "hide" : ""}`}><span>배기가스의 열</span></div>
          <div className={`carArrow powerArrow ${mode === "h" ? "hide" : ""}`}><span>전기 → 회전력</span></div>
        </div>
      </section>

      <section className="flowBar">
        <div className="flowHeading"><span>에너지 변화</span><b>왼쪽에서 오른쪽으로 읽기</b></div>
        <div className="flowSteps">
          {stages.map((item, index) => (
            <div className="stepWrap" key={`${item.type}-${index}`}>
              <div className={`flowStep ${index === step ? "active" : ""} type-${item.type}`}>
                <span>{item.icon}</span><div><small>{item.type}에너지</small><b>{item.label}</b></div>
              </div>
              {index < stages.length - 1 && <div className="flowArrow"><i /><small>변환</small></div>}
            </div>
          ))}
        </div>
        <div className="lawBox"><b>에너지는 새로 생기지 않는다</b><span>원래 버려질 에너지를 다른 형태로 바꿔 다시 사용한다.</span></div>
      </section>
    </main>
  );
}
