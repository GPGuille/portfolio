import { CanvasTexture, SRGBColorSpace } from "three";
import type { SkillGroup } from "../../content/skills";

const PIXEL_FONT = '"ProFont", monospace';
const MAIN_FONT = '"Urbanist", system-ui, sans-serif';

// Texto de un post-it: el título en la fuente pixelada de la web y debajo la lista de skills.
// Fondo transparente: se pone encima del papel. Se redibuja al cargar las fuentes
export const createPostItTextTexture = ({ title, items }: SkillGroup, ink: string) => {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext("2d")!;
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;

  const draw = () => {
    context.clearRect(0, 0, 512, 512);
    context.fillStyle = ink;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = `700 84px ${PIXEL_FONT}`;
    context.fillText(title.toUpperCase(), 256, 100);
    context.fillRect(136, 158, 240, 8);
    context.font = `700 66px ${MAIN_FONT}`;
    items.slice(0, 4).forEach((item, index) => context.fillText(item, 256, 238 + index * 80));
    texture.needsUpdate = true;
  };

  draw();
  Promise.all([document.fonts.load(`700 40px ${PIXEL_FONT}`), document.fonts.load(`700 40px ${MAIN_FONT}`)])
    .then(draw)
    .catch(() => {});
  return texture;
};
