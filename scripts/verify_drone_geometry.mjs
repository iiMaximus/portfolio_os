import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { createCutGeometry } from "../src/models/drone/profileGeometry.js";
import {
  assembly,
  armPlacements,
  armPoint,
  motorPositions,
  boardPositions,
} from "../src/models/drone/assemblyConfig.js";
import { studioLayout } from "../src/models/studioLayout.js";
const data = JSON.parse(
  fs.readFileSync(
    new URL("../src/models/drone/frameProfiles.json", import.meta.url),
  ),
);
assert.equal(data.units, "mm");
function checkMesh(geometry, profile, thickness, name) {
  geometry.computeBoundingBox();
  const box = geometry.boundingBox;
  assert.ok(
    Math.abs(box.max.z - box.min.z - thickness) < 1e-5,
    `${name}: stock thickness`,
  );
  let volume = 0;
  const edges = new Map();
  const p = geometry.attributes.position;
  const key = (v) => v.map((n) => Math.round(n * 10000)).join(",");
  const topFaces = [];
  for (let i = 0; i < p.count; i += 3) {
    const v = [0, 1, 2].map((j) => [
      p.getX(i + j),
      p.getY(i + j),
      p.getZ(i + j),
    ]);
    const [a, b, c] = v;
    volume +=
      (a[0] * (b[1] * c[2] - b[2] * c[1]) +
        a[1] * (b[2] * c[0] - b[0] * c[2]) +
        a[2] * (b[0] * c[1] - b[1] * c[0])) /
      6;
    for (let j = 0; j < 3; j++) {
      const ends = [key(v[j]), key(v[(j + 1) % 3])].sort();
      if (ends[0] === ends[1]) continue;
      const id = ends.join("|");
      edges.set(id, (edges.get(id) || 0) + 1);
    }
    if (v.every((pt) => Math.abs(pt[2] - thickness) < 1e-5)) topFaces.push(v);
  }
  assert.ok(
    [...edges.values()].every((n) => n === 2),
    `${name}: each welded edge must have exactly two adjacent faces`,
  );
  const expected = profile.areaMm2 * thickness;
  assert.ok(
    Math.abs(volume - expected) / expected < 0.0005,
    `${name}: volume ${volume} vs cut area × stock ${expected}`,
  );
  function inTriangle(pt, [a, b, c]) {
    const sign = (p, q, r) =>
      (p[0] - r[0]) * (q[1] - r[1]) - (q[0] - r[0]) * (p[1] - r[1]);
    const ds = [sign(pt, a, b), sign(pt, b, c), sign(pt, c, a)];
    return ds.every((v) => v >= -1e-7) || ds.every((v) => v <= 1e-7);
  }
  for (const h of profile.holes)
    assert.ok(
      !topFaces.some((t) => inTriangle(h.center, t)),
      `${name}: hole was filled at ${h.center}`,
    );
  for (const loop of profile.cutouts) {
    const center = loop.reduce(
      (a, p) => [a[0] + p[0] / loop.length, a[1] + p[1] / loop.length],
      [0, 0],
    );
    assert.ok(
      !topFaces.some((t) => inTriangle(center, t)),
      `${name}: slot was filled`,
    );
  }
  return Math.round(volume);
}
for (const [name, profile] of Object.entries(data.profiles)) {
  const source = fs.readFileSync(
    new URL(`../src/models/drone/cad/${profile.source}`, import.meta.url),
  );
  assert.equal(
    crypto.createHash("sha256").update(source).digest("hex"),
    profile.sha256,
  );
  const thickness = name.endsWith("Arm") ? 6 : 2;
  const generated = createCutGeometry(profile, thickness);
  checkMesh(generated, profile, thickness, name);
  generated.dispose();
  const bytes = fs.readFileSync(
    new URL(
      `../public/models/drone/stl/${name}-${thickness}mm.stl`,
      import.meta.url,
    ),
  );
  const loaded = new STLLoader().parse(
    bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
  );
  const volume = checkMesh(loaded, profile, thickness, `${name} STL`);
  loaded.dispose();
  console.log(
    `${name}: closed mesh; holes/slots preserved; ${thickness} mm stock; ${volume} mm³`,
  );
}
const xholes = data.profiles.xplate.holes.map((h) => h.center);
for (const arm of armPlacements) {
  for (const hole of data.profiles[arm.profile].holes.filter(
    (h) => h.center[0] < 30,
  )) {
    const p = armPoint(hole.center, arm);
    assert.ok(
      xholes.some((q) => Math.hypot(p[0] - q[0], p[1] - q[1]) < 0.0001),
      `${arm.id}: mounting hole alignment`,
    );
  }
}
for (const board of boardPositions)
  for (const x of [-15.25, 15.25])
    for (const z of [-15.25, 15.25])
      assert.ok(
        xholes.some(
          (p) => Math.hypot(p[0] - x, p[1] - (board.center[1] + z)) < 0.0001,
        ),
        "FC/ESC mount alignment",
      );
assert.ok(
  Math.abs(boardPositions[0].center[1] - boardPositions[1].center[1]) >
    (boardPositions[0].length + boardPositions[1].length) / 2,
  "FC and ESC must be beside each other",
);
for (let i = 0; i < 4; i++)
  for (let j = i + 1; j < 4; j++)
    assert.ok(
      Math.hypot(
        motorPositions[i][0] - motorPositions[j][0],
        motorPositions[i][1] - motorPositions[j][1],
      ) >
        2 * assembly.propRadius,
      "5-inch propeller sweeps overlap",
    );
const drone = studioLayout.drone,
  yaw = -0.15,
  s = assembly.sceneScale * drone.scale;
const rightmost = Math.max(
  ...motorPositions.map(
    ([x, z]) =>
      drone.position[0] +
      (Math.cos(yaw) * x + Math.sin(yaw) * (z + assembly.centerZ)) * s +
      assembly.propRadius * s,
  ),
);
const computerLeft = studioLayout.computer.position[0] - 0.95;
assert.ok(
  computerLeft - rightmost > 0.5,
  "Drone rotor sweep must clear the computer and keyboard by at least 0.5 scene units",
);
console.log(
  `Mounting patterns aligned; props clear one another; computer/rotor clearance ${(computerLeft - rightmost).toFixed(2)} scene units.`,
);
