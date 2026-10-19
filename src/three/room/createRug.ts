import { Mesh, MeshStandardMaterial } from "three";
import { createRoundedSlab } from "../geometry/createRoundedSlab";
import { palette } from "../palette";
import { createRugTexture } from "../textures/createRugTexture";

// Alfombra grande en damero terracota y crema, gruesa como de lana tejida (4 cm, canto
// redondeado). Se sale de la pantalla por los lados para que la escena sea inmersiva
const SQUARE = 0.28;
const COLUMNS = 12;
const ROWS = 8;
export const RUG_SIZE = { width: SQUARE * COLUMNS, depth: SQUARE * ROWS, thickness: 0.04 };

export const createRug = () => {
  const { width, depth, thickness } = RUG_SIZE;

  const geometry = createRoundedSlab(width, depth, thickness, 0.06, 0.014);
  // La placa se crea de pie: se tumba en el suelo
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, thickness / 2, 0);

  // Coordenadas de textura en metros y centradas: se escalan para que el damero ocupe toda la alfombra
  const pattern = createRugTexture({ dark: palette.rugTerracotta, light: palette.rugCream }, COLUMNS, ROWS);
  pattern.repeat.set(1 / width, 1 / depth);
  pattern.offset.set(0.5, 0.5);

  // Las caras de arriba y abajo llevan el damero; el canto, un solo color (si no, el canto
  // estira el color del cuadro vecino y se ven bordes naranjas en cuadros crema)
  const rug = new Mesh(geometry, [
    new MeshStandardMaterial({ map: pattern, roughness: 1 }),
    new MeshStandardMaterial({ color: palette.rugBase, roughness: 1 }),
  ]);
  rug.receiveShadow = true;
  // El encuadre no la tiene en cuenta: puede salirse por los bordes de la pantalla
  rug.userData.bleeds = true;
  return rug;
};
