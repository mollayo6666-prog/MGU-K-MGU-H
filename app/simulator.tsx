"use client";

import { useEffect, useRef, useState } from "react";

type DriveMode = "READY" | "ACCEL" | "BRAKE" | "COAST" | "FINISH";
type RuleYear = 2025 | 2026;
type ScreenView = "simulator" | "components";
type ComponentChoice = "K" | "H";

function ComponentFlowScreen({ choice, setChoice, onBack }: { choice: ComponentChoice; setChoice: (choice: ComponentChoice) => void; onBack: () => void }) {
  const isK = choice === "K";
  return (
    <main className={`componentScreen show${choice}`}>
      <header className="componentHeader">
        <button className="backButton" onClick={onBack}>← 주행 시뮬레이터</button>
        <div><small>실제 차량 속 에너지 경로</small><h1>MGU-{choice} 부품과 에너지 흐름</h1></div>
        <div className="componentSwitch" role="group" aria-label="표시할 에너지 흐름 선택">
          <button className={isK ? "active k" : ""} onClick={() => setChoice("K")}><b>MGU-K</b><small>바퀴·배터리</small></button>
          <button className={!isK ? "active h" : ""} onClick={() => setChoice("H")}><b>MGU-H</b><small>배기·터보</small></button>
        </div>
      </header>

      <section className="cutawayStage">
        <img src="./car-cutaway.png" alt="파워 유닛과 구동계가 보이는 포뮬러 1 차량 컷어웨이" />
        <div className={`componentRoute route${choice}`} aria-label={isK ? "MGU-K 에너지 흐름" : "MGU-H 에너지 흐름"}>
          {isK ? <>
            <div className="routeRow deployRow"><span><b>배터리</b><small>전기 에너지</small></span><i><em /><em /><em />→</i><span><b>MGU-K</b><small>모터</small></span><i><em /><em /><em />→</i><span><b>뒷바퀴</b><small>운동 에너지</small></span></div>
            <div className="routeRow recoverRow"><span><b>뒷바퀴</b><small>제동 운동</small></span><i><em /><em /><em />→</i><span><b>MGU-K</b><small>발전기</small></span><i><em /><em /><em />→</i><span><b>배터리</b><small>전기 저장</small></span></div>
          </> : <div className="routeRow heatRow"><span><b>배기가스</b><small>열 에너지</small></span><i><em /><em /><em />→</i><span><b>터보 축</b><small>회전 에너지</small></span><i><em /><em /><em />→</i><span><b>MGU-H</b><small>발전</small></span><i><em /><em /><em />→</i><span><b>배터리·MGU-K</b><small>전기 에너지</small></span></div>}
        </div>
        {isK ? <>
          <div className="partSpot batterySpot"><i>1</i><b>에너지 저장장치</b><small>고전압 배터리</small></div>
          <div className="partSpot kSpot"><i>2</i><b>MGU-K</b><small>크랭크축 연결 모터·발전기</small></div>
          <div className="partSpot wheelSpot"><i>3</i><b>뒷바퀴</b><small>운동 에너지</small></div>
        </> : <>
          <div className="partSpot exhaustSpot"><i>1</i><b>배기 매니폴드</b><small>뜨거운 배기가스</small></div>
          <div className="partSpot hSpot"><i>2</i><b>터보 + MGU-H</b><small>터보 축 연결 발전기</small></div>
          <div className="partSpot batterySpot"><i>3</i><b>에너지 저장장치</b><small>고전압 배터리</small></div>
        </>}
      </section>

      <footer className="componentLegend">
        {isK ? <>
          <div className="legendMode deploy"><b>가속</b><span>배터리 전기 → MGU-K 모터 → 뒷바퀴 운동</span></div>
          <div className="legendMode recover"><b>제동</b><span>뒷바퀴 운동 → MGU-K 발전 → 배터리 충전</span></div>
        </> : <div className="legendMode heat"><b>배기 회수</b><span>배기가스 열 → 터보 축 회전 → MGU-H 발전 → 전기 저장·사용</span></div>}
      </footer>
    </main>
  );
}

function EnergyFlowOverview({
  braking,
  year,
  kPower,
  hPower,
}: {
  braking: boolean;
  year: RuleYear;
  kPower: number;
  hPower: number;
}) {
  const kLimit = year === 2026 ? 350 : 120;
  const kPercent = Math.min(100, Math.max(0, (kPower / kLimit) * 100));
  const hPercent = Math.min(100, Math.max(0, (hPower / 85) * 100));
  return (
    <section className="energyOverview" aria-label="MGU-K와 MGU-H의 실시간 에너지 흐름">
      <div className={`flowLane kFlow ${braking ? "recovering" : "deploying"}`}>
        <div className="flowName"><b>MGU-K</b><span>{braking ? "회수" : "사용"} · {Math.round(kPower)} kW</span></div>
        <div className="flowPath">
          <div className="flowNode"><strong>{braking ? "바퀴" : "배터리"}</strong><small>{braking ? "운동 에너지" : "전기 에너지"}</small></div>
          <div className="flowArrow" aria-hidden="true"><i /><i /><i /><b>→</b></div>
          <div className="flowNode unit"><strong>MGU-K</strong><small>{braking ? "발전기" : "모터"}</small></div>
          <div className="flowArrow" aria-hidden="true"><i /><i /><i /><b>→</b></div>
          <div className="flowNode"><strong>{braking ? "배터리" : "바퀴"}</strong><small>{braking ? "전기 에너지" : "운동 에너지"}</small></div>
        </div>
        <div className="conversionText">{braking ? "운동 → 전기 → 저장" : "저장 전기 → 운동"}</div>
        <p className="flowExplanation">{braking ? "바퀴가 MGU-K를 돌려 발전하고, 만든 전기를 배터리에 저장합니다." : "배터리 전기로 MGU-K를 돌려 뒷바퀴에 힘을 더합니다."}</p>
        <div className="flowPower"><span>MGU-K 출력</span><i><b style={{ width: `${kPercent}%` }} /></i><strong>{Math.round(kPower)} / {kLimit} kW</strong></div>
      </div>

      <div className={`flowLane hFlow ${year === 2026 ? "disabled" : ""}`}>
        <div className="flowName"><b>MGU-H</b><span>{year === 2026 ? "2026 규정에서 삭제" : `회수 · ${Math.round(hPower)} kW`}</span></div>
        {year === 2025 ? <>
          <div className="flowPath">
            <div className="flowNode"><strong>배기가스</strong><small>열 에너지</small></div>
            <div className="flowArrow" aria-hidden="true"><i /><i /><i /><b>→</b></div>
            <div className="flowNode unit"><strong>터보·H</strong><small>회전 발전</small></div>
            <div className="flowArrow" aria-hidden="true"><i /><i /><i /><b>→</b></div>
            <div className="flowNode"><strong>전기</strong><small>배터리 / MGU-K</small></div>
          </div>
          <div className="conversionText">열 → 회전 → 전기</div>
          <p className="flowExplanation">뜨거운 배기가스가 터보 축을 돌리고, MGU-H가 회전을 전기로 바꿉니다.</p>
          <div className="flowPower"><span>MGU-H 발전</span><i><b style={{ width: `${hPercent}%` }} /></i><strong>{Math.round(hPower)} / 85 kW</strong></div>
        </> : <div className="flowRemoved">배기가스 <b>×</b> MGU-H <b>×</b> 전기</div>}
      </div>
    </section>
  );
}

function carPose(progress: number) {
  if (progress < 38) return { x: 28, y: 8 + progress * (45 / 38), angle: 90 };
  if (progress < 62) {
    const t = (progress - 38) / 24;
    const theta = Math.PI - t * Math.PI / 2;
    return {
      x: 40 + 12 * Math.cos(theta),
      y: 53 + 12 * Math.sin(theta),
      angle: 90 - t * 90,
    };
  }
  return { x: 40 + (progress - 62) * (54 / 38), y: 65, angle: 0 };
}

function smoothstep(value: number) {
  const t = Math.min(1, Math.max(0, value));
  return t * t * (3 - 2 * t);
}

function interpolate(from: number, to: number, value: number) {
  return from + (to - from) * smoothstep(value);
}

// Display-only estimate, kept separate from the visible animation physics.
function qualifyingSpeed(progress: number) {
  if (progress < 22) return interpolate(200, 264, progress / 22);
  if (progress < 38) return interpolate(264, 120, (progress - 22) / 16);
  if (progress < 50) return interpolate(120, 110, (progress - 38) / 12);
  if (progress < 62) return interpolate(110, 132, (progress - 50) / 12);
  return interpolate(132, 315, (progress - 62) / 38);
}

export default function Simulator() {
  const [screenView, setScreenView] = useState<ScreenView>("simulator");
  const [componentChoice, setComponentChoice] = useState<ComponentChoice>("K");
  const [ruleYear, setRuleYear] = useState<RuleYear>(2025);
  const [speed, setSpeed] = useState(200);
  const [progress, setProgress] = useState(0);
  const [battery, setBattery] = useState(58);
  const [paused, setPaused] = useState(false);
  const [mode, setMode] = useState<DriveMode>("ACCEL");
  const [message, setMessage] = useState("시속 200 km로 직선을 주행 중입니다");
  const speedRef = useRef(200);
  const progressRef = useRef(0);
  const batteryRef = useRef(58);
  const pausedRef = useRef(false);

  const togglePlayback = () => {
    setPaused((current) => {
      const next = !current;
      pausedRef.current = next;
      return next;
    });
  };

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.code === "Space" && !event.repeat) {
        event.preventDefault();
        togglePlayback();
      }
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    let frame = 0;
    let previous = performance.now();
    const tick = (now: number) => {
      if (pausedRef.current) {
        previous = now;
        frame = requestAnimationFrame(tick);
        return;
      }
      const dt = Math.min((now - previous) / 1000, 0.05);
      previous = now;
      const currentProgress = progressRef.current;
      const autoBrake = currentProgress >= 22 && currentProgress < 62;
      const autoAccelerate = !autoBrake;
      const effectiveBraking = autoBrake;
      const effectiveAccelerating = autoAccelerate;
      let nextSpeed = speedRef.current;
      let nextBattery = batteryRef.current;

      if (effectiveBraking) {
        const brakingForce = nextSpeed > 118 ? 155 : 35;
        nextSpeed = Math.max(82, nextSpeed - brakingForce * dt);
        nextBattery = Math.min(100, nextBattery + Math.min(nextSpeed / 65, 2.2) * dt);
      } else if (effectiveAccelerating) {
        const electricHelp = nextBattery > 4 ? 1 : 0.55;
        nextSpeed = Math.min(305, nextSpeed + (54 * electricHelp - nextSpeed * 0.045) * dt);
        nextBattery = Math.max(0, nextBattery - (nextSpeed > 20 ? 1.25 : 0.45) * dt);
      } else {
        nextSpeed = Math.max(0, nextSpeed - (7 + nextSpeed * 0.018) * dt);
      }

      // Normalize each path segment by its drawn length. A slightly nonlinear
      // presentation scale makes high speed read clearly on a small slide:
      // 200 km/h appears about 2.5x faster than 100 km/h.
      const pathLengthPerProgress = currentProgress < 38
        ? 45 / 38
        : currentProgress < 62
          ? Math.PI / 4
          : 54 / 38;
      const perceivedScreenSpeed = (100 / 15) * Math.pow(Math.max(nextSpeed, 1) / 100, 1.3);
      const visualProgressRate = perceivedScreenSpeed / pathLengthPerProgress;
      let nextProgress = progressRef.current + dt * visualProgressRate;
      if (nextProgress >= 100) {
        nextProgress = 0;
        nextSpeed = 200;
        setMode("FINISH");
        setMessage("주행 완료 — 시속 200 km로 다음 주행을 시작합니다");
      } else if (nextProgress >= 38 && nextProgress < 62) {
        if (nextSpeed > 110) setMessage("바쿠 2번 코너 제동 — 속도를 약 90 km/h까지 낮춥니다");
        else if (effectiveBraking) setMessage("2번 코너 진입 — MGU-K가 제동 에너지를 전기로 회수합니다");
        else setMessage("바쿠 2번 코너: 저속 90도 좌회전");
      } else if (nextProgress >= 72) {
        setMessage("다시 직선 — MGU-K 출력을 조절하며 고속으로 가속합니다");
      } else if (nextProgress >= 62) {
        setMessage("2번 코너 탈출 — MGU-K가 가속을 돕고 54m 뒤 DRS 구간이 시작됩니다");
      } else if (nextProgress >= 22) {
        setMessage("시속 200 km 이상 — 바쿠 2번 코너 강한 제동 시작");
      } else if (effectiveAccelerating) setMessage("바쿠 2번 코너 접근 — MGU-H와 MGU-K가 가속을 돕습니다");

      const nextMode: DriveMode = effectiveBraking ? "BRAKE" : effectiveAccelerating ? "ACCEL" : nextSpeed > 1 ? "COAST" : "READY";
      if (nextProgress < 99.8) setMode(nextMode);
      speedRef.current = nextSpeed;
      progressRef.current = nextProgress;
      batteryRef.current = nextBattery;
      setSpeed(nextSpeed);
      setProgress(nextProgress);
      setBattery(nextBattery);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const pose = carPose(progress);
  const inCorner = progress >= 38 && progress < 62;
  const atExit = progress >= 62;
  const isBraking = mode === "BRAKE";
  const isAccelerating = mode === "ACCEL";
  const displaySpeed = qualifyingSpeed(progress);
  const mguKLimit = ruleYear === 2026 ? 350 : 120;
  const mguKPower = ruleYear === 2026
    ? isBraking
      ? progress < 38
        ? interpolate(350, 210, (progress - 22) / 16)
        : interpolate(210, 95, (progress - 38) / 24)
      : isAccelerating && atExit
        ? interpolate(350, 250, (progress - 62) / 38)
        : isAccelerating ? 350 : 0
    : isBraking
      ? progress < 38
        ? interpolate(120, 72, (progress - 22) / 16)
        : interpolate(72, 28, (progress - 38) / 24)
      : isAccelerating && atExit
        ? interpolate(120, 86, (progress - 62) / 38)
        : isAccelerating ? 100 : 0;
  const mguHPower = ruleYear === 2026 ? 0 : isBraking
    ? Math.max(3, 28 - (progress - 22) * 0.62)
    : isAccelerating && atExit
      ? Math.min(85, 18 + (progress - 62) * 1.75)
      : isAccelerating
        ? Math.min(78, 56 + progress * 0.58)
        : 0;
  const mguKPercent = Math.min(100, Math.max(0, (mguKPower / mguKLimit) * 100));
  const mguHPercent = Math.min(100, Math.max(0, (mguHPower / 85) * 100));
  const phaseIndex = progress < 22 ? 0 : progress < 50 ? 1 : progress < 72 ? 2 : 3;
  const speedClass = speed >= 170 ? "speed-fast" : speed <= 110 ? "speed-slow" : "speed-medium";
  const displayedMessage = ruleYear === 2026 && progress < 22
    ? "바쿠 2번 코너 접근 — 350 kW MGU-K가 가속을 돕습니다"
    : message;

  if (screenView === "components") {
    return <ComponentFlowScreen choice={componentChoice} setChoice={setComponentChoice} onBack={() => setScreenView("simulator")} />;
  }

  return (
    <main className={`raceSim videoMode ${paused ? "isPaused" : ""}`} onClick={togglePlayback} aria-label="바쿠 ERS 영상 시뮬레이터. 클릭하거나 Space 키로 재생 또는 일시정지합니다.">
      <header className="simHeader">
        <div className="brand"><span>E</span> {ruleYear === 2025 ? "MGU-K, MGU-H" : "MGU-K"}<button className="anatomyButton" onClick={(event) => { event.stopPropagation(); setScreenView("components"); }}>차량 내부 보기 →</button></div>
        <div className="titleBlock"><small>F1 하이브리드 에너지 체험</small><h1>브레이크로 충전하고, 가속으로 사용하라</h1></div>
        <div className="ruleSwitch" role="group" aria-label="파워유닛 규정 연도 선택">
          <button className={ruleYear === 2025 ? "active" : ""} onClick={(event) => { event.stopPropagation(); setRuleYear(2025); }}><b>2025</b><small>K + H · 120 kW</small></button>
          <button className={ruleYear === 2026 ? "active" : ""} onClick={(event) => { event.stopPropagation(); setRuleYear(2026); }}><b>2026</b><small>K · 350 kW</small></button>
        </div>
      </header>

      <section className="gameGrid">
        <div className="trackPanel">
          <div className="trackHud">
            <div><small>속도</small><b>{Math.round(displaySpeed)}</b><span>km/h</span></div>
            <div className="trackPhaseSteps" aria-label="트랙 진행 단계">
              {["직선", "코너 진입", "코너 탈출", "다시 직선"].map((label, index) => <span className={phaseIndex === index ? "active" : ""} key={label}><i>{index + 1}</i>{label}</span>)}
            </div>
          </div>
          <div className="instruction"><i className="signal" /><span>{displayedMessage}</span></div>

          <div className="track" aria-label="바쿠 시가지 서킷의 2번 왼쪽 코너와 긴 탈출 직선">
            <div className="grassTexture" />
            <div className="road approachRoad"><i /></div>
            <div className="road cornerRoad"><i /></div>
            <div className="road exitRoad"><i /></div>
            <div className="brakeZone"><span>BRAKE</span></div>
            <div className="cornerNumber"><b>2</b><span>BAKU · TURN 2</span></div>
            <div className="drsActivation"><i /><span>54m 후 DRS</span></div>

            <div className={`miniCar mode-${mode.toLowerCase()} ${speedClass}`} style={{ left: `${pose.x}%`, top: `${pose.y}%`, transform: `translate(-50%,-50%) rotate(${pose.angle}deg)` }}>
              <img src={ruleYear === 2025 ? "./kick-sauber-2025.png" : "./audi-r26-2026.png"} alt={ruleYear === 2025 ? "2025 Kick Sauber 스타일 F1 차량" : "2026 Audi 스타일 F1 차량"} draggable="false" /><i className="energyPulse" />
            </div>
          </div>
        </div>

        <aside className="systemsPanel">
          <EnergyFlowOverview braking={isBraking} year={ruleYear} kPower={mguKPower} hPower={mguHPower} />
          <div className="panelHeading"><small>실시간 에너지 흐름</small><h2>{isBraking ? "제동 에너지 회수" : isAccelerating ? "전기 에너지 사용" : "시스템 대기"}</h2></div>

          <div className={`systemCard kCard ${isBraking ? "active generatorMode" : isAccelerating ? "active motorMode" : ""}`}>
            <div className="systemTitle"><span>K</span><div><b>MGU-K</b><small>{isBraking ? "발전기 모드" : isAccelerating ? "모터 모드" : "대기"}</small></div><strong>{Math.round(mguKPower)} kW</strong></div>
            {isBraking ? (
              <div className="energyDiagram generatorFlow" aria-label="바퀴에서 MGU-K를 거쳐 배터리로 충전"><div className="wheelSymbol modeIcon"><b>W</b><small>바퀴</small></div><div className="movingArrow"><i /><i /><i /></div><div className="unitSymbol modeIcon"><b>K</b><small>발전</small></div><div className="movingArrow"><i /><i /><i /></div><div className="batterySymbol modeIcon"><b>+</b><small>충전</small></div></div>
            ) : (
              <div className="energyDiagram motorFlow" aria-label="배터리에서 MGU-K를 거쳐 바퀴로 출력"><div className="batterySymbol modeIcon"><b>-</b><small>배터리</small></div><div className="movingArrow"><i /><i /><i /></div><div className="unitSymbol modeIcon"><b>K</b><small>모터</small></div><div className="movingArrow"><i /><i /><i /></div><div className="wheelSymbol modeIcon"><b>W</b><small>구동</small></div></div>
            )}
            <p>{isBraking ? "바퀴의 운동에너지 → 전기에너지 → 배터리 충전" : isAccelerating ? "배터리 전기에너지 → MGU-K 회전력 → 바퀴 가속" : "시스템이 주행 구간을 감지합니다."}</p>
            <div className="powerBar"><i style={{ width: `${mguKPercent}%` }} /></div>
          </div>

          {ruleYear === 2025 ? <div className={`systemCard hCard ${isAccelerating || isBraking ? "active" : ""}`}>
            <div className="systemTitle"><span>H</span><div><b>MGU-H</b><small>{isAccelerating ? "터보 발전·제어" : isBraking ? "배기량 감소" : "대기"}</small></div><strong>{Math.round(mguHPower)} kW</strong></div>
            <div className="energyDiagram"><div className="exhaustSymbol">≋</div><div className="movingArrow"><i /><i /><i /></div><div className="unitSymbol">H</div><div className="movingArrow"><i /><i /><i /></div><div className="turboSymbol">◎</div></div>
            <p>{isAccelerating ? "뜨거운 배기가스가 터보와 MGU-H를 돌려 전기를 만들고 터보 회전을 조절합니다." : isBraking ? "가속이 해제되어 배기가스가 줄고 MGU-H 발전량도 낮아집니다." : "가속 구간을 기다립니다."}</p>
            <div className="powerBar orange"><i style={{ width: `${mguHPercent}%` }} /></div>
          </div> : <div className="systemCard noHCard active"><div className="systemTitle"><span>H</span><div><b>MGU-H 없음</b><small>2026 규정에서 삭제</small></div><strong>0 kW</strong></div><div className="removedFlow"><b>MGU-H</b><span>삭제</span></div><p>2026 파워유닛은 MGU-H를 사용하지 않고, MGU-K 전기 출력을 최대 350 kW로 높였습니다.</p><div className="powerBar"><i style={{ width: "0%" }} /></div></div>}

          <div className="batteryMeter"><div><span>ENERGY STORE</span><b>{Math.round(battery)}%</b></div><div className="batteryFill"><i style={{ width: `${battery}%` }} /></div><small>{isBraking ? "▲ MGU-K가 자동 충전 중" : isAccelerating ? "▼ MGU-K에 자동 전력 공급 중" : "— 충전량 유지"}</small></div>
        </aside>
      </section>

      <section className="videoControls">
        <div className="videoToggle"><b>{paused ? "▶" : "Ⅱ"}</b><span>{paused ? "일시정지됨" : "자동 재생 중"}</span></div>
        <div className="videoTimeline"><i><b style={{ width: `${progress}%` }} /></i><div>{["직선", "코너 진입", "코너 탈출", "다시 직선"].map((label, index) => <span className={phaseIndex === index ? "active" : ""} key={label}>{label}</span>)}</div></div>
        <div className="videoHint">화면 클릭 또는 <kbd>SPACE</kbd></div>
      </section>
    </main>
  );
}
