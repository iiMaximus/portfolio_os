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

- An editorial portfolio with directly accessible project notes, ongoing software projects, a planned rocket project, personal background and team experience, a CV reader and downloads, and contact details. Planned concepts and empty media collections are secondary to the current work.
- A detailed interactive drone with assembly, exploded, wireframe, pause, and reset controls.
- An optional **Enter the workbench** experience: choose physical objects to move the camera, inspect the drone assembly, change apps on the Palm-style handheld, open project notes, or start the desktop computer. The studio includes an oak worktop, ruled cutting mat, digital caliper, articulated lamp, keyboard, and measuring tools. Escape returns to the portfolio; arrow keys work when the scene is focused. Every object also has a keyboard-accessible navigation button.
- **Maksym OS** restores the original desktop, including its terminal, notes, utilities, and games. The CV and project links connect to the current portfolio. The email composer saves a local draft; it does not send email.
- App selectors support arrow keys, Home, and End. Native dialogs trap focus and restore it on close.
- Mobile layouts, reduced-motion preferences, lazy-loaded 3D, offscreen rendering suspension, and WebGL fallbacks.

## Drone geometry and content

`src/portfolioContent.js` holds project copy and the existing GitHub link. Identity/contact fields remain placeholders. The rocket and app screens are illustrative. The drone frame now uses the supplied cutting geometry; hardware components are dimensioned visual approximations, not manufacturer CAD.

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

The profile leads with third-year Mechanical Engineering at Politecnico di Torino and expected graduation in July 2027. The user supplied the SolidWorks design/integration role, independent app development with AI assistance, and DRAFT/Squadra Corse experience. Aerospace is a personal interest, not a future qualification. Identity/contact details, academic results, languages, and measured project evidence remain explicit placeholders. Team website links were checked against the university's official student-team directory. The personal archive is collapsed until real collections are supplied.

`src/resumeData.json` is the shared source for the online CV and downloadable documents. After editing it, regenerate the PDF and editable text with Python and ReportLab:

```sh
python3 scripts/build_resume.py
```

The PDF is written to `output/pdf/Maksym-CV-draft.pdf` and copied into `public/resume/` alongside the editable text version. The script checks that the content fits one A4 page. Review the rendered document after substantive edits. Complete the bracketed fields before using it for applications.

The restored desktop lives in `public/legacy-os/`. Its same-origin message bridge allows only named windows and portfolio sections. `src/models/Computer.jsx` supplies the physical computer, and `src/components/DesktopDialog.jsx` opens its working desktop.

## Component rendering

`manufacturedGeometry.js` builds closed, twisted airfoil surfaces for mirrored CW/CCW propellers, open motor bells, copper windings, chamfered rings, and continuous battery straps. Motor repetitions are merged by material; the four motor/blade geometry sets total 43,200 triangles. Small procedural decals and surface textures provide battery labels, textile stitching, camera displays, polymer grain, and woven carbon without downloaded images or scanned meshes. Camera optics use layered reflective surfaces without full-scene transmission passes. The existing offscreen rendering suspension, bounded pixel ratio, and lazy loading remain in place.

The hardware geometry check verifies finite vertices/normals, positive volume, closed blade surfaces, mirrored handedness, the five-inch radial envelope, and explicit triangle budgets. The source DXF profiles and downloadable STL parts are unchanged by this rendering pass. Battery, action camera, props, and other component details remain illustrative, not manufacturer CAD.
