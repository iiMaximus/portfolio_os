DXF FRAME RECONSTRUCTION
Units: millimetres (STL itself does not encode units).

Original DXF profiles, including holes and slots, sampled to 0.015 mm chord tolerance.
Body plates are translated to the xplate datum; the original DXF files remain unchanged.
Bottom, top and xplate: provisional 2 mm thickness. Arms: provisional 6 mm thickness.
STLs retain the original XY cutting plane with positive Z thickness.
The frame assembly uses mounting-hole alignment for its arm angles.
Vertical spacing is provisional: bottom 0-2, arms 2-8, xplate 8-10, top 32-34 mm.
The assembly is a set of touching/separate parts, not a fused manufacturing solid.
These files are a visual reconstruction; confirm stock thickness and spacing before fabrication.

[
  {
    "part": "bottom",
    "source": "bottom_frame.DXF",
    "thicknessMm": 2,
    "holes": 14,
    "cutouts": 0,
    "triangles": 4164
  },
  {
    "part": "top",
    "source": "top_frame.DXF",
    "thicknessMm": 2,
    "holes": 12,
    "cutouts": 2,
    "triangles": 4348
  },
  {
    "part": "frontArm",
    "source": "front_arm_v7.dxf",
    "thicknessMm": 6,
    "holes": 6,
    "cutouts": 0,
    "triangles": 2068
  },
  {
    "part": "rearArm",
    "source": "rear_arm.dxf",
    "thicknessMm": 6,
    "holes": 7,
    "cutouts": 0,
    "triangles": 2312
  },
  {
    "part": "xplate",
    "source": "xplate.dxf",
    "thicknessMm": 2,
    "holes": 16,
    "cutouts": 0,
    "triangles": 5308
  }
]
