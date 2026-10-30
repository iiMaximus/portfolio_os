import { useEffect, useMemo } from "react";
import * as THREE from "three";

function drawBattery(c) {
  c.fillStyle = "#e4e3d6";
  c.fillRect(0, 0, 512, 256);
  c.fillStyle = "#cf512b";
  c.fillRect(0, 0, 20, 256);
  c.fillStyle = "#252b2d";
  c.font = "bold 80px sans-serif";
  c.fillText("LiPo", 42, 91);
  c.font = "bold 22px monospace";
  c.fillText("FPV / FLIGHT PACK", 44, 127);
  c.fillRect(42, 149, 426, 2);
  c.font = "18px monospace";
  c.fillText("LITHIUM POLYMER", 44, 182);
  c.fillText("CHECK CELLS BEFORE FLIGHT", 44, 210);
  for (let i = 0; i < 40; i++) {
    c.fillRect(313 + i * 3.5, 34, 1 + (i % 3), 49 + (i % 2) * 5);
  }
  c.font = "12px monospace";
  c.fillText("ILLUSTRATIVE PACK", 313, 107);
}
function drawScreen(c) {
  const gradient = c.createLinearGradient(0, 0, 0, 256);
  gradient.addColorStop(0, "#718c97");
  gradient.addColorStop(0.56, "#bec7bb");
  gradient.addColorStop(0.57, "#657361");
  gradient.addColorStop(1, "#283b35");
  c.fillStyle = gradient;
  c.fillRect(0, 0, 512, 256);
  c.fillStyle = "#344c47";
  c.beginPath();
  c.moveTo(0, 172);
  c.lineTo(93, 124);
  c.lineTo(184, 155);
  c.lineTo(295, 101);
  c.lineTo(435, 165);
  c.lineTo(512, 135);
  c.lineTo(512, 256);
  c.lineTo(0, 256);
  c.fill();
  c.fillStyle = "#e3e9dc";
  c.font = "18px monospace";
  c.fillText("4K  60", 22, 32);
  c.fillText("00:00", 363, 32);
  c.fillStyle = "#d85b3c";
  c.beginPath();
  c.arc(339, 25, 6, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = "#d4ded5";
  c.lineWidth = 1.5;
  c.strokeRect(230, 110, 52, 36);
  c.font = "14px monospace";
  c.fillStyle = "#e1e6da";
  c.fillText("PREVIEW", 22, 233);
}
function drawStrap(c) {
  c.fillStyle = "#343b38";
  c.fillRect(0, 0, 512, 256);
  for (let y = 0; y < 256; y += 4)
    for (let x = 0; x < 512; x += 4) {
      c.fillStyle = (x + y) % 8 === 0 ? "#444b46" : "#252d2a";
      c.fillRect(x, y, 3, 2);
    }
  c.strokeStyle = "#9b9a7b";
  c.lineWidth = 2;
  c.setLineDash([7, 5]);
  for (const y of [17, 239]) {
    c.beginPath();
    c.moveTo(0, y);
    c.lineTo(512, y);
    c.stroke();
  }
  c.fillStyle = "#d1d0ba";
  c.font = "bold 40px monospace";
  c.textAlign = "center";
  c.fillText("FLIGHT / 01", 256, 144);
}
export function ComponentDecal({
  kind,
  size,
  position,
  rotation = [0, 0, 0],
  wireframe = false,
}) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    ({ battery: drawBattery, screen: drawScreen, strap: drawStrap })[kind](ctx);
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }, [kind]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={size} />
      <meshPhysicalMaterial
        map={texture}
        roughness={kind === "screen" ? 0.22 : 0.72}
        clearcoat={kind === "screen" ? 0.8 : 0.08}
        clearcoatRoughness={0.15}
        wireframe={wireframe}
      />
    </mesh>
  );
}

// Decorative routing only, never represented as an electrical schematic.
export function pcbTexture(item) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const c = canvas.getContext("2d");
  c.fillStyle = "#1d3733";
  c.fillRect(0, 0, 256, 256);
  c.lineWidth = 1.4;
  c.strokeStyle = "#45665a";
  for (let side of [-1, 1])
    for (let i = 0; i < 12; i++) {
      const y = 37 + i * 15;
      c.beginPath();
      c.moveTo(128 + side * 112, y);
      c.lineTo(128 + side * (70 - (i % 4) * 5), y);
      c.lineTo(128 + side * 42, y + 9);
      c.lineTo(128 + side * 33, y + 9);
      c.stroke();
      c.fillStyle = "#a89b67";
      c.beginPath();
      c.arc(128 + side * 107, y, 2.3, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "#c1cbb5";
      c.font = "5px monospace";
      c.fillText("R" + (i + 1), 128 + side * 90, y - 4);
    }
  for (const x of [-15.25, 15.25])
    for (const z of [-15.25, 15.25]) {
      c.beginPath();
      c.arc(
        (x / item.width + 0.5) * 256,
        (z / item.length + 0.5) * 256,
        15,
        0,
        Math.PI * 2,
      );
      c.strokeStyle = "#b0a276";
      c.lineWidth = 4;
      c.stroke();
    }
  c.fillStyle = "#cad0bc";
  c.font = "bold 11px monospace";
  c.textAlign = "center";
  c.fillText(item.id === "esc" ? "S55 / 128K" : "FLIGHT CTRL", 128, 230);
  c.font = "7px monospace";
  c.fillText("ILLUSTRATIVE LAYOUT", 128, 245);
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
