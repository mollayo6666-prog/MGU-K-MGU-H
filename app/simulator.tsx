"use client";

import { useEffect, useRef, useState } from "react";

type DriveMode = "READY" | "ACCEL" | "BRAKE" | "COAST" | "FINISH";

function carPose(progress: number) {
  if (progress < 60) return { x: 9 + progress * 0.84, y: 32, angle: 0 };
  if (progress < 80) {
    const t = (progress - 60) / 20;
    const theta = -Math.PI / 2 + t * Math.PI / 2;
    return { x: 59.4 + 20 * Math.cos(theta), y: 52 + 20 * Math.sin(theta), angle: t * 90 };
  }
  return { x: 79.4, y: 52 + (progress - 80) * 1.75, angle: 90 };
}

export default function Simulator() {
  const [speed, setSpeed] = useState(0);
  const [progress, setProgress] = useState(0);
  const [battery, setBattery] = useState(58);
  const [accelerating, setAccelerating] = useState(false);
  const [braking, setBraking] = useState(false);
  const [mode, setMode] = useState<DriveMode>("READY");
  const [lap, setLap] = useState(1);
  const [message, setMessage] = useState("가속 페달을 눌러 출발하세요");
  const speedRef = useRef(0);
  const progressRef = useRef(0);
  const batteryRef = useRef(58);
  const inputsRef = useRef({ accelerating: false, braking: false });

  useEffect(() => { inputsRef.current = { accelerating, braking }; }, [accelerating, braking]);

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.code === "ArrowUp") { event.preventDefault(); setAccelerating(true); }
      if (event.code === "Space" || event.code === "ArrowDown") { event.preventDefault(); setBraking(true); }
    };
    const up = (event: KeyboardEvent) => {
      if (event.code === "ArrowUp") setAccelerating(false);
      if (event.code === "Space" || event.code === "ArrowDown") setBraking(false);
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);

  useEffect(() => {
    let frame = 0;
    let previous = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - previous) / 1000, 0.05);
      previous = now;
      const input = inputsRef.current;
      let nextSpeed = speedRef.current;
      let nextBattery = batteryRef.current;

      if (input.braking) {
        nextSpeed = Math.max(0, nextSpeed - 115 * dt);
        nextBattery = Math.min(100, nextBattery + Math.min(nextSpeed / 65, 2.2) * dt);
      } else if (input.accelerating) {
        const electricHelp = nextBattery > 4 ? 1 : 0.55;
        nextSpeed = Math.min(320, nextSpeed + (62 * electricHelp - nextSpeed * 0.055) * dt);
        nextBattery = Math.max(0, nextBattery - (nextSpeed > 20 ? 1.25 : 0.45) * dt);
      } else {
        nextSpeed = Math.max(0, nextSpeed - (7 + nextSpeed * 0.018) * dt);
      }

      let nextProgress = progressRef.current + nextSpeed * dt * 0.011;
      if (nextProgress >= 100) {
        nextProgress = 0;
        nextSpeed = 0;
        setLap((value) => value + 1);
        setMode("FINISH");
        setMessage("한 바퀴 완료! 다시 가속해 보세요");
      } else if (nextProgress >= 60 && nextProgress < 80) {
        if (nextSpeed > 145) setMessage("너무 빠릅니다! 브레이크를 누르세요");
        else if (input.braking) setMessage("좋아요! MGU-K가 제동 에너지를 회수합니다");
        else setMessage("코너 제한 속도: 145 km/h 이하");
      } else if (nextProgress >= 80) {
        if (input.accelerating) setMessage("코너 탈출! MGU-K가 가속을 돕습니다");
        else setMessage("가속 페달을 눌러 코너를 빠져나가세요");
      } else if (nextProgress >= 48) {
        setMessage("코너 접근 중 — 브레이크를 준비하세요");
      } else if (input.accelerating) setMessage("직선 가속 — MGU-H와 MGU-K가 함께 작동합니다");

      const nextMode: DriveMode = input.braking ? "BRAKE" : input.accelerating ? "ACCEL" : nextSpeed > 1 ? "COAST" : "READY";
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
  const inCorner = progress >= 60 && progress < 80;
  const atExit = progress >= 80;
  const mguKPower = braking ? Math.min(120, speed * 0.65) : accelerating ? Math.min(120, battery * 1.2) : 0;
  const mguHPower = accelerating ? Math.min(85, 22 + speed * 0.2) : braking ? 4 : speed > 20 ? 12 : 0;
  const safe = !inCorner || speed <= 145;

  const pedalProps = (setter: (value: boolean) => void) => ({
    onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => { event.currentTarget.setPointerCapture(event.pointerId); setter(true); },
    onPointerUp: () => setter(false),
    onPointerCancel: () => setter(false),
    onPointerLeave: () => setter(false),
  });

  return (
    <main className="raceSim">
      <header className="simHeader">
        <div className="brand"><span>E</span> ERS 드라이빙 랩</div>
        <div className="titleBlock"><small>F1 하이브리드 에너지 체험</small><h1>브레이크로 충전하고, 가속으로 사용하라</h1></div>
        <div className="lapCounter">LAP <b>{lap}</b></div>
      </header>

      <section className="gameGrid">
        <div className="trackPanel">
          <div className="trackHud">
            <div><small>속도</small><b>{Math.round(speed)}</b><span>km/h</span></div>
            <div><small>구간</small><b>{inCorner ? "코너" : atExit ? "탈출" : "직선"}</b></div>
            <div className={safe ? "safe" : "danger"}><small>상태</small><b>{safe ? "정상" : "과속"}</b></div>
          </div>
          <div className="instruction"><i className={`signal ${inCorner ? "brakeSignal" : atExit ? "goSignal" : ""}`} /><span>{message}</span></div>

          <div className="track" aria-label="짧은 직선 뒤 오른쪽 코너가 있는 트랙">
            <div className="grassTexture" />
            <div className="road straightRoad"><i /></div>
            <div className="road curveRoad"><i /></div>
            <div className="road exitRoad"><i /></div>
            <div className="brakeZone"><span>BRAKE ZONE</span></div>
            <div className="apex"><i /><span>APEX</span></div>
            <div className="startLine" />
            <div className="finishLine" />

            <div className={`miniCar mode-${mode.toLowerCase()} ${!safe ? "sliding" : ""}`} style={{ left: `${pose.x}%`, top: `${pose.y}%`, transform: `translate(-50%,-50%) rotate(${pose.angle}deg)` }}>
              <div className="frontWing" /><div className="carBody"><i className="cockpit" /><i className="energyPulse" /></div><div className="rearWing" /><i className="tyre t1" /><i className="tyre t2" /><i className="tyre t3" /><i className="tyre t4" />
            </div>
          </div>
        </div>

        <aside className="systemsPanel">
          <div className="panelHeading"><small>실시간 에너지 흐름</small><h2>{braking ? "제동 에너지 회수" : accelerating ? "전기 에너지 사용" : "시스템 대기"}</h2></div>

          <div className={`systemCard kCard ${braking || accelerating ? "active" : ""}`}>
            <div className="systemTitle"><span>K</span><div><b>MGU-K</b><small>{braking ? "발전기 모드" : accelerating ? "모터 모드" : "대기"}</small></div><strong>{Math.round(mguKPower)} kW</strong></div>
            <div className={`energyDiagram ${braking ? "reverse" : ""}`}><div className="wheelSymbol">◉</div><div className="movingArrow"><i /><i /><i /></div><div className="unitSymbol">K</div><div className="movingArrow"><i /><i /><i /></div><div className="batterySymbol">▥</div></div>
            <p>{braking ? "바퀴의 운동에너지 → 전기에너지 → 배터리 충전" : accelerating ? "배터리 전기에너지 → MGU-K 회전력 → 바퀴 가속" : "브레이크 또는 가속 페달을 눌러 보세요."}</p>
            <div className="powerBar"><i style={{ width: `${mguKPower / 1.2}%` }} /></div>
          </div>

          <div className={`systemCard hCard ${accelerating ? "active" : ""}`}>
            <div className="systemTitle"><span>H</span><div><b>MGU-H</b><small>{accelerating ? "터보 발전·제어" : braking ? "배기량 감소" : "대기"}</small></div><strong>{Math.round(mguHPower)} kW</strong></div>
            <div className="energyDiagram"><div className="exhaustSymbol">≋</div><div className="movingArrow"><i /><i /><i /></div><div className="unitSymbol">H</div><div className="movingArrow"><i /><i /><i /></div><div className="turboSymbol">◎</div></div>
            <p>{accelerating ? "뜨거운 배기가스가 터보와 MGU-H를 돌려 전기를 만들고 터보 회전을 조절합니다." : braking ? "가속 페달을 놓아 배기가스가 줄어들고 MGU-H 발전량도 낮아집니다." : "가속하면 배기가스의 에너지를 회수합니다."}</p>
            <div className="powerBar orange"><i style={{ width: `${mguHPower}%` }} /></div>
          </div>

          <div className="batteryMeter"><div><span>ENERGY STORE</span><b>{Math.round(battery)}%</b></div><div className="batteryFill"><i style={{ width: `${battery}%` }} /></div><small>{braking ? "▲ MGU-K가 충전 중" : accelerating ? "▼ MGU-K에 전력 공급 중" : "— 충전량 유지"}</small></div>
        </aside>
      </section>

      <section className="controls">
        <div className="controlHelp"><span>운전 방법</span><h2>{progress < 48 ? "가속해서 코너로 이동" : inCorner ? "브레이크로 145 km/h 이하" : "가속해서 코너 탈출"}</h2><p>키보드: ↑ 가속 · Space/↓ 브레이크</p></div>
        <div className="pedalCluster">
          <button className={`pedal brakePedal ${braking ? "pressed" : ""}`} {...pedalProps(setBraking)} aria-label="브레이크 페달"><span className="pedalFace"><i /><i /><i /><i /><i /><i /></span><b>BRAKE</b><small>브레이크</small></button>
          <button className={`pedal accelPedal ${accelerating ? "pressed" : ""}`} {...pedalProps(setAccelerating)} aria-label="가속 페달"><span className="pedalFace"><i /><i /><i /><i /><i /></span><b>ACCEL</b><small>가속</small></button>
        </div>
        <div className="pedalReadout"><div><span>브레이크 입력</span><i><b style={{ width: braking ? "100%" : "0%" }} /></i></div><div><span>가속 입력</span><i><b style={{ width: accelerating ? "100%" : "0%" }} /></i></div></div>
      </section>
    </main>
  );
}
