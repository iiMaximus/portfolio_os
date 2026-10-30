import assert from "node:assert/strict";
import * as THREE from "three";
import {
  createPropellerGeometry,
  createMotorGeometry,
  createStrapGeometry,
  latheRing,
} from "../src/models/drone/manufacturedGeometry.js";

function checkGeometry(g, name, maxTriangles) {
  const pos = g.getAttribute("position"),
    normal = g.getAttribute("normal");
  const triangles = (g.index?.count ?? pos.count) / 3;
  assert(
    triangles <= maxTriangles,
    `${name}: triangle budget exceeded (${triangles})`,
  );
  for (const array of [pos.array, normal.array])
    assert(
      Array.from(array).every(Number.isFinite),
      `${name}: non-finite vertex/normal`,
    );
  let volume = 0;
  const a = new THREE.Vector3(),
    b = new THREE.Vector3(),
    c = new THREE.Vector3();
  for (let i = 0; i < triangles * 3; i += 3) {
    a.fromBufferAttribute(pos, g.index ? g.index.getX(i) : i);
    b.fromBufferAttribute(pos, g.index ? g.index.getX(i + 1) : i + 1);
    c.fromBufferAttribute(pos, g.index ? g.index.getX(i + 2) : i + 2);
    volume += a.dot(b.cross(c)) / 6;
  }
  assert(volume > 0, `${name}: reversed winding or zero volume (${volume})`);
  console.log(
    `${name}: ${triangles} triangles; volume ${volume.toFixed(1)} mm³`,
  );
  return triangles;
}
const cw = createPropellerGeometry(1),
  ccw = createPropellerGeometry(-1);
let total = 0;
for (const [i, g] of [cw, ccw].entries()) {
  total += 2 * checkGeometry(g, `propeller ${i ? "CCW" : "CW"}`, 4000);
  const p = g.getAttribute("position");
  for (let j = 0; j < p.count; j++)
    assert(
      Math.hypot(p.getX(j), p.getZ(j)) <= 63.501,
      "Blade exceeds 5-inch diameter",
    );
  g.computeBoundingBox();
  assert(g.boundingBox.max.y - g.boundingBox.min.y > 5, "Blade lost twist");
  const edges = new Map();
  for (let j = 0; j < g.index.count; j += 3)
    for (let k = 0; k < 3; k++) {
      const a = g.index.getX(j + k),
        b = g.index.getX(j + ((k + 1) % 3)),
        key = [Math.min(a, b), Math.max(a, b)].join(":");
      edges.set(key, (edges.get(key) || 0) + 1);
    }
  assert(
    [...edges.values()].every((n) => n === 2),
    "Propeller blade surface is not closed",
  );
}
const a = cw.getAttribute("position"),
  b = ccw.getAttribute("position");
for (let i = 0; i < a.count; i++) {
  assert(
    Math.abs(a.getX(i) - b.getX(i)) < 1e-5 &&
      Math.abs(a.getY(i) - b.getY(i)) < 1e-5 &&
      Math.abs(a.getZ(i) + b.getZ(i)) < 1e-5,
    "CW/CCW geometry must be mirrored",
  );
}
const motor = createMotorGeometry();
for (const [name, g] of Object.entries(motor))
  total += 4 * checkGeometry(g, `motor ${name}`, 5000);
const strap = createStrapGeometry(35, 37, 11),
  ring = latheRing(2.6, 7, 4);
checkGeometry(strap, "battery strap", 600);
checkGeometry(ring, "chamfered hub", 1000);
assert(
  total < 50000,
  "Four motor/propeller sets exceed their combined geometry budget",
);
console.log(
  `Four motor/propeller sets: ${total} triangles; repeated motor details merged by material.`,
);
[cw, ccw, ...Object.values(motor), strap, ring].forEach((g) => g.dispose());
