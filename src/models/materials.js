import * as THREE from "three";

// Deterministic woven texture, generated locally without remote assets.
export function carbonTexture() {
  const size = 128;
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const horizontal = (Math.floor(x / 8) + Math.floor(y / 8)) % 2 === 0;
      const thread = (horizontal ? y : x) % 8;
      const value =
        41 + Math.sin((thread / 8) * Math.PI) * 28 + ((x * 13 + y * 7) % 5) * 2;
      const i = (y * size + x) * 4;
      data[i] = value;
      data[i + 1] = value + 2;
      data[i + 2] = value + 3;
      data[i + 3] = 255;
    }
  }
  const texture = new THREE.DataTexture(data, size, size);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

export function makeMaterials(wireframe = false) {
  const weave = carbonTexture();
  const grainData = new Uint8Array(64 * 64 * 4);
  for (let i = 0; i < 64 * 64; i++) {
    const v = 105 + ((i * 73 + (i % 64) * 19) % 43);
    grainData.set([v, v, v, 255], i * 4);
  }
  const grain = new THREE.DataTexture(grainData, 64, 64);
  grain.wrapS = grain.wrapT = THREE.RepeatWrapping;
  grain.repeat.set(8, 8);
  grain.needsUpdate = true;
  const physical = (color, roughness, extra = {}) =>
    new THREE.MeshPhysicalMaterial({ color, roughness, wireframe, ...extra });
  const standard = (color, roughness, metalness, extra = {}) =>
    new THREE.MeshStandardMaterial({
      color,
      roughness,
      metalness,
      wireframe,
      ...extra,
    });
  return {
    carbon: physical("#a3a8aa", 0.4, {
      metalness: 0.32,
      clearcoat: 0.38,
      clearcoatRoughness: 0.28,
      map: weave,
      bumpMap: weave,
      bumpScale: 0.018,
    }),
    carbonEdge: standard("#363c3d", 0.72, 0.22),
    orange: standard("#eb5827", 0.31, 0.25),
    dark: standard("#25282b", 0.38, 0.65),
    rubber: standard("#202326", 0.82, 0.02),
    silver: standard("#b6bec1", 0.25, 0.92),
    copper: standard("#c98b53", 0.3, 0.85),
    pcb: standard("#244d42", 0.62, 0.25),
    propeller: physical("#535852", 0.28, {
      metalness: 0.04,
      clearcoat: 0.65,
      clearcoatRoughness: 0.2,
      side: THREE.DoubleSide,
    }),
    lens: physical("#142e38", 0.075, {
      metalness: 0.08,
      transparent: true,
      opacity: 0.32,
      depthWrite: false,
      envMapIntensity: 0.6,
      clearcoat: 1,
      clearcoatRoughness: 0.025,
      iridescence: 0.35,
      iridescenceIOR: 1.3,
    }),
    optic: physical("#102429", 0.16, { metalness: 0.25, clearcoat: 0.6 }),
    camera: physical("#343939", 0.52, {
      metalness: 0.12,
      bumpMap: grain,
      bumpScale: 0.055,
    }),
    shrink: physical("#293333", 0.34, {
      metalness: 0.08,
      clearcoat: 0.45,
      clearcoatRoughness: 0.3,
      bumpMap: grain,
      bumpScale: 0.04,
    }),
    foil: standard("#999d99", 0.38, 0.65),
    fabric: standard("#343b35", 0.94, 0, { bumpMap: grain, bumpScale: 0.18 }),
    tpu: standard("#bd4a29", 0.8, 0, { bumpMap: grain, bumpScale: 0.12 }),
    connector: standard("#cb9a2e", 0.54, 0.02),
    red: standard("#b33929", 0.4, 0.05),
    white: standard("#e8e3d7", 0.4, 0.3),
    dispose() {
      Object.values(this).forEach((value) => {
        if (value?.isMaterial) value.dispose();
      });
      weave.dispose();
      grain.dispose();
    },
  };
}
