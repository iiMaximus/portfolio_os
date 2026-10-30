import { useEffect, useMemo } from "react";
import * as THREE from "three";

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

export function Label({
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
