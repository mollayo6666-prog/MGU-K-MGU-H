"use client";

import { useEffect, useState } from "react";

type Mode = "both" | "h" | "k";
type Part = "engine" | "h" | "battery" | "k" | "wheel";

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

const parts: Record<Part, { name: string; role: string; definition: string; operation: string; color: string }> = {
  engine: { name: "V6 엔진", role: "연료 → 열·회전", definition: "1.6 L 터보 엔진은 연료를 태워 크랭크축을 돌리고 뜨거운 배기가스를 만듭니다.", operation: "피스톤이 위아래로 움직이며 크랭크축을 회전시킵니다.", color: "neutral" },
  h: { name: "MGU-H", role: "터보 회전 ↔ 전기", definition: "터보축에 직접 연결된 모터·발전기입니다. H는 Heat(열)를 뜻합니다.", operation: "배기가스가 터보축을 돌리면 MGU-H가 전기를 생산합니다.", color: "orange" },
  battery: { name: "에너지 저장장치", role: "전기 저장·공급", definition: "MGU-H와 MGU-K가 회수한 전기에너지를 화학에너지 형태로 저장하는 고전압 배터리입니다.", operation: "회수할 때 충전되고, 가속할 때 MGU-K로 전기를 보냅니다.", color: "yellow" },
  k: { name: "MGU-K", role: "바퀴 회전 ↔ 전기", definition: "크랭크축에 연결된 모터·발전기입니다. K는 Kinetic(운동)을 뜻합니다.", operation: "제동 때는 발전기로 충전하고, 가속 때는 모터로 바퀴를 돕습니다.", color: "cyan" },
  wheel: { name: "뒷바퀴·구동계", role: "회전 → 자동차 운동", definition: "엔진과 MGU-K의 회전력을 노면에 전달해 자동차를 앞으로 움직입니다.", operation: "가속 때 빨라지고, 제동 때는 MGU-K를 돌려 에너지를 회수합니다.", color: "cyan" },
};

export default function Simulator() {
  const [mode, setMode] = useState<Mode>("both");
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(0);
  const [selectedPart, setSelectedPart] = useState<Part>("engine");
  const stages = flow[mode];
  const stepParts: Record<Mode, Part[]> = {
    both: ["engine", "h", "h", "k", "wheel"],
    h: ["engine", "h", "h"],
    k: ["wheel", "k", "battery", "k", "wheel"],
  };

  useEffect(() => {
    setStep(0);
    setPlaying(false);
    setSelectedPart(mode === "h" ? "h" : mode === "k" ? "k" : "engine");
  }, [mode]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setStep((value) => (value + 1) % stages.length), 1200);
    return () => window.clearInterval(timer);
  }, [playing, stages.length]);

  useEffect(() => {
    setSelectedPart(stepParts[mode][step]);
  }, [step, mode]);

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

          <div className="modeSummary">
            <div className={`bigLetter modeLetter-${mode}`}>{mode === "both" ? "H+K" : mode.toUpperCase()}</div>
            <div><span className="panelEyebrow">핵심 한 문장</span><h2>{summaries[mode].title}</h2><p>{summaries[mode].text}</p></div>
          </div>

          <div className={`partInspector inspector-${parts[selectedPart].color}`}>
            <div className="inspectorTop"><span>선택한 부품</span><b>{parts[selectedPart].role}</b></div>
            <div className={`partAnimation anim-${selectedPart}`}>
              {selectedPart === "engine" && <div className="pistons"><i /><i /><i /></div>}
              {selectedPart === "h" && <div className="rotor"><i /></div>}
              {selectedPart === "battery" && <div className="batteryAnim"><i /></div>}
              {selectedPart === "k" && <div className="kRotor"><i /></div>}
              {selectedPart === "wheel" && <div className="wheelAnim"><i /><i /></div>}
            </div>
            <div className="inspectorCopy"><h3>{parts[selectedPart].name}</h3><p>{parts[selectedPart].definition}</p><strong>작동: {parts[selectedPart].operation}</strong></div>
          </div>

          <button className="playButton" onClick={() => setPlaying(!playing)}>{playing ? "Ⅱ  잠시 멈추기" : "▶  에너지 흐름 재생"}</button>
        </aside>

        <div className={`carPanel mode-${mode}`}>
          <img src="/car-cutaway.png" alt="F1 하이브리드 파워유닛의 엔진, 터보, MGU-H, 배터리, MGU-K와 뒷바퀴 단면도" />
          <div className="carShade" />
          <div className={`partGlow glow-${selectedPart}`}><i /><span>{parts[selectedPart].name} 작동 중</span></div>

          <button className={`label engineLabel ${selectedPart === "engine" ? "selected" : ""}`} onClick={() => setSelectedPart("engine")}><i>1</i><span><b>V6 엔진</b><small>눌러서 작동 보기</small></span></button>
          <button className={`label hLabel ${mode === "k" ? "dim" : ""} ${selectedPart === "h" ? "selected" : ""}`} onClick={() => setSelectedPart("h")}><i>H</i><span><b>MGU-H</b><small>눌러서 작동 보기</small></span></button>
          <button className={`label batteryLabel ${selectedPart === "battery" ? "selected" : ""}`} onClick={() => setSelectedPart("battery")}><i>2</i><span><b>배터리</b><small>눌러서 작동 보기</small></span></button>
          <button className={`label kLabel ${mode === "h" ? "dim" : ""} ${selectedPart === "k" ? "selected" : ""}`} onClick={() => setSelectedPart("k")}><i>K</i><span><b>MGU-K</b><small>눌러서 작동 보기</small></span></button>
          <button className={`label wheelLabel ${selectedPart === "wheel" ? "selected" : ""}`} onClick={() => setSelectedPart("wheel")}><i>3</i><span><b>뒷바퀴</b><small>눌러서 작동 보기</small></span></button>

          <div className={`carArrow heatArrow ${mode === "k" ? "hide" : ""}`}><span>배기가스의 열</span></div>
          <div className={`carArrow powerArrow ${mode === "h" ? "hide" : ""}`}><span>전기 → 회전력</span></div>
        </div>
      </section>

      <section className="flowBar">
        <div className="flowHeading"><span>에너지 변화</span><b>왼쪽에서 오른쪽으로 읽기</b></div>
        <div className="flowSteps">
          {stages.map((item, index) => (
            <div className="stepWrap" key={`${item.type}-${index}`}>
              <button className={`flowStep ${index === step ? "active" : ""} type-${item.type}`} onClick={() => { setStep(index); setPlaying(false); }} aria-label={`${item.label} 단계와 관련 부품 보기`}>
                <span>{item.icon}</span><div><small>{item.type}에너지</small><b>{item.label}</b></div>
              </button>
              {index < stages.length - 1 && <div className="flowArrow"><i /><small>변환</small></div>}
            </div>
          ))}
        </div>
        <div className="lawBox"><b>에너지는 새로 생기지 않는다</b><span>원래 버려질 에너지를 다른 형태로 바꿔 다시 사용한다.</span></div>
      </section>
    </main>
  );
}
