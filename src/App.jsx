import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls, useCursor } from "@react-three/drei";
import * as THREE from "three";
import {
  cameraKeyframes,
  disks,
  freePlayCamera,
  mobileApps,
  softwareProjects
} from "./portfolioContent";

const LEGACY_SCREEN_WIDTH = 960;
const LEGACY_SCREEN_HEIGHT = 720;
const LEGACY_SCREEN_SRC = "/legacy-os/index.html?surface=screen";

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function smoother(value) {
  const t = clamp(value);
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function smoothRange(value, start, end) {
  if (end === start) return value >= end ? 1 : 0;
  return smoother((value - start) / (end - start));
}

function mix(a, b, t) {
  return THREE.MathUtils.lerp(a, b, clamp(t));
}

function mixArray(start, end, t) {
  const eased = clamp(t);
  return [
    mix(start[0], end[0], eased),
    mix(start[1], end[1], eased),
    mix(start[2], end[2], eased)
  ];
}

function notifyLegacyOS(disk) {
  document.querySelectorAll(".mac-screen-frame, .legacy-os-frame").forEach((iframe) => {
    const doc = iframe.contentDocument;
    const alertBox = doc?.getElementById("desktop-alert");
    const diskLabel = doc?.querySelector(".disk-icon span:last-child");

    if (diskLabel) diskLabel.textContent = `${disk.label} Disk`;
    if (!alertBox) return;

    alertBox.textContent = disk.status;
    alertBox.classList.add("show");
    window.setTimeout(() => alertBox.classList.remove("show"), 1900);
  });
}

function releaseTerminalLock() {
  document.body.style.overflow = "";
  document.documentElement.style.overflowY = "";
}

function jumpToTop() {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  window.dispatchEvent(new Event("scroll"));
}

function isAtScrollEnd() {
  const doc = document.documentElement;
  const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
  return window.scrollY >= maxScroll - 2;
}

function useScrollTimeline() {
  const progressRef = useRef(0);
  const targetRef = useRef(0);
  const [uiProgress, setUiProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    let lastTime = 0;
    let lastUiProgress = progressRef.current;
    let lastUiTime = 0;

    function readTarget() {
      const doc = document.documentElement;
      const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
      targetRef.current = clamp(window.scrollY / maxScroll);
    }

    function tick(time) {
      const delta = lastTime ? Math.min(0.05, (time - lastTime) / 1000) : 0.016;
      const ease = 1 - Math.exp(-delta * 6.4);
      lastTime = time;

      const current = THREE.MathUtils.lerp(progressRef.current, targetRef.current, ease);
      progressRef.current = Math.abs(current - targetRef.current) < 0.00035 ? targetRef.current : current;
      document.documentElement.style.setProperty("--scroll-progress", progressRef.current.toFixed(4));

      const needsFineUi = progressRef.current > 0.93 || targetRef.current > 0.93;
      const shouldUpdateUi =
        Math.abs(progressRef.current - lastUiProgress) > (needsFineUi ? 0.0025 : 0.025) ||
        time - lastUiTime > (needsFineUi ? 34 : 240) ||
        progressRef.current === targetRef.current;

      if (shouldUpdateUi) {
        lastUiProgress = progressRef.current;
        lastUiTime = time;
        setUiProgress(progressRef.current);
      }

      if (progressRef.current !== targetRef.current) {
        frame = window.requestAnimationFrame(tick);
      } else {
        frame = 0;
        lastTime = 0;
      }
    }

    function queueRead() {
      readTarget();
      if (!frame) {
        frame = window.requestAnimationFrame(tick);
      }
    }

    readTarget();
    progressRef.current = targetRef.current;
    lastUiProgress = targetRef.current;
    document.documentElement.style.setProperty("--scroll-progress", targetRef.current.toFixed(4));
    setUiProgress(targetRef.current);
    window.addEventListener("scroll", queueRead, { passive: true });
    window.addEventListener("resize", queueRead);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", queueRead);
      window.removeEventListener("resize", queueRead);
      document.documentElement.style.removeProperty("--scroll-progress");
    };
  }, []);

  return { progressRef, uiProgress };
}

function useViewportSize() {
  const [size, setSize] = useState(() => ({
    width: typeof window === "undefined" ? LEGACY_SCREEN_WIDTH : window.innerWidth,
    height: typeof window === "undefined" ? LEGACY_SCREEN_HEIGHT : window.innerHeight
  }));

  useEffect(() => {
    function updateSize() {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    }

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return size;
}

function App() {
  const { progressRef, uiProgress } = useScrollTimeline();
  const [activeDisk, setActiveDisk] = useState(disks[0]);
  const [insertedDiskId, setInsertedDiskId] = useState(null);
  const [terminalLocked, setTerminalLocked] = useState(false);
  const [mode, setMode] = useState(() => {
    if (typeof window === "undefined") return "cinematic";
    return window.matchMedia("(max-width: 760px)").matches ? "normal" : "cinematic";
  });

  useEffect(() => {
    const query = window.matchMedia("(max-width: 760px)");

    function keepMobileSimple(event) {
      if (event.matches) setMode("normal");
    }

    if (query.matches) setMode("normal");
    query.addEventListener("change", keepMobileSimple);

    return () => query.removeEventListener("change", keepMobileSimple);
  }, []);

  useEffect(() => {
    if (mode === "cinematic" && uiProgress > 0.998 && isAtScrollEnd()) {
      setTerminalLocked(true);
    }
  }, [mode, uiProgress]);

  useEffect(() => {
    if (mode !== "terminal" && !terminalLocked) return undefined;

    const bodyOverflow = document.body.style.overflow;
    const htmlOverflowY = document.documentElement.style.overflowY;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflowY = "hidden";

    return () => {
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflowY = htmlOverflowY;
    };
  }, [mode, terminalLocked]);

  function scrollToProgress(target) {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    window.scrollTo({ top: maxScroll * target, behavior: "smooth" });
  }

  function selectDisk(disk) {
    setActiveDisk(disk);
    setInsertedDiskId(disk.id);
    window.setTimeout(() => notifyLegacyOS(disk), 180);
  }

  function loadCinematic() {
    if (window.matchMedia("(max-width: 760px)").matches) {
      loadNormal();
      return;
    }

    releaseTerminalLock();
    setTerminalLocked(false);
    jumpToTop();
    setMode("cinematic");
    window.requestAnimationFrame(jumpToTop);
    window.setTimeout(jumpToTop, 0);
  }

  function loadNormal() {
    releaseTerminalLock();
    setTerminalLocked(false);
    setMode("normal");
  }

  function loadFreePlay() {
    releaseTerminalLock();
    setTerminalLocked(false);
    jumpToTop();
    setMode("freeplay");
    window.requestAnimationFrame(jumpToTop);
  }

  if (mode === "normal") {
    return <NormalPortfolio standalone onLoadCinematic={loadCinematic} />;
  }

  if (mode === "terminal") {
    return (
      <TerminalDesktop
        onLoadCinematic={loadCinematic}
        onLoadNormal={loadNormal}
        onLoadFreePlay={loadFreePlay}
      />
    );
  }

  if (mode === "freeplay") {
    return (
      <FreePlayWorkbench
        activeDisk={activeDisk}
        insertedDiskId={insertedDiskId}
        onSelectDisk={selectDisk}
        onLoadCinematic={loadCinematic}
        onLoadNormal={() => setMode("normal")}
      />
    );
  }

  const legacyOpacity = terminalLocked ? 1 : smoothRange(uiProgress, 0.956, 0.963);
  const legacyActive = terminalLocked || legacyOpacity > 0.001;

  return (
    <main className="workbench-app">
      <section className="cinematic-stage" aria-label="Scroll-driven portfolio sequence">
        <Canvas
          className="workbench-canvas"
          camera={{ position: [-0.12, 1.24, 5.2], fov: 38, near: 0.08, far: 80 }}
          dpr={[1, 1.25]}
          shadows
        >
          <SceneAtmosphere progressRef={progressRef} />
          <Suspense fallback={<SceneFallback />}>
            <WorkbenchScene
              activeDisk={activeDisk}
              insertedDiskId={insertedDiskId}
              progressRef={progressRef}
              screenLive={uiProgress > 0.25 && legacyOpacity < 0.08}
              onSelectDisk={selectDisk}
              onOpenComputer={() => scrollToProgress(1)}
              onOpenProjects={() => scrollToProgress(0.5)}
            />
          </Suspense>
          <ScrollCameraRig progressRef={progressRef} />
          <ShadowMapController progressRef={progressRef} freezeAfter={0.52} />
        </Canvas>

        {!legacyActive && (
          <CinematicHud onSkip={loadNormal} />
        )}

        <LegacyOSOverlay
          progress={legacyOpacity}
          active
          visible={legacyActive}
          locked={terminalLocked}
          onLoadCinematic={loadCinematic}
          onLoadNormal={loadNormal}
          onLoadFreePlay={loadFreePlay}
        />
      </section>

      <div className="scroll-track" aria-hidden="true" />
    </main>
  );
}

function SceneFallback() {
  return (
    <Html center>
      <div className="loading-chip">loading workbench</div>
    </Html>
  );
}

function SceneAtmosphere({ progressRef }) {
  const { scene } = useThree();
  const background = useMemo(() => new THREE.Color("#f6f3ea"), []);
  const voidColor = useMemo(() => new THREE.Color("#f6f3ea"), []);
  const benchColor = useMemo(() => new THREE.Color("#0c0f10"), []);
  const fog = useMemo(() => new THREE.Fog("#f6f3ea", 7.2, 14), []);

  useFrame(() => {
    const progress = progressRef.current;
    const reveal = smoothRange(progress, 0.26, 0.44);

    background.copy(voidColor).lerp(benchColor, reveal);
    fog.color.copy(background);
    fog.near = mix(7.2, 5.8, reveal);
    fog.far = mix(14, 10.5, reveal);

    scene.background = background;
    scene.fog = fog;
  });

  return null;
}

function ShadowMapController({ progressRef, freezeAfter = 0.52 }) {
  const { gl } = useThree();
  const frozen = useRef(false);

  useEffect(() => {
    gl.shadowMap.autoUpdate = true;
    gl.shadowMap.needsUpdate = true;

    return () => {
      gl.shadowMap.autoUpdate = true;
      gl.shadowMap.needsUpdate = true;
    };
  }, [gl]);

  useFrame(() => {
    const shouldUpdate = progressRef.current < freezeAfter;

    if (shouldUpdate) {
      if (frozen.current) frozen.current = false;
      gl.shadowMap.autoUpdate = true;
      gl.shadowMap.needsUpdate = true;
      return;
    }

    if (!frozen.current) {
      gl.shadowMap.needsUpdate = true;
      gl.shadowMap.autoUpdate = false;
      frozen.current = true;
    }
  });

  return null;
}

function ScrollCameraRig({ progressRef }) {
  const { camera } = useThree();
  const lookAt = useRef(new THREE.Vector3(0, 1, 0));
  const targetPosition = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    const next = sampleCamera(progressRef.current);
    const terminalApproach = smoothRange(progressRef.current, 0.94, 1);
    const ease = 1 - Math.exp(-delta * mix(7.8, 18, terminalApproach));

    targetPosition.current.set(next.position[0], next.position[1], next.position[2]);
    targetLookAt.current.set(next.target[0], next.target[1], next.target[2]);

    camera.position.lerp(targetPosition.current, ease);
    lookAt.current.lerp(targetLookAt.current, ease);
    camera.fov = mix(camera.fov, next.fov, ease);
    camera.updateProjectionMatrix();
    camera.lookAt(lookAt.current);
  });

  return null;
}

function sampleCamera(progress) {
  const current = cameraKeyframes.findLast((frame) => frame.t <= progress) || cameraKeyframes[0];
  const next = cameraKeyframes.find((frame) => frame.t > progress) || current;
  const span = Math.max(0.001, next.t - current.t);
  const t = smoother((progress - current.t) / span);

  return {
    position: mixArray(current.position, next.position, t),
    target: mixArray(current.target, next.target, t),
    fov: mix(current.fov, next.fov, t)
  };
}

function WorkbenchScene({
  activeDisk,
  insertedDiskId,
  progressRef,
  screenLive = true,
  onSelectDisk,
  onOpenComputer,
  onOpenProjects
}) {
  const ambientRef = useRef();
  const directionalRef = useRef();
  const spotRef = useRef();
  const warmPointRef = useRef();
  const coolPointRef = useRef();

  const getEnvironmentOpacity = () => smoothRange(progressRef.current, 0.26, 0.44);
  const getSceneOpacity = () => getEnvironmentOpacity() * (1 - smoothRange(progressRef.current, 0.96, 0.998));
  const getTerminalProgress = () => smoothRange(progressRef.current, 0.91, 0.995);

  useFrame(() => {
    const environmentOpacity = getEnvironmentOpacity();
    const lampProgress = smoothRange(progressRef.current, 0.28, 0.48);

    if (ambientRef.current) ambientRef.current.intensity = 0.1 + environmentOpacity * 0.34;
    if (directionalRef.current) directionalRef.current.intensity = 0.45 + environmentOpacity * 1.05;
    if (spotRef.current) spotRef.current.intensity = lampProgress * 4.2;
    if (warmPointRef.current) warmPointRef.current.intensity = 0.08 + lampProgress * 1.1;
    if (coolPointRef.current) coolPointRef.current.intensity = environmentOpacity * 0.45;
  });

  return (
    <group>
      <ambientLight ref={ambientRef} intensity={0.1} />
      <directionalLight
        ref={directionalRef}
        position={[-2.3, 4.2, 2.1]}
        intensity={0.45}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <spotLight
        ref={spotRef}
        position={[-1.25, 3.8, 1.75]}
        angle={0.58}
        penumbra={0.72}
        intensity={0}
        color="#ffd49a"
        castShadow
        shadow-mapSize={[512, 512]}
      />
      <pointLight ref={warmPointRef} position={[1.3, 1.9, 1.5]} intensity={0.08} color="#ffe2a8" />
      <pointLight ref={coolPointRef} position={[-1.6, 1.3, 2.2]} intensity={0} color="#83d7ff" />

      <DroneAssembly progressRef={progressRef} />

      <FadeGroup opacitySource={getSceneOpacity}>
        <WorkbenchBase />
        <RetroComputer
          onFocus={onOpenComputer}
          screenLive={screenLive}
          terminalProgressSource={getTerminalProgress}
        />
        <BlueprintStack onFocus={onOpenProjects} />
        <PhysicalProjects onFocus={onOpenProjects} />
        <MobilePhoneShowcase onFocus={onOpenProjects} />

        {disks.map((disk, index) => (
          <FloppyDisk
            key={disk.id}
            disk={disk}
            index={index}
            active={insertedDiskId === disk.id}
            onSelect={() => onSelectDisk(disk)}
          />
        ))}
      </FadeGroup>
    </group>
  );
}

function FadeGroup({ opacitySource, children }) {
  const ref = useRef();
  const visualOpacity = useRef(0);
  const lastAppliedOpacity = useRef(-1);
  const settled = useRef(false);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const opacity = typeof opacitySource === "function" ? opacitySource() : opacitySource;
    visualOpacity.current = THREE.MathUtils.damp(visualOpacity.current, opacity, 5.8, delta);
    ref.current.visible = visualOpacity.current > 0.001;

    if (visualOpacity.current > 0.996) {
      if (!settled.current) {
        settled.current = true;
        lastAppliedOpacity.current = 1;
        ref.current.traverse((child) => {
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          materials.forEach((material) => {
            if (!material) return;
            if (material.userData.fadeBaseOpacity === undefined) {
              material.userData.fadeBaseOpacity = material.opacity ?? 1;
              material.userData.fadeBaseTransparent = material.transparent;
              material.userData.fadeBaseDepthWrite = material.depthWrite;
            }

            material.opacity = material.userData.fadeBaseOpacity;
            material.transparent = material.userData.fadeBaseTransparent;
            material.depthWrite = material.userData.fadeBaseDepthWrite;
          });
        });
      }
      return;
    }

    settled.current = false;
    if (Math.abs(visualOpacity.current - lastAppliedOpacity.current) < 0.01) return;
    lastAppliedOpacity.current = visualOpacity.current;

    ref.current.traverse((child) => {
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => {
        if (!material) return;
        if (material.userData.fadeBaseOpacity === undefined) {
          material.userData.fadeBaseOpacity = material.opacity ?? 1;
          material.userData.fadeBaseTransparent = material.transparent;
          material.userData.fadeBaseDepthWrite = material.depthWrite;
        }

        const nextOpacity = material.userData.fadeBaseOpacity * visualOpacity.current;
        material.opacity = nextOpacity;
        material.transparent = nextOpacity < 0.995 || material.userData.fadeBaseTransparent;
        material.depthWrite = visualOpacity.current > 0.5;
      });
    });
  });

  return (
    <group ref={ref} visible={false}>
      {children}
    </group>
  );
}

function WorkbenchBase() {
  const grain = useMemo(() => {
    const strips = [];
    for (let index = 0; index < 24; index += 1) {
      strips.push(-3.42 + index * 0.3);
    }
    return strips;
  }, []);

  return (
    <group>
      <mesh position={[0, 0.47, 0]} receiveShadow castShadow>
        <boxGeometry args={[7.45, 0.22, 3.28]} />
        <meshStandardMaterial color="#735137" roughness={0.72} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.62, 0]} receiveShadow>
        <boxGeometry args={[7.35, 0.035, 3.18]} />
        <meshStandardMaterial color="#a5774c" roughness={0.68} />
      </mesh>
      {grain.map((x) => (
        <mesh key={x} position={[x, 0.643, 0]} receiveShadow>
          <boxGeometry args={[0.018, 0.012, 3.1]} />
          <meshStandardMaterial color="#5f432f" roughness={0.8} />
        </mesh>
      ))}
      {[-3.32, 3.32].map((x) =>
        [-1.38, 1.38].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, -0.08, z]} castShadow>
            <boxGeometry args={[0.22, 1.05, 0.22]} />
            <meshStandardMaterial color="#4b3428" roughness={0.78} />
          </mesh>
        ))
      )}
      <mesh position={[0, 1.72, -1.62]} receiveShadow>
        <boxGeometry args={[7.75, 2.15, 0.14]} />
        <meshStandardMaterial color="#222a2c" roughness={0.62} />
      </mesh>
      <mesh position={[0, 1.72, -1.535]}>
        <boxGeometry args={[7.55, 1.94, 0.035]} />
        <meshStandardMaterial color="#354244" roughness={0.82} />
      </mesh>
      <PegGrid />
    </group>
  );
}

function PegGrid() {
  const pegs = useMemo(() => {
    const items = [];
    for (let x = -3.48; x <= 3.48; x += 0.24) {
      for (let y = 1.05; y <= 2.52; y += 0.24) {
        items.push([x, y]);
      }
    }
    return items;
  }, []);
  const meshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    if (!meshRef.current) return;
    pegs.forEach(([x, y], index) => {
      dummy.position.set(x, y, -1.505);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(index, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [dummy, pegs]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, pegs.length]}>
      <cylinderGeometry args={[0.012, 0.012, 0.018, 8]} />
      <meshStandardMaterial color="#131819" roughness={0.4} />
    </instancedMesh>
  );
}

function RetroComputer({ onFocus, screenLive = true, terminalProgressSource = () => 0 }) {
  const screenMaterialRef = useRef();
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  useFrame(() => {
    if (!screenMaterialRef.current) return;
    screenMaterialRef.current.emissiveIntensity = 0.18 + terminalProgressSource() * 0.85;
  });

  return (
    <group position={[0.18, 0.64, -0.86]}>
      <mesh position={[0, 0.08, 0.32]} castShadow receiveShadow>
        <boxGeometry args={[1.72, 0.18, 0.86]} />
        <meshStandardMaterial color="#d6cfb7" roughness={0.64} />
      </mesh>
      <mesh position={[0, 0.22, 0.1]} castShadow>
        <boxGeometry args={[1.32, 0.14, 0.44]} />
        <meshStandardMaterial color="#c8bea4" roughness={0.7} />
      </mesh>
      <mesh position={[-0.55, 0.34, 0.2]}>
        <boxGeometry args={[0.48, 0.035, 0.08]} />
        <meshStandardMaterial color="#1b1b1b" roughness={0.45} />
      </mesh>

      <mesh position={[0, 1.03, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.02, 1.54, 0.38]} />
        <meshStandardMaterial color="#d9d0b7" roughness={0.58} />
      </mesh>
      <mesh position={[0, 1.03, 0.205]} castShadow>
        <boxGeometry args={[1.72, 1.28, 0.08]} />
        <meshStandardMaterial color="#221f1c" roughness={0.42} />
      </mesh>
      <mesh
        position={[0, 1.03, 0.252]}
        onClick={onFocus}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[1.62, 1.2, 0.035]} />
        <meshStandardMaterial
          ref={screenMaterialRef}
          color="#2f9f9d"
          roughness={0.32}
          emissive="#319f9c"
          emissiveIntensity={0.18}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, 1.03, 0.282]}>
        <boxGeometry args={[1.64, 1.22, 0.012]} />
        <meshStandardMaterial
          color="#e8fff9"
          transparent
          opacity={0.08}
          roughness={0.05}
        />
      </mesh>

      {screenLive && (
        <Html
          transform
          position={[0, 1.03, 0.306]}
          scale={0.06}
          zIndexRange={[120, 0]}
        >
          <MacScreenFrame />
        </Html>
      )}

      <mesh position={[0.64, 0.28, 0.55]} castShadow>
        <boxGeometry args={[0.46, 0.06, 0.22]} />
        <meshStandardMaterial color="#cfc6ad" roughness={0.62} />
      </mesh>
      <mesh position={[0.64, 0.315, 0.55]}>
        <boxGeometry args={[0.36, 0.012, 0.145]} />
        <meshStandardMaterial color="#1f2320" roughness={0.4} />
      </mesh>
    </group>
  );
}

function MacScreenFrame() {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="mac-screen-viewport">
      <iframe
        className={`mac-screen-frame ${loaded ? "is-loaded" : ""}`}
        src={LEGACY_SCREEN_SRC}
        title="Mac OS portfolio preview"
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}

function useMacScreenTexture() {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = LEGACY_SCREEN_WIDTH;
    canvas.height = LEGACY_SCREEN_HEIGHT;
    const ctx = canvas.getContext("2d");

    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "#2f9f9d";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#f7f7f7";
    ctx.fillRect(0, 0, canvas.width, 18);
    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 18, canvas.width, 2);
    drawSystemBadge(ctx, 10, 4);
    drawMenuText(ctx, "File", 40, 13, true);
    drawMenuText(ctx, "Edit", 80, 13, true);
    drawMenuText(ctx, "View", 122, 13, false);
    drawMenuText(ctx, "Label", 168, 13, false);
    drawMenuText(ctx, "Special", 222, 13, true);
    drawMenuText(ctx, "10:39 PM", 846, 13, true);

    [
      { kind: "folder", label: "Apps", x: 58, y: 86 },
      { kind: "hazard", label: "Do Not Open", x: 154, y: 86 },
      { kind: "striped", label: "Projects", x: 58, y: 164 },
      { kind: "doc", label: "About Me", x: 58, y: 242 },
      { kind: "contact", label: "Contact", x: 58, y: 320 },
      { kind: "readme", label: "README.md", x: 58, y: 398 },
      { kind: "disk", label: "Untitled", x: 848, y: 74 },
      { kind: "trash", label: "Trash", x: 858, y: 620 }
    ].forEach((icon) => drawDesktopPreviewIcon(ctx, icon));

    drawControlStrip(ctx);

    const nextTexture = new THREE.CanvasTexture(canvas);
    nextTexture.colorSpace = THREE.SRGBColorSpace;
    nextTexture.minFilter = THREE.LinearFilter;
    nextTexture.magFilter = THREE.NearestFilter;
    nextTexture.generateMipmaps = false;
    nextTexture.needsUpdate = true;
    return nextTexture;
  }, []);

  useEffect(() => () => texture.dispose(), [texture]);

  return texture;
}

function drawMenuText(ctx, text, x, y, bold = false) {
  ctx.fillStyle = bold ? "#050505" : "#737373";
  ctx.font = `${bold ? 700 : 600} 13px Monaco, Menlo, monospace`;
  ctx.fillText(text, x, y);
}

function drawSystemBadge(ctx, x, y) {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x, y, 12, 12);
  ctx.strokeStyle = "#777";
  ctx.strokeRect(x, y, 12, 12);
  [["#ff5a5f", 2, 2], ["#ffde59", 7, 2], ["#67e08a", 2, 7], ["#7bc7ff", 7, 7]].forEach(([color, dx, dy]) => {
    ctx.fillStyle = color;
    ctx.fillRect(x + dx, y + dy, 4, 4);
  });
}

function drawDesktopPreviewIcon(ctx, { kind, label, x, y }) {
  const iconX = x + 12;
  const iconY = y;

  ctx.save();
  ctx.translate(iconX, iconY);
  ctx.fillStyle = "rgba(0,0,0,0.42)";
  ctx.fillRect(4, 4, 38, 30);

  if (kind === "folder" || kind === "striped") {
    ctx.fillStyle = "#93b9ff";
    ctx.fillRect(0, 8, 40, 28);
    ctx.fillRect(0, 4, 18, 8);
    ctx.strokeStyle = "#050505";
    ctx.strokeRect(0, 8, 40, 28);
    ctx.strokeRect(0, 4, 18, 8);
    if (kind === "striped") {
      ctx.fillStyle = "#ffec59";
      for (let stripe = -20; stripe < 48; stripe += 13) {
        ctx.fillRect(stripe, 9, 7, 36);
      }
    }
  } else if (kind === "hazard") {
    ctx.fillStyle = "#ffec59";
    ctx.fillRect(0, 0, 40, 32);
    ctx.strokeStyle = "#050505";
    ctx.strokeRect(0, 0, 40, 32);
    ctx.fillStyle = "#050505";
    for (let stripe = -18; stripe < 54; stripe += 14) {
      ctx.save();
      ctx.translate(stripe, 0);
      ctx.rotate(-Math.PI / 4);
      ctx.fillRect(0, 0, 8, 62);
      ctx.restore();
    }
    ctx.fillStyle = "#ff5a87";
    ctx.fillRect(25, 19, 10, 10);
  } else if (kind === "disk") {
    ctx.fillStyle = "#d5d5d5";
    ctx.fillRect(0, 4, 40, 27);
    ctx.strokeStyle = "#050505";
    ctx.strokeRect(0, 4, 40, 27);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(23, 16, 12, 9);
    ctx.strokeRect(23, 16, 12, 9);
  } else if (kind === "trash") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(4, 4, 28, 42);
    ctx.strokeStyle = "#050505";
    ctx.strokeRect(4, 4, 28, 42);
    ctx.fillRect(9, 0, 18, 5);
    ctx.fillStyle = "#bfbfbf";
    for (let line = 9; line < 30; line += 7) ctx.fillRect(line, 8, 2, 36);
  } else {
    ctx.fillStyle = "#f8f8f8";
    ctx.fillRect(6, 0, 28, 40);
    ctx.strokeStyle = "#050505";
    ctx.strokeRect(6, 0, 28, 40);
    ctx.fillStyle = "#050505";
    if (kind === "contact") {
      ctx.fillStyle = "#ffde59";
      ctx.beginPath();
      ctx.arc(20, 12, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#87dfff";
      ctx.fillRect(11, 21, 18, 9);
      ctx.strokeRect(11, 21, 18, 9);
    } else {
      ctx.fillRect(13, 13, 16, 3);
      ctx.fillRect(13, 24, 16, 3);
      if (kind === "readme") ctx.fillText("#", 14, 19);
    }
  }

  ctx.restore();
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x + 2, y + 44, Math.max(40, label.length * 8), 18);
  ctx.fillStyle = "#050505";
  ctx.font = "700 13px Monaco, Menlo, monospace";
  ctx.fillText(label, x + 6, y + 58);
}

function drawControlStrip(ctx) {
  let x = 0;
  const y = LEGACY_SCREEN_HEIGHT - 18;

  for (let index = 0; index < 11; index += 1) {
    ctx.fillStyle = "#d8d8d8";
    ctx.fillRect(x, y, 23, 18);
    ctx.strokeStyle = "#050505";
    ctx.strokeRect(x, y, 23, 18);
    ctx.fillStyle = index % 3 === 0 ? "#8fdfff" : index % 3 === 1 ? "#93b9ff" : "#050505";
    ctx.fillRect(x + 6, y + 5, 11, 8);
    x += 26;
  }
}

function FloppyDisk({ disk, index, active, onSelect }) {
  const ref = useRef();
  const [hovered, setHovered] = useState(false);
  const target = useMemo(() => new THREE.Vector3(), []);
  const resting = useMemo(() => {
    const spots = [
      [0, 0.665, 0.12],
      [0.42, 0.665, 0.12],
      [0.84, 0.665, 0.12]
    ];
    return new THREE.Vector3(...spots[index]);
  }, [index]);
  const inserted = useMemo(() => new THREE.Vector3(-0.37, 0.98, -0.32), []);
  useCursor(hovered);

  useFrame((_, delta) => {
    if (!ref.current) return;
    target.copy(active ? inserted : resting);
    ref.current.position.lerp(target, 1 - Math.exp(-delta * 7.5));
    ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, active ? -0.08 : 0, 0.08);
    ref.current.rotation.z = THREE.MathUtils.lerp(ref.current.rotation.z, active ? 0 : -0.05 + index * 0.025, 0.08);
  });

  return (
    <group
      ref={ref}
      rotation={[0, 0, -0.05 + index * 0.025]}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.38, 0.035, 0.34]} />
        <meshStandardMaterial color={disk.color} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.023, -0.08]}>
        <boxGeometry args={[0.25, 0.012, 0.115]} />
        <meshStandardMaterial color="#f8f1d9" roughness={0.6} />
      </mesh>
      <mesh position={[0.095, 0.026, 0.08]}>
        <boxGeometry args={[0.08, 0.014, 0.105]} />
        <meshStandardMaterial color={disk.accent} roughness={0.45} />
      </mesh>
      <mesh position={[-0.06, 0.045, -0.08]}>
        <boxGeometry args={[0.13, 0.008, 0.018]} />
        <meshStandardMaterial color="#171717" roughness={0.5} />
      </mesh>
      <mesh position={[-0.06, 0.046, -0.04]}>
        <boxGeometry args={[0.18, 0.008, 0.014]} />
        <meshStandardMaterial color="#171717" roughness={0.5} />
      </mesh>
    </group>
  );
}

function BlueprintStack({ onFocus }) {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  return (
    <group
      position={[-2.42, 0.68, 0.1]}
      rotation={[0, -0.1, 0.025]}
      onClick={onFocus}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <mesh position={[0.05, -0.018, -0.035]} receiveShadow castShadow>
        <boxGeometry args={[1.64, 0.025, 1.02]} />
        <meshStandardMaterial color="#d8d0bc" roughness={0.7} />
      </mesh>
      <mesh receiveShadow castShadow>
        <boxGeometry args={[1.56, 0.025, 0.96]} />
        <meshStandardMaterial color="#0d5a91" roughness={0.58} />
      </mesh>

      {[-0.36, -0.18, 0, 0.18, 0.36].map((z) => (
        <BlueprintLine key={`grid-x-${z}`} position={[0, 0.03, z]} size={[1.36, 0.011, 0.004]} subtle />
      ))}
      {[-0.54, -0.27, 0, 0.27, 0.54].map((x) => (
        <BlueprintLine key={`grid-z-${x}`} position={[x, 0.031, 0]} size={[0.004, 0.011, 0.74]} subtle />
      ))}

      <BlueprintLine position={[0, 0.034, -0.43]} size={[1.36, 0.014, 0.008]} />
      <BlueprintLine position={[0, 0.034, 0.43]} size={[1.36, 0.014, 0.008]} />
      <BlueprintLine position={[-0.68, 0.034, 0]} size={[0.008, 0.014, 0.86]} />
      <BlueprintLine position={[0.68, 0.034, 0]} size={[0.008, 0.014, 0.86]} />

      <group position={[-0.28, 0.038, 0.08]}>
        <BlueprintLine position={[0, 0, 0]} size={[0.36, 0.018, 0.18]} bright />
        <BlueprintLine position={[0, 0.002, 0]} size={[0.92, 0.016, 0.014]} rotation={[0, 0.58, 0]} />
        <BlueprintLine position={[0, 0.003, 0]} size={[0.92, 0.016, 0.014]} rotation={[0, -0.58, 0]} />
        {[
          [-0.42, -0.26],
          [0.42, -0.26],
          [-0.42, 0.26],
          [0.42, 0.26]
        ].map(([x, z]) => (
          <BlueprintCircle key={`${x}-${z}`} position={[x, 0.004, z]} radius={0.085} />
        ))}
        <BlueprintLine position={[0, 0.004, -0.41]} size={[0.86, 0.012, 0.006]} bright />
        <BlueprintLine position={[-0.43, 0.006, -0.38]} size={[0.006, 0.012, 0.06]} bright />
        <BlueprintLine position={[0.43, 0.006, -0.38]} size={[0.006, 0.012, 0.06]} bright />
        <BlueprintLine position={[0.55, 0.005, 0]} size={[0.006, 0.012, 0.54]} bright />
        <BlueprintLine position={[0.52, 0.006, -0.27]} size={[0.06, 0.012, 0.006]} bright />
        <BlueprintLine position={[0.52, 0.006, 0.27]} size={[0.06, 0.012, 0.006]} bright />
      </group>

      <group position={[0.45, 0.039, -0.05]}>
        <BlueprintLine position={[0, 0, 0.18]} size={[0.38, 0.016, 0.035]} bright />
        <BlueprintLine position={[-0.08, 0.002, 0.12]} size={[0.18, 0.016, 0.018]} />
        <BlueprintLine position={[0.19, 0.003, 0.18]} size={[0.22, 0.014, 0.01]} rotation={[0, -0.24, 0]} />
        <BlueprintCircle position={[0.33, 0.004, 0.15]} radius={0.045} />
        <BlueprintLine position={[-0.26, 0.006, 0.34]} size={[0.36, 0.012, 0.006]} />
        <BlueprintLine position={[-0.44, 0.006, 0.3]} size={[0.006, 0.012, 0.08]} />
        <BlueprintLine position={[-0.08, 0.006, 0.3]} size={[0.006, 0.012, 0.08]} />
      </group>

      <group position={[0.43, 0.04, 0.31]}>
        <BlueprintLine position={[0, 0, 0]} size={[0.46, 0.013, 0.006]} />
        <BlueprintLine position={[0, 0, 0.07]} size={[0.46, 0.013, 0.006]} />
        <BlueprintLine position={[0.12, 0, -0.07]} size={[0.22, 0.013, 0.006]} />
        <BlueprintLine position={[-0.24, 0, 0.035]} size={[0.006, 0.013, 0.14]} />
        <BlueprintLine position={[0.24, 0, 0.035]} size={[0.006, 0.013, 0.14]} />
        <BlueprintLine position={[0.02, 0, 0.12]} size={[0.44, 0.013, 0.006]} />
      </group>
    </group>
  );
}

function BlueprintLine({ position, size, rotation = [0, 0, 0], subtle = false, bright = false }) {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={bright ? "#f3fbff" : "#bdeeff"}
        opacity={subtle ? 0.44 : 0.9}
        transparent
        roughness={0.42}
      />
    </mesh>
  );
}

function BlueprintCircle({ position, radius }) {
  return (
    <mesh position={position} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[radius, 0.006, 8, 32]} />
      <meshStandardMaterial color="#f3fbff" roughness={0.35} />
    </mesh>
  );
}

function PhysicalProjects({ onFocus }) {
  return (
    <group>
      <ExplodedAssembly position={[-3.1, 0.82, -0.95]} onFocus={onFocus} />
      <Calipers position={[-0.7, 0.68, 1.22]} />
      <FixturePrototype position={[0.92, 0.76, 1.02]} onFocus={onFocus} />
      <GearboxPlaceholder position={[2.38, 0.77, 0.62]} onFocus={onFocus} />
      <JuiceMachinePlaceholder position={[3.32, 0.78, -1.36]} onFocus={onFocus} />
      <LinearActuatorPlaceholder position={[1.78, 0.72, -1.2]} onFocus={onFocus} />
    </group>
  );
}

function MobilePhoneShowcase({ onFocus }) {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  return (
    <group
      position={[3.05, 0.675, 1.02]}
      rotation={[0, -0.25, 0]}
      onClick={onFocus}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <mesh position={[0.03, -0.008, -0.025]} receiveShadow>
        <boxGeometry args={[0.72, 0.018, 1.08]} />
        <meshStandardMaterial color="#171b1d" roughness={0.7} transparent opacity={0.26} />
      </mesh>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.64, 0.052, 1.02]} />
        <meshStandardMaterial color="#16191d" roughness={0.34} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.031, 0]} castShadow>
        <boxGeometry args={[0.56, 0.012, 0.9]} />
        <meshStandardMaterial
          color="#12283a"
          roughness={0.22}
          metalness={0.08}
          emissive="#1a5f7d"
          emissiveIntensity={0.42}
        />
      </mesh>
      <mesh position={[0, 0.041, 0.4]}>
        <boxGeometry args={[0.18, 0.006, 0.018]} />
        <meshStandardMaterial color="#d8f4ff" roughness={0.36} emissive="#7bc7ff" emissiveIntensity={0.25} />
      </mesh>
      <mesh position={[0.2, 0.04, 0.4]}>
        <cylinderGeometry args={[0.018, 0.018, 0.008, 16]} />
        <meshStandardMaterial color="#0a0d10" roughness={0.2} />
      </mesh>

      <mesh position={[-0.13, 0.042, 0.29]}>
        <boxGeometry args={[0.2, 0.007, 0.025]} />
        <meshStandardMaterial color="#f4fbff" roughness={0.35} emissive="#d8f4ff" emissiveIntensity={0.18} />
      </mesh>
      <mesh position={[0.12, 0.042, 0.29]}>
        <boxGeometry args={[0.12, 0.007, 0.018]} />
        <meshStandardMaterial color="#67e08a" roughness={0.35} emissive="#67e08a" emissiveIntensity={0.28} />
      </mesh>

      {mobileApps.map((app, index) => (
        <PhoneAppTile key={app.name} app={app} index={index} />
      ))}
    </group>
  );
}

function PhoneAppTile({ app, index }) {
  const z = 0.14 - index * 0.23;
  const y = 0.044 + index * 0.001;

  return (
    <group position={[0, y, z]}>
      <mesh>
        <boxGeometry args={[0.46, 0.008, 0.16]} />
        <meshStandardMaterial color="#e8f7ff" roughness={0.42} emissive="#8bdfff" emissiveIntensity={0.06} />
      </mesh>
      <mesh position={[-0.17, 0.006, 0]}>
        <boxGeometry args={[0.09, 0.008, 0.09]} />
        <meshStandardMaterial color={app.color} roughness={0.3} emissive={app.color} emissiveIntensity={0.34} />
      </mesh>
      <mesh position={[0.05, 0.007, 0.026]}>
        <boxGeometry args={[0.22, 0.008, 0.018]} />
        <meshStandardMaterial color="#14202a" roughness={0.38} />
      </mesh>
      <mesh position={[0.01, 0.007, -0.026]}>
        <boxGeometry args={[0.15, 0.008, 0.014]} />
        <meshStandardMaterial color="#49606b" roughness={0.38} />
      </mesh>
    </group>
  );
}

function DroneAssembly({ progressRef }) {
  const ref = useRef();
  const targetPosition = useMemo(() => new THREE.Vector3(), []);
  const targetScale = useMemo(() => new THREE.Vector3(), []);
  const landedPosition = [-3.02, 0.83, 1.37];
  const voidPosition = [-2.8, 1.0, 1.24];

  const getAssemblyProgress = () => smoothRange(progressRef.current, 0.01, 0.23);
  const getLandingProgress = () => smoothRange(progressRef.current, 0.28, 0.45);
  const getDroneOpacity = () => 1 - smoothRange(progressRef.current, 0.96, 1);

  useFadedMaterials(ref, getDroneOpacity);

  useFrame((_, delta) => {
    if (!ref.current) return;

    const ease = 1 - Math.exp(-delta * 14);
    const landingProgress = getLandingProgress();
    const landing = clamp(landingProgress);
    const lateralTravel = smoothRange(landing, 0.1, 0.72);
    const verticalTravel = smoother(landing);
    const groupPosition = [
      mix(voidPosition[0], landedPosition[0], lateralTravel),
      mix(voidPosition[1], landedPosition[1], verticalTravel),
      mix(voidPosition[2], landedPosition[2], lateralTravel)
    ];
    groupPosition[1] += Math.sin(landing * Math.PI) * 0.045;
    const scale = mix(1.02, 0.78, landingProgress);
    const rotationY = mix(-0.22, -0.58, landingProgress);

    targetPosition.set(groupPosition[0], groupPosition[1], groupPosition[2]);
    targetScale.set(scale, scale, scale);

    ref.current.position.lerp(targetPosition, ease);
    ref.current.scale.lerp(targetScale, ease);
    ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, 0.04, ease);
    ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, rotationY, ease);
    ref.current.rotation.z = THREE.MathUtils.lerp(ref.current.rotation.z, 0.02, ease);
  });

  const rotors = [
    { final: [-0.42, 0.02, -0.3], start: [-1.05, 0.58, -0.82], startAt: 0.08, endAt: 0.78 },
    { final: [0.42, 0.02, -0.3], start: [1.02, 0.52, -0.74], startAt: 0.14, endAt: 0.82 },
    { final: [-0.42, 0.02, 0.3], start: [-0.96, 0.66, 0.78], startAt: 0.2, endAt: 0.88 },
    { final: [0.42, 0.02, 0.3], start: [1.0, 0.62, 0.84], startAt: 0.26, endAt: 0.94 }
  ];

  return (
    <group ref={ref} position={voidPosition} rotation={[0.04, -0.22, 0.02]} scale={1.02}>
      <AnimatedPart
        start={[0, 0.88, 0]}
        end={[0, 0, 0]}
        progressSource={() => smoothRange(getAssemblyProgress(), 0, 0.68)}
        rotationStart={[0.4, -0.7, 0.25]}
        rotationEnd={[0, 0, 0]}
      >
        <mesh castShadow>
          <boxGeometry args={[0.34, 0.08, 0.22]} />
          <meshStandardMaterial color="#242628" roughness={0.38} metalness={0.3} />
        </mesh>
        <mesh position={[0, 0.06, 0.02]} castShadow>
          <boxGeometry args={[0.2, 0.025, 0.28]} />
          <meshStandardMaterial color="#7bc7ff" roughness={0.4} metalness={0.25} />
        </mesh>
      </AnimatedPart>

      <AnimatedPart
        start={[-0.75, 0.55, -0.35]}
        end={[0, 0, 0]}
        progressSource={() => smoothRange(getAssemblyProgress(), 0.08, 0.78)}
        rotationStart={[0.25, 0.85, -0.35]}
        rotationEnd={[0, Math.PI / 4, 0]}
      >
        <mesh castShadow>
          <boxGeometry args={[1.1, 0.035, 0.035]} />
          <meshStandardMaterial color="#303337" roughness={0.35} metalness={0.45} />
        </mesh>
      </AnimatedPart>

      <AnimatedPart
        start={[0.78, 0.48, -0.3]}
        end={[0, 0, 0]}
        progressSource={() => smoothRange(getAssemblyProgress(), 0.14, 0.84)}
        rotationStart={[-0.2, -0.9, 0.25]}
        rotationEnd={[0, -Math.PI / 4, 0]}
      >
        <mesh castShadow>
          <boxGeometry args={[1.1, 0.035, 0.035]} />
          <meshStandardMaterial color="#303337" roughness={0.35} metalness={0.45} />
        </mesh>
      </AnimatedPart>

      {rotors.map((rotor, index) => {
        return (
          <AnimatedPart
            key={`${rotor.final[0]}-${rotor.final[2]}`}
            start={rotor.start}
            end={rotor.final}
            progressSource={() => smoothRange(getAssemblyProgress(), rotor.startAt, rotor.endAt)}
            rotationStart={[0.25, index * 0.6, -0.2]}
            rotationEnd={[0, 0, 0]}
          >
            <Rotor
              index={index}
              spinSource={() => {
                const rotorProgress = smoothRange(getAssemblyProgress(), rotor.startAt, rotor.endAt);
                return getAssemblyProgress() > 0.92 ? 0.16 : 1 - rotorProgress;
              }}
            />
          </AnimatedPart>
        );
      })}
    </group>
  );
}

function AnimatedPart({ start, end, progressSource, rotationStart, rotationEnd, children }) {
  const ref = useRef();
  const visualProgress = useRef(0);
  const targetPosition = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    if (!ref.current) return;

    const progress = typeof progressSource === "function" ? progressSource() : 0;
    visualProgress.current = THREE.MathUtils.damp(visualProgress.current, clamp(progress), 18, delta);
    const t = visualProgress.current;
    const position = mixArray(start, end, t);
    const rotation = mixArray(rotationStart, rotationEnd, t);

    targetPosition.set(position[0], position[1], position[2]);
    ref.current.position.copy(targetPosition);
    ref.current.rotation.set(rotation[0], rotation[1], rotation[2]);
  });

  return <group ref={ref}>{children}</group>;
}

function Rotor({ index, spinSource = () => 1 }) {
  const ref = useRef();

  useFrame((_, delta) => {
    if (!ref.current) return;
    const spin = spinSource();
    ref.current.rotation.y += delta * (4 + spin * 16 + index * 0.3);
  });

  return (
    <group>
      <mesh castShadow>
        <cylinderGeometry args={[0.13, 0.13, 0.025, 24]} />
        <meshStandardMaterial color="#151718" roughness={0.42} />
      </mesh>
      <mesh position={[0, 0.03, 0]}>
        <torusGeometry args={[0.16, 0.012, 8, 32]} />
        <meshStandardMaterial color="#60d4ff" roughness={0.34} metalness={0.2} />
      </mesh>
      <group ref={ref} position={[0, 0.055, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.36, 0.012, 0.045]} />
          <meshStandardMaterial color="#e6ecec" roughness={0.32} metalness={0.25} />
        </mesh>
        <mesh rotation={[0, Math.PI / 2, 0]} castShadow>
          <boxGeometry args={[0.36, 0.012, 0.045]} />
          <meshStandardMaterial color="#e6ecec" roughness={0.32} metalness={0.25} />
        </mesh>
      </group>
    </group>
  );
}

function useFadedMaterials(ref, opacitySource) {
  const lastAppliedOpacity = useRef(-1);

  useFrame(() => {
    if (!ref.current) return;
    const opacity = typeof opacitySource === "function" ? opacitySource() : opacitySource;
    ref.current.visible = opacity > 0.015;

    if (Math.abs(opacity - lastAppliedOpacity.current) < 0.003) return;
    lastAppliedOpacity.current = opacity;

    ref.current.traverse((child) => {
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => {
        if (!material) return;
        if (material.userData.fadeBaseOpacity === undefined) {
          material.userData.fadeBaseOpacity = material.opacity ?? 1;
        }

        const nextOpacity = material.userData.fadeBaseOpacity * opacity;
        material.opacity = nextOpacity;
        material.transparent = nextOpacity < 0.995 || material.userData.fadeBaseOpacity < 0.995;
      });
    });
  });
}

function JuiceMachinePlaceholder({ position, onFocus }) {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  return (
    <group
      position={position}
      rotation={[0, 0.38, 0]}
      onClick={onFocus}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.54, 0.5, 0.46]} />
        <meshStandardMaterial color="#d8d2c0" roughness={0.52} metalness={0.08} />
      </mesh>
      <mesh position={[0, 0.34, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.22, 0.34, 32]} />
        <meshStandardMaterial color="#ffb84f" roughness={0.2} transparent opacity={0.74} />
      </mesh>
      <mesh position={[0.25, 0.04, 0.02]} castShadow>
        <boxGeometry args={[0.08, 0.24, 0.26]} />
        <meshStandardMaterial color="#252525" roughness={0.3} />
      </mesh>
      <mesh position={[-0.13, -0.1, 0.25]}>
        <boxGeometry args={[0.2, 0.08, 0.06]} />
        <meshStandardMaterial color="#67d7f0" roughness={0.36} />
      </mesh>
    </group>
  );
}

function ExplodedAssembly({ position, onFocus }) {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  return (
    <group
      position={position}
      rotation={[0, 0.24, 0]}
      onClick={onFocus}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <mesh position={[0, 0.08, 0]} castShadow>
        <boxGeometry args={[0.32, 0.32, 0.32]} />
        <meshStandardMaterial color="#94b8ff" roughness={0.4} metalness={0.15} />
      </mesh>
      <mesh position={[0, 0.52, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.2, 32]} />
        <meshStandardMaterial color="#f4d067" roughness={0.34} metalness={0.25} />
      </mesh>
      <mesh position={[0.42, 0.28, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.42, 24]} />
        <meshStandardMaterial color="#ef6f71" roughness={0.38} metalness={0.18} />
      </mesh>
      <mesh position={[-0.42, 0.28, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.42, 24]} />
        <meshStandardMaterial color="#70d596" roughness={0.38} metalness={0.18} />
      </mesh>
      {[0.21, 0.41].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <boxGeometry args={[0.02, 0.02, 0.88]} />
          <meshStandardMaterial color="#d5f4ff" roughness={0.55} />
        </mesh>
      ))}
    </group>
  );
}

function Calipers({ position }) {
  return (
    <group position={position} rotation={[0, 0.72, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.82, 0.025, 0.055]} />
        <meshStandardMaterial color="#bfc6c6" roughness={0.28} metalness={0.7} />
      </mesh>
      <mesh position={[-0.34, 0.03, 0]} castShadow>
        <boxGeometry args={[0.06, 0.17, 0.045]} />
        <meshStandardMaterial color="#dfe5e5" roughness={0.25} metalness={0.72} />
      </mesh>
      <mesh position={[0.16, 0.03, 0]} castShadow>
        <boxGeometry args={[0.06, 0.15, 0.045]} />
        <meshStandardMaterial color="#dfe5e5" roughness={0.25} metalness={0.72} />
      </mesh>
      <mesh position={[0.36, 0.045, 0]}>
        <boxGeometry args={[0.2, 0.075, 0.065]} />
        <meshStandardMaterial color="#2a3030" roughness={0.4} metalness={0.2} />
      </mesh>
    </group>
  );
}

function FixturePrototype({ position, onFocus }) {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  return (
    <group
      position={position}
      rotation={[0, -0.42, 0]}
      onClick={onFocus}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <mesh position={[0, -0.045, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.78, 0.05, 0.5]} />
        <meshStandardMaterial color="#22292b" roughness={0.38} metalness={0.28} />
      </mesh>
      {[-0.24, 0.24].map((x) => (
        <mesh key={`rail-${x}`} position={[x, 0.035, 0]} castShadow>
          <boxGeometry args={[0.055, 0.08, 0.56]} />
          <meshStandardMaterial color="#c9d2d2" roughness={0.26} metalness={0.62} />
        </mesh>
      ))}
      <mesh position={[0, 0.16, -0.05]} castShadow>
        <boxGeometry args={[0.34, 0.28, 0.12]} />
        <meshStandardMaterial color="#7bc7ff" roughness={0.42} metalness={0.16} />
      </mesh>
      <mesh position={[0, 0.36, -0.05]} castShadow>
        <cylinderGeometry args={[0.14, 0.14, 0.16, 28]} />
        <meshStandardMaterial color="#ffde59" roughness={0.38} metalness={0.22} />
      </mesh>
      <mesh position={[0.28, 0.16, 0.13]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.035, 0.035, 0.32, 20]} />
        <meshStandardMaterial color="#ef6f71" roughness={0.36} metalness={0.25} />
      </mesh>
    </group>
  );
}

function GearboxPlaceholder({ position, onFocus }) {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  const teeth = useMemo(() => {
    const items = [];
    for (let index = 0; index < 12; index += 1) {
      const angle = (index / 12) * Math.PI * 2;
      items.push(angle);
    }
    return items;
  }, []);

  return (
    <group
      position={position}
      rotation={[0, 0.32, 0]}
      onClick={onFocus}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <mesh position={[0, -0.04, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.74, 0.055, 0.46]} />
        <meshStandardMaterial color="#d8d2c0" roughness={0.52} metalness={0.08} />
      </mesh>
      {[
        [-0.18, 0.12, 0.02, 0.16, "#70d596"],
        [0.18, 0.15, -0.04, 0.19, "#94b8ff"]
      ].map(([x, y, z, radius, color]) => (
        <group key={`${x}-${z}`} position={[x, y, z]}>
          <mesh castShadow>
            <cylinderGeometry args={[radius, radius, 0.08, 32]} />
            <meshStandardMaterial color={color} roughness={0.34} metalness={0.32} />
          </mesh>
          {teeth.map((angle) => (
            <mesh
              key={angle}
              position={[Math.cos(angle) * radius, 0.048, Math.sin(angle) * radius]}
              rotation={[0, angle, 0]}
              castShadow
            >
              <boxGeometry args={[0.035, 0.026, 0.018]} />
              <meshStandardMaterial color="#eaf0ec" roughness={0.3} metalness={0.4} />
            </mesh>
          ))}
        </group>
      ))}
      <mesh position={[0, 0.13, 0.2]} castShadow>
        <boxGeometry args={[0.55, 0.12, 0.08]} />
        <meshStandardMaterial color="#242628" roughness={0.42} metalness={0.3} />
      </mesh>
    </group>
  );
}

function LinearActuatorPlaceholder({ position, onFocus }) {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  return (
    <group
      position={position}
      rotation={[0, -0.18, -0.04]}
      onClick={onFocus}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <mesh position={[-0.18, 0.04, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.09, 0.09, 0.56, 28]} />
        <meshStandardMaterial color="#252a2c" roughness={0.36} metalness={0.35} />
      </mesh>
      <mesh position={[0.18, 0.04, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.045, 0.045, 0.58, 24]} />
        <meshStandardMaterial color="#dfe5e5" roughness={0.22} metalness={0.8} />
      </mesh>
      {[-0.49, 0.5].map((x) => (
        <mesh key={x} position={[x, 0.04, 0]} castShadow>
          <boxGeometry args={[0.12, 0.13, 0.22]} />
          <meshStandardMaterial color="#ffb84f" roughness={0.34} metalness={0.18} />
        </mesh>
      ))}
      <mesh position={[0, -0.055, 0.12]} castShadow receiveShadow>
        <boxGeometry args={[1.08, 0.035, 0.08]} />
        <meshStandardMaterial color="#bfc6c6" roughness={0.28} metalness={0.62} />
      </mesh>
    </group>
  );
}

function CinematicHud({ onSkip }) {
  return (
    <>
      <button className="skip-cinematic" type="button" onClick={onSkip}>
        skip this bullshit and load normal portfolio
      </button>

      <div className="scroll-hairline" aria-hidden="true">
        <span />
      </div>
    </>
  );
}

function LegacyOSOverlay({
  progress,
  active,
  visible,
  locked,
  onLoadCinematic,
  onLoadNormal,
  onLoadFreePlay
}) {
  const { width, height } = useViewportSize();
  const [loaded, setLoaded] = useState(false);
  const screenFitScale = Math.max(1, width / LEGACY_SCREEN_WIDTH, height / LEGACY_SCREEN_HEIGHT);
  const overlaySrc = `${LEGACY_SCREEN_SRC}&scale=${screenFitScale.toFixed(4)}`;

  useEffect(() => {
    setLoaded(false);
  }, [overlaySrc]);

  return (
    <section
      className={`legacy-os-overlay ${visible ?? active ? "is-visible" : ""} ${loaded ? "is-loaded" : ""} ${locked ? "is-locked" : "is-cinematic"}`}
      style={{
        opacity: progress
      }}
      aria-hidden={!(visible ?? active)}
    >
      <div className="legacy-os-shell">
        <iframe
          key={overlaySrc}
          className={`legacy-os-frame ${loaded ? "is-loaded" : ""}`}
          src={overlaySrc}
          title="Interactive Mac OS portfolio desktop"
          onLoad={() => setLoaded(true)}
        />
      </div>
      <nav className="legacy-action-bar" aria-label="Portfolio actions">
        <a href="/Maksym-CV.pdf" download>
          Download CV
        </a>
        <button type="button" onClick={onLoadNormal}>
          Normal portfolio
        </button>
        <button type="button" onClick={onLoadFreePlay}>
          Back to workbench
        </button>
        <button type="button" onClick={onLoadCinematic}>
          Replay intro
        </button>
      </nav>
    </section>
  );
}

function TerminalDesktop({ onLoadCinematic, onLoadNormal, onLoadFreePlay }) {
  return (
    <main className="terminal-app">
      <LegacyOSOverlay
        progress={1}
        active
        locked
        onLoadCinematic={onLoadCinematic}
        onLoadNormal={onLoadNormal}
        onLoadFreePlay={onLoadFreePlay}
      />
    </main>
  );
}

function FreePlayWorkbench({ activeDisk, insertedDiskId, onSelectDisk, onLoadCinematic, onLoadNormal }) {
  const freePlayProgressRef = useRef(0.55);

  return (
    <main className="freeplay-app">
      <Canvas
        className="workbench-canvas"
        camera={{ position: freePlayCamera.position, fov: freePlayCamera.fov, near: 0.08, far: 80 }}
        dpr={[1, 1.25]}
        shadows
      >
        <color attach="background" args={["#0c0f10"]} />
        <fog attach="fog" args={["#0c0f10", 6.2, 11]} />
        <Suspense fallback={<SceneFallback />}>
          <WorkbenchScene
            activeDisk={activeDisk}
            insertedDiskId={insertedDiskId}
            progressRef={freePlayProgressRef}
            screenLive
            onSelectDisk={onSelectDisk}
            onOpenComputer={() => {}}
            onOpenProjects={() => {}}
          />
        </Suspense>
        <OrbitControls
          makeDefault
          enableDamping
          minDistance={1.25}
          maxDistance={8.4}
          maxPolarAngle={Math.PI / 2.02}
          target={[0, 0.85, -0.12]}
        />
        <ShadowMapController progressRef={freePlayProgressRef} freezeAfter={0.01} />
      </Canvas>
      <nav className="freeplay-toolbar" aria-label="Workbench modes">
        <button type="button" onClick={onLoadCinematic}>
          Replay intro
        </button>
        <button type="button" onClick={onLoadNormal}>
          Normal portfolio
        </button>
      </nav>
      <aside className="bench-status">
        <span className="status-light" style={{ "--disk-color": activeDisk.color }} />
        <div>
          <strong>{activeDisk.label} Disk</strong>
          <span>{activeDisk.status}</span>
        </div>
      </aside>
    </main>
  );
}

function NormalPortfolio({ standalone = false, onLoadCinematic }) {
  const Shell = standalone ? "main" : "section";

  return (
    <Shell className={`normal-portfolio ${standalone ? "normal-portfolio--standalone" : ""}`}>
      <header className="normal-topbar">
        <div className="topbar-title">
          <span className="topbar-mark" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <div>
            <strong>Maksym</strong>
            <span>Mechanical Engineering Portfolio</span>
          </div>
        </div>
        {onLoadCinematic && (
          <button className="load-cinematic" type="button" onClick={onLoadCinematic}>
            Load 3D intro
          </button>
        )}
      </header>

      <section className="payload-hero" aria-label="Portfolio actions">
        <div>
          <span className="payload-label">CV packet</span>
          <h1>Mechanical engineer building real hardware with clean digital systems.</h1>
          <p>
            CAD assemblies, prototypes, test rigs, embedded-adjacent tooling, and software side projects in one place.
          </p>
        </div>
        <a className="download-cv" href="/Maksym-CV.pdf" download>
          Download CV
        </a>
      </section>

      <section className="payload-grid" aria-label="Portfolio payload">
        <section className="contact-block" id="contact">
          <span className="payload-label">Contact</span>
          <h2>Open channels</h2>
          <a href="mailto:hello@maksym.dev">hello@maksym.dev</a>
          <a href="https://github.com/" target="_blank" rel="noreferrer">GitHub</a>
          <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer">LinkedIn</a>
        </section>

        <section className="artifact-block">
          <span className="payload-label">Physical workbench</span>
          <h2>Hardware artifacts</h2>
          <ul>
            <li>FPV drone assemblies and exploded CAD drawings</li>
            <li>Juice maker mechanism concept and enclosure studies</li>
            <li>Fixtures, caliper checks, quick prototypes, and design notes</li>
          </ul>
        </section>

        <section className="software-folder" aria-label="Software side quests">
          <span className="folder-tab" aria-hidden="true" />
          <span className="payload-label">Software side-quests</span>
          <h2>Projects folder</h2>
          <div className="software-list">
            {softwareProjects.map((project) => (
              <article key={project.name}>
                <strong>{project.name}</strong>
                <span>{project.type}</span>
                <p>{project.detail}</p>
              </article>
            ))}
          </div>
        </section>
      </section>
    </Shell>
  );
}

export default App;
