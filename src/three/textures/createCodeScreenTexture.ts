import { CanvasTexture, SRGBColorSpace } from "three";
import { createRandom } from "./createRandom";

type ScreenColors = { background: string; panel: string; muted: string; syntax: string[] };

const roundedBar = (context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) => {
  context.beginPath();
  context.roundRect(x, y, width, height, height / 2);
  context.fill();
};

// Pantalla de un editor de código simplificado: barra de ventana, panel lateral
// y líneas de código como barras redondeadas de colores
export const createCodeScreenTexture = ({ background, panel, muted, syntax }: ScreenColors, seed = 5) => {
  const random = createRandom(seed);
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 576;
  const context = canvas.getContext("2d")!;

  context.fillStyle = background;
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Barra de la ventana con los tres botones
  context.fillStyle = panel;
  context.fillRect(0, 0, canvas.width, 44);
  syntax.slice(0, 3).forEach((color, index) => {
    context.fillStyle = color;
    context.beginPath();
    context.arc(28 + index * 26, 22, 8, 0, Math.PI * 2);
    context.fill();
  });

  // Panel lateral con la lista de archivos
  const sidebarWidth = 190;
  context.fillStyle = panel;
  context.fillRect(0, 44, sidebarWidth, canvas.height - 44);
  context.fillStyle = muted;
  for (let row = 0; row < 9; row++) {
    roundedBar(context, 26 + (row % 3 === 0 ? 0 : 18), 78 + row * 38, 70 + random() * 70, 12);
  }

  // Líneas de código: sangría variable y varios "tokens" de colores por línea
  const lineHeight = 30;
  for (let line = 0; line < 16; line++) {
    const y = 72 + line * lineHeight;
    if (random() < 0.12) continue;
    let x = sidebarWidth + 46 + Math.floor(random() * 4) * 32;
    const tokens = 1 + Math.floor(random() * 4);
    for (let token = 0; token < tokens; token++) {
      const width = 30 + random() * 110;
      context.fillStyle = syntax[Math.floor(random() * syntax.length)]!;
      roundedBar(context, x, y, width, 13);
      x += width + 14;
    }
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
};
