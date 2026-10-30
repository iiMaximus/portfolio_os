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
  const standard = (color, roughness, metalness, extra = {}) =>
    new THREE.MeshStandardMaterial({
      color,
      roughness,
      metalness,
      wireframe,
      ...extra,
    });
  return {
    carbon: standard("#b2b5b6", 0.48, 0.55, {
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
    propeller: standard("#3c4141", 0.24, 0.55, {
      transparent: true,
      opacity: 0.88,
      side: THREE.DoubleSide,
    }),
    lens: standard("#16373c", 0.08, 0.75),
    white: standard("#e8e3d7", 0.4, 0.3),
    dispose() {
      Object.values(this).forEach((value) => {
        if (value?.isMaterial) value.dispose();
      });
      weave.dispose();
    },
  };
}
