# Mechanical Workbench Portfolio

Interactive mechanical engineering portfolio prototype built with React, Vite, React Three Fiber, Drei, and Three.js.

## Run Locally

```bash
npm run dev
```

Vite serves the project at:

```text
http://127.0.0.1:5173/
```

If that port is already in use, Vite will print the next available local URL in the terminal.

## Current Concept

The main desktop experience is a scroll-driven 3D workbench:

- A drone assembles in a white void, then lands on the workbench.
- The camera tours mechanical artifacts, CAD-style blueprints, fixtures, prototype placeholders, and a mobile phone app showcase.
- The camera returns to a retro computer and transitions into the interactive Mac OS 7-inspired portfolio desktop.
- A "skip this bullshit and load normal portfolio" button loads a simpler portfolio view.
- Mobile browsers default to the normal portfolio to avoid an awkward 3D scroll experience.

## Useful Commands

```bash
npm run dev
npm run build
npm run preview
```

`npm run build` creates the production bundle in `dist/`.

`npm run preview` serves the production build locally after a build.

## Main Files

- `src/App.jsx`: 3D scene, scroll camera, workbench objects, Mac overlay, normal portfolio.
- `src/portfolioContent.js`: camera keyframes, timeline stops, disk data, mobile/software project content.
- `src/workbench.css`: cinematic layout, Mac overlay styling, normal portfolio styling.
- `public/legacy-os/`: the Mac OS 7-inspired interactive desktop.
