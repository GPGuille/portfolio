import { CanvasTexture } from "three";

// Mancha de sombra difuminada (negro con transparencia): redonda para los pies del avatar y
// cuadrada con esquinas suaves para la pila de cubos
export const createSoftShadowTexture = (shape: "round" | "square") => {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const context = canvas.getContext("2d")!;
  context.filter = "blur(14px)";
  context.fillStyle = "#000";
  context.beginPath();
  if (shape === "round") context.ellipse(size / 2, size / 2, size * 0.32, size * 0.3, 0, 0, Math.PI * 2);
  else context.roundRect(size * 0.22, size * 0.22, size * 0.56, size * 0.56, size * 0.08);
  context.fill();
  return new CanvasTexture(canvas);
};
