// Shared object positions keep cameras, labels, models and their supports aligned.
// Drone placement reserves its full 5-inch rotor envelope, not just the body.
export const studioLayout = {
  drone: {
    position: [-3.25, 0.265, 0.25],
    scale: 0.72,
    pin: [-3.25, 1.55, 0.25],
    camera: [-0.9, 3.7, 5.6],
    target: [-3.25, 0.75, 0.25],
  },
  computer: {
    position: [0.1, 0.12, -1.45],
    scale: 1,
    pin: [0.1, 2.65, -1.45],
    camera: [-0.9, 2.9, 3.7],
    target: [0.1, 1.3, -1.45],
  },
  palm: {
    position: [2.05, 1.43, 1.05],
    scale: 0.72,
    pin: [2.05, 2.8, 1.05],
    camera: [2.9, 2.3, 5.95],
    target: [2.05, 1.36, 1.05],
    base: [2.05, 0.22, 1.05],
  },
  rocket: {
    position: [4.3, 1.43, -1],
    scale: 0.72,
    pin: [4.3, 3.13, -1],
    camera: [6.15, 2.9, 4.85],
    target: [4.3, 1.65, -1],
    base: [4.3, 0.155, -1],
    support: [4.3, 0.66, -1.23],
  },
};
