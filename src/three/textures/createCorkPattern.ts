import { createRandom } from "./createRandom";

// Corcho aglomerado dibujado en código: miles de granitos de varios marrones sobre una base, con
// poros oscuros. El dibujo se repite sin cortes (los granos que tocan un borde se dibujan también
// en el contrario). Sin three.js: lo usan la ventana de Skills (como imagen) y el corcho del
// tablón 3D (como textura), así los dos son el mismo corcho. Se genera una sola vez (~90 ms)
// Medida real de un mosaico: 21,7 cm (en la ventana de escritorio, 256 px de un tablón de 1180 px)
export const CORK_TILE_METERS = 0.217;
const SIZE = 512;
const BASE = "#a2633a";
const GRAINS = ["#b97a47", "#c98a55", "#8f5530", "#7c4626", "#ad6d3e", "#d39a62"];

let canvas: HTMLCanvasElement | null = null;
let dataUrl: string | null = null;

export const createCorkCanvas = () => {
  if (canvas) return canvas;
  canvas = document.createElement("canvas");
  canvas.width = canvas.height = SIZE;
  const context = canvas.getContext("2d");
  if (!context) return canvas;
  const random = createRandom(7);

  context.fillStyle = BASE;
  context.fillRect(0, 0, SIZE, SIZE);

  const blob = (x: number, y: number, radius: number, color: string, alpha: number) => {
    const rotation = random() * Math.PI;
    const squash = 0.5 + random() * 0.5;
    context.globalAlpha = alpha;
    context.fillStyle = color;
    for (const dx of [-SIZE, 0, SIZE]) {
      for (const dy of [-SIZE, 0, SIZE]) {
        if (x + dx < -radius || x + dx > SIZE + radius || y + dy < -radius || y + dy > SIZE + radius) continue;
        context.beginPath();
        context.ellipse(x + dx, y + dy, radius, radius * squash, rotation, 0, Math.PI * 2);
        context.fill();
      }
    }
  };

  // Granos grandes y suaves primero, luego los finos encima
  for (let index = 0; index < 1800; index++) {
    blob(random() * SIZE, random() * SIZE, 3 + random() * 4, GRAINS[Math.floor(random() * GRAINS.length)]!, 0.35);
  }
  for (let index = 0; index < 14000; index++) {
    blob(random() * SIZE, random() * SIZE, 0.7 + random() * 1.9, GRAINS[Math.floor(random() * GRAINS.length)]!, 0.55 + random() * 0.4);
  }
  // Poros: puntitos oscuros entre los granos
  for (let index = 0; index < 2200; index++) {
    blob(random() * SIZE, random() * SIZE, 0.5 + random() * 1.1, "#4f2a14", 0.55);
  }

  context.globalAlpha = 1;
  return canvas;
};

export const createCorkPattern = () => (dataUrl ??= createCorkCanvas().toDataURL("image/webp", 0.9));
