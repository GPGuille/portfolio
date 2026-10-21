import { CanvasTexture, SRGBColorSpace } from "three";
import type { SkillGroup } from "../../content/skills";
import type { Locale } from "../../i18n/messages";
import { drawSkillIcon } from "./drawSkillIcon";

const PIXEL_FONT = '"ProFont", monospace';

// Contenido de un post-it: icono grande y el título debajo en la fuente pixelada de la web.
// Fondo transparente: se pone encima del papel. Se redibuja al cargar la fuente y al cambiar de
// idioma (el título se traduce: "Herramientas" / "Tools"); un título largo se estrecha para caber
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
    drawSkillIcon(context, icon);
    context.restore();
    context.textAlign = "center";
    context.textBaseline = "middle";
    const locale: Locale = document.documentElement.lang === "en" ? "en" : "es";
    const text = title[locale].toUpperCase();
    let size = 92;
    context.font = `700 ${size}px ${PIXEL_FONT}`;
    while (context.measureText(text).width > 470 && size > 40) {
      size -= 2;
      context.font = `700 ${size}px ${PIXEL_FONT}`;
    }
    context.fillText(text, 256, 420);
    texture.needsUpdate = true;
  };

  draw();
  document.fonts.load(`700 40px ${PIXEL_FONT}`).then(draw).catch(() => {});
  new MutationObserver(draw).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  return texture;
};
