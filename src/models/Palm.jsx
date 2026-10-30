import { useEffect, useMemo } from "react";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

function screenTexture(app) {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 800;
  const c = canvas.getContext("2d");
  c.fillStyle = "#e8eadd";
  c.fillRect(0, 0, 640, 800);
  c.fillStyle = "#282e29";
  c.font = "22px monospace";
  c.fillText("M / SOFTWARE LAB", 36, 48);
  c.fillText("●", 574, 48);
  c.fillRect(32, 72, 576, 2);
  c.fillStyle = app.color;
  c.beginPath();
  c.roundRect(38, 112, 98, 98, 24);
  c.fill();
  c.strokeStyle = "#30372f";
  c.lineWidth = 5;
  if (app.id === "allergify") {
    [
      [60, 134, 1, 1],
      [113, 134, -1, 1],
      [60, 187, 1, -1],
      [113, 187, -1, -1],
    ].forEach(([x, y, dx, dy]) => {
      c.beginPath();
      c.moveTo(x + 15 * dx, y);
      c.lineTo(x, y);
      c.lineTo(x, y + 15 * dy);
      c.stroke();
    });
    c.beginPath();
    c.moveTo(68, 161);
    c.lineTo(105, 161);
    c.stroke();
  } else if (app.id === "absorb") {
    c.strokeRect(61, 138, 51, 47);
    c.beginPath();
    c.moveTo(86, 139);
    c.lineTo(86, 185);
    c.stroke();
  } else {
    c.beginPath();
    c.arc(87, 160, 27, 0, Math.PI * 2);
    c.moveTo(87, 141);
    c.lineTo(87, 160);
    c.lineTo(101, 160);
    c.stroke();
  }
  c.fillStyle = "#292e29";
  c.font = "bold 54px sans-serif";
  c.fillText(app.name, 38, 290);
  c.font = "25px sans-serif";
  c.fillText(app.category, 40, 335);
  c.strokeStyle = "#b7bcae";
  c.lineWidth = 1;
  c.beginPath();
  c.moveTo(38, 377);
  c.lineTo(600, 377);
  c.stroke();
  c.font = "20px monospace";
  c.fillStyle = "#69715f";
  c.fillText("EXPLORING", 40, 424);
  app.focus.forEach((item, i) => {
    c.fillStyle = "#d9ddcf";
    c.beginPath();
    c.roundRect(38, 456 + i * 72, 563, 58, 8);
    c.fill();
    c.fillStyle = "#323b2e";
    c.font = "25px sans-serif";
    c.fillText(item, 59, 495 + i * 72);
    c.fillText("↗", 550, 495 + i * 72);
  });
  c.fillStyle = "#6d7566";
  c.font = "18px monospace";
  c.fillText("INTERFACE STUDY / IN DEVELOPMENT", 38, 751);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

export default function Palm({ app }) {
  const screen = useMemo(() => screenTexture(app), [app]);
  useEffect(() => () => screen.dispose(), [screen]);
  return (
    <group rotation={[-0.13, -0.26, -0.12]} position={[0, 0.06, 0]}>
      <RoundedBox
        args={[1.78, 2.88, 0.25]}
        radius={0.16}
        smoothness={5}
        castShadow
      >
        <meshStandardMaterial
          color="#8c9699"
          roughness={0.32}
          metalness={0.8}
        />
      </RoundedBox>
      <RoundedBox
        args={[1.69, 2.78, 0.12]}
        radius={0.13}
        smoothness={4}
        position={[0, 0, 0.132]}
        castShadow
      >
        <meshStandardMaterial
          color="#b5bcbb"
          roughness={0.36}
          metalness={0.65}
        />
      </RoundedBox>
      <RoundedBox
        args={[1.43, 1.94, 0.04]}
        radius={0.08}
        smoothness={3}
        position={[0, 0.26, 0.204]}
      >
        <meshStandardMaterial color="#38413e" roughness={0.6} />
      </RoundedBox>
      <mesh position={[0, 0.26, 0.229]}>
        <planeGeometry args={[1.31, 1.72]} />
        <meshBasicMaterial map={screen} toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.86, 0.213]}>
        <circleGeometry args={[0.213, 48]} />
        <meshStandardMaterial
          color="#626c6a"
          metalness={0.85}
          roughness={0.3}
        />
      </mesh>
      <mesh position={[0, -0.86, 0.221]}>
        <ringGeometry args={[0.139, 0.191, 48]} />
        <meshStandardMaterial
          color="#d2d6d3"
          metalness={0.8}
          roughness={0.23}
        />
      </mesh>
      <mesh position={[0, -0.86, 0.228]}>
        <circleGeometry args={[0.1, 32]} />
        <meshStandardMaterial
          color="#888f8c"
          metalness={0.8}
          roughness={0.33}
        />
      </mesh>
      {[-0.57, -0.35, 0.35, 0.57].map((x) => (
        <RoundedBox
          key={x}
          args={[0.15, 0.15, 0.045]}
          radius={0.045}
          smoothness={3}
          position={[x, -0.86, 0.22]}
        >
          <meshStandardMaterial
            color="#636c6b"
            metalness={0.65}
            roughness={0.4}
          />
        </RoundedBox>
      ))}
      {Array.from({ length: 5 }, (_, i) => (
        <mesh key={i} position={[-0.12 + i * 0.06, 1.29, 0.197]}>
          <boxGeometry args={[0.018, 0.04, 0.009]} />
          <meshStandardMaterial color="#586261" />
        </mesh>
      ))}
      <mesh position={[0.84, 0.3, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 2.13, 12]} />
        <meshStandardMaterial
          color="#4b5454"
          metalness={0.85}
          roughness={0.32}
        />
      </mesh>
      <RoundedBox
        args={[0.075, 0.11, 0.08]}
        radius={0.02}
        position={[0.84, 1.38, 0]}
      >
        <meshStandardMaterial color="#343c3b" roughness={0.5} />
      </RoundedBox>
      <mesh position={[-0.64, 1.29, 0.2]}>
        <circleGeometry args={[0.022, 12]} />
        <meshStandardMaterial
          color="#a3cf8c"
          emissive="#86c769"
          emissiveIntensity={0.5}
        />
      </mesh>
      {[-0.62, 0.62].map((x) =>
        [-1.22, 1.18].map((y) => (
          <mesh
            key={`${x}-${y}`}
            position={[x, y, -0.13]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <cylinderGeometry args={[0.026, 0.026, 0.012, 6]} />
            <meshStandardMaterial color="#535c5c" metalness={0.8} />
          </mesh>
        )),
      )}
    </group>
  );
}
