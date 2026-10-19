import { CanvasTexture, SRGBColorSpace } from "three";

type CertificateColors = { paper: string; ink: string; seal: string };

const bar = (context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) => {
  context.beginPath();
  context.roundRect(x - width / 2, y, width, height, height / 2);
  context.fill();
};

// Diploma simplificado: doble filete, título, unas líneas de texto, firma y sello dorado
export const createCertificateTexture = ({ paper, ink, seal }: CertificateColors) => {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 384;
  const context = canvas.getContext("2d")!;
  const center = canvas.width / 2;

  context.fillStyle = paper;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.strokeStyle = ink;
  context.globalAlpha = 0.5;
  context.lineWidth = 4;
  context.strokeRect(22, 22, canvas.width - 44, canvas.height - 44);
  context.lineWidth = 2;
  context.strokeRect(34, 34, canvas.width - 68, canvas.height - 68);

  context.globalAlpha = 0.85;
  context.fillStyle = ink;
  bar(context, center, 78, 250, 22);
  context.globalAlpha = 0.45;
  bar(context, center, 136, 320, 10);
  bar(context, center, 162, 280, 10);
  bar(context, center, 188, 300, 10);
  bar(context, center - 90, 290, 120, 8);

  context.globalAlpha = 1;
  context.fillStyle = seal;
  context.beginPath();
  context.arc(center + 110, 280, 34, 0, Math.PI * 2);
  context.fill();

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
};
