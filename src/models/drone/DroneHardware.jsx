import { useEffect, useMemo } from "react";
import { RoundedBox } from "@react-three/drei";
import { createProfileGeometry } from "./profileGeometry";
import { pcbTexture } from "./ComponentDecal";
import { Optics } from "./PremiumHardware";
import { Bolt, Label } from "./HardwarePrimitives";
export { Bolt, Cable } from "./HardwarePrimitives";
export { Motor, Rotor, Payload } from "./PremiumHardware";

export function Board({ item, materials: m }) {
  const geometry = useMemo(() => {
    const x = item.width / 2,
      z = item.length / 2;
    const g = createProfileGeometry(
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
    const position = g.getAttribute("position"),
      uv = g.getAttribute("uv");
    for (let i = 0; i < position.count; i++)
      uv.setXY(
        i,
        position.getX(i) / item.width + 0.5,
        position.getZ(i) / item.length + 0.5,
      );
    return g;
  }, [item]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  const surface = useMemo(() => {
    const material = m.pcb.clone();
    material.color.set("#ffffff");
    material.map = pcbTexture(item);
    return material;
  }, [item, m.pcb]);
  useEffect(
    () => () => {
      surface.map.dispose();
      surface.dispose();
    },
    [surface],
  );
  const esc = item.id === "esc";
  return (
    <group position={[item.center[0], 0, item.center[1]]}>
      <mesh geometry={geometry} material={surface} castShadow />
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
      <Optics materials={m} radius={4.1} position={[0, 2, 6.5]} />
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
