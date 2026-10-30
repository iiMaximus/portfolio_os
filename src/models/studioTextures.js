import * as THREE from "three";

function texture(width, height, draw) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  draw(canvas.getContext("2d"), width, height);
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;
  return map;
}

export function oakTexture() {
  return texture(1024, 512, (c, w, h) => {
    c.fillStyle = "#98795a";
    c.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y++) {
      const wave = Math.sin(y * 0.18) * 5 + Math.sin(y * 0.036) * 8;
      const value = 124 + Math.sin(y * 0.9) * 10 + Math.sin(y * 0.04) * 14;
      c.strokeStyle = `rgba(${value + 34},${value + 5},${value - 24},.36)`;
      c.lineWidth = 0.6 + (y % 3) * 0.4;
      c.beginPath();
      c.moveTo(0, y);
      for (let x = 0; x < w; x += 12)
        c.lineTo(x, y + Math.sin(x * 0.009 + y * 0.015) * wave);
      c.stroke();
    }
    for (let j = 1; j < 5; j++) {
      c.fillStyle = "#2e24191a";
      c.fillRect(0, (j * h) / 5, w, 2);
    }
  });
}

export function matTexture() {
  return texture(1200, 850, (c, w, h) => {
    c.fillStyle = "#344d44";
    c.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 4)
      for (let x = 0; x < w; x += 4) {
        c.fillStyle = (x * 31 + y * 7) % 11 > 5 ? "#ffffff03" : "#00000003";
        c.fillRect(x, y, 2, 2);
      }
    for (let x = 40; x <= w - 40; x += 20) {
      c.strokeStyle = x % 100 === 40 ? "#a4bea66b" : "#a4bea62b";
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(x, 40);
      c.lineTo(x, h - 40);
      c.stroke();
    }
    for (let y = 40; y <= h - 40; y += 20) {
      c.strokeStyle = y % 100 === 40 ? "#a4bea66b" : "#a4bea62b";
      c.beginPath();
      c.moveTo(40, y);
      c.lineTo(w - 40, y);
      c.stroke();
    }
    c.strokeStyle = "#bed2ac70";
    c.lineWidth = 2;
    c.strokeRect(40, 40, w - 80, h - 80);
    c.font = "11px monospace";
    c.fillStyle = "#c7d6ba90";
    for (let x = 40; x < w - 40; x += 100)
      c.fillText(String((x - 40) / 20).padStart(2, "0"), x - 5, 30);
    c.font = "15px monospace";
    c.fillText("M / WORKBENCH", 60, h - 16);
    c.font = "11px monospace";
    c.fillText("CUT · MEASURE · MAKE", w - 220, h - 16);
    c.strokeStyle = "#c3d9b437";
    c.beginPath();
    c.moveTo(40, h - 40);
    c.lineTo(630, 40);
    c.stroke();
    c.beginPath();
    c.arc(w - 160, h - 160, 85, 0, Math.PI * 2);
    c.stroke();
  });
}

export function concreteTexture() {
  const map = texture(256, 256, (c, w, h) => {
    c.fillStyle = "#afafa4";
    c.fillRect(0, 0, w, h);
    let seed = 2701;
    const random = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    for (let i = 0; i < 17000; i++) {
      const v = Math.floor(130 + random() * 90);
      c.fillStyle = `rgba(${v},${v},${v - 6},.12)`;
      c.fillRect(random() * w, random() * h, 1 + random() * 2, 1);
    }
  });
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(42, 24);
  return map;
}

export function drawingTexture() {
  return texture(1000, 700, (c, w, h) => {
    c.fillStyle = "#eeebdd";
    c.fillRect(0, 0, w, h);
    c.strokeStyle = "#536452";
    c.lineWidth = 1.3;
    c.strokeRect(25, 25, w - 50, h - 50);
    c.strokeRect(25, h - 100, w - 50, 75);
    c.font = "17px monospace";
    c.fillStyle = "#536452";
    c.fillText("FRAME LAYOUT / WORKING STUDY", 47, h - 65);
    c.font = "12px monospace";
    c.fillText("M / ENGINEERING PORTFOLIO", 47, h - 40);
    c.fillText("ILLUSTRATIVE · NOT TO SCALE", 710, h - 40);
    c.translate(w / 2, h / 2 - 30);
    c.strokeRect(-65, -140, 130, 280);
    c.strokeRect(-43, -85, 86, 170);
    [
      [-220, -160],
      [220, -160],
      [-220, 160],
      [220, 160],
    ].forEach(([x, y]) => {
      c.beginPath();
      c.moveTo(Math.sign(x) * 55, Math.sign(y) * 85);
      c.lineTo(x, y);
      c.stroke();
      c.beginPath();
      c.arc(x, y, 86, 0, Math.PI * 2);
      c.stroke();
      c.beginPath();
      c.arc(x, y, 21, 0, Math.PI * 2);
      c.stroke();
      c.setLineDash([5, 5]);
      c.beginPath();
      c.moveTo(x - 100, y);
      c.lineTo(x + 100, y);
      c.moveTo(x, y - 100);
      c.lineTo(x, y + 100);
      c.stroke();
      c.setLineDash([]);
    });
    c.strokeStyle = "#6b79506b";
    c.beginPath();
    c.moveTo(-340, -265);
    c.lineTo(340, -265);
    c.moveTo(-340, -273);
    c.lineTo(-340, -257);
    c.moveTo(340, -273);
    c.lineTo(340, -257);
    c.stroke();
  });
}

export function caliperDisplay() {
  return texture(256, 100, (c) => {
    c.fillStyle = "#bdc8ad";
    c.fillRect(0, 0, 256, 100);
    c.fillStyle = "#253629";
    c.font = "63px monospace";
    c.fillText("0.00", 12, 72);
    c.font = "17px monospace";
    c.fillText("mm", 204, 75);
  });
}
