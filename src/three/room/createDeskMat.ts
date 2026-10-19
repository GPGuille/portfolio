import { Mesh, MeshStandardMaterial, RepeatWrapping } from "three";
import { createRoundedSlab } from "../geometry/createRoundedSlab";
import { palette } from "../palette";
import { createSpeckleTexture } from "../textures/createSpeckleTexture";

// Alfombrilla de fieltro gris antracita en estilo juguete: gruesa, con esquinas
// muy redondeadas y el canto suave (86 × 36 cm, 8 mm)
export const DESK_MAT_SIZE = { width: 0.86, depth: 0.36, thickness: 0.008 };

export const createDeskMat = () => {
  const { width, depth, thickness } = DESK_MAT_SIZE;

  const geometry = createRoundedSlab(width, depth, thickness, 0.035, 0.003);
  // La placa se crea de pie: se tumba sobre la mesa
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, thickness / 2, 0);

  // Las coordenadas de textura de la forma van en metros: una repetición por metro
  const felt = createSpeckleTexture({ base: palette.deskMat, dark: palette.deskMatDark, light: palette.deskMatLight }, 11);
  felt.wrapS = RepeatWrapping;
  felt.wrapT = RepeatWrapping;

  const mat = new Mesh(geometry, new MeshStandardMaterial({ map: felt, roughness: 1 }));
  mat.receiveShadow = true;
  return mat;
};
