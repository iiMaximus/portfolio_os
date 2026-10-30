import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as THREE from "three";
import { STLExporter } from "three/examples/jsm/exporters/STLExporter.js";
import { createCutGeometry } from "../src/models/drone/profileGeometry.js";
import {
  assembly,
  armPlacements,
  armPoint,
} from "../src/models/drone/assemblyConfig.js";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const data = JSON.parse(
  fs.readFileSync(path.join(root, "src/models/drone/frameProfiles.json")),
);
const out = path.join(root, "public/models/drone/stl");
fs.mkdirSync(out, { recursive: true });
const exporter = new STLExporter(),
  material = new THREE.MeshBasicMaterial();
const geometries = [],
  report = [];
function save(name, object) {
  object.updateMatrixWorld(true);
  const binary = exporter.parse(object, { binary: true });
  fs.writeFileSync(
    path.join(out, name),
    Buffer.from(binary.buffer, binary.byteOffset, binary.byteLength),
  );
}
for (const [key, profile] of Object.entries(data.profiles)) {
  const thickness = key.endsWith("Arm")
    ? assembly.armThickness
    : assembly.plateThickness;
  const geometry = createCutGeometry(profile, thickness);
  geometries.push(geometry);
  const mesh = new THREE.Mesh(geometry, material);
  save(`${key}-${thickness}mm.stl`, mesh);
  report.push({
    part: key,
    source: profile.source,
    thicknessMm: thickness,
    holes: profile.holes.length,
    cutouts: profile.cutouts.length,
    triangles: geometry.attributes.position.count / 3,
  });
}
const frame = new THREE.Group();
for (const [key, height] of [
  ["bottom", 0],
  ["xplate", 8],
  ["top", assembly.topPlateHeight],
]) {
  const geometry = createCutGeometry(
    data.profiles[key],
    assembly.plateThickness,
  );
  geometries.push(geometry);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.z = height;
  frame.add(mesh);
}
for (const arm of armPlacements) {
  const geometry = createCutGeometry(
    data.profiles[arm.profile],
    assembly.armThickness,
    (p) => armPoint(p, arm),
  );
  geometries.push(geometry);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.z = assembly.plateThickness;
  frame.add(mesh);
}
save("frame-assembly.stl", frame);
fs.writeFileSync(
  path.join(out, "README.txt"),
  `DXF FRAME RECONSTRUCTION\nUnits: millimetres (STL itself does not encode units).\n\nOriginal DXF profiles, including holes and slots, sampled to 0.015 mm chord tolerance.\nBody plates are translated to the xplate datum; the original DXF files remain unchanged.\nBottom, top and xplate: provisional 2 mm thickness. Arms: provisional 6 mm thickness.\nSTLs retain the original XY cutting plane with positive Z thickness.\nThe frame assembly uses mounting-hole alignment for its arm angles.\nVertical spacing is provisional: bottom 0-2, arms 2-8, xplate 8-10, top 32-34 mm.\nThe assembly is a set of touching/separate parts, not a fused manufacturing solid.\nThese files are a visual reconstruction; confirm stock thickness and spacing before fabrication.\n\n${JSON.stringify(report, null, 2)}\n`,
);
for (const geometry of geometries) geometry.dispose();
material.dispose();
console.log(JSON.stringify(report, null, 2));
