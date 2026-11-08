# Maksym — Engineering & Software

An engineering portfolio built with React, Vite, React Three Fiber, Drei, and Three.js.

## Local development

```sh
npm run dev
npm run build
npm run preview
```

The development server is available at http://127.0.0.1:5173 (or the next free port printed by Vite). The production build is written to `dist/`.

## Experience

- An editorial portfolio with directly accessible project notes, published iOS apps, a planned rocket project, personal background and team experience, a CV reader and downloads, and contact details. Planned concepts and empty media collections are secondary to the current work.
- A detailed interactive drone with assembly, exploded, wireframe, pause, and reset controls.
- An optional **Enter the workbench** experience: choose physical objects to move the camera, inspect the drone assembly, change apps on the Palm-style handheld, open project notes, or start the desktop computer. The studio includes an oak worktop, ruled cutting mat, digital caliper, articulated lamp, keyboard, and measuring tools. Escape returns to the portfolio; arrow keys work when the scene is focused. Every object also has a keyboard-accessible navigation button.
- **Maksym OS** restores the original desktop, including its terminal, notes, utilities, and games. The CV and project links connect to the current portfolio. The email composer saves a local draft; it does not send email.
- App selectors support arrow keys, Home, and End. Native dialogs trap focus and restore it on close.
- Mobile layouts, reduced-motion preferences, lazy-loaded 3D, offscreen rendering suspension, and WebGL fallbacks.

## Drone geometry and content

`src/portfolioContent.js` holds project copy, App Store links, and contact details. The drone is manufactured, assembled, and has completed initial flights. Lychee and Absorb are published iOS apps; Lychee’s development is Maksym’s work, while distribution is shared with a friend. The rocket is an illustrative concept. The handheld shows screenshots from the Lychee product page and Absorb reader. The drone frame now uses the supplied cutting geometry; hardware components are dimensioned visual approximations, not manufacturer CAD.

The five original DXFs are preserved in `src/models/drone/cad/`. `scripts/convert_drone_dxf.py` converts their lines, arcs, circles and B-splines into closed profiles, keeping the holes and slots. It checks millimetre units, rejects unsupported geometry/open contours, and records hashes of the source files. Curve chord tolerance is 0.015 mm.

`src/models/drone/assemblyConfig.js` contains provisional **2 mm** plate and **6 mm** arm thicknesses, mounting-hole-based arm placement, 5-inch propeller radius, adjacent FC/ESC positions, and approximate component sizes. See `src/models/drone/README.md` for the reconstruction assumptions and the DJI dimension reference.

```sh
npm run build:drone
npm run test:geometry
npm run test:hardware
```

This regenerates the profiles, five individual STL parts, a frame assembly, and a downloadable ZIP in `public/models/drone/`. Geometry checks cover closed meshes, material volume, preserved holes/slots, source hashes, mounting alignment, propeller clearance, and clearance from the computer. STL coordinates are millimetres; set that unit explicitly when importing into CAD software.

The main viewer and workbench share the same model. Both have assembled, exploded and frame-only controls. The project drawing uses the original profiles too. `src/models/studioLayout.js` keeps model positions, camera targets, labels and stands aligned.

The main models live in `src/models/`; standalone object viewers and the shared workbench live in `src/components/`. Materials are generated locally. Typography uses Google Fonts with system fallbacks.

## CV and profile

The profile leads with third-year Mechanical Engineering at Politecnico di Torino and expected graduation in July 2027. The user supplied the drone design, manufacture, assembly, and initial-flight history; the Lychee/Absorb development roles; and the DRAFT/Squadra Corse experience. Aerospace remains a personal interest. No grade average, unmeasured drone performance, or estimated app usage/revenue is published.

`public/resume/Maksym-CV-2026.pdf` is the approved one-page CV, published unchanged. `Maksym-CV-2026.webp` is its rendered preview. `src/resumeData.json` mirrors the approved CV for the accessible text reader and About section. All current CV links, including the restored desktop, use this PDF. The contact section links to email and LinkedIn.

For future CV revisions, export and visually check the approved one-page PDF, render its preview, and update `src/resumeData.json` to match. Replace the two public assets and update the displayed revision date in `PortfolioEssentials.jsx`. The previous draft generator and public draft files have been retired so they cannot overwrite the approved design. The original editable document is kept locally under `output/cv/`; source documents are not served by Vite.

The restored desktop lives in `public/legacy-os/`. Its same-origin message bridge allows only named windows and portfolio sections. `src/models/Computer.jsx` supplies the physical computer, and `src/components/DesktopDialog.jsx` opens its working desktop.

## Component rendering

`manufacturedGeometry.js` builds closed, twisted airfoil surfaces for mirrored CW/CCW propellers, open motor bells, copper windings, chamfered rings, and continuous battery straps. Motor repetitions are merged by material; the four motor/blade geometry sets total 43,200 triangles. Small procedural decals and surface textures provide battery labels, textile stitching, camera displays, polymer grain, and woven carbon without downloaded images or scanned meshes. Camera optics use layered reflective surfaces without full-scene transmission passes. The existing offscreen rendering suspension, bounded pixel ratio, and lazy loading remain in place.

The hardware geometry check verifies finite vertices/normals, positive volume, closed blade surfaces, mirrored handedness, the five-inch radial envelope, and explicit triangle budgets. The source DXF profiles and downloadable STL parts are unchanged by this rendering pass. Battery, action camera, props, and other component details remain illustrative, not manufacturer CAD.
