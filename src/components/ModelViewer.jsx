import { Component, Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Environment, Lightformer, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import Drone from "../models/Drone";
import Palm from "../models/Palm";
import Rocket from "../models/Rocket";

class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <SceneFallback /> : this.props.children;
  }
}

function SceneFallback() {
  return (
    <div className="scene-fallback">
      <span className="fallback-mark" aria-hidden="true">
        ✳
      </span>
      <p>The interactive model is unavailable on this device.</p>
      <span>You can still explore every project below.</span>
    </div>
  );
}

function ContextHealth({ onLost }) {
  const gl = useThree((state) => state.gl);
  useEffect(() => {
    const handle = () => onLost(true);
    gl.domElement.addEventListener("webglcontextlost", handle);
    // R3F deliberately loses the old context on unmount. Remove our handler
    // first so a hot reload cannot mark a new, healthy canvas as failed.
    return () => gl.domElement.removeEventListener("webglcontextlost", handle);
  }, [gl, onLost]);
  return null;
}

function RenderUpdates({ signature, reducedMotion }) {
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    invalidate();
    if (reducedMotion) return;
    const start = performance.now();
    let frame;
    const tick = () => {
      invalidate();
      if (performance.now() - start < 1800) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [signature, reducedMotion, invalidate]);
  return null;
}

function CameraControls({ kind, moving, resetKey, onInteract }) {
  const ref = useRef();
  const { camera, size, invalidate } = useThree();
  useEffect(() => {
    ref.current?.reset();
    // Preserve the whole rotor envelope in narrow, portrait-shaped exhibits.
    camera.zoom =
      kind === "drone" ? Math.min(1, size.width / size.height / 1.25) : 1;
    camera.updateProjectionMatrix();
    invalidate();
  }, [resetKey, kind, size.width, size.height, camera, invalidate]);
  return (
    <OrbitControls
      ref={ref}
      makeDefault
      enablePan={false}
      enableZoom={false}
      enableDamping
      dampingFactor={0.065}
      autoRotate={moving && kind === "drone"}
      autoRotateSpeed={0.22}
      minPolarAngle={0.3}
      maxPolarAngle={Math.PI * 0.78}
      target={kind === "drone" ? [0, 0.12, 0] : [0, 0.15, 0]}
      onStart={onInteract}
    />
  );
}

export default function ModelViewer({
  kind = "drone",
  exploded = false,
  frameOnly = false,
  wireframe = false,
  moving = true,
  reducedMotion = false,
  resetKey = 0,
  app,
  onInteract,
  paused = false,
}) {
  const container = useRef();
  const [near, setNear] = useState(kind === "drone");
  const [visible, setVisible] = useState(true);
  const [pageVisible, setPageVisible] = useState(!document.hidden);
  const [lost, setLost] = useState(false);
  useEffect(() => {
    const preload = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setNear(true);
      },
      { rootMargin: "250px" },
    );
    const visibility = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting),
    );
    preload.observe(container.current);
    visibility.observe(container.current);
    const handle = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", handle);
    return () => {
      preload.disconnect();
      visibility.disconnect();
      document.removeEventListener("visibilitychange", handle);
    };
  }, []);
  const active = visible && pageVisible && !paused;
  const camera =
    kind === "drone"
      ? { position: [4.8, 3.7, 5.5], fov: 34 }
      : kind === "palm"
        ? { position: [0, 0.4, 6.6], fov: 32 }
        : { position: [2, 1.4, 7.9], fov: 33 };
  return (
    <div
      ref={container}
      className={`model-canvas model-canvas--${kind}`}
      role="img"
      aria-label={
        kind === "drone"
          ? `DXF-derived drone frame with visualised components, ${exploded ? "exploded" : "assembled"} view`
          : kind === "palm"
            ? `Palm-style handheld showing ${app.name}, an interface study`
            : "Illustrative rocket concept; planned project"
      }
    >
      <SceneBoundary>
        {lost ? (
          <SceneFallback />
        ) : (
          near && (
            <Canvas
              camera={camera}
              dpr={[1, 1.6]}
              shadows="soft"
              frameloop={
                !active
                  ? "never"
                  : moving && !reducedMotion
                    ? "always"
                    : "demand"
              }
              gl={{
                antialias: true,
                alpha: true,
                powerPreference: "high-performance",
              }}
              fallback={<SceneFallback />}
              onCreated={({ gl }) => {
                gl.toneMapping = THREE.ACESFilmicToneMapping;
                gl.toneMappingExposure = 1.15;
              }}
            >
              <ContextHealth onLost={setLost} />
              <ambientLight intensity={0.65} />
              <directionalLight
                position={[3, 6, 4]}
                intensity={3.0}
                castShadow
                shadow-mapSize={[1024, 1024]}
                shadow-bias={-0.0005}
                shadow-normalBias={0.03}
                shadow-camera-left={-3.5}
                shadow-camera-right={3.5}
                shadow-camera-top={3.5}
                shadow-camera-bottom={-3.5}
              />
              <directionalLight
                position={[-4, 1, -2]}
                intensity={1.4}
                color="#dce7ed"
              />
              <Suspense fallback={null}>
                <Environment resolution={128} frames={1}>
                  <Lightformer
                    position={[0, 5, -3]}
                    rotation={[Math.PI / 2, 0, 0]}
                    scale={[8, 5, 1]}
                    intensity={3}
                  />
                  <Lightformer
                    position={[-5, 1, 2]}
                    rotation={[0, Math.PI / 2, 0]}
                    scale={[3, 7, 1]}
                    intensity={2}
                  />
                  <Lightformer
                    position={[5, 2, 1]}
                    rotation={[0, -Math.PI / 2, 0]}
                    scale={[2, 6, 1]}
                    intensity={3}
                  />
                </Environment>
                {kind === "drone" ? (
                  <Drone
                    exploded={exploded}
                    frameOnly={frameOnly}
                    wireframe={wireframe}
                    moving={moving && active}
                    reducedMotion={reducedMotion}
                  />
                ) : kind === "palm" ? (
                  <Palm app={app} />
                ) : (
                  <Rocket />
                )}
                {kind === "drone" && (
                  <mesh
                    rotation={[-Math.PI / 2, 0, 0]}
                    position={[0, -0.24, 0]}
                    receiveShadow
                  >
                    <planeGeometry args={[20, 20]} />
                    <shadowMaterial transparent opacity={0.12} />
                  </mesh>
                )}
              </Suspense>
              <CameraControls
                kind={kind}
                moving={moving && !reducedMotion && active}
                resetKey={resetKey}
                onInteract={onInteract}
              />
              <RenderUpdates
                signature={`${exploded}-${frameOnly}-${wireframe}-${moving}-${resetKey}-${app?.id}-${visible}`}
                reducedMotion={reducedMotion}
              />
            </Canvas>
          )
        )}
      </SceneBoundary>
    </div>
  );
}
