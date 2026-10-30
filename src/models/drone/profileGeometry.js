import * as THREE from "three";

// Extrusion is in true millimetres. The profile plane maps to X/Z, height to Y.
export function createCutGeometry(profile, thickness, transform = (p) => p) {
  const outer = profile.outer
    .map(transform)
    .map(([x, y]) => new THREE.Vector2(x, y));
  if (!THREE.ShapeUtils.isClockWise(outer)) outer.reverse();
  const shape = new THREE.Shape(outer);
  shape.closePath();
  for (const loop of profile.cutouts) {
    const contour = loop
      .map(transform)
      .map(([x, y]) => new THREE.Vector2(x, y));
    if (THREE.ShapeUtils.isClockWise(contour)) contour.reverse();
    const path = new THREE.Path(contour);
    path.closePath();
    shape.holes.push(path);
  }
  for (const hole of profile.holes) {
    const [x, y] = transform(hole.center);
    const path = new THREE.Path();
    path.absarc(x, y, hole.radius, 0, Math.PI * 2, false);
    shape.holes.push(path);
  }
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: false,
    curveSegments: 32,
    steps: 1,
  });
  return geometry;
}

export function createProfileGeometry(
  profile,
  thickness,
  transform = (p) => p,
) {
  const geometry = createCutGeometry(profile, thickness, transform);
  geometry.rotateX(Math.PI / 2);
  geometry.translate(0, thickness, 0);
  // Physical-size weave, shared across every differently sized frame component.
  const position = geometry.attributes.position,
    uv = geometry.attributes.uv;
  for (let i = 0; i < position.count; i++)
    uv.setXY(i, position.getX(i) / 16, position.getZ(i) / 16);
  uv.needsUpdate = true;
  geometry.computeBoundingBox();
  return geometry;
}
