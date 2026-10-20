import { CanvasTexture, SRGBColorSpace } from "three";
import { messages, type Locale } from "../../i18n/messages";
import { palette } from "../palette";

const PIXEL_FONT = '"ProFont", monospace';
const MAIN_FONT = '"Urbanist", system-ui, sans-serif';

// Pantalla del monitor: una ventana con su barra, la palabra "Proyectos" en la fuente pixelada de
// la web y tres carpetas, como invitando a abrirlos (la pantalla será el acceso a Proyectos).
// El idioma es el de la página al crearla. Las fuentes se cargan aparte: se redibuja al llegar
export const createProjectsScreenTexture = (aspect: number) => {
  const locale: Locale = document.documentElement.lang === "en" ? "en" : "es";
  const title = messages[locale].sections.projects;
  const hint = messages[locale].screen.hint;

  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = Math.round(1024 / aspect);
  const context = canvas.getContext("2d")!;
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;

  const draw = () => {
    const { width, height } = canvas;
    context.fillStyle = palette.screenBackground;
    context.fillRect(0, 0, width, height);

    const bar = height * 0.09;
    context.fillStyle = palette.screenBar;
    context.fillRect(0, 0, width, bar);
    palette.screenDots.forEach((color, index) => {
      context.fillStyle = color;
      context.beginPath();
      context.arc(bar * 0.6 + index * bar * 0.6, bar / 2, bar * 0.18, 0, Math.PI * 2);
      context.fill();
    });

    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = palette.screenText;
    context.font = `700 ${height * 0.17}px ${PIXEL_FONT}`;
    context.fillText(title.toUpperCase(), width / 2, height * 0.36);

    // Tres carpetas
    const folderWidth = width * 0.12;
    const folderHeight = folderWidth * 0.75;
    const gap = folderWidth * 0.55;
    const startX = width / 2 - (folderWidth * 3 + gap * 2) / 2;
    const y = height * 0.55;
    for (let index = 0; index < 3; index++) {
      const x = startX + index * (folderWidth + gap);
      context.fillStyle = palette.screenAccent;
      context.beginPath();
      context.roundRect(x, y, folderWidth * 0.45, folderHeight * 0.25, 6);
      context.roundRect(x, y + folderHeight * 0.15, folderWidth, folderHeight * 0.85, 8);
      context.fill();
    }

    context.fillStyle = palette.screenMuted;
    context.font = `500 ${height * 0.065}px ${MAIN_FONT}`;
    context.fillText(hint, width / 2, height * 0.86);
    texture.needsUpdate = true;
  };

  draw();
  Promise.all([document.fonts.load(`700 40px ${PIXEL_FONT}`), document.fonts.load(`500 40px ${MAIN_FONT}`)])
    .then(draw)
    .catch(() => {});

  return texture;
};
