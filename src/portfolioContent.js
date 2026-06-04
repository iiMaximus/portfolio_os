export const disks = [
  {
    id: "cad",
    label: "CAD",
    color: "#7bc7ff",
    accent: "#2b5f96",
    status: "CAD disk mounted: drone frames, assemblies, and drawings."
  },
  {
    id: "code",
    label: "Code",
    color: "#67e08a",
    accent: "#247547",
    status: "Code disk mounted: apps, interfaces, and tools."
  },
  {
    id: "photo",
    label: "Photo",
    color: "#ffc76a",
    accent: "#9c5a20",
    status: "Photo disk mounted: shoots, edits, and visual work."
  }
];

export const timelineStops = [
  {
    id: "drop",
    start: 0,
    end: 0.46,
    title: "Drone Assembly",
    detail: "Exploded CAD parts ease into a landed FPV prototype."
  },
  {
    id: "blueprints",
    start: 0.46,
    end: 0.64,
    title: "Blueprints",
    detail: "Drawings, layout studies, and the hardware thinking behind the build."
  },
  {
    id: "bench",
    start: 0.64,
    end: 0.83,
    title: "Workbench Tour",
    detail: "Fixtures, prototypes, measurements, and rough mechanical artifacts."
  },
  {
    id: "mobile",
    start: 0.83,
    end: 0.925,
    title: "Mobile Apps",
    detail: "A phone on the bench pauses the tour for app projects and product work."
  },
  {
    id: "media",
    start: 0.925,
    end: 0.945,
    title: "Digital Bench",
    detail: "Floppy disks and the retro machine hold CAD, code, and photography."
  },
  {
    id: "mac",
    start: 0.945,
    end: 1,
    title: "Mac OS Portfolio",
    detail: "The tour lands inside the interactive System 7 desktop."
  }
];

export const cameraKeyframes = [
  {
    t: 0,
    position: [-2.2, 1.5, 5.25],
    target: [-2.42, 1.2, 1.26],
    fov: 36
  },
  {
    t: 0.12,
    position: [-2.78, 1.55, 4.04],
    target: [-2.42, 1.3, 1.26],
    fov: 35
  },
  {
    t: 0.23,
    position: [-1.68, 1.48, 3.34],
    target: [-2.42, 1.34, 1.26],
    fov: 33
  },
  {
    t: 0.3,
    position: [-2.52, 1.9, 3.42],
    target: [-2.66, 1.14, 1.3],
    fov: 40
  },
  {
    t: 0.38,
    position: [-3.28, 1.48, 3.06],
    target: [-2.95, 0.9, 1.37],
    fov: 40
  },
  {
    t: 0.46,
    position: [-3.54, 1.3, 3.06],
    target: [-3.02, 0.84, 1.37],
    fov: 42
  },
  {
    t: 0.5,
    position: [-3.28, 1.62, 2.48],
    target: [-2.42, 0.7, 0.1],
    fov: 39
  },
  {
    t: 0.54,
    position: [-2.52, 2.58, 0.66],
    target: [-2.42, 0.68, 0.1],
    fov: 30
  },
  {
    t: 0.6,
    position: [-1.32, 1.38, 1.7],
    target: [-2.42, 0.68, 0.1],
    fov: 35
  },
  {
    t: 0.65,
    position: [-3.55, 1.34, 0.82],
    target: [-3.1, 0.98, -0.95],
    fov: 36
  },
  {
    t: 0.69,
    position: [-2.08, 1.38, 0.72],
    target: [-3.1, 0.98, -0.95],
    fov: 37
  },
  {
    t: 0.73,
    position: [-0.72, 1.35, 2.5],
    target: [0.1, 0.74, 1.12],
    fov: 38
  },
  {
    t: 0.77,
    position: [1.55, 1.2, 2.22],
    target: [0.92, 0.78, 1.02],
    fov: 33
  },
  {
    t: 0.81,
    position: [2.35, 1.25, 2.22],
    target: [2.38, 0.78, 0.62],
    fov: 35
  },
  {
    t: 0.835,
    position: [3.3, 1.34, 1.84],
    target: [2.35, 0.78, 0.62],
    fov: 37
  },
  {
    t: 0.86,
    position: [2.08, 1.38, 2.64],
    target: [3.05, 0.69, 1.02],
    fov: 39
  },
  {
    t: 0.878,
    position: [3.05, 2.42, 1.1],
    target: [3.05, 0.69, 1.02],
    fov: 28
  },
  {
    t: 0.902,
    position: [3.05, 2.42, 1.1],
    target: [3.05, 0.69, 1.02],
    fov: 28
  },
  {
    t: 0.92,
    position: [3.68, 1.36, 2.0],
    target: [3.05, 0.69, 1.02],
    fov: 36
  },
  {
    t: 0.94,
    position: [1.4, 1.5, 2.38],
    target: [0.18, 1.34, -0.68],
    fov: 42
  },
  {
    t: 0.955,
    position: [0.55, 1.6, 1.18],
    target: [0.18, 1.62, -0.56],
    fov: 31
  },
  {
    t: 0.98,
    position: [0.28, 1.67, 0.62],
    target: [0.18, 1.67, -0.56],
    fov: 25
  },
  {
    t: 0.995,
    position: [0.2, 1.67, 0.42],
    target: [0.18, 1.67, -0.56],
    fov: 22
  },
  {
    t: 1,
    position: [0.18, 1.67, 0.28],
    target: [0.18, 1.67, -0.56],
    fov: 20
  }
];

export const freePlayCamera = {
  position: [3.85, 2.35, 4.05],
  fov: 42
};

export const mobileApps = [
  {
    name: "Allergify",
    short: "scan",
    color: "#7bc7ff"
  },
  {
    name: "Quarter",
    short: "plan",
    color: "#67e08a"
  },
  {
    name: "Absorb",
    short: "learn",
    color: "#ffde59"
  }
];

export const softwareProjects = [
  {
    name: "Allergify",
    type: "Food intelligence app",
    detail: "Mobile-first product logic, scanning flows, and ingredient data."
  },
  {
    name: "Absorb",
    type: "Learning system",
    detail: "Structured study tools with focused interface design."
  },
  {
    name: "Quarter",
    type: "Time-aware planner",
    detail: "A practical scheduling app for planning the next block of work."
  }
];
