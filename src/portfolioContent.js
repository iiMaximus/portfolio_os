export const profile = {
  name: "Maksym",
  github: "https://github.com/iiMaximus",
  university: "Politecnico di Torino",
  degree: "Bachelor’s in Mechanical Engineering",
  graduation: "July 2027",
};

export const apps = [
  {
    id: "allergify",
    name: "Allergify",
    category: "Food intelligence",
    verb: "Know what’s inside.",
    description:
      "Exploring how scanning, ingredient information, and a clear interface can make food easier to understand.",
    focus: ["Scanning flows", "Ingredient data", "Mobile interface"],
    color: "#c4e7b3",
    glyph: "scan",
  },
  {
    id: "absorb",
    name: "Absorb",
    category: "Learning tools",
    verb: "Make room for understanding.",
    description:
      "A learning app exploring how thoughtful structure and focused interactions can support a better study workflow.",
    focus: ["Study workflows", "Information design", "Focused interaction"],
    color: "#c9bde8",
    glyph: "book",
  },
  {
    id: "quarter",
    name: "Quarter",
    category: "Time & planning",
    verb: "A little more intentional.",
    description:
      "A planning app exploring the relationship between time, attention, and the next useful block of work.",
    focus: ["Scheduling logic", "Planning flows", "Product design"],
    color: "#f0c4a5",
    glyph: "clock",
  },
];

export const projects = [
  {
    id: "drone",
    number: "01",
    title: "The flight project.",
    discipline: "Mechanical engineering",
    status: "In development",
    summary:
      "A 5-inch FPV drone I designed from scratch in SolidWorks: carbon-fibre frame, component placement, and integration of the complete assembly.",
    intro:
      "I designed the frame and complete component layout in SolidWorks, then had the parts machined from carbon fibre. The motors, electronics, and video system are off-the-shelf components that I selected and integrated. The frame shown here is reconstructed from my five original DXF cutting files, retaining the outlines, holes, and slots. The electronics and upper payload are visual representations of the build.",
    facts: [
      ["My role", "Frame design & complete component integration"],
      ["CAD", "SolidWorks"],
      ["Stage", "Ongoing build"],
      ["Frame", "5 original DXF profiles → extruded STL"],
      ["Carbon stock", "2 mm plates / 6 mm arms (provisional)"],
      ["Electronics", "Mamba FC + S55 128K 55A ESC, adjacent mounts"],
      ["Propulsion", "2207 motors · 5-inch propellers"],
      ["Video", "DJI O4 Air Unit (Lite)"],
    ],
    notes: [
      [
        "The question",
        "How do the frame, propulsion, and electronics fit together as one coherent assembly?",
      ],
      [
        "The work",
        "Bottom plate, top plate, xplate, and mirrored front/rear arms are extruded from the supplied cut profiles. The FC and ESC use the two separate 30.5 mm mounting patterns on the xplate, at the same height. Arm angles follow the shared mounting holes.",
      ],
      [
        "What comes next",
        "Confirm the carbon thicknesses and vertical spacing, then add build photographs and test results. The generic FPV battery has approximate dimensions. The action camera is a planned accessory; its model and mount are illustrative.",
      ],
    ],
    download: {
      href: "/models/drone/drone-frame-stl.zip",
      label: "Download the frame STL files",
    },
  },
  {
    id: "apps",
    number: "02",
    title: "Small screens. Big questions.",
    discipline: "Software & product",
    status: "Ongoing development",
    summary:
      "Allergify, Absorb, and Quarter. Three ongoing apps exploring food, learning, and how we spend our time.",
    intro:
      "I developed all three apps independently with substantial help from AI coding tools. I’m now working on distribution. The handheld here shows illustrative interfaces; it is a way to explore the projects, rather than a live app demo.",
    facts: [
      ["Projects", "Allergify / Absorb / Quarter"],
      ["My role", "Independent development, with AI assistance"],
      ["Stage", "Development & distribution"],
      ["Focus", "Mobile products & interfaces"],
    ],
    notes: [
      [
        "Allergify",
        "Food intelligence, scanning flows, and ingredient information.",
      ],
      ["Absorb", "Structured study tools and a focused learning experience."],
      ["Quarter", "Time-aware planning and the next block of work."],
    ],
  },
  {
    id: "rocket",
    number: "03",
    title: "A new trajectory.",
    discipline: "Future exploration",
    status: "Planned project",
    summary:
      "A rocket is the next project I want to take on. For now, a direction to explore—with plenty still to learn.",
    intro:
      "I want to explore a rocket project next. It is currently an intention, rather than a completed design or build, and the semester timeline is still open.",
    facts: [
      ["Stage", "Early intention"],
      ["Timeline", "To be determined"],
      ["Visual", "Illustrative concept"],
    ],
    notes: [
      [
        "The starting point",
        "Define a realistic project scope and the questions I want the project to answer.",
      ],
      [
        "The learning",
        "Explore the relationship between geometry, structure, and flight through research and design.",
      ],
      [
        "The commitment",
        "Document the process honestly as the project develops. No build, testing, or performance results are claimed yet.",
      ],
    ],
  },
];
