import { useEffect, useMemo } from "react";
import { RoundedBox, useTexture } from "@react-three/drei";
import * as THREE from "three";

const lcd = { width: 1.48, height: 1.83, y: 0.21 };
const keyY = -1.09;

function roundedOpening(left, bottom, width, height, radius) {
  const path = new THREE.Path();
  const right = left + width;
  const top = bottom + height;
  path.moveTo(left + radius, bottom);
  path.lineTo(right - radius, bottom);
  path.quadraticCurveTo(right, bottom, right, bottom + radius);
  path.lineTo(right, top - radius);
  path.quadraticCurveTo(right, top, right - radius, top);
  path.lineTo(left + radius, top);
  path.quadraticCurveTo(left, top, left, top - radius);
  path.lineTo(left, bottom + radius);
  path.quadraticCurveTo(left, bottom, left + radius, bottom);
  return path;
}

// The top shoulders flare around the glass. The lower sides taper into the palm.
function housingShape() {
  const shape = new THREE.Shape();
  shape.moveTo(0, 1.46);
  shape.bezierCurveTo(0.68, 1.46, 0.93, 1.44, 0.93, 1.23);
  shape.bezierCurveTo(0.95, 0.7, 0.88, 0.05, 0.875, -0.67);
  shape.bezierCurveTo(0.875, -1.12, 0.83, -1.36, 0.62, -1.405);
  shape.bezierCurveTo(0.32, -1.48, -0.32, -1.48, -0.62, -1.405);
  shape.bezierCurveTo(-0.83, -1.36, -0.875, -1.12, -0.875, -0.67);
  shape.bezierCurveTo(-0.88, 0.05, -0.95, 0.7, -0.93, 1.23);
  shape.bezierCurveTo(-0.93, 1.44, -0.68, 1.46, 0, 1.46);
  return shape;
}

const solidShell = housingShape();
const frontShell = housingShape();
frontShell.holes.push(roundedOpening(-0.785, -0.75, 1.57, 1.95, 0.082));

const bevel = (depth, radius) => ({
  depth, bevelEnabled: true, bevelSize: radius, bevelThickness: radius,
  bevelSegments: 3, curveSegments: 12, steps: 1,
});
const backOptions = bevel(0.14, 0.052);
const frontOptions = bevel(0.065, 0.025);
const seamOptions = bevel(0.016, 0.016);

function textureFrom(canvas) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function makeScreen(app, source) {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = Math.round(canvas.width * lcd.height / lcd.width);
  const ctx = canvas.getContext("2d");
  const header = 62;
  const imageHeight = canvas.height - header;
  const cropHeight = source.width * imageHeight / canvas.width;
  // Crop into the real app at its original aspect ratio, below the phone chrome.
  const cropTop = Math.round(source.height * (app.id === "lychee" ? 0.15 : 0.097));
  ctx.drawImage(source, 0, cropTop, source.width, cropHeight, 0, header, canvas.width, imageHeight);
  ctx.fillStyle = "#e8eae1";
  ctx.fillRect(0, 0, canvas.width, header);
  ctx.fillStyle = "#26332b";
  ctx.font = "600 27px sans-serif";
  ctx.fillText(app.name, 24, 41);
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#57635a";
  ctx.strokeRect(568, 22, 40, 18);
  ctx.fillStyle = "#57635a";
  ctx.fillRect(572, 26, 27, 10);
  ctx.fillRect(609, 28, 4, 6);
  ctx.fillStyle = "#b6baad";
  ctx.fillRect(0, header - 2, canvas.width, 2);
  return textureFrom(canvas);
}

function facePrinting() {
  const canvas = document.createElement("canvas");
  canvas.width = 768;
  canvas.height = 1180;
  const ctx = canvas.getContext("2d");
  // Draw in model coordinates so the markings register with the molded parts.
  ctx.setTransform(400, 0, 0, -400, 384, 590);
  ctx.fillStyle = "#33403b";
  ctx.save();
  ctx.scale(1, -1);
  ctx.font = "italic 0.113px Georgia";
  ctx.fillText("Horoszczak", -0.71, -1.285);
  ctx.restore();
  ctx.strokeStyle = "#69716a";
  ctx.lineWidth = 0.007;
  ctx.beginPath();
  ctx.moveTo(-0.66, -0.85);
  ctx.lineTo(0.66, -0.85);
  ctx.stroke();
  for (let i = 0; i < 29; i++) {
    const x = -0.63 + 0.045 * i;
    ctx.beginPath();
    ctx.moveTo(x, -0.85);
    ctx.lineTo(x, -0.85 + (i % 7 === 0 ? 0.034 : 0.017));
    ctx.stroke();
  }
  return textureFrom(canvas);
}

function brushedFinish() {
  // Fine parallel tool marks vary the width of the highlight across the case.
  const width = 128, height = 128;
  const pixels = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++) {
    const band = 202 + 14 * Math.sin(y * 18.3) + 12 * Math.cos(y * 5.7);
    for (let x = 0; x < width; x++) {
      const value = Math.round(band + 6 * Math.sin(x * 0.15 + y));
      pixels.set([value, value, value, 255], (y * width + x) * 4);
    }
  }
  const map = new THREE.DataTexture(pixels, width, height);
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.magFilter = THREE.LinearFilter;
  map.minFilter = THREE.LinearMipmapLinearFilter;
  map.generateMipmaps = true;
  map.repeat.set(1.5, 3);
  map.needsUpdate = true;
  return map;
}

function keyGraphics() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const c = canvas.getContext("2d");
  c.strokeStyle = "#e4e6dc";
  c.lineWidth = 6;
  c.lineCap = "round";
  c.lineJoin = "round";
  c.beginPath();
  for (const [x, y, dx, dy] of [[28,31,1,1], [100,31,-1,1], [28,97,1,-1], [100,97,-1,-1]]) {
    c.moveTo(x + dx * 15, y); c.lineTo(x, y); c.lineTo(x, y + dy * 15);
  }
  c.moveTo(39,65); c.lineTo(90,65);
  c.stroke();
  c.beginPath();
  c.moveTo(192, 42); c.quadraticCurveTo(177, 32, 158, 36);
  c.lineTo(158, 89); c.quadraticCurveTo(174, 84, 192, 96);
  c.quadraticCurveTo(210, 84, 226, 89); c.lineTo(226, 36);
  c.quadraticCurveTo(207, 32, 192, 42); c.lineTo(192, 96);
  c.stroke();
  return textureFrom(canvas);
}

function ShortcutKey({ index, active, onSelect, legend }) {
  const x = index === 0 ? -0.50 : 0.50;
  const icon = useMemo(() => {
    const map = legend.clone();
    map.repeat.x = 0.5;
    map.offset.x = index * 0.5;
    map.needsUpdate = true;
    return map;
  }, [legend, index]);
  useEffect(() => () => icon.dispose(), [icon]);
  return (
    <group position={[x, keyY, 0.202]} onClick={(event) => {
      if (onSelect && event.delta < 4) {
        event.stopPropagation();
        onSelect(index);
      }
    }}>
      <RoundedBox args={[0.425, 0.235, 0.036]} radius={0.057} smoothness={2}>
        <meshStandardMaterial color="#29332f" roughness={0.56} />
      </RoundedBox>
      <RoundedBox args={[0.386, 0.195, 0.064]} position={[0, 0, 0.027]} radius={0.049} smoothness={2}>
        <meshStandardMaterial color="#46514c" roughness={0.35} metalness={0.35} />
      </RoundedBox>
      <mesh position={[0, 0, 0.061]}>
        <planeGeometry args={[0.152, 0.152]} />
        <meshBasicMaterial map={icon} transparent depthWrite={false} />
      </mesh>
      <mesh position={[0, -0.172, 0.012]}>
        <planeGeometry args={[0.16, 0.015]} />
        <meshBasicMaterial color={active ? "#d06a36" : "#7c827b"} />
      </mesh>
    </group>
  );
}

export default function Palm({ app, onAppSelect }) {
  const source = useTexture(app.screen);
  const screen = useMemo(() => makeScreen(app, source.image), [app, source]);
  const printing = useMemo(facePrinting, []);
  const keyLegend = useMemo(keyGraphics, []);
  const finish = useMemo(brushedFinish, []);
  useEffect(() => () => screen.dispose(), [screen]);
  useEffect(() => () => {
    printing.dispose();
    keyLegend.dispose();
    finish.dispose();
  }, [printing, keyLegend, finish]);

  return (
    <group rotation={[-0.085, -0.19, -0.075]} position={[0, 0.06, 0]}>
      <mesh position={[0, 0, -0.155]} castShadow>
        <extrudeGeometry args={[solidShell, backOptions]} />
        <meshStandardMaterial color="#444b45" roughness={0.53} metalness={0.16} />
      </mesh>
      <mesh position={[0, 0, 0.041]}>
        <extrudeGeometry args={[solidShell, seamOptions]} />
        <meshStandardMaterial color="#272d2a" roughness={0.73} />
      </mesh>
      <mesh position={[0, 0, 0.113]} castShadow>
        <extrudeGeometry args={[frontShell, frontOptions]} />
        <meshStandardMaterial attach="material-0" color="#c6c7b8" metalness={0.46} roughness={0.48} roughnessMap={finish} />
        <meshStandardMaterial attach="material-1" color="#c6cabe" metalness={0.7} roughness={0.23} />
      </mesh>
      <RoundedBox args={[0.26, 0.056, 0.025]} radius={0.017} smoothness={2} position={[0.55,1.303,0.197]}>
        <meshPhysicalMaterial color="#352d29" metalness={0.23} roughness={0.21} clearcoat={0.8} />
      </RoundedBox>
      <mesh position={[0.355,1.303,0.205]}>
        <circleGeometry args={[0.014,16]} />
        <meshBasicMaterial color="#b9cb9d" />
      </mesh>
      <RoundedBox args={[1.62, 2.02, 0.09]} radius={0.052} smoothness={2} position={[0, 0.226, 0.095]}>
        <meshStandardMaterial color="#252c29" roughness={0.38} />
      </RoundedBox>
      <mesh position={[0, lcd.y, 0.144]}>
        <planeGeometry args={[lcd.width, lcd.height]} />
        <meshBasicMaterial map={screen} toneMapped={false} />
      </mesh>
      <mesh position={[0, lcd.y, 0.151]}>
        <planeGeometry args={[lcd.width, lcd.height]} />
        <meshPhysicalMaterial color="#dce8df" roughness={0.18} metalness={0.45} clearcoat={1} clearcoatRoughness={0.12} transparent opacity={0.055} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0, 0.206]}>
        <planeGeometry args={[1.92, 2.95]} />
        <meshBasicMaterial map={printing} transparent depthWrite={false} />
      </mesh>
      {[0, 1].map((i) => (
        <ShortcutKey index={i} key={i} active={i === (app.id === "lychee" ? 0 : 1)} onSelect={onAppSelect} legend={keyLegend} />
      ))}
      <group position={[0, keyY, 0.215]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 0.88]}>
        <mesh>
          <cylinderGeometry args={[0.225, 0.24, 0.052, 40]} />
          <meshStandardMaterial color="#343d35" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.035, 0]}>
          <cylinderGeometry args={[0.195, 0.21, 0.048, 40]} />
          <meshStandardMaterial color="#abb3a7" metalness={0.84} roughness={0.26} />
        </mesh>
        <mesh position={[0, 0.062, 0]}>
          <cylinderGeometry args={[0.116, 0.133, 0.043, 40]} />
          <meshStandardMaterial color="#48534a" metalness={0.36} roughness={0.32} />
        </mesh>
      </group>
      <group position={[0.921, 0.05, -0.039]} rotation={[0, 0, -0.022]}>
        <mesh>
          <cylinderGeometry args={[0.043, 0.038, 2.29, 16]} />
          <meshStandardMaterial color="#727a70" roughness={0.28} metalness={0.80} />
        </mesh>
        <mesh position={[0, 1.19, 0]}>
          <cylinderGeometry args={[0.062, 0.051, 0.19, 20]} />
          <meshStandardMaterial color="#363d36" roughness={0.5} />
        </mesh>
        {[1.14,1.18,1.22].map((y) => (
          <mesh position={[0, y, 0]} key={y}>
            <cylinderGeometry args={[0.062, 0.062, 0.018, 16]} />
            <meshStandardMaterial color="#676e62" roughness={0.4} metalness={0.48} />
          </mesh>
        ))}
        <mesh position={[0, -1.20, 0]} rotation={[0, 0, Math.PI]}>
          <coneGeometry args={[0.038, 0.115, 16]} />
          <meshStandardMaterial color="#292e28" roughness={0.58} />
        </mesh>
      </group>
      <RoundedBox args={[1.37, 0.95, 0.053]} radius={0.07} smoothness={2} position={[0, -0.44, -0.201]}>
        <meshStandardMaterial color="#515950" roughness={0.6} />
      </RoundedBox>
      <RoundedBox args={[0.45, 0.10, 0.026]} radius={0.026} smoothness={2} position={[0, 0.014, -0.229]}>
        <meshStandardMaterial color="#2b352c" roughness={0.68} />
      </RoundedBox>
      {[[-0.73,-1.19],[0.73,-1.19],[-0.76,1.22],[0.76,1.22]].map(([x,y]) => (
        <group key={x + "," + y} position={[x,y,-0.207]}>
          <mesh rotation={[-Math.PI / 2,0,0]}>
            <cylinderGeometry args={[0.035,0.043,0.014,12]} />
            <meshStandardMaterial color="#778075" roughness={0.3} metalness={0.8} />
          </mesh>
          <mesh position={[0,0,-0.009]} rotation={[0,0,0.65]}>
            <boxGeometry args={[0.043,0.009,0.002]} />
            <meshStandardMaterial color="#293028" />
          </mesh>
        </group>
      ))}
      <mesh position={[0, -1.24, -0.213]}>
        <boxGeometry args={[0.62, 0.16, 0.035]} />
        <meshStandardMaterial color="#242a26" roughness={0.65} />
      </mesh>
      {Array.from({length: 8}, (_, i) => (
        <mesh key={i} position={[(i - 3.5) * 0.062, -1.24, -0.234]}>
          <boxGeometry args={[0.025, 0.10, 0.009]} />
          <meshStandardMaterial color="#c5a973" metalness={0.8} roughness={0.35} />
        </mesh>
      ))}
    </group>
  );
}
