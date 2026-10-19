import { CanvasTexture, SRGBColorSpace } from "three";

type RugColors = { field: string; band: string; stripe: string; border: string };

// Dibujo de la alfombra (en proporción a su tamaño): borde de roble y, dentro, franjas anchas
// a lo largo alternando hueso y azul pastel, cada franja azul con un filete fino más oscuro
export const createRugTexture = ({ field, band, stripe, border }: RugColors, aspect: number) => {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = Math.round(2048 / aspect);
  const context = canvas.getContext("2d")!;
  const { width, height } = canvas;
  const edge = height * 0.045;

  context.fillStyle = border;
  context.fillRect(0, 0, width, height);

  const inner = { x: edge, y: edge, width: width - edge * 2, height: height - edge * 2 };
  context.save();
  context.beginPath();
  context.roundRect(inner.x, inner.y, inner.width, inner.height, edge * 1.5);
  context.clip();

  context.fillStyle = field;
  context.fillRect(inner.x, inner.y, inner.width, inner.height);

  // Siete franjas a lo ancho de la alfombra: hueso / azul / hueso / azul / hueso / azul / hueso
  const bands = 7;
  const bandHeight = inner.height / bands;
  for (let index = 1; index < bands; index += 2) {
    const y = inner.y + index * bandHeight;
    context.fillStyle = band;
    context.fillRect(inner.x, y, inner.width, bandHeight);
    context.fillStyle = stripe;
    const line = bandHeight * 0.08;
    context.fillRect(inner.x, y + bandHeight / 2 - line / 2, inner.width, line);
  }
  context.restore();

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
};
