import { useEffect, useMemo } from "react";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { Wire } from "./StudioProps";

function desktopTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 900;
  canvas.height = 700;
  const c = canvas.getContext("2d");
  c.fillStyle = "#7c9687";
  c.fillRect(0, 0, 900, 700);
  for (let y = 30; y < 700; y += 4) {
    c.fillStyle = "#ffffff09";
    c.fillRect(0, y, 900, 1);
  }
  c.fillStyle = "#e6e7d7";
  c.fillRect(0, 0, 900, 33);
  c.fillStyle = "#27382d";
  c.font = "bold 17px monospace";
  c.fillText("m↗   File   Edit   Special", 20, 23);
  c.font = "15px monospace";
  c.fillText("Maksym OS", 760, 22);
  ["CV", "Projects", "Apps", "Contact", "Media"].forEach((label, i) => {
    const y = 75 + i * 110;
    c.fillStyle = "#d5dac2";
    c.strokeStyle = "#384c3c";
    c.lineWidth = 2;
    c.fillRect(45, y, 55, 39);
    c.strokeRect(45, y, 55, 39);
    c.fillRect(45, y - 7, 23, 8);
    c.fillStyle = "#e8ebda";
    c.font = "16px monospace";
    c.fillText(label, 45, y + 64);
  });
  c.fillStyle = "#e9e9dc";
  c.fillRect(260, 166, 500, 310);
  c.strokeStyle = "#2b3f30";
  c.lineWidth = 3;
  c.strokeRect(260, 166, 500, 310);
  c.fillStyle = "#c5cdb8";
  c.fillRect(263, 169, 494, 30);
  c.strokeStyle = "#68735d";
  for (let y = 176; y < 194; y += 5) {
    c.beginPath();
    c.moveTo(270, y);
    c.lineTo(747, y);
    c.stroke();
  }
  c.fillStyle = "#e9e9dc";
  c.fillRect(399, 171, 230, 25);
  c.fillStyle = "#34452f";
  c.font = "16px monospace";
  c.fillText("Personal archive", 412, 189);
  c.font = "52px sans-serif";
  c.fillText("Hello, I’m Maksym.", 295, 278);
  c.font = "23px sans-serif";
  c.fillText("Mechanical engineering", 296, 327);
  c.fillText("Politecnico di Torino", 296, 360);
  c.fillStyle = "#bac9a4";
  c.fillRect(296, 401, 220, 40);
  c.strokeRect(296, 401, 220, 40);
  c.fillStyle = "#34452f";
  c.font = "16px monospace";
  c.fillText("Open the desktop →", 310, 427);
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

export default function Computer() {
  const screen = useMemo(desktopTexture, []);
  useEffect(() => () => screen.dispose(), [screen]);
  return (
    <group>
      <RoundedBox
        args={[1.73, 2.08, 1.23]}
        radius={0.12}
        smoothness={5}
        position={[0, 1.16, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color="#c4c4b3"
          roughness={0.56}
          metalness={0.06}
        />
      </RoundedBox>
      <RoundedBox
        args={[1.78, 2.04, 0.13]}
        radius={0.1}
        smoothness={4}
        position={[0, 1.18, 0.62]}
        castShadow
      >
        <meshStandardMaterial color="#dddbc6" roughness={0.6} />
      </RoundedBox>
      <RoundedBox
        args={[1.48, 1.31, 0.1]}
        radius={0.12}
        smoothness={4}
        position={[0, 1.47, 0.701]}
      >
        <meshStandardMaterial color="#60675a" roughness={0.44} />
      </RoundedBox>
      <RoundedBox
        args={[1.35, 1.18, 0.055]}
        radius={0.11}
        smoothness={4}
        position={[0, 1.47, 0.755]}
      >
        <meshPhysicalMaterial
          color="#17241c"
          clearcoat={1}
          roughness={0.18}
          metalness={0.3}
        />
      </RoundedBox>
      <mesh position={[0, 1.47, 0.79]}>
        <planeGeometry args={[1.22, 0.985]} />
        <meshBasicMaterial map={screen} toneMapped={false} />
      </mesh>
      <RoundedBox
        args={[0.72, 0.045, 0.022]}
        radius={0.018}
        smoothness={2}
        position={[0.31, 0.54, 0.694]}
      >
        <meshStandardMaterial color="#4a5045" roughness={0.8} />
      </RoundedBox>
      <mesh position={[0.62, 0.5, 0.714]}>
        <boxGeometry args={[0.08, 0.02, 0.016]} />
        <meshStandardMaterial color="#aeae9b" />
      </mesh>
      <mesh position={[-0.61, 0.48, 0.705]}>
        <boxGeometry args={[0.17, 0.17, 0.018]} />
        <meshStandardMaterial color="#e9e7d1" roughness={0.7} />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[-0.61, 0.52 - i * 0.026, 0.716]}>
          <planeGeometry args={[0.105, 0.016]} />
          <meshStandardMaterial
            color={["#82975c", "#bfad58", "#c07245", "#688b91"][i]}
          />
        </mesh>
      ))}
      {Array.from({ length: 10 }, (_, i) => (
        <mesh
          key={i}
          position={[0.87, 0.82 + i * 0.08, -0.23]}
          rotation={[0, Math.PI / 2, 0]}
        >
          <planeGeometry args={[0.49, 0.018]} />
          <meshStandardMaterial color="#737b67" roughness={1} />
        </mesh>
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh
          key={i}
          position={[-0.41 + i * 0.16, 2.205, -0.15]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[0.055, 0.45]} />
          <meshStandardMaterial color="#737b67" />
        </mesh>
      ))}
      <RoundedBox
        args={[1.55, 0.15, 1.02]}
        radius={0.04}
        smoothness={2}
        position={[0, 0.1, 0.02]}
        castShadow
      >
        <meshStandardMaterial color="#686e5f" roughness={0.8} />
      </RoundedBox>
      <group position={[0, 0.17, 1.22]} rotation={[0.08, 0, 0]}>
        <RoundedBox
          args={[1.9, 0.16, 0.7]}
          radius={0.055}
          smoothness={3}
          castShadow
        >
          <meshStandardMaterial color="#c3c3b0" roughness={0.62} />
        </RoundedBox>
        {Array.from({ length: 4 }, (_, row) =>
          Array.from({ length: 13 }, (_, col) => (
            <RoundedBox
              key={`${row}-${col}`}
              args={[0.117, 0.055, 0.113]}
              radius={0.012}
              smoothness={1}
              position={[-0.81 + col * 0.133, 0.105, -0.23 + row * 0.14]}
              castShadow
            >
              <meshStandardMaterial
                color={col === 12 || col === 0 ? "#a2a996" : "#d6d6c2"}
                roughness={0.64}
              />
            </RoundedBox>
          )),
        )}
        <RoundedBox
          args={[0.64, 0.055, 0.1]}
          radius={0.012}
          smoothness={1}
          position={[0, 0.105, 0.27]}
          castShadow
        >
          <meshStandardMaterial color="#d6d6c2" roughness={0.64} />
        </RoundedBox>
      </group>
      <group position={[1.33, 0.18, 1.18]} rotation={[0, -0.12, 0]}>
        <RoundedBox
          args={[0.32, 0.15, 0.48]}
          radius={0.08}
          smoothness={4}
          castShadow
        >
          <meshStandardMaterial color="#d4d2bd" roughness={0.6} />
        </RoundedBox>
        <RoundedBox
          args={[0.23, 0.025, 0.17]}
          radius={0.025}
          smoothness={2}
          position={[0, 0.07, -0.1]}
        >
          <meshStandardMaterial color="#a6ad99" roughness={0.6} />
        </RoundedBox>
      </group>
      <Wire
        points={[
          [1.31, 0.17, 0.97],
          [1.42, 0.14, 0.55],
          [1.2, 0.12, 0.34],
          [0.9, 0.12, 0.35],
        ]}
        radius={0.011}
        color="#aaa995"
      />
      <Wire
        points={[
          [0.3, 0.17, 0.89],
          [0.55, 0.13, 0.55],
          [0.55, 0.13, 0.35],
        ]}
        radius={0.013}
        color="#aaa995"
      />
    </group>
  );
}
