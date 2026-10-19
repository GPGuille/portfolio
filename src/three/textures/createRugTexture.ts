import { CanvasTexture, SRGBColorSpace } from "three";
import { createRandom } from "./createRandom";

type RugColors = { dark: string; light: string };

// Damero de lana: cuadros alternos con un grano de tejido sutil (puntadas más claras y más
// oscuras) para que se lea como alfombra y no como papel. columns × rows cuadros
export const createRugTexture = ({ dark, light }: RugColors, columns: number, rows: number) => {
  const random = createRandom(9);
  const cell = 128;
  const canvas = document.createElement("canvas");
  canvas.width = columns * cell;
  canvas.height = rows * cell;
  const context = canvas.getContext("2d")!;

  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      context.fillStyle = (row + column) % 2 === 0 ? dark : light;
      context.fillRect(column * cell, row * cell, cell, cell);
    }
  }

  // Grano del tejido: trazos cortos en filas, como las puntadas de una alfombra de lana
  for (let stitch = 0; stitch < canvas.width * canvas.height * 0.02; stitch++) {
    context.fillStyle = random() > 0.5 ? "#ffffff" : "#000000";
    context.globalAlpha = 0.03 + random() * 0.05;
    context.fillRect(random() * canvas.width, random() * canvas.height, 2 + random() * 3, 1.5);
  }
  context.globalAlpha = 1;

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
};
