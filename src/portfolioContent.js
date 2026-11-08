import resume from "./resumeData.json";

export const profile = {
  name: "Maksym",
  fullName: resume.name,
  email: resume.contacts[0].label,
  university: "Politecnico di Torino",
  degree: "Bachelor’s in Mechanical Engineering",
  graduation: "July 2027",
};

export const apps = [
  {
    id: "lychee",
    name: "Lychee",
    url: "https://apps.apple.com/us/app/lychee-clean-food-scanner/id6755896152",
    verb: "Food and cosmetics scanner",
    screen: "/screens/lychee.webp",
    screenCaption: "Lychee · Product scan",
    description:
      "Lychee turns a barcode scan into an ingredient list, a product score, and recommendations. I write the app. A friend and I share distribution, and he leads promotion.",
    color: "#c4e7b3",
    glyph: "scan",
  },
  {
    id: "absorb",
    name: "Absorb",
    url: "https://apps.apple.com/us/app/read-fast-absorb/id6759666710",
    verb: "Word-by-word reader",
    screen: "/screens/absorb.webp",
    screenCaption: "Absorb · Reading view",
    description:
      "Absorb displays one word at a time at a chosen reading speed. I built the reader around this technique, called rapid serial visual presentation (RSVP).",
    color: "#c9bde8",
    glyph: "book",
  },
];

export const projects = [
  {
    id: "drone",
    number: "01",
    title: "5-inch FPV drone",
    discipline: "Mechanical engineering",
    status: "Designed, built & flown",
    summary:
      "I designed the frame in SolidWorks and sent the DXFs out for carbon-fibre machining. When the parts arrived, I assembled the drone, soldered the electronics, and flew it.",
    intro:
      "I wanted a 5-inch quad that I could fly for fun and eventually use for filming. I drew the frame around the motors, boards, and camera I’d chosen. Five DXFs went to the machine shop. I soldered the electronics and assembled the finished carbon parts myself.",
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
        "The dead-cat layout makes room for a forward camera. I positioned the battery towards the rear to balance that payload, considering the centres of gravity and thrust together. The action camera shown in the model is planned.",
      ],
      [
        "Packaging & manufacture",
        "I put the flight controller and ESC side by side on separate mounts. Cut-outs in the plates remove material while leaving room for wiring and fasteners.",
      ],
      [
        "Initial flights & further analysis",
        "I’ve completed the first flights. I haven’t yet recorded all-up mass or flight time. I’d like to measure how far the balance point moves when I reposition the battery.",
      ],
      [
        "About the model",
        "The frame preserves the outlines, holes, and slots in my original DXFs. The model uses provisional 2 mm plates and 6 mm arms. The electronics, battery, and planned camera are approximate models.",
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
    title: "Lychee and Absorb",
    discipline: "Software & product",
    status: "Published iOS apps",
    summary:
      "Lychee scans products. Absorb presents text one word at a time. Select an app to see its screen.",
    intro:
      "I developed and released both apps with help from AI coding tools. A friend and I work together on Lychee. I handle the code and help with distribution. He spends more of his time on promotion.",
    facts: [
      ["Projects", "Lychee / Absorb"],
      ["My role", "App development, releases & distribution"],
      ["Stage", "Released on the App Store"],
    ],
    notes: [
      [
        "Lychee",
        "A barcode scanner for food and cosmetics, bringing together ingredient information, product scoring, and recommendations. I build the app and share distribution work with a friend.",
      ],
      ["Absorb", "I built the reader so the words appear in the same position as the text advances. Readers can change the pace and pause on a word."],
    ],
    links: apps.map(({ name, url }) => ({ label: `${name} on the App Store`, url })),
  },
  {
    id: "rocket",
    number: "03",
    title: "Model rocket",
    discipline: "Rocketry",
    status: "Planned",
    summary: "I’d like to build a model rocket after the drone study.",
    intro: "I’m interested in designing a model rocket. The 3D object on the desk is a concept.",
    facts: [["Stage", "Idea"], ["Schedule", "Open"]],
    notes: [],
  },
];
