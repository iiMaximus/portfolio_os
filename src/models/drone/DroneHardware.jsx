import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { createProfileGeometry } from "./profileGeometry";
import { assembly } from "./assemblyConfig";

export function Bolt({ position, material, radius = 2.7 }) {
  return (
    <group position={position}>
      <mesh material={material} castShadow>
        <cylinderGeometry args={[radius, radius, 1.7, 16]} />
      </mesh>
      <mesh position={[0, 0.86, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[radius * 0.44, 6]} />
        <meshBasicMaterial color="#121719" />
      </mesh>
    </group>
  );
}

export function Cable({ points, color = "#25282b", radius = 0.65 }) {
  const geometry = useMemo(
    () =>
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))),
        20,
        radius,
        5,
        false,
      ),
    [points, radius],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh geometry={geometry} castShadow>
      <meshStandardMaterial color={color} roughness={0.72} />
    </mesh>
  );
}

function Label({
  text,
  width,
  height,
  position,
  rotation = [-Math.PI / 2, 0, 0],
  dark = false,
}) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;
    const c = canvas.getContext("2d");
    c.fillStyle = dark ? "#29302c" : "#d5d7c9";
    c.fillRect(0, 0, 512, 128);
    c.fillStyle = dark ? "#c9d2bd" : "#253028";
    c.font = "bold 48px monospace";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText(text, 256, 64);
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [text, dark]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial map={texture} roughness={0.85} />
    </mesh>
  );
}

export function Motor({ materials: m }) {
  return (
    <group>
      <mesh position={[0, 1.5, 0]} material={m.dark} castShadow>
        <cylinderGeometry args={[12.8, 13.8, 3, 40]} />
      </mesh>
      <mesh position={[0, 6.5, 0]} material={m.copper}>
        <cylinderGeometry args={[10.8, 10.8, 7, 36]} />
      </mesh>
      {Array.from({ length: 12 }, (_, i) => (
        <group key={i} rotation={[0, (i * Math.PI) / 6, 0]}>
          <mesh
            position={[12, 7.7, 0]}
            rotation={[0, 0, -0.12]}
            material={m.dark}
            castShadow
          >
            <boxGeometry args={[2.5, 10.5, 3.5]} />
          </mesh>
          <mesh
            position={[10.2, 6.7, 0]}
            rotation={[0, 0, Math.PI / 2]}
            material={m.copper}
          >
            <torusGeometry args={[2.5, 0.65, 5, 10]} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 13.5, 0]} material={m.dark} castShadow>
        <cylinderGeometry args={[12.8, 13.8, 4, 40]} />
      </mesh>
      <mesh
        position={[0, 3, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        material={m.orange}
      >
        <torusGeometry args={[13, 0.55, 6, 40]} />
      </mesh>
      <mesh position={[0, 17, 0]} material={m.silver}>
        <cylinderGeometry args={[2.5, 2.5, 8, 20]} />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <Bolt
          key={i}
          position={[
            Math.cos((i * Math.PI) / 2) * 9,
            16,
            Math.sin((i * Math.PI) / 2) * 9,
          ]}
          material={m.silver}
          radius={1.3}
        />
      ))}
      <Label text="2207" width={12} height={3} position={[0, 15.6, 0]} dark />
    </group>
  );
}

export function Rotor({ materials: m, spin, phase }) {
  const ref = useRef();
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(5, -2.4);
    shape.bezierCurveTo(19, -10, 49, -12, 61.5, -4.8);
    shape.bezierCurveTo(64, -3, 64, 1.3, 61, 4.5);
    shape.bezierCurveTo(43, 9, 17, 7, 5, 2.4);
    shape.closePath();
    const g = new THREE.ExtrudeGeometry(shape, {
      depth: 1.05,
      bevelEnabled: true,
      bevelThickness: 0.25,
      bevelSize: 0.35,
      bevelSegments: 2,
      steps: 1,
    });
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame((_, delta) => {
    if (ref.current && spin)
      ref.current.rotation.y += Math.min(delta, 0.05) * 1.2;
  });
  return (
    <group ref={ref} rotation={[0, phase, 0]}>
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          rotation={[0, (i * Math.PI * 2) / 3, 0]}
          geometry={geometry}
          material={m.propeller}
          castShadow
        />
      ))}
      <mesh material={m.dark} castShadow>
        <cylinderGeometry args={[6, 7.5, 3.2, 32]} />
      </mesh>
      <Bolt position={[0, 3, 0]} material={m.silver} radius={3.4} />
    </group>
  );
}

export function Board({ item, materials: m }) {
  const geometry = useMemo(() => {
    const x = item.width / 2,
      z = item.length / 2;
    return createProfileGeometry(
      {
        outer: [
          [-x + 2, -z],
          [x - 2, -z],
          [x, -z + 2],
          [x, z - 2],
          [x - 2, z],
          [-x + 2, z],
          [-x, z - 2],
          [-x, -z + 2],
        ],
        cutouts: [],
        holes: [-15.25, 15.25].flatMap((x) =>
          [-15.25, 15.25].map((z) => ({ center: [x, z], radius: 1.65 })),
        ),
      },
      1.6,
    );
  }, [item]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  const esc = item.id === "esc";
  return (
    <group position={[item.center[0], 0, item.center[1]]}>
      <mesh geometry={geometry} material={m.pcb} castShadow />
      {[-15.25, 15.25].flatMap((x) =>
        [-15.25, 15.25].map((z) => (
          <group key={`${x}:${z}`} position={[x, 0, z]}>
            <mesh position={[0, -2, 0]} material={m.rubber}>
              <cylinderGeometry args={[2.6, 2.6, 5, 16]} />
            </mesh>
            <Bolt position={[0, 2.1, 0]} material={m.silver} radius={2.4} />
          </group>
        )),
      )}
      {esc ? (
        [-1, 1].flatMap((side) =>
          Array.from({ length: 6 }, (_, i) => (
            <mesh
              key={`${side}:${i}`}
              position={[side * 10, 3, -12 + i * 4.8]}
              material={m.dark}
            >
              <boxGeometry args={[6, 2.8, 3.5]} />
            </mesh>
          )),
        )
      ) : (
        <>
          <mesh
            position={[0, 3, 0]}
            rotation={[0, Math.PI / 4, 0]}
            material={m.dark}
          >
            <boxGeometry args={[10, 2.2, 10]} />
          </mesh>
          <mesh position={[18, 3.6, 0]} material={m.silver}>
            <boxGeometry args={[4, 3.5, 8]} />
          </mesh>
          <mesh position={[20.1, 3.6, 0]} material={m.dark}>
            <boxGeometry args={[0.2, 2.4, 5.8]} />
          </mesh>
          {[-1, 1].flatMap((s) =>
            [-7, 0, 7].map((z) => (
              <mesh
                key={`${s}:${z}`}
                position={[s * 10, 2.8, z]}
                material={m.silver}
              >
                <boxGeometry args={[2.8, 2, 2]} />
              </mesh>
            )),
          )}
        </>
      )}
      {[-1, 1].flatMap((s) =>
        Array.from({ length: 7 }, (_, i) => (
          <mesh
            key={`${s}:${i}`}
            position={[s * (item.width / 2 - 1.3), 1.9, -11 + i * 3.5]}
            material={m.copper}
          >
            <boxGeometry args={[2.3, 0.4, 1.9]} />
          </mesh>
        )),
      )}
      <Label
        text={item.label}
        width={esc ? 21 : 18}
        height={3.7}
        position={[0, 1.9, esc ? 17 : 12]}
      />
      <mesh position={[-9, 3, 10]}>
        <sphereGeometry args={[0.8, 8, 8]} />
        <meshStandardMaterial
          color="#96d598"
          emissive="#60b780"
          emissiveIntensity={0.4}
        />
      </mesh>
    </group>
  );
}

export function FpvCamera({ materials: m }) {
  return (
    <group position={[0, 20, 56]} rotation={[-0.12, 0, 0]}>
      <RoundedBox
        args={[12.36, 16.5, 10]}
        radius={1.5}
        smoothness={3}
        material={m.dark}
        castShadow
      />
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 8, -0.5, -1]}>
          <RoundedBox
            args={[2.5, 18, 12]}
            radius={1}
            smoothness={2}
            material={m.orange}
            castShadow
          />
          <mesh rotation={[0, 0, Math.PI / 2]} material={m.silver}>
            <cylinderGeometry args={[1.5, 1.5, 4, 16]} />
          </mesh>
        </group>
      ))}
      <mesh
        position={[0, 2, 6]}
        rotation={[Math.PI / 2, 0, 0]}
        material={m.dark}
      >
        <cylinderGeometry args={[5, 5.5, 3.44, 32]} />
      </mesh>
      <mesh
        position={[0, 2, 7.8]}
        rotation={[Math.PI / 2, 0, 0]}
        material={m.lens}
      >
        <cylinderGeometry args={[4.25, 4.25, 0.3, 32]} />
      </mesh>
      <Label
        text="O4"
        width={7}
        height={2.2}
        position={[0, -5.6, 5.05]}
        rotation={[0, 0, 0]}
      />
    </group>
  );
}

export function AirUnit({ materials: m }) {
  return (
    <group position={[0, 27, -22.75]}>
      <RoundedBox
        args={[30, 6, 30]}
        radius={1}
        smoothness={2}
        material={m.silver}
        castShadow
      />
      <mesh position={[0, -3.1, 0]} material={m.dark}>
        <boxGeometry args={[25, 1, 25]} />
      </mesh>
      {[-10, -6, -2, 2, 6, 10].map((x) => (
        <mesh key={x} position={[x, 3.1, 0]} material={m.dark}>
          <boxGeometry args={[0.8, 0.3, 22]} />
        </mesh>
      ))}
      <Label text="O4" width={11} height={4} position={[0, 3.3, 0]} dark />
    </group>
  );
}

export function Payload({ materials: m }) {
  const { battery: b, actionCamera: c } = assembly;
  return (
    <group>
      <group position={[0, 54, -28]}>
        <RoundedBox
          args={[b.width, b.height, b.length]}
          radius={4}
          smoothness={3}
          material={m.rubber}
          castShadow
        />
        <RoundedBox
          args={[b.width + 2, 2, b.length + 2]}
          radius={0.8}
          smoothness={2}
          position={[0, -19, 0]}
          material={m.rubber}
        />
        {[-23, 23].map((z) => (
          <group key={z} position={[0, 0, z]}>
            <RoundedBox
              args={[b.width + 2, b.height + 2, 7]}
              radius={3}
              smoothness={2}
              material={m.orange}
              castShadow
            />
            <mesh position={[b.width / 2 + 1.3, 2, 0]} material={m.dark}>
              <boxGeometry args={[2, 11, 9]} />
            </mesh>
          </group>
        ))}
        <Label
          text="LiPo / FPV"
          width={23}
          height={9}
          position={[0, b.height / 2 + 0.1, 0]}
        />
        <Cable
          points={[
            [12, 0, -40],
            [25, -5, -50],
            [22, -25, -58],
            [12, -30, -55],
          ]}
          color="#be4f2f"
          radius={1.3}
        />
        <Cable
          points={[
            [6, 0, -40],
            [18, -4, -48],
            [16, -25, -55],
            [7, -30, -55],
          ]}
          radius={1.3}
        />
        <RoundedBox
          args={[12, 8, 9]}
          radius={1.5}
          smoothness={2}
          position={[11, -29, -56]}
          material={m.orange}
        />
      </group>
      <group position={[0, assembly.topPlateHeight + 2, 42]}>
        <RoundedBox
          args={[c.width + 5, 6, c.depth + 5]}
          radius={2}
          smoothness={2}
          position={[0, 3, 0]}
          material={m.orange}
          castShadow
        />
        <group position={[0, c.height / 2 + 7, 0]} rotation={[-0.12, 0, 0]}>
          <RoundedBox
            args={[c.width, c.height, c.depth]}
            radius={4}
            smoothness={3}
            material={m.dark}
            castShadow
          />
          <RoundedBox
            args={[20, 23, 1]}
            radius={2}
            smoothness={2}
            position={[-14, 1, c.depth / 2 + 0.4]}
            material={m.rubber}
          />
          <mesh position={[-14, 1, c.depth / 2 + 1]}>
            <planeGeometry args={[17, 20]} />
            <meshStandardMaterial
              color="#1b2e2a"
              metalness={0.4}
              roughness={0.15}
            />
          </mesh>
          <RoundedBox
            args={[26, 27, 4]}
            radius={4}
            smoothness={3}
            position={[13, 3, c.depth / 2 + 1]}
            material={m.rubber}
            castShadow
          />
          <mesh
            position={[13, 3, c.depth / 2 + 3.3]}
            rotation={[Math.PI / 2, 0, 0]}
            material={m.silver}
          >
            <cylinderGeometry args={[10, 10, 1.4, 40]} />
          </mesh>
          <mesh
            position={[13, 3, c.depth / 2 + 4.1]}
            rotation={[Math.PI / 2, 0, 0]}
            material={m.lens}
          >
            <cylinderGeometry args={[8.5, 8.5, 0.3, 40]} />
          </mesh>
          <Label
            text="ACTION / CONCEPT"
            width={43}
            height={4}
            position={[0, -15.5, c.depth / 2 + 0.1]}
            rotation={[0, 0, 0]}
          />
          <mesh position={[18, c.height / 2 + 0.5, 0]} material={m.orange}>
            <cylinderGeometry args={[3, 3, 1, 24]} />
          </mesh>
        </group>
        {[-1, 1].map((s) => (
          <RoundedBox
            key={s}
            args={[3, 17, 22]}
            radius={1}
            smoothness={2}
            position={[s * (c.width / 2 + 1.5), 9, 0]}
            material={m.orange}
            castShadow
          />
        ))}
      </group>
    </group>
  );
}
