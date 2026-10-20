import { CanvasTexture, SRGBColorSpace } from "three";
import type { SkillGroup, SkillIcon } from "../../content/skills";

const PIXEL_FONT = '"ProFont", monospace';

// Llave inglesa de contorno (como los otros iconos, de línea): se dibuja la silueta rellena en un
// lienzo aparte (mango con el extremo redondeado y cabeza con la boca abierta arriba a la derecha) y
// se deja solo su borde: la silueta repetida alrededor menos la silueta en sí
const drawWrench = (context: CanvasRenderingContext2D) => {
  const size = 240;
  const silhouette = document.createElement("canvas");
  silhouette.width = silhouette.height = size;
  const shape = silhouette.getContext("2d")!;
  shape.translate(size / 2, size / 2);
  shape.fillStyle = "#000";
  shape.strokeStyle = "#000";
  shape.lineCap = "round";
  shape.lineWidth = 38;
  shape.beginPath();
  shape.moveTo(-62, 62);
  shape.lineTo(30, -30);
  shape.stroke();
  shape.beginPath();
  shape.arc(42, -42, 44, 0, Math.PI * 2);
  shape.fill();
  shape.globalCompositeOperation = "destination-out";
  shape.translate(42, -42);
  shape.rotate(Math.PI / 4);
  shape.fillRect(-17, -70, 34, 70);
  shape.beginPath();
  shape.arc(0, 0, 17, 0, Math.PI * 2);
  shape.fill();

  const outline = document.createElement("canvas");
  outline.width = outline.height = size;
  const ring = outline.getContext("2d")!;
  // Mismo grosor de línea que los otros iconos
  const thickness = 15;
  for (let step = 0; step < 24; step++) {
    const angle = (step / 24) * Math.PI * 2;
    ring.drawImage(silhouette, Math.cos(angle) * thickness, Math.sin(angle) * thickness);
  }
  ring.globalCompositeOperation = "destination-out";
  ring.drawImage(silhouette, 0, 0);
  // Teñir el borde con el color de la tinta
  ring.globalCompositeOperation = "source-in";
  ring.fillStyle = context.strokeStyle;
  ring.fillRect(0, 0, size, size);

  context.drawImage(outline, -size / 2, -size / 2);
};

// Iconos de línea gruesa dibujados en un cuadro de 200 × 200 con el centro en (0, 0)
const drawIcon = (context: CanvasRenderingContext2D, icon: SkillIcon) => {
  context.lineWidth = 16;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.beginPath();
  if (icon === "code") {
    // </>
    context.moveTo(-40, -50);
    context.lineTo(-90, 0);
    context.lineTo(-40, 50);
    context.moveTo(40, -50);
    context.lineTo(90, 0);
    context.lineTo(40, 50);
    context.moveTo(18, -70);
    context.lineTo(-18, 70);
    context.stroke();
  } else if (icon === "server") {
    // Tres módulos de servidor apilados, cada uno con su piloto
    for (const y of [-62, -12, 38]) {
      context.roundRect(-70, y, 140, 44, 10);
      context.moveTo(-40, y + 22);
      context.arc(-44, y + 22, 4, 0, Math.PI * 2);
    }
    context.stroke();
  } else if (icon === "database") {
    // Cilindro con dos franjas
    context.ellipse(0, -55, 70, 22, 0, 0, Math.PI * 2);
    context.moveTo(-70, -55);
    context.lineTo(-70, 55);
    context.ellipse(0, 55, 70, 22, 0, Math.PI, 0, true);
    context.lineTo(70, -55);
    context.moveTo(-70, 0);
    context.ellipse(0, 0, 70, 22, 0, Math.PI, 0, true);
    context.stroke();
  } else {
    drawWrench(context);
  }
};

// Contenido de un post-it: icono grande y el título debajo en la fuente pixelada de la web.
// Fondo transparente: se pone encima del papel. Se redibuja al cargar la fuente
export const createPostItTextTexture = ({ title, icon }: SkillGroup, ink: string) => {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext("2d")!;
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;

  const draw = () => {
    context.clearRect(0, 0, 512, 512);
    context.strokeStyle = ink;
    context.fillStyle = ink;
    context.save();
    context.translate(256, 190);
    context.scale(1.35, 1.35);
    drawIcon(context, icon);
    context.restore();
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = `700 92px ${PIXEL_FONT}`;
    context.fillText(title.toUpperCase(), 256, 420);
    texture.needsUpdate = true;
  };

  draw();
  document.fonts.load(`700 40px ${PIXEL_FONT}`).then(draw).catch(() => {});
  return texture;
};
