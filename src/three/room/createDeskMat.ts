import { ExtrudeGeometry, Mesh, MeshStandardMaterial, RepeatWrapping, Shape } from "three";
import { roundedRect } from "../geometry/roundedRect";
import { palette } from "../palette";
import { createSpeckleTexture } from "../textures/createSpeckleTexture";

// Alfombrilla de fieltro gris antracita, justa para teclado y ratón (80 × 32 cm, 4 mm),
// con las esquinas redondeadas y el canto suavizado
export const DESK_MAT_SIZE = { width: 0.8, depth: 0.32, thickness: 0.004 };

const CORNER_RADIUS = 0.02;
const EDGE = 0.0012;

export const createDeskMat = () => {
  const { width, depth, thickness } = DESK_MAT_SIZE;

  const outline = roundedRect(new Shape(), width - EDGE * 2, depth - EDGE * 2, CORNER_RADIUS);
  const geometry = new ExtrudeGeometry(outline, {
    depth: thickness - EDGE * 2,
    bevelEnabled: true,
    bevelThickness: EDGE,
    bevelSize: EDGE,
    bevelSegments: 3,
    curveSegments: 12,
  });
  // La forma se dibuja de pie: se tumba sobre la mesa con la cara superior arriba
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, EDGE, 0);

  // Las coordenadas de textura de la forma van en metros: una repetición por metro
  const felt = createSpeckleTexture({ base: palette.deskMat, dark: palette.deskMatDark, light: palette.deskMatLight }, 11);
  felt.wrapS = RepeatWrapping;
  felt.wrapT = RepeatWrapping;

  const mat = new Mesh(geometry, new MeshStandardMaterial({ map: felt, roughness: 1 }));
  mat.receiveShadow = true;
  return mat;
};
