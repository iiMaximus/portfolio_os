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
    title: "Palm Pilot Apps",
    detail: "A retro PDA on the bench pauses the tour for app projects and product work."
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

export const blueprintProjects = [
  {
    id: "fpv",
    title: "FPV Drone",
    accent: "#bdeeff",
    paper: "#0d5a91",
    detail: "Frame geometry, prop clearance, electronics layout."
  },
  {
    id: "fixture",
    title: "Fixture Jig",
    accent: "#c8ffd7",
    paper: "#145f43",
    detail: "Locating pins, clamp travel, repeatable assembly setup."
  },
  {
    id: "juice",
    title: "Juice Mechanism",
    accent: "#ffe7a8",
    paper: "#8d5c18",
    detail: "Rollers, feed path, enclosure and service access."
  }
];

export const workbenchProjects = [
  {
    id: "drone",
    title: "FPV Drone Prototype",
    eyebrow: "Physical build",
    detail: "A compact drone assembly used to show frame layout, prop clearance, electronics packaging, and CAD-to-bench thinking.",
    anchor: [-3.02, 1.0, 1.37],
    stats: ["Frame and rotor layout", "Assembly order study", "CAD viewer planned"]
  },
  {
    id: "blueprints",
    title: "Blueprint Stack",
    eyebrow: "Design documentation",
    detail: "A rotating set of drawings for favorite mechanical projects. This will become the place to inspect real CAD drawings and notes.",
    anchor: [-2.42, 0.78, 0.1],
    stats: ["3 project sheets", "Expandable drawing stack", "Future drawing picker"]
  },
  {
    id: "fixture",
    title: "Fixture Jig",
    eyebrow: "Manufacturing aid",
    detail: "A placeholder for locating pins, clamp travel, and repeatable assembly setups. Good for showing practical engineering judgment.",
    anchor: [0.92, 1.02, 1.02],
    stats: ["Locating surfaces", "Clamp clearance", "Repeatability story"]
  },
  {
    id: "gearbox",
    title: "Gearbox Study",
    eyebrow: "Mechanism concept",
    detail: "A small mechanism placeholder for gear trains, tolerances, and motion-transfer decisions.",
    anchor: [2.38, 1.0, 0.62],
    stats: ["Gear placement", "Housing concept", "Motion path"]
  },
  {
    id: "juice",
    title: "Juice Machine",
    eyebrow: "Product mechanism",
    detail: "A machine concept for rollers, feed path, enclosure layout, and service access. This can become a polished product case study.",
    anchor: [3.32, 1.12, -1.36],
    stats: ["Roller path", "Enclosure sketch", "Service access"]
  },
  {
    id: "actuator",
    title: "Linear Actuator",
    eyebrow: "Motion hardware",
    detail: "A bench artifact for guided linear motion, rod support, brackets, and mechanical packaging decisions.",
    anchor: [1.78, 0.82, -1.2],
    stats: ["Rod support", "Bracket geometry", "Motion envelope"]
  },
  {
    id: "mobile",
    title: "Palm Pilot App Showcase",
    eyebrow: "Retro software projects",
    detail: "A Palm-style PDA on the workbench for mobile products like Allergify, Absorb, and Quarter, without forcing every visitor into the OS.",
    anchor: [3.05, 0.88, 1.02],
    stats: ["Mobile app portfolio", "Product decisions", "Retro PDA wrapper"]
  }
];

export const cameraKeyframes = [
  {
    t: 0,
    position: [-2.38, 1.28, 5.0],
    target: [-2.8, 1.04, 1.24],
    fov: 40
  },
  {
    t: 0.12,
    position: [-2.96, 1.3, 4.0],
    target: [-2.8, 1.08, 1.24],
    fov: 38
  },
  {
    t: 0.23,
    position: [-1.82, 1.34, 3.34],
    target: [-2.8, 1.04, 1.24],
    fov: 35
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
    position: [-3.42, 1.76, 2.82],
    target: [-2.42, 0.7, 0.1],
    fov: 43
  },
  {
    t: 0.54,
    position: [-2.68, 3.08, 1.08],
    target: [-2.42, 0.68, 0.1],
    fov: 42
  },
  {
    t: 0.6,
    position: [-1.12, 1.58, 2.02],
    target: [-2.42, 0.68, 0.1],
    fov: 41
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
    position: [2.5, 1.36, 2.38],
    target: [3.05, 0.69, 1.02],
    fov: 38
  },
  {
    t: 0.878,
    position: [3.05, 2.28, 1.42],
    target: [3.05, 0.69, 1.02],
    fov: 35
  },
  {
    t: 0.905,
    position: [3.05, 2.28, 1.42],
    target: [3.05, 0.69, 1.02],
    fov: 35
  },
  {
    t: 0.923,
    position: [3.4, 1.32, 2.1],
    target: [3.05, 0.69, 1.02],
    fov: 36
  },
  {
    t: 0.94,
    position: [1.28, 1.48, 2.28],
    target: [0.18, 1.5, -0.61],
    fov: 40
  },
  {
    t: 0.955,
    position: [0.52, 1.58, 1.12],
    target: [0.18, 1.62, -0.61],
    fov: 30
  },
  {
    t: 0.98,
    position: [0.28, 1.67, 0.58],
    target: [0.18, 1.67, -0.61],
    fov: 23
  },
  {
    t: 0.995,
    position: [0.2, 1.67, 0.39],
    target: [0.18, 1.67, -0.61],
    fov: 21
  },
  {
    t: 1,
    position: [0.18, 1.67, 0.26],
    target: [0.18, 1.67, -0.61],
    fov: 19
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
    detail: "Mobile-first product logic, scanning flows, and ingredient data.",
    status: "Mobile app",
    links: ["Product case study", "Interface flow", "Data model"]
  },
  {
    name: "Absorb",
    type: "Learning system",
    detail: "Structured study tools with focused interface design.",
    status: "Learning tool",
    links: ["Study workflow", "UI system", "Product notes"]
  },
  {
    name: "Quarter",
    type: "Time-aware planner",
    detail: "A practical scheduling app for planning the next block of work.",
    status: "Planner",
    links: ["Scheduling logic", "Mobile prototype", "Roadmap"]
  }
];

export const normalPortfolioStats = [
  { value: "CAD", label: "assemblies, drawings, and mechanism studies" },
  { value: "Build", label: "prototypes, fixtures, test rigs, and bench notes" },
  { value: "Apps", label: "mobile products and small software systems" },
  { value: "Media", label: "photography, videography, and visual storytelling" }
];

export const engineeringProjectCards = [
  {
    id: "fpv-drone",
    title: "FPV Drone Prototype",
    category: "Mechanical assembly",
    summary:
      "Frame layout, prop clearance, electronics packaging, assembly order, and CAD-to-bench iteration for a compact FPV drone.",
    deliverables: ["CAD assembly", "Exploded view", "Blueprint sheet", "Build notes"],
    files: ["STEP / Fusion archive", "Drawing packet", "Photo build log"],
    status: "Hero project"
  },
  {
    id: "juice-mechanism",
    title: "Juice Mechanism",
    category: "Product mechanism",
    summary:
      "Roller path, feed geometry, service access, enclosure thinking, and manufacturable layout studies for a machine concept.",
    deliverables: ["Mechanism sketch", "CAD model", "Motion notes", "Service layout"],
    files: ["CAD viewer", "Drawing sheet", "Design rationale"],
    status: "Case study"
  },
  {
    id: "fixture-jig",
    title: "Fixture Jig",
    category: "Manufacturing aid",
    summary:
      "Locating pins, clamp travel, repeatable assembly setup, and tolerance-aware decisions for holding parts accurately.",
    deliverables: ["Fixture CAD", "Tolerance notes", "Process steps", "Hardware list"],
    files: ["STEP file", "Dimensioned drawing", "Assembly notes"],
    status: "Bench project"
  }
];

export const mediaPortfolio = [
  {
    title: "Photography",
    type: "Still image archive",
    detail: "Product-style shots, build documentation, experiments, and visual studies that show craft and attention to detail.",
    items: ["Project photos", "Detail shots", "Edited sets"]
  },
  {
    title: "Videography",
    type: "Motion and process",
    detail: "Short videos for build progress, prototype movement, cinematic edits, and social-friendly project storytelling.",
    items: ["Assembly clips", "Mechanism demos", "Edited reels"]
  },
  {
    title: "Visual Documentation",
    type: "Engineering communication",
    detail: "Blueprints, annotated screenshots, CAD captures, diagrams, and clean explanations for technical readers.",
    items: ["CAD renders", "Annotated drawings", "Explainer panels"]
  }
];

export const computerPortfolioContents = [
  {
    folder: "CV",
    description: "The direct recruiter payload: resume download, quick bio, skills, and contact links.",
    contents: ["Download CV", "About Me", "Contact"]
  },
  {
    folder: "Projects",
    description: "Mechanical case studies with CAD viewers, CAD file downloads, drawings, photos, and engineering notes.",
    contents: ["FPV Drone", "Juice Mechanism", "Fixture Jig"]
  },
  {
    folder: "Apps",
    description: "Software side projects and mobile products, separated from the physical workbench but still easy to reach.",
    contents: ["Allergify", "Absorb", "Quarter"]
  },
  {
    folder: "Media",
    description: "Photography and videography work for visual craft, product documentation, and project storytelling.",
    contents: ["Photo Sets", "Video Reels", "Visual Studies"]
  },
  {
    folder: "Terminal",
    description: "A playful command-line layer for easter eggs, quick links, and hidden portfolio shortcuts.",
    contents: ["help", "print cv", "open apps", "whoami"]
  }
];

export const contactLinks = [
  { label: "Email", value: "hello@maksym.dev", href: "mailto:hello@maksym.dev" },
  { label: "GitHub", value: "github.com/iiMaximus", href: "https://github.com/iiMaximus" },
  { label: "LinkedIn", value: "linkedin.com", href: "https://www.linkedin.com/" }
];
