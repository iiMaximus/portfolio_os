// All mechanical dimensions below are millimetres. Thicknesses and vertical
// spacing are provisional; XY cut geometry and mounting positions come from DXF.
export const assembly = {
  plateThickness: 2,
  armThickness: 6,
  topPlateHeight: 32,
  boardHeight: 15,
  propRadius: 63.5,
  sceneScale: 0.014,
  centerZ: 24.15,
  battery: { width: 34, height: 36, length: 80 },
  actionCamera: { width: 60, height: 42, depth: 29, planned: true },
};

export const armPlacements = [
  {
    id: "front-right",
    profile: "frontArm",
    mirror: 1,
    angle: Math.PI / 10,
    origin: [0, 12],
    motorDistance: 100,
  },
  {
    id: "front-left",
    profile: "frontArm",
    mirror: -1,
    angle: Math.PI / 10,
    origin: [0, 12],
    motorDistance: 100,
  },
  {
    id: "rear-right",
    profile: "rearArm",
    mirror: 1,
    angle: -Math.PI / 4,
    origin: [0, -12],
    motorDistance: 112,
  },
  {
    id: "rear-left",
    profile: "rearArm",
    mirror: -1,
    angle: -Math.PI / 4,
    origin: [0, -12],
    motorDistance: 112,
  },
];

export function armPoint([x, y], arm) {
  const c = Math.cos(arm.angle),
    s = Math.sin(arm.angle);
  return [
    arm.origin[0] + arm.mirror * (x * c - y * s),
    arm.origin[1] + x * s + y * c,
  ];
}
export const motorPositions = armPlacements.map((arm) =>
  armPoint([arm.motorDistance, 0], arm),
);
export const boardPositions = [
  { id: "fc", label: "MAMBA / FC", center: [0, 19.25], width: 36, length: 36 },
  { id: "esc", label: "S55 / 128K", center: [0, -25.8], width: 40, length: 40 },
];
export const standoffs = [
  [-13.5, 52.5],
  [13.5, 52.5],
  [-23, 8],
  [23, 8],
  [-13.5, -68],
  [13.5, -68],
];
