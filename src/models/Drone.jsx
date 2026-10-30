import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { makeMaterials } from "./materials";
import profiles from "./drone/frameProfiles.json";
import { createProfileGeometry } from "./drone/profileGeometry";
import {
  assembly,
  armPlacements,
  armPoint,
  motorPositions,
  boardPositions,
  standoffs,
} from "./drone/assemblyConfig";
import {
  AirUnit,
  Board,
  Bolt,
  Cable,
  FpvCamera,
  Motor,
  Payload,
  Rotor,
} from "./drone/DroneHardware";

function CutPart({ name, thickness, arm, materials }) {
  const geometry = useMemo(
    () =>
      createProfileGeometry(
        profiles.profiles[name],
        thickness,
        arm ? (p) => armPoint(p, arm) : undefined,
      ),
    [name, thickness, arm],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh
      geometry={geometry}
      material={[materials.carbon, materials.carbonEdge]}
      castShadow
      receiveShadow
    />
  );
}

export default function Drone({
  exploded = false,
  frameOnly = false,
  wireframe = false,
  moving = true,
  reducedMotion = false,
  grounded = false,
}) {
  const materials = useMemo(() => {
    const m = makeMaterials(wireframe);
    m.carbon.map.repeat.set(1, 1);
    m.carbon.bumpScale = 0.12;
    return m;
  }, [wireframe]);
  useEffect(() => () => materials.dispose(), [materials]);
  const root = useRef(),
    bottom = useRef(),
    arms = useRef(),
    xplate = useRef(),
    boards = useRef(),
    top = useRef(),
    payload = useRef(),
    motors = useRef(),
    props = useRef(),
    wires = useRef(),
    spread = useRef(0);
  useFrame((state, delta) => {
    const ease = reducedMotion ? 1 : 1 - Math.exp(-Math.min(delta, 0.05) * 5);
    spread.current = THREE.MathUtils.lerp(
      spread.current,
      exploded ? 1 : 0,
      ease,
    );
    const e = spread.current;
    bottom.current.position.y = -e * 26;
    arms.current.position.y = assembly.plateThickness;
    xplate.current.position.y = 8 + e * 20;
    boards.current.position.y = assembly.boardHeight + e * 35;
    top.current.position.y = assembly.topPlateHeight + e * 60;
    payload.current.position.y = e * 80;
    motors.current.position.y = 8 + e * 5;
    props.current.position.y = 30 + e * 22;
    wires.current.visible = !frameOnly && e < 0.03;
    root.current.position.y =
      -0.15 +
      e * (grounded ? 0.36 : -0.4) +
      (moving && !reducedMotion
        ? Math.sin(state.clock.elapsedTime * 0.65) * 0.025
        : 0);
    root.current.scale.setScalar(1 - e * 0.08);
  });
  return (
    <group ref={root} position={[0, -0.15, 0]} rotation={[0, -0.15, 0]}>
      <group
        scale={assembly.sceneScale}
        position={[0, 0, assembly.centerZ * assembly.sceneScale]}
      >
        <group ref={bottom}>
          <CutPart
            name="bottom"
            thickness={assembly.plateThickness}
            materials={materials}
          />
        </group>
        <group ref={arms} position={[0, 2, 0]}>
          {armPlacements.map((arm) => (
            <CutPart
              key={arm.id}
              name={arm.profile}
              arm={arm}
              thickness={assembly.armThickness}
              materials={materials}
            />
          ))}
        </group>
        <group ref={xplate} position={[0, 8, 0]}>
          <CutPart
            name="xplate"
            thickness={assembly.plateThickness}
            materials={materials}
          />
          {profiles.profiles.bottom.holes
            .filter(
              (h) =>
                !standoffs.some(
                  (p) =>
                    Math.hypot(p[0] - h.center[0], p[1] - h.center[1]) < 0.01,
                ),
            )
            .map((h, i) => (
              <Bolt
                key={i}
                position={[h.center[0], 2.9, h.center[1]]}
                material={materials.silver}
              />
            ))}
        </group>
        {standoffs.map(([x, z]) => (
          <group key={`${x}:${z}`} position={[x, 2, z]}>
            <mesh position={[0, 15, 0]} material={materials.orange} castShadow>
              <cylinderGeometry args={[2.6, 2.6, 30, 12]} />
            </mesh>
            <Bolt position={[0, -1.5, 0]} material={materials.silver} />
          </group>
        ))}
        <group ref={top} position={[0, assembly.topPlateHeight, 0]}>
          <CutPart
            name="top"
            thickness={assembly.plateThickness}
            materials={materials}
          />
          {standoffs.map(([x, z]) => (
            <Bolt
              key={`${x}:${z}`}
              position={[x, 2.9, z]}
              material={materials.silver}
            />
          ))}
          <group
            visible={!frameOnly}
            position={[0, -assembly.topPlateHeight, 0]}
          >
            <AirUnit materials={materials} />
          </group>
        </group>
        <group
          ref={boards}
          position={[0, assembly.boardHeight, 0]}
          visible={!frameOnly}
        >
          {boardPositions.map((item) => (
            <Board key={item.id} item={item} materials={materials} />
          ))}
        </group>
        <group visible={!frameOnly}>
          <FpvCamera materials={materials} />
        </group>
        <group ref={payload} visible={!frameOnly}>
          <Payload materials={materials} />
        </group>
        <group ref={motors} position={[0, 8, 0]} visible={!frameOnly}>
          {motorPositions.map(([x, z], i) => (
            <group key={i} position={[x, 0, z]}>
              <Motor materials={materials} />
              <mesh
                position={[0, -8, 0]}
                material={materials.rubber}
                castShadow
              >
                <cylinderGeometry args={[8, 9, 6, 24]} />
              </mesh>
            </group>
          ))}
        </group>
        <group ref={props} position={[0, 30, 0]} visible={!frameOnly}>
          {motorPositions.map(([x, z], i) => (
            <group key={i} position={[x, 0, z]}>
              <Rotor
                materials={materials}
                spin={moving && !reducedMotion}
                phase={i * 0.61}
              />
            </group>
          ))}
        </group>
        <group ref={wires} visible={!frameOnly}>
          {motorPositions.flatMap(([x, z], i) =>
            [-1, 0, 1].map((offset) => (
              <Cable
                key={`${i}:${offset}`}
                radius={0.6}
                points={[
                  [Math.sign(x) * 19, 17, -25.8 + offset * 2],
                  [Math.sign(x) * 29, 13, z > 0 ? 8 : -34],
                  [x * 0.65, 10, z * 0.65 + offset * 2],
                  [x, 10, z + offset * 2],
                ]}
              />
            )),
          )}
          <Cable
            points={[
              [10, 18, -7],
              [12, 20, -2],
              [10, 18, 2],
            ]}
            color="#b0a88e"
            radius={1}
          />
          <Cable
            points={[
              [4, 21, 51],
              [16, 16, 40],
              [21, 22, 4],
              [17, 26, -17],
            ]}
            radius={0.65}
          />
          <Cable
            points={[
              [0, 27, -36],
              [0, 29, -56],
              [3, 29, -71],
              [8, 43, -84],
            ]}
            radius={1}
          />
          <mesh
            position={[8, 43, -84]}
            rotation={[0.4, 0, -0.15]}
            material={materials.rubber}
          >
            <capsuleGeometry args={[2, 10, 4, 12]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
