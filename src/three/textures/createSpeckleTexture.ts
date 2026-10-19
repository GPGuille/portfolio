import { CanvasTexture, SRGBColorSpace } from "three";
import { createRandom } from "./createRandom";

type SpeckleColors = { base: string; dark: string; light: string };

// Material moteado (corcho, fieltro…): miles de motas pequeñas más claras y más oscuras
// sobre el color base
export const createSpeckleTexture = ({ base, dark, light }: SpeckleColors, seed = 3) => {
  const random = createRandom(seed);
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const context = canvas.getContext("2d")!;

  context.fillStyle = base;
  context.fillRect(0, 0, canvas.width, canvas.height);

  for (let speck = 0; speck < 9000; speck++) {
    context.fillStyle = random() > 0.5 ? dark : light;
    context.globalAlpha = 0.15 + random() * 0.35;
    const size = 1 + random() * 4;
    context.fillRect(random() * canvas.width, random() * canvas.height, size, size * (0.5 + random()));
  }
  context.globalAlpha = 1;

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
};
