import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  Html,
  Lightformer,
  OrbitControls,
  SoftShadows,
  useCursor,
} from "@react-three/drei";
import * as THREE from "three";
import Drone from "../models/Drone";
import Palm from "../models/Palm";
import Rocket from "../models/Rocket";
import Studio from "../models/Studio";
import Computer from "../models/Computer";
import { studioLayout as layout } from "../models/studioLayout";
import { apps, projects } from "../portfolioContent";

const views = [
  { position: [8.4, 7.2, 13.2], target: [0, 0.65, 0] },
  ...["drone", "palm", "rocket", "computer"].map((key) => ({
    position: layout[key].camera,
    target: layout[key].target,
  })),
];

function CameraRig({ view, reducedMotion, controls }) {
  const { camera, invalidate, size } = useThree();
  const flying = useRef(true);
  const destination = useMemo(() => new THREE.Vector3(), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  useEffect(() => {
    target.fromArray(views[view + 1].target);
    destination.fromArray(views[view + 1].position);
    const fit = Math.max(
      1,
      (view === -1 ? 1.35 : view === 0 ? 1.1 : 0.85) /
        (size.width / size.height),
    );
    destination.sub(target).multiplyScalar(Math.min(fit, 1.8)).add(target);
    flying.current = true;
    invalidate();
  }, [view, destination, target, invalidate, size.width, size.height]);
  useEffect(() => {
    const current = controls.current;
    const stop = () => {
      flying.current = false;
    };
    current?.addEventListener("start", stop);
    return () => current?.removeEventListener("start", stop);
  }, [controls]);
  useFrame((_, delta) => {
    if (!flying.current || !controls.current) return;
    const ease = reducedMotion ? 1 : 1 - Math.exp(-Math.min(delta, 0.05) * 3.8);
    camera.position.lerp(destination, ease);
    controls.current.target.lerp(target, ease);
    controls.current.update();
    if (
      camera.position.distanceTo(destination) < 0.003 &&
      controls.current.target.distanceTo(target) < 0.003
    )
      flying.current = false;
    else invalidate();
  });
  return null;
}

function Selectable({ children, position, scale, onSelect }) {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered, "pointer", "auto");
  return (
    <group
      position={position}
      scale={scale}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      {children}
    </group>
  );
}

function AssemblyAnimation({ exploded, reducedMotion }) {
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    const start = performance.now();
    let frame;
    const tick = () => {
      invalidate();
      if (!reducedMotion && performance.now() - start < 1800)
        frame = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(frame);
  }, [exploded, reducedMotion, invalidate]);
  return null;
}

function BenchScene({
  view,
  setView,
  exploded,
  frameOnly,
  selectedApp,
  onAppSelect,
  reducedMotion,
}) {
  const controls = useRef();
  return (
    <>
      <color attach="background" args={["#a2aa99"]} />
      <fog attach="fog" args={["#a2aa99", 24, 50]} />
      <SoftShadows size={12} samples={8} focus={0.4} />
      <ambientLight intensity={0.8} />
      <directionalLight
        position={[-4, 9, 5]}
        intensity={1.9}
        color="#fff0d5"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
        shadow-normalBias={0.04}
        shadow-bias={-0.0003}
      />
      <directionalLight position={[5, 3, -5]} intensity={1.0} color="#c7d9df" />
      <Environment frames={1} resolution={128}>
        <Lightformer
          position={[0, 6, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[10, 6, 1]}
          intensity={3}
        />
        <Lightformer
          position={[-6, 3, 2]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[3, 6, 1]}
          intensity={3}
        />
      </Environment>
      <Studio />
      {view === -1 &&
        [
          { position: layout.drone.pin, label: "Drone" },
          { position: layout.palm.pin, label: "Apps" },
          { position: layout.rocket.pin, label: "Rocket" },
          { position: layout.computer.pin, label: "Desktop" },
        ].map((item, i) => (
          <Html
            key={item.label}
            position={item.position}
            center
            zIndexRange={[2, 1]}
          >
            <button
              className="bench-pin"
              aria-label={`Inspect ${item.label.toLowerCase()}`}
              onClick={() => setView(i)}
            >
              <span>0{i + 1}</span>
              {item.label}
              <span>↗</span>
            </button>
          </Html>
        ))}
      <Selectable
        position={layout.drone.position}
        scale={layout.drone.scale}
        onSelect={() => setView(0)}
      >
        <Drone
          grounded
          moving={false}
          exploded={exploded}
          frameOnly={frameOnly}
          reducedMotion={reducedMotion}
        />
      </Selectable>
      <Selectable
        position={layout.palm.position}
        scale={layout.palm.scale}
        onSelect={() => setView(1)}
      >
        <Palm app={apps[selectedApp]} onAppSelect={view === 1 ? onAppSelect : undefined} />
      </Selectable>
      <Selectable
        position={layout.rocket.position}
        scale={layout.rocket.scale}
        onSelect={() => setView(2)}
      >
        <Rocket />
      </Selectable>
      <Selectable
        position={layout.computer.position}
        scale={layout.computer.scale}
        onSelect={() => setView(3)}
      >
        <Computer />
      </Selectable>
      <OrbitControls
        ref={controls}
        makeDefault
        enablePan={false}
        enableZoom={false}
        minPolarAngle={0.25}
        maxPolarAngle={Math.PI / 2.08}
        enableDamping
        dampingFactor={0.07}
      />
      <AssemblyAnimation exploded={exploded} reducedMotion={reducedMotion} />
      <CameraRig
        view={view}
        reducedMotion={reducedMotion}
        controls={controls}
      />
    </>
  );
}

export default function Workbench({
  onClose,
  onReadProject,
  onOpenDesktop,
  reducedMotion,
}) {
  const dialog = useRef();
  const [view, setView] = useState(-1);
  const [exploded, setExploded] = useState(false);
  const [frameOnly, setFrameOnly] = useState(false);
  const [selectedApp, setSelectedApp] = useState(0);
  const [failed, setFailed] = useState(false);
  const [visible, setVisible] = useState(!document.hidden);
  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current.showModal();
    const handle = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", handle);
    return () => {
      document.body.style.overflow = overflow;
      document.body.style.cursor = "";
      previous?.focus();
      document.removeEventListener("visibilitychange", handle);
    };
  }, []);
  const project = view >= 0 && view < 3 ? projects[view] : null;
  const computer = view === 3;
  return (
    <dialog
      ref={dialog}
      className="workbench-dialog"
      aria-labelledby="workbench-title"
      onCancel={onClose}
      onKeyDown={(event) => {
        if (event.target.closest("button")) return;
        if (event.key === "ArrowRight") {
          event.preventDefault();
          setView((v) => (v === 3 ? -1 : v + 1));
        }
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          setView((v) => (v === -1 ? 3 : v - 1));
        }
      }}
    >
      <div className="bench-topbar">
        <div>
          <span className="bench-symbol">m↗</span>
          <span id="workbench-title">
            The workbench
          </span>
        </div>
        <button className="bench-exit" onClick={onClose}>
          Back to portfolio <span>×</span>
        </button>
      </div>
      <div
        className="bench-scene"
        tabIndex={0}
        aria-label="Interactive 3D workbench. Click an object or use the project buttons to inspect it. Arrow keys move between objects."
      >
        {failed ? (
          <div className="bench-fallback">
            <p>The 3D workbench is unavailable on this device.</p>
            <button onClick={onClose}>Return to the project pages →</button>
          </div>
        ) : (
          <Canvas
            shadows="soft"
            camera={{ position: views[0].position, fov: 39 }}
            dpr={[1, 1.5]}
            frameloop={visible ? "demand" : "never"}
            gl={{ antialias: true, powerPreference: "high-performance" }}
            fallback={
              <div className="bench-fallback">
                <p>Explore the project notes using the buttons below.</p>
              </div>
            }
            onCreated={({ gl }) => {
              gl.toneMappingExposure = 1.03;
              gl.domElement.addEventListener(
                "webglcontextlost",
                () => setFailed(true),
                { once: true },
              );
            }}
          >
            <Suspense fallback={null}>
              <BenchScene
                view={view}
                setView={setView}
                exploded={exploded}
                frameOnly={frameOnly}
                selectedApp={selectedApp}
                onAppSelect={setSelectedApp}
                reducedMotion={reducedMotion}
              />
            </Suspense>
          </Canvas>
        )}
      </div>
      <div className="bench-caption" aria-live="polite">
        <p className="eyebrow">
          {project
            ? project.discipline
            : computer
              ? "Desktop"
              : "Overview"}
        </p>
        <h2>
          {project
            ? project.title
            : computer
              ? "Maksym OS"
              : "My workbench"}
        </h2>
        <p>
          {project
            ? project.summary
            : computer
              ? "Open the computer to browse my CV and projects."
              : "Select the drone, handheld, rocket, or computer for a closer look."}
        </p>
        {computer && (
          <button className="bench-read" onClick={onOpenDesktop}>
            Start the computer ↗
          </button>
        )}
        {project && (
          <button className="bench-read" onClick={() => onReadProject(project)}>
            Read the project notes ↗
          </button>
        )}
      </div>
      {view === 0 && (
        <div className="bench-object-controls">
          <button
            className={!exploded ? "active" : ""}
            onClick={() => setExploded(false)}
            aria-pressed={!exploded}
          >
            Assembled
          </button>
          <button
            className={exploded ? "active" : ""}
            onClick={() => setExploded(true)}
            aria-pressed={exploded}
          >
            Exploded
          </button>
          <button
            className={frameOnly ? "active" : ""}
            aria-pressed={frameOnly}
            onClick={() => setFrameOnly((v) => !v)}
          >
            Frame only
          </button>
        </div>
      )}
      {view === 1 && (
        <div className="bench-object-controls">
          {apps.map((app, i) => (
            <button
              key={app.id}
              onClick={() => setSelectedApp(i)}
              aria-pressed={selectedApp === i}
              className={selectedApp === i ? "active" : ""}
            >
              {app.name}
            </button>
          ))}
        </div>
      )}
      <div className="bench-navigation">
        <div className="bench-view-tabs" aria-label="Workbench views">
          <button
            onClick={() => setView(-1)}
            className={view === -1 ? "active" : ""}
            aria-pressed={view === -1}
          >
            Overview<span>↗</span>
          </button>
          {projects.map((item, i) => (
            <button
              key={item.id}
              onClick={() => setView(i)}
              className={view === i ? "active" : ""}
              aria-pressed={view === i}
            >
              <span>{item.number}</span>
              {["Drone", "Apps", "Rocket"][i]}
            </button>
          ))}
          <button
            onClick={() => setView(3)}
            className={computer ? "active" : ""}
            aria-pressed={computer}
          >
            <span>04</span>Desktop
          </button>
        </div>
        <span className="bench-help">
          CLICK AN OBJECT · DRAG TO LOOK AROUND
        </span>
        <div className="bench-arrows">
          <button
            aria-label="Previous workbench object"
            onClick={() => setView((v) => (v === -1 ? 3 : v - 1))}
          >
            ←
          </button>
          <button
            aria-label="Next workbench object"
            onClick={() => setView((v) => (v === 3 ? -1 : v + 1))}
          >
            →
          </button>
        </div>
      </div>
    </dialog>
  );
}
