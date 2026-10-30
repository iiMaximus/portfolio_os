import { useEffect, useMemo } from "react";
import { RoundedBox } from "@react-three/drei";
import {
  oakTexture,
  matTexture,
  concreteTexture,
  drawingTexture,
} from "./studioTextures";
import { Caliper, Screwdriver, TaskLamp, Wire } from "./StudioProps";
import { studioLayout as layout } from "./studioLayout";

export default function Studio() {
  const textures = useMemo(
    () => ({
      oak: oakTexture(),
      mat: matTexture(),
      wall: concreteTexture(),
      drawing: drawingTexture(),
    }),
    [],
  );
  useEffect(
    () => () => Object.values(textures).forEach((t) => t.dispose()),
    [textures],
  );
  return (
    <group>
      {/* A layered oak worktop, inset cutting surface and steel trestles. */}
      <RoundedBox
        args={[11.4, 0.25, 5.9]}
        radius={0.07}
        smoothness={3}
        receiveShadow
        castShadow
        position={[0, -0.035, 0]}
      >
        <meshStandardMaterial
          map={textures.oak}
          roughness={0.56}
          metalness={0.02}
          bumpMap={textures.oak}
          bumpScale={0.009}
        />
      </RoundedBox>
      <mesh
        position={[0, 0.091, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[11.24, 5.74]} />
        <meshStandardMaterial
          map={textures.oak}
          roughness={0.62}
          bumpMap={textures.oak}
          bumpScale={0.004}
        />
      </mesh>
      <RoundedBox
        args={[11.2, 0.055, 5.72]}
        radius={0.025}
        smoothness={2}
        position={[0, -0.19, 0]}
        castShadow
      >
        <meshStandardMaterial color="#443e34" roughness={0.7} />
      </RoundedBox>
      <RoundedBox
        args={[5.05, 0.025, 3.8]}
        radius={0.01}
        smoothness={2}
        position={[-2.85, 0.105, 0.35]}
        receiveShadow
      >
        <meshStandardMaterial color="#35473c" roughness={0.9} />
      </RoundedBox>
      <mesh
        position={[-2.85, 0.119, 0.35]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[4.99, 3.74]} />
        <meshStandardMaterial map={textures.mat} roughness={0.87} />
      </mesh>
      {[-4.75, 4.75].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          {[-2.05, 2.05].map((z) => (
            <group key={z} position={[0, -1.44, z]}>
              <RoundedBox
                args={[0.18, 2.55, 0.23]}
                radius={0.025}
                smoothness={2}
                castShadow
              >
                <meshStandardMaterial
                  color="#444b43"
                  roughness={0.43}
                  metalness={0.65}
                />
              </RoundedBox>
              <mesh position={[0, -1.33, 0]}>
                <cylinderGeometry args={[0.16, 0.18, 0.09, 20]} />
                <meshStandardMaterial color="#303630" roughness={0.9} />
              </mesh>
            </group>
          ))}
          <RoundedBox
            args={[0.16, 0.18, 4.3]}
            radius={0.02}
            smoothness={2}
            position={[0, -2.22, 0]}
            castShadow
          >
            <meshStandardMaterial
              color="#434c41"
              roughness={0.45}
              metalness={0.6}
            />
          </RoundedBox>
        </group>
      ))}
      <RoundedBox
        args={[9.5, 0.2, 0.15]}
        radius={0.02}
        smoothness={2}
        position={[0, -0.57, -2.05]}
        castShadow
      >
        <meshStandardMaterial color="#444d42" roughness={0.5} metalness={0.6} />
      </RoundedBox>
      <group position={[-3.8, 0.15, 2.08]} rotation={[0, -0.15, 0]}>
        <Caliper />
      </group>
      <group position={[-1.7, 0.22, 2.13]} rotation={[0, 0.5, 0]}>
        <Screwdriver />
      </group>
      <group position={[3.6, 0.119, 1.83]} rotation={[0, -0.16, 0]}>
        <mesh receiveShadow>
          <boxGeometry args={[1.8, 0.014, 1.27]} />
          <meshStandardMaterial color="#bdb6a1" roughness={0.95} />
        </mesh>
        <mesh
          position={[0, 0.009, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[1.8, 1.27]} />
          <meshStandardMaterial map={textures.drawing} roughness={0.93} />
        </mesh>
        <mesh
          position={[0.64, 0.035, 0.27]}
          rotation={[0, 0, Math.PI / 2]}
          castShadow
        >
          <cylinderGeometry args={[0.018, 0.018, 0.9, 6]} />
          <meshStandardMaterial color="#d4b36c" roughness={0.7} />
        </mesh>
      </group>
      <group position={[-4.9, 0.11, -2.12]} rotation={[0, 0.45, 0]}>
        <TaskLamp />
      </group>
      <group position={[4.95, 0.19, 0.85]}>
        <RoundedBox
          args={[0.58, 0.12, 0.66]}
          radius={0.08}
          smoothness={3}
          castShadow
        >
          <meshStandardMaterial
            color="#646e5a"
            roughness={0.4}
            metalness={0.65}
          />
        </RoundedBox>
        <RoundedBox
          args={[0.49, 0.11, 0.57]}
          radius={0.06}
          smoothness={3}
          position={[0, 0.035, 0]}
        >
          <meshStandardMaterial color="#353e32" roughness={0.7} />
        </RoundedBox>
        {[
          [-0.12, -0.1],
          [0.08, 0.08],
          [-0.07, 0.17],
        ].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.1, z]} rotation={[0, 0, 0.4]}>
            <cylinderGeometry args={[0.025, 0.025, 0.1, 6]} />
            <meshStandardMaterial
              color="#adb4a4"
              roughness={0.3}
              metalness={0.95}
            />
          </mesh>
        ))}
      </group>
      <group position={layout.palm.base}>
        <RoundedBox
          args={[1.15, 0.2, 0.62]}
          radius={0.05}
          smoothness={2}
          castShadow
        >
          <meshStandardMaterial
            color="#454f3d"
            roughness={0.57}
            metalness={0.45}
          />
        </RoundedBox>
      </group>
      <mesh position={layout.rocket.base} castShadow>
        <cylinderGeometry args={[0.63, 0.69, 0.11, 48]} />
        <meshStandardMaterial
          color="#495340"
          metalness={0.7}
          roughness={0.36}
        />
      </mesh>
      <mesh position={layout.rocket.support} castShadow>
        <cylinderGeometry args={[0.024, 0.024, 1.0, 16]} />
        <meshStandardMaterial
          color="#a1ad98"
          metalness={0.9}
          roughness={0.28}
        />
      </mesh>
      <Wire
        points={[
          [-0.5, 0.12, -2.1],
          [-1, 0.12, -2.6],
          [-1.2, -0.2, -2.99],
          [-1.2, -1.8, -3.0],
        ]}
        radius={0.025}
      />
      {/* A quiet architectural backdrop with wall seams and a low display rail. */}
      <mesh position={[0, 27, -4.5]} receiveShadow>
        <boxGeometry args={[120, 60, 0.25]} />
        <meshStandardMaterial
          map={textures.wall}
          color="#ced1c6"
          bumpMap={textures.wall}
          bumpScale={0.008}
          roughness={1}
        />
      </mesh>
      {[-7, -2, 3, 8].map((x) => (
        <mesh key={x} position={[x, 27, -4.36]}>
          <boxGeometry args={[0.014, 60, 0.018]} />
          <meshStandardMaterial color="#9ca494" roughness={1} />
        </mesh>
      ))}
      <mesh position={[0, -2.8, -4.25]}>
        <boxGeometry args={[120, 0.14, 0.16]} />
        <meshStandardMaterial color="#676e60" roughness={0.8} />
      </mesh>
      <RoundedBox
        args={[8.5, 0.08, 0.48]}
        radius={0.015}
        smoothness={2}
        position={[0.3, 3.35, -4.1]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color="#4c5747"
          roughness={0.5}
          metalness={0.65}
        />
      </RoundedBox>
      <mesh
        position={[0, -2.8, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#767b6e" roughness={0.96} />
      </mesh>
    </group>
  );
}
