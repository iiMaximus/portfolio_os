import { useEffect, useMemo } from "react";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { caliperDisplay } from "./studioTextures";

const metal = { color: "#a5aeaa", metalness: 0.92, roughness: 0.28 };
export function Wire({ points, radius = 0.018, color = "#333936" }) {
  const geometry = useMemo(
    () =>
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))),
        32,
        radius,
        8,
        false,
      ),
    [points, radius],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh geometry={geometry} castShadow>
      <meshStandardMaterial color={color} roughness={0.74} />
    </mesh>
  );
}

export function Caliper() {
  const display = useMemo(caliperDisplay, []);
  const jaw = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.lineTo(0.13, 0);
    s.lineTo(0.13, -0.27);
    s.lineTo(0.11, -0.43);
    s.lineTo(0.035, -0.5);
    s.lineTo(0, -0.5);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, {
      depth: 0.045,
      bevelEnabled: true,
      bevelSize: 0.007,
      bevelThickness: 0.005,
      bevelSegments: 2,
      steps: 1,
    });
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  useEffect(
    () => () => {
      display.dispose();
      jaw.dispose();
    },
    [display, jaw],
  );
  return (
    <group rotation={[0, -0.21, 0]}>
      <RoundedBox
        args={[1.55, 0.035, 0.13]}
        radius={0.008}
        smoothness={2}
        castShadow
      >
        <meshStandardMaterial {...metal} />
      </RoundedBox>
      <mesh position={[0.79, 0, 0]}>
        <boxGeometry args={[0.17, 0.018, 0.025]} />
        <meshStandardMaterial {...metal} />
      </mesh>
      {Array.from({ length: 61 }, (_, i) => (
        <mesh
          key={i}
          position={[-0.69 + i * 0.022, 0.02, -0.047]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[0.003, i % 5 === 0 ? 0.052 : 0.025]} />
          <meshStandardMaterial color="#303b36" />
        </mesh>
      ))}
      <mesh geometry={jaw} position={[-0.65, 0.01, 0]} castShadow>
        <meshStandardMaterial {...metal} />
      </mesh>
      <mesh
        geometry={jaw}
        position={[-0.13, 0.01, 0]}
        scale={[-1, 1, 1]}
        castShadow
      >
        <meshStandardMaterial {...metal} side={THREE.DoubleSide} />
      </mesh>
      {[-0.62, -0.2].map((x, i) => (
        <mesh
          key={x}
          position={[x, 0.015, -0.19]}
          rotation={[0, 0, i ? -0.12 : 0.12]}
          castShadow
        >
          <boxGeometry args={[0.042, 0.045, 0.25]} />
          <meshStandardMaterial {...metal} />
        </mesh>
      ))}
      <RoundedBox
        args={[0.42, 0.115, 0.29]}
        radius={0.025}
        smoothness={2}
        position={[-0.25, 0.06, 0.01]}
        castShadow
      >
        <meshStandardMaterial
          color="#303b37"
          roughness={0.45}
          metalness={0.45}
        />
      </RoundedBox>
      <mesh position={[-0.25, 0.12, -0.015]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.3, 0.115]} />
        <meshBasicMaterial map={display} />
      </mesh>
      {[-0.37, -0.26, -0.15].map((x, i) => (
        <mesh key={x} position={[x, 0.12, 0.105]}>
          <cylinderGeometry args={[0.017, 0.017, 0.01, 12]} />
          <meshStandardMaterial
            color={i === 0 ? "#e47740" : "#b3b9ac"}
            roughness={0.5}
          />
        </mesh>
      ))}
      <mesh
        position={[-0.26, 0.055, 0.23]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
      >
        <cylinderGeometry args={[0.06, 0.06, 0.15, 24]} />
        <meshStandardMaterial {...metal} />
      </mesh>
      {Array.from({ length: 9 }, (_, i) => (
        <mesh
          key={i}
          position={[-0.32 + i * 0.016, 0.055, 0.23]}
          rotation={[0, Math.PI / 2, 0]}
        >
          <torusGeometry args={[0.061, 0.003, 4, 20]} />
          <meshStandardMaterial
            color="#4c5750"
            metalness={0.9}
            roughness={0.3}
          />
        </mesh>
      ))}
      <mesh position={[-0.21, 0.17, -0.13]}>
        <cylinderGeometry args={[0.035, 0.035, 0.06, 18]} />
        <meshStandardMaterial {...metal} />
      </mesh>
    </group>
  );
}

export function Screwdriver() {
  return (
    <group rotation={[0, 0, Math.PI / 2]}>
      <RoundedBox
        args={[0.17, 0.61, 0.17]}
        radius={0.07}
        smoothness={4}
        castShadow
      >
        <meshStandardMaterial color="#bd5634" roughness={0.48} />
      </RoundedBox>
      <mesh position={[0, -0.32, 0]}>
        <cylinderGeometry args={[0.073, 0.064, 0.06, 24]} />
        <meshStandardMaterial color="#373e37" roughness={0.7} />
      </mesh>
      {[-0.18, -0.1, -0.02, 0.06, 0.14].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <cylinderGeometry args={[0.089, 0.089, 0.023, 24]} />
          <meshStandardMaterial color="#313b35" roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.038, 0.052, 0.12, 20]} />
        <meshStandardMaterial {...metal} />
      </mesh>
      <mesh position={[0, 0.66, 0]} castShadow>
        <cylinderGeometry args={[0.022, 0.022, 0.52, 16]} />
        <meshStandardMaterial {...metal} />
      </mesh>
      <mesh position={[0, 0.95, 0]}>
        <boxGeometry args={[0.054, 0.09, 0.018]} />
        <meshStandardMaterial {...metal} />
      </mesh>
    </group>
  );
}

function Rod({ a, b, radius = 0.032, color = "#39433b" }) {
  const [position, quaternion, length] = useMemo(() => {
    const start = new THREE.Vector3(...a),
      end = new THREE.Vector3(...b);
    return [
      start.clone().add(end).multiplyScalar(0.5),
      new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        end.clone().sub(start).normalize(),
      ),
      start.distanceTo(end),
    ];
  }, [a, b]);
  return (
    <mesh position={position} quaternion={quaternion} castShadow>
      <cylinderGeometry args={[radius, radius, length, 12]} />
      <meshStandardMaterial color={color} metalness={0.7} roughness={0.4} />
    </mesh>
  );
}

export function TaskLamp() {
  return (
    <group>
      <mesh position={[0, 0.06, 0]} castShadow>
        <cylinderGeometry args={[0.37, 0.4, 0.12, 40]} />
        <meshStandardMaterial
          color="#424a3d"
          metalness={0.55}
          roughness={0.45}
        />
      </mesh>
      {[-0.065, 0.065].map((x) => (
        <group key={x}>
          <Rod a={[x, 0.14, 0]} b={[x - 0.24, 1.12, -0.06]} />
          <Rod a={[x - 0.24, 1.12, -0.06]} b={[x + 0.28, 2.02, 0.15]} />
        </group>
      ))}
      {[
        [0, 0.18, 0],
        [-0.24, 1.12, -0.06],
        [0.28, 2.02, 0.15],
      ].map((p, i) => (
        <mesh key={i} position={p} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.085, 0.085, 0.19, 24]} />
          <meshStandardMaterial
            color="#b0b5a6"
            metalness={0.9}
            roughness={0.32}
          />
        </mesh>
      ))}
      <group position={[0.38, 1.97, 0.27]} rotation={[0.48, 0, -0.2]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.115, 0.34, 0.32, 32, 1, true]} />
          <meshStandardMaterial
            color="#48533f"
            metalness={0.6}
            roughness={0.37}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh position={[0, -0.16, 0]}>
          <cylinderGeometry args={[0.32, 0.32, 0.01, 32]} />
          <meshStandardMaterial
            color="#f7e4ba"
            emissive="#ffd9a0"
            emissiveIntensity={1.8}
          />
        </mesh>
      </group>
      <Wire
        points={[
          [0, 0.15, -0.1],
          [-0.3, 0.6, -0.1],
          [-0.32, 1.15, -0.13],
          [0.24, 2.02, 0.12],
        ]}
        radius={0.014}
      />
    </group>
  );
}
