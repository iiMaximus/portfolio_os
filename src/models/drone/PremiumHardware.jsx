import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { assembly } from "./assemblyConfig";
import { Bolt, Cable, Label } from "./HardwarePrimitives";
import { ComponentDecal } from "./ComponentDecal";
import {
  createMotorGeometry,
  createPropellerGeometry,
  createStrapGeometry,
  latheRing,
  mergeParts,
} from "./manufacturedGeometry";

function Ring({
  inner,
  outer,
  height,
  material,
  position,
  rotation,
  bevel = 0.35,
}) {
  const geometry = useMemo(
    () => latheRing(inner, outer, height, 40, bevel),
    [inner, outer, height, bevel],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh
      geometry={geometry}
      material={material}
      position={position}
      rotation={rotation}
      castShadow
    />
  );
}

export function Motor({ materials: m }) {
  const g = useMemo(createMotorGeometry, []);
  useEffect(() => () => Object.values(g).forEach((v) => v.dispose()), [g]);
  return (
    <group>
      <Ring
        inner={3}
        outer={12.3}
        height={2.5}
        position={[0, 1, 0]}
        material={m.dark}
      />
      <mesh geometry={g.bell} material={m.dark} castShadow />
      <mesh geometry={g.crown} material={m.silver} castShadow />
      <mesh geometry={g.copper} material={m.copper} />
      <mesh position={[0, 7.5, 0]} material={m.rubber}>
        <cylinderGeometry args={[7, 7, 9, 24]} />
      </mesh>
      <Ring
        inner={12.7}
        outer={14.05}
        height={0.65}
        position={[0, 3.3, 0]}
        material={m.orange}
        bevel={0.15}
      />
      <Ring
        inner={11.3}
        outer={13.85}
        height={0.55}
        position={[0, 12, 0]}
        material={m.silver}
        bevel={0.12}
      />
      <mesh position={[0, 17, 0]} material={m.silver}>
        <cylinderGeometry args={[2.5, 2.5, 9, 24]} />
      </mesh>
      <Label
        text="2207"
        width={8}
        height={2.3}
        position={[0, 14.5, 8.2]}
        dark
      />
    </group>
  );
}

export function Rotor({ materials: m, spin, phase, handedness = 1 }) {
  const ref = useRef();
  const geometry = useMemo(
    () => createPropellerGeometry(handedness),
    [handedness],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame((_, delta) => {
    if (ref.current && spin)
      ref.current.rotation.y += Math.min(delta, 0.05) * 0.65 * handedness;
  });
  return (
    <group ref={ref} rotation={[0, phase, 0]}>
      <mesh geometry={geometry} material={m.propeller} castShadow />
      <Ring inner={2.6} outer={7} height={4} material={m.propeller} />
      <Ring
        inner={2.6}
        outer={4.8}
        height={0.6}
        position={[0, 2.2, 0]}
        material={m.silver}
      />
      <mesh position={[0, 3.8, 0]} material={m.dark} castShadow>
        <cylinderGeometry args={[3.3, 3.7, 2.7, 6]} />
      </mesh>
      <Ring
        inner={1.7}
        outer={2.7}
        height={0.5}
        position={[0, 5.15, 0]}
        material={m.rubber}
        bevel={0.1}
      />
      <Label
        text="5 IN"
        width={5}
        height={1.8}
        position={[0, 2.05, 4.5]}
        dark
      />
    </group>
  );
}

export function Optics({ materials: m, radius = 9, position = [0, 0, 0] }) {
  const knurl = useMemo(
    () =>
      mergeParts(
        Array.from({ length: 32 }, (_, i) =>
          new THREE.BoxGeometry(0.48, 2.1, 0.48)
            .translate(radius + 0.1, 0, 0)
            .rotateY((i * Math.PI) / 16),
        ),
      ),
    [radius],
  );
  useEffect(() => () => knurl.dispose(), [knurl]);
  return (
    <group position={position}>
      <Ring
        inner={radius * 0.73}
        outer={radius + 1.2}
        height={3.7}
        rotation={[Math.PI / 2, 0, 0]}
        material={m.dark}
      />
      <mesh
        geometry={knurl}
        rotation={[Math.PI / 2, 0, 0]}
        material={m.silver}
      />
      <Ring
        inner={radius * 0.94}
        outer={radius + 0.15}
        height={0.55}
        position={[0, 0, 2]}
        rotation={[Math.PI / 2, 0, 0]}
        material={m.silver}
        bevel={0.1}
      />
      <Ring
        inner={radius * 0.76}
        outer={radius * 0.94}
        height={0.6}
        position={[0, 0, 1.98]}
        rotation={[Math.PI / 2, 0, 0]}
        material={m.dark}
        bevel={0.08}
      />
      <mesh position={[0, 0, 1.2]} material={m.rubber}>
        <circleGeometry args={[radius * 0.8, 40]} />
      </mesh>
      <mesh position={[0, 0, 1.32]} material={m.optic}>
        <circleGeometry args={[radius * 0.65, 40]} />
      </mesh>
      <Ring
        inner={radius * 0.25}
        outer={radius * 0.43}
        height={0.15}
        position={[0, 0, 1.47]}
        rotation={[Math.PI / 2, 0, 0]}
        material={m.lens}
      />
      <mesh position={[0, 0, 1.55]} material={m.rubber}>
        <circleGeometry args={[radius * 0.29, 32]} />
      </mesh>
      <mesh position={[0, 0, 1.65]} scale={[1, 1, 0.07]} material={m.lens}>
        <sphereGeometry args={[radius * 0.72, 32, 16]} />
      </mesh>
    </group>
  );
}

function Battery({ materials: m }) {
  const b = assembly.battery;
  const strap = useMemo(
    () => createStrapGeometry(b.width + 1, b.height + 1, 11),
    [b],
  );
  useEffect(() => () => strap.dispose(), [strap]);
  return (
    <group position={[0, 54, -28]}>
      <RoundedBox
        args={[b.width, b.height, b.length]}
        radius={3.8}
        smoothness={3}
        material={m.shrink}
        castShadow
      />
      {/* Pouch folds and heat-sealed end caps remain visible beyond the sleeve. */}
      {[-1, 1].map((s) => (
        <group key={s} position={[0, 0, s * (b.length / 2 - 0.7)]}>
          <RoundedBox
            args={[b.width - 2, b.height - 2, 2.5]}
            radius={3}
            smoothness={2}
            material={m.rubber}
          />
          {[-10, -5, 0, 5, 10].map((y) => (
            <RoundedBox
              key={y}
              args={[b.width - 6, 0.8, 1.1]}
              radius={0.35}
              smoothness={1}
              position={[0, y, s * 1.4]}
              material={m.foil}
            />
          ))}
          <mesh position={[0, -b.height / 2 + 3, s * 1.1]} material={m.shrink}>
            <boxGeometry args={[b.width - 4, 3, 0.9]} />
          </mesh>
        </group>
      ))}
      <mesh position={[b.width / 2 + 0.03, -4, 0]} material={m.rubber}>
        <boxGeometry args={[0.3, 1.2, b.length - 7]} />
      </mesh>
      <ComponentDecal
        kind="battery"
        size={[29, 25]}
        position={[0, b.height / 2 + 0.06, -1]}
        rotation={[-Math.PI / 2, 0, Math.PI]}
        wireframe={m.dark.wireframe}
      />
      {[-25, 25].map((z) => (
        <group key={z} position={[0, 0, z]}>
          <mesh geometry={strap} material={m.fabric} castShadow />
          <ComponentDecal
            kind="strap"
            size={[25, 10.3]}
            position={[0, b.height / 2 + 1.65, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            wireframe={m.dark.wireframe}
          />
          <RoundedBox
            args={[2.5, 13, 14]}
            radius={1.2}
            smoothness={2}
            position={[b.width / 2 + 2.2, 5, 0]}
            material={m.dark}
            castShadow
          />
          <RoundedBox
            args={[0.5, 8, 8.5]}
            radius={0.6}
            smoothness={2}
            position={[b.width / 2 + 3.5, 5, 0]}
            material={m.rubber}
          />
          <mesh position={[b.width / 2 + 3.9, 5, 0]} material={m.silver}>
            <boxGeometry args={[0.7, 1.4, 10]} />
          </mesh>
        </group>
      ))}
      <Cable
        points={[
          [10, -3, -40],
          [20, -4, -48],
          [27, -15, -52],
          [24, -26, -55],
        ]}
        color="#b93820"
        radius={1.35}
      />
      <Cable
        points={[
          [5, -3, -40],
          [13, -6, -49],
          [20, -15, -54],
          [19, -26, -55],
        ]}
        radius={1.35}
      />
      <group position={[21.5, -27, -55]} rotation={[0.15, 0, -0.2]}>
        <RoundedBox
          args={[12, 8.5, 8]}
          radius={1.5}
          smoothness={2}
          material={m.connector}
          castShadow
        />
        <RoundedBox
          args={[13, 1.2, 8.5]}
          radius={0.5}
          smoothness={2}
          position={[0, 3.8, 0]}
          material={m.connector}
        />
        {[-2.9, 2.9].map((x) => (
          <group key={x} position={[x, -4.4, 0]}>
            <Ring inner={1.3} outer={2.15} height={1.1} material={m.rubber} />
            <Ring inner={1.05} outer={1.4} height={0.8} material={m.copper} />
          </group>
        ))}
      </group>
      {[-1, 0, 1, 2].map((i) => (
        <Cable
          key={i}
          radius={0.45}
          color={i === 2 ? "#ba4028" : "#343937"}
          points={[
            [i * 2, -9, -40],
            [i * 2 + 1, -13, -48],
            [i * 2 - 3, -24, -47],
            [i * 2 - 5, -25, -40],
          ]}
        />
      ))}
      <RoundedBox
        args={[10, 4, 6]}
        radius={0.6}
        smoothness={1}
        position={[-4, -26, -39]}
        material={m.white}
      />
    </group>
  );
}

function ActionCamera({ materials: m }) {
  const c = assembly.actionCamera;
  const grill = useMemo(
    () =>
      mergeParts(
        Array.from({ length: 7 }, (_, i) =>
          new THREE.BoxGeometry(0.2, 1, 5).translate(
            -c.width / 2 - 0.14,
            -6 + i * 1.9,
            0,
          ),
        ),
      ),
    [c],
  );
  useEffect(() => () => grill.dispose(), [grill]);
  return (
    <group position={[0, assembly.topPlateHeight + 2, 42]}>
      <RoundedBox
        args={[c.width + 5, 5, c.depth + 6]}
        radius={2}
        smoothness={2}
        position={[0, 2.5, 0]}
        material={m.tpu}
        castShadow
      />
      <group position={[0, c.height / 2 + 7, 0]} rotation={[-0.12, 0, 0]}>
        <RoundedBox
          args={[c.width, c.height, c.depth]}
          radius={4}
          smoothness={3}
          material={m.camera}
          castShadow
        />
        {/* Separate front shell, rubber gasket and anodised lens surround. */}
        <RoundedBox
          args={[c.width - 0.8, c.height - 0.8, 2.8]}
          radius={3.6}
          smoothness={3}
          position={[0, 0, c.depth / 2 - 1.2]}
          material={m.rubber}
        />
        <RoundedBox
          args={[c.width - 1.2, c.height - 1.2, 2.1]}
          radius={3.3}
          smoothness={3}
          position={[0, 0, c.depth / 2 + 0.15]}
          material={m.camera}
        />
        <RoundedBox
          args={[22, 25, 1.2]}
          radius={2.4}
          smoothness={3}
          position={[-14, 1, c.depth / 2 + 1.4]}
          material={m.dark}
        />
        <ComponentDecal
          kind="screen"
          size={[18.5, 21.2]}
          position={[-14, 1, c.depth / 2 + 2.05]}
          wireframe={m.dark.wireframe}
        />
        <RoundedBox
          args={[27.5, 28, 4.6]}
          radius={4.5}
          smoothness={3}
          position={[13.5, 3, c.depth / 2 + 2]}
          material={m.dark}
          castShadow
        />
        <Optics
          materials={m}
          radius={9.3}
          position={[13.5, 3, c.depth / 2 + 5]}
        />
        <Label
          text="ACTION"
          width={16}
          height={2.5}
          position={[-15, -15, c.depth / 2 + 1.24]}
          rotation={[0, 0, 0]}
          dark
        />
        <mesh position={[-25, 16, c.depth / 2 + 1.3]} material={m.red}>
          <sphereGeometry args={[0.8, 10, 8]} />
        </mesh>
        <RoundedBox
          args={[c.width - 7, c.height - 9, 1.2]}
          radius={2.8}
          smoothness={3}
          position={[0, 0, -c.depth / 2 + 0.1]}
          material={m.dark}
        />
        <ComponentDecal
          kind="screen"
          size={[c.width - 11, c.height - 13]}
          position={[0, 0, -c.depth / 2 - 0.55]}
          rotation={[0, Math.PI, 0]}
          wireframe={m.dark.wireframe}
        />
        <RoundedBox
          args={[13, 1.8, 9]}
          radius={2}
          smoothness={3}
          position={[16, c.height / 2, 0]}
          material={m.rubber}
        />
        <mesh position={[16, c.height / 2 + 1, 0]} material={m.red}>
          <cylinderGeometry args={[2.4, 2.4, 0.4, 24]} />
        </mesh>
        <mesh geometry={grill} material={m.rubber} />
        <RoundedBox
          args={[0.6, 25, 19]}
          radius={0.25}
          smoothness={1}
          position={[c.width / 2 + 0.07, -1, 0]}
          material={m.rubber}
        />
        <RoundedBox
          args={[0.6, 23, 17]}
          radius={0.25}
          smoothness={1}
          position={[c.width / 2 + 0.39, -1, 0]}
          material={m.camera}
        />
        <mesh position={[c.width / 2 + 0.8, 5, 0]} material={m.dark}>
          <boxGeometry args={[0.6, 2.5, 8]} />
        </mesh>
        {[-1, 1].flatMap((x) =>
          [-1, 1].map((y) => (
            <group
              key={`${x}:${y}`}
              position={[x * 25, y * 16, -c.depth / 2 - 0.15]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <Bolt material={m.dark} radius={1} />
            </group>
          )),
        )}
      </group>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * (c.width / 2 + 1.5), 10, 0]}>
          <RoundedBox
            args={[3, 18, 24]}
            radius={1.3}
            smoothness={2}
            material={m.tpu}
            castShadow
          />
          <RoundedBox
            args={[0.3, 7, 13]}
            radius={0.12}
            smoothness={1}
            position={[s * 1.55, 1, 0]}
            material={m.rubber}
          />
          <mesh
            position={[0, -1, -8]}
            rotation={[0, 0, Math.PI / 2]}
            material={m.dark}
          >
            <cylinderGeometry args={[2.4, 2.4, 5, 16]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function Payload({ materials }) {
  return (
    <group>
      <Battery materials={materials} />
      <ActionCamera materials={materials} />
    </group>
  );
}
