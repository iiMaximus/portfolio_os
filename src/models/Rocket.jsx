import { useMemo, useEffect } from "react";
import * as THREE from "three";

export default function Rocket() {
  const nose = useMemo(() => {
    const points = Array.from({ length: 25 }, (_, i) => {
      const t = i / 24;
      return new THREE.Vector2(0.24 * Math.cos((t * Math.PI) / 2), 0.93 * t);
    });
    return new THREE.LatheGeometry(points, 48);
  }, []);
  const fin = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0.22, -0.65);
    shape.lineTo(0.69, -1.27);
    shape.lineTo(0.67, -1.51);
    shape.lineTo(0.22, -1.37);
    shape.closePath();
    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.035,
      bevelEnabled: true,
      bevelSize: 0.008,
      bevelThickness: 0.008,
      bevelSegments: 2,
      steps: 1,
    });
  }, []);
  useEffect(
    () => () => {
      nose.dispose();
      fin.dispose();
    },
    [nose, fin],
  );
  return (
    <group rotation={[0, -0.2, -0.5]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.24, 0.24, 2.7, 48]} />
        <meshStandardMaterial
          color="#e8e5dd"
          metalness={0.58}
          roughness={0.32}
        />
      </mesh>
      <mesh geometry={nose} position={[0, 1.35, 0]} castShadow>
        <meshStandardMaterial
          color="#e9e4db"
          metalness={0.5}
          roughness={0.29}
        />
      </mesh>
      <mesh position={[0, 0.95, 0]}>
        <cylinderGeometry args={[0.242, 0.242, 0.28, 48]} />
        <meshStandardMaterial
          color="#e66635"
          metalness={0.35}
          roughness={0.38}
        />
      </mesh>
      {[-1.23, 0.68, 1.34].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <cylinderGeometry args={[0.246, 0.246, 0.025, 48]} />
          <meshStandardMaterial
            color="#596060"
            metalness={0.8}
            roughness={0.32}
          />
        </mesh>
      ))}
      {[0, 1, 2, 3].map((i) => (
        <group key={i} rotation={[0, (i * Math.PI) / 2, 0]}>
          <mesh geometry={fin} castShadow>
            <meshStandardMaterial
              color={i % 2 ? "#d5d6d0" : "#e66635"}
              metalness={0.5}
              roughness={0.35}
            />
          </mesh>
        </group>
      ))}
      <mesh position={[0, -1.43, 0]}>
        <cylinderGeometry args={[0.14, 0.19, 0.16, 32, 1, true]} />
        <meshStandardMaterial
          color="#333a3d"
          metalness={0.8}
          roughness={0.35}
          side={THREE.DoubleSide}
        />
      </mesh>
      {Array.from({ length: 8 }, (_, i) => (
        <group key={i} rotation={[0, (i * Math.PI) / 4, 0]}>
          <mesh position={[0, 0.2, 0.242]}>
            <planeGeometry args={[0.12, 0.12]} />
            <meshStandardMaterial color={i % 2 ? "#343b3d" : "#e7e5dd"} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, -0.35, 0.243]}>
        <planeGeometry args={[0.035, 0.58]} />
        <meshStandardMaterial color="#404745" />
      </mesh>
    </group>
  );
}
