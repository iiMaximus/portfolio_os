import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

// Closed, swept airfoil surfaces. These are visual 5-inch propellers, not
// manufacturer geometry or aerodynamic predictions. Dimensions are in mm.
export function createPropellerGeometry(handedness = 1) {
  const positions = [],
    indices = [],
    radial = 26,
    section = 24;
  for (let blade = 0; blade < 3; blade++) {
    const base = positions.length / 3,
      angle = (blade * Math.PI * 2) / 3;
    for (let i = 0; i <= radial; i++) {
      const t = i / radial;
      const radius = 5.5 + 57.5 * t;
      const chord =
        (8 + 13 * Math.sin(Math.PI * Math.pow(t, 0.72))) *
        (1 - 0.84 * Math.pow(t, 12));
      const twist = 0.65 - 0.43 * t;
      const sweep = 1.3 + 7.5 * t * t;
      for (let j = 0; j < section; j++) {
        const theta = (j / section) * Math.PI * 2;
        const u = (1 - Math.cos(theta)) / 2;
        const thickness =
          5 *
          0.11 *
          chord *
          (0.2969 * Math.sqrt(u) -
            0.126 * u -
            0.3516 * u * u +
            0.2843 * u * u * u -
            0.1036 * u * u * u * u);
        const camber = 0.025 * chord * Math.sin(Math.PI * u);
        const y = camber + (j <= section / 2 ? thickness : -thickness);
        const z = (u - 0.42) * chord;
        const twistedY = y * Math.cos(twist) - z * Math.sin(twist);
        const twistedZ = y * Math.sin(twist) + z * Math.cos(twist) + sweep;
        // Keep the complete swept tip within the 63.5 mm propeller envelope.
        const r = Math.min(radius, Math.sqrt(63.5 ** 2 - twistedZ ** 2));
        positions.push(
          r * Math.cos(angle) + twistedZ * Math.sin(angle),
          twistedY,
          -r * Math.sin(angle) + twistedZ * Math.cos(angle),
        );
      }
    }
    for (let i = 0; i < radial; i++)
      for (let j = 0; j < section; j++) {
        const a = base + i * section + j,
          b = base + i * section + ((j + 1) % section);
        indices.push(a, b, a + section, b, b + section, a + section);
      }
    for (const end of [0, radial]) {
      const ring = base + end * section,
        center = positions.length / 3;
      const average = [0, 0, 0];
      for (let j = 0; j < section; j++)
        for (let k = 0; k < 3; k++)
          average[k] += positions[(ring + j) * 3 + k] / section;
      positions.push(...average);
      for (let j = 0; j < section; j++) {
        const a = ring + j,
          b = ring + ((j + 1) % section);
        if (end === 0) indices.push(center, b, a);
        else indices.push(center, a, b);
      }
    }
  }
  if (handedness < 0) {
    for (let i = 2; i < positions.length; i += 3) positions[i] *= -1;
    for (let i = 0; i < indices.length; i += 3)
      [indices[i + 1], indices[i + 2]] = [indices[i + 2], indices[i + 1]];
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

// Lathed rings keep real bores and catch light across machined chamfers.
export function latheRing(inner, outer, height, segments = 48, bevel = 0.35) {
  const b = Math.min(bevel, height / 3, (outer - inner) / 3);
  return new THREE.LatheGeometry(
    [
      [inner, -height / 2 + b],
      [inner + b, -height / 2],
      [outer - b, -height / 2],
      [outer, -height / 2 + b],
      [outer, height / 2 - b],
      [outer - b, height / 2],
      [inner + b, height / 2],
      [inner, height / 2 - b],
      [inner, -height / 2 + b],
    ].map(([x, y]) => new THREE.Vector2(x, y)),
    segments,
  );
}

export function mergeParts(parts) {
  const normalized = parts.map((g) => {
    const n = g.index ? g.toNonIndexed() : g.clone();
    n.deleteAttribute("uv");
    n.deleteAttribute("normal");
    return n;
  });
  const merged = mergeGeometries(normalized);
  merged.computeVertexNormals();
  [...parts, ...normalized].forEach((g) => g.dispose());
  return merged;
}

export function createMotorGeometry() {
  const bell = [
    latheRing(10.9, 13.9, 3).translate(0, 3, 0),
    latheRing(10.9, 13.9, 2.2).translate(0, 13, 0),
  ];
  const copper = [];
  const crown = [latheRing(2.5, 6, 2).translate(0, 15.3, 0)];
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6;
    bell.push(
      new THREE.BoxGeometry(2.1, 8.8, 2.2).translate(12.6, 8, 0).rotateY(a),
    );
    crown.push(
      new THREE.BoxGeometry(9.2, 1.8, 2.2)
        .rotateZ(-0.14)
        .translate(9, 14.6, 0)
        .rotateY(a),
    );
    // Individual winding turns are visible through the bell's open windows.
    for (let turn = 0; turn < 3; turn++)
      copper.push(
        new THREE.TorusGeometry(2.5, 0.42, 5, 12)
          .rotateY(Math.PI / 2)
          .translate(8.9 + turn * 0.65, 7.9, 0)
          .rotateY(a),
      );
  }
  return {
    bell: mergeParts(bell),
    crown: mergeParts(crown),
    copper: mergeParts(copper),
  };
}

export function createStrapGeometry(width, height, bandWidth) {
  const r = 4.6,
    x = width / 2,
    y = height / 2;
  const shape = new THREE.Shape();
  function outline(path, w, h, radius) {
    path.moveTo(-w + radius, -h);
    path.lineTo(w - radius, -h);
    path.quadraticCurveTo(w, -h, w, -h + radius);
    path.lineTo(w, h - radius);
    path.quadraticCurveTo(w, h, w - radius, h);
    path.lineTo(-w + radius, h);
    path.quadraticCurveTo(-w, h, -w, h - radius);
    path.lineTo(-w, -h + radius);
    path.quadraticCurveTo(-w, -h, -w + radius, -h);
  }
  outline(shape, x + 1.1, y + 1.1, r + 1.1);
  const hole = new THREE.Path();
  outline(hole, x, y, r);
  shape.holes.push(hole);
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: bandWidth,
    bevelEnabled: false,
    curveSegments: 6,
  });
  g.translate(0, 0, -bandWidth / 2);
  return g;
}
