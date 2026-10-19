import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from "three";
import { createRandom } from "./createRandom";

type FurColors = { base: string; dark: string; light: string };

// Peluche de pelo corto: miles de trazos finos y cortos en direcciones parecidas, unos más
// claros y otros más oscuros. Devuelve el color y un mapa de relieve (los mismos pelos en gris)
// para que con la luz se noten los mechones
export const createFurTexture = ({ base, dark, light }: FurColors, seed = 4) => {
  const size = 512;
  const color = document.createElement("canvas");
  const bump = document.createElement("canvas");
  color.width = color.height = bump.width = bump.height = size;
  const colorContext = color.getContext("2d")!;
  const bumpContext = bump.getContext("2d")!;

  colorContext.fillStyle = base;
  colorContext.fillRect(0, 0, size, size);
  bumpContext.fillStyle = "#808080";
  bumpContext.fillRect(0, 0, size, size);
  colorContext.lineCap = bumpContext.lineCap = "round";

  const random = createRandom(seed);
  for (let hair = 0; hair < 14000; hair++) {
    const x = random() * size;
    const y = random() * size;
    const angle = -Math.PI / 2 + (random() - 0.5) * 1.4;
    const length = 4 + random() * 7;
    const isLight = random() > 0.45;
    const endX = x + Math.cos(angle) * length;
    const endY = y + Math.sin(angle) * length;

    colorContext.strokeStyle = isLight ? light : dark;
    colorContext.globalAlpha = 0.25 + random() * 0.35;
    colorContext.lineWidth = 1 + random() * 1.2;
    colorContext.beginPath();
    colorContext.moveTo(x, y);
    colorContext.lineTo(endX, endY);
    colorContext.stroke();

    bumpContext.strokeStyle = isLight ? "#ffffff" : "#303030";
    bumpContext.globalAlpha = 0.35;
    bumpContext.lineWidth = colorContext.lineWidth;
    bumpContext.beginPath();
    bumpContext.moveTo(x, y);
    bumpContext.lineTo(endX, endY);
    bumpContext.stroke();
  }

  const map = new CanvasTexture(color);
  map.colorSpace = SRGBColorSpace;
  const bumpMap = new CanvasTexture(bump);
  for (const texture of [map, bumpMap]) {
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.anisotropy = 8;
  }
  return { map, bumpMap };
};
