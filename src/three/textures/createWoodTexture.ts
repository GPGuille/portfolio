import { CanvasTexture, SRGBColorSpace } from "three";
import { createRandom } from "./createRandom";

type WoodColors = { base: string; dark: string; light: string };

// Veta de madera dibujada en un canvas: líneas onduladas a lo largo del tablero,
// sin imágenes externas
export const createWoodTexture = ({ base, dark, light }: WoodColors, seed = 7) => {
  const random = createRandom(seed);
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 512;
  const context = canvas.getContext("2d")!;

  context.fillStyle = base;
  context.fillRect(0, 0, canvas.width, canvas.height);

  for (let line = 0; line < 140; line++) {
    const y = random() * canvas.height;
    const amplitude = 2 + random() * 10;
    const frequency = 0.002 + random() * 0.004;
    const phase = random() * Math.PI * 2;

    context.strokeStyle = random() > 0.4 ? dark : light;
    context.globalAlpha = 0.08 + random() * 0.22;
    context.lineWidth = 1 + random() * 5;
    context.beginPath();
    for (let x = 0; x <= canvas.width; x += 16) {
      const wave = Math.sin(x * frequency + phase) * amplitude + Math.sin(x * frequency * 3.1 + phase) * amplitude * 0.3;
      if (x === 0) context.moveTo(x, y + wave);
      else context.lineTo(x, y + wave);
    }
    context.stroke();
  }
  context.globalAlpha = 1;

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
};
