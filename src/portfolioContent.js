import resume from "./resumeData.json";

export const profile = {
  name: "Maksym",
  fullName: resume.name,
  email: resume.contacts[0].label,
  github: "https://github.com/iiMaximus",
  university: "Politecnico di Torino",
  degree: "Bachelor’s in Mechanical Engineering",
  graduation: "July 2027",
};

export const apps = [
  {
    id: "lychee",
    name: "Lychee",
    category: "Food & cosmetics",
    status: "Available on iOS",
    url: "https://apps.apple.com/us/app/lychee-clean-food-scanner/id6755896152",
    verb: "Know what’s inside.",
    description:
      "Scan a food or cosmetics barcode to explore its ingredients, product score, and recommendations. I handle the app’s development and work on distribution with a friend, whose focus is promotion.",
    focus: ["Barcode scanning", "Ingredient information", "Product scoring"],
    color: "#c4e7b3",
    glyph: "scan",
  },
  {
    id: "absorb",
    name: "Absorb",
    category: "RSVP reading",
    status: "Available on iOS",
    url: "https://apps.apple.com/us/app/read-fast-absorb/id6759666710",
    verb: "One word at a time.",
    description:
      "A reading app that presents words one at a time using rapid serial visual presentation (RSVP). I built and released the app, turning a reading technique into a focused mobile experience.",
    focus: ["Word-by-word reading", "Focused presentation", "Mobile experience"],
    color: "#c9bde8",
    glyph: "book",
  },
];

export const projects = [
  {
    id: "drone",
    number: "01",
    title: "The flight project.",
    discipline: "Mechanical engineering",
    status: "Designed, built & flown",
    summary:
      "A custom 5-inch FPV drone, from an empty SolidWorks assembly to a flying carbon-fibre build. I designed the dead-cat frame, arranged manufacture, and assembled and integrated the complete drone.",
    intro:
      "I wanted a drone that could combine agile FPV flight with a forward-mounted cinematic camera. I designed the carbon-fibre frame and every component’s position in SolidWorks, prepared the cutting files, and arranged manufacture. I then assembled the frame, soldered the electronics, and integrated the off-the-shelf motors, flight controller, ESC, and video system. The drone is complete and has made its initial flights.",
    facts: [
      ["My role", "Frame design & complete component integration"],
      ["CAD", "SolidWorks"],
      ["Stage", "Manufactured, assembled & flown"],
      ["Frame", "Custom carbon-fibre dead-cat design"],
      ["Fabrication", "5 original DXF cutting profiles"],
      ["Electronics", "Mamba FC + S55 128K 55A ESC, adjacent mounts"],
      ["Propulsion", "2207 motors · 5-inch propellers"],
      ["Video", "DJI O4 Air Unit (Lite)"],
    ],
    notes: [
      [
        "Geometry & balance",
        "The dead-cat layout makes room for a forward camera. I positioned the battery towards the rear to balance that payload, considering the centres of gravity and thrust together. The design accommodates a future action camera; that accessory has not been purchased yet.",
      ],
      [
        "Packaging & manufacture",
        "Component fit, mounting positions, and assembly clearances drove the frame design. The FC and ESC sit side by side, and cut-outs reduce frame material. Taking the assembly through manufacture and soldering taught me as much about tolerances and basic electronics as it did about CAD.",
      ],
      [
        "Initial flights & further analysis",
        "The drone flies, but extensive flight testing is still ahead. I have not yet measured its mass or flight endurance. Those measurements and a more structured test programme are the next steps towards turning the build into an engineering study.",
      ],
      [
        "About the model",
        "The frame preserves the outlines, holes, and slots in my original DXFs. The model uses provisional 2 mm plates and 6 mm arms. Hardware, battery dimensions, and the planned action camera are visual approximations, rather than manufacturer CAD.",
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
    status: "Published iOS apps",
    summary:
      "Lychee and Absorb: two published iOS apps for product information and word-by-word reading. My current focus is distribution, especially for Lychee.",
    intro:
      "I built and released both apps with help from AI coding tools. For Lychee, I handle development and some distribution; a friend works with me, focusing on promotion. I’m now concentrating on getting the apps into people’s hands, especially Lychee. The handheld displays illustrative project cards, not live app screens.",
    facts: [
      ["Projects", "Lychee / Absorb"],
      ["My role", "App development, releases & distribution"],
      ["Stage", "Released on the App Store"],
      ["Focus", "Mobile products & interfaces"],
    ],
    notes: [
      [
        "Lychee",
        "A barcode scanner for food and cosmetics, bringing together ingredient information, product scoring, and recommendations. I build the app and share distribution work with a friend.",
      ],
      ["Absorb", "An RSVP reading app that presents words one at a time. I developed and published the app, shaping the reading technique into a focused mobile interface."],
      ["What I’m working on now", "Distribution and promotion, with most of my attention on Lychee: learning how to explain the product and reach people who find it useful."],
    ],
    links: apps.map(({ name, url }) => ({ label: `${name} on the App Store`, url })),
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
