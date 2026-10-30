# DXF drone reconstruction

The five user-supplied DXFs are the source of the carbon contours, mounting holes, and cutouts. They use millimetres. Source files are unchanged; conversion translates the bottom/top drawing origins by `(5.1854304636, -1.9699633624)` to match the xplate datum. Circles remain analytic until mesh tessellation; other curves use a maximum 0.015 mm chord deviation.

## Confirmed input and provisional dimensions

- User's remembered carbon stock: **2 mm plates**, **6 mm arms**, both provisional. The xplate currently uses the same 2 mm stock as the other plates.
- Front arms: mirrored around the centreline at ±18° relative to the lateral axis. Rear arms: mirrored at 45°. These transforms align the source mounting holes; they are inferred from the cut geometry.
- 5-inch propellers, 2207-class motors. Motor appearance is generic because the manufacturer/model is unspecified.
- FC and ESC occupy the two **30.5 mm** square mounting patterns, centred at plan Y = 19.25 and -25.8 mm, at the same height. Board shapes/component placement are representative, not exact PCB CAD. The ESC label follows the user's **Mamba S55 128K, 55A × 4** identification; the exact FC model is unspecified.
- DJI O4 Air Unit (“Lite”): the camera envelope follows DJI's **13.44 × 12.36 × 16.50 mm** dimensions; transmission module **30 × 30 × 6 mm**. Reference: [DJI specifications](https://www.dji.com/o4-air-unit/specs). Its bracket, antenna, wiring route and mounting are illustrative.
- Generic FPV battery: **34 × 36 × 80 mm**, provisional. No capacity, cell count, or mass is claimed.
- Action camera: **planned**, not purchased. The generic **60 × 42 × 29 mm** representation and mount are placeholders, not a DJI Action 6 CAD model.
- Vertical frame stack: bottom 0–2 mm; arms 2–8 mm; xplate 8–10 mm; top 32–34 mm. Board height 15 mm. These vertical placements are reconstruction assumptions, since 2D DXF profiles do not encode them.

## Exports and checks

`npm run build:drone` runs the conversion, binary STL export, geometry validation, and ZIP packaging. The site builds directly from the same profiles, so its frame and the downloads share one source. STL parts retain the normalized XY cutting plane and positive Z stock thickness. The assembly export includes all seven carbon pieces (three plates and four arms), without electronics or fasteners; it is not a fused manufacturing solid.

Checks validate watertight part meshes, positive volume against the cut area times thickness, empty holes/slots, input hashes, arm and board mounting alignment, 5-inch rotor clearance, and clearance between the drone and computer. Confirm the provisional thicknesses and assembly spacing before fabrication.
