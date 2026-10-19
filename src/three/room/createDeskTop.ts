import { Mesh, MeshStandardMaterial } from "three";
import { createRoundedSlab } from "../geometry/createRoundedSlab";
import { palette } from "../palette";
import { createWoodTexture } from "../textures/createWoodTexture";

// Tamaño pensado para que quepan monitor, teclado, ratón y alfombrilla con holgura.
// Con las cajoneras de 70 cm, la mesa queda a 75 cm: altura estándar de escritorio
export const DESK_TOP_SIZE = { width: 1.8, depth: 0.8, thickness: 0.05 };

// Tablero de nogal en estilo juguete: esquinas redondeadas vistas desde arriba
// y cantos gorditos
export const createDeskTop = () => {
  const { width, depth, thickness } = DESK_TOP_SIZE;

  // Radio de esquina total 3 cm (1,6 de la forma + 1,4 del canto): el mismo que las cajoneras,
  // así sus esquinas quedan exactamente a ras y no asoman por debajo
  const geometry = createRoundedSlab(width, depth, thickness, 0.016, 0.014);
  // La placa se crea de pie: se tumba como tablero, centrada en su grosor
  geometry.rotateX(-Math.PI / 2);

  // Las coordenadas de textura de la forma van en metros (centradas en el tablero):
  // se escalan para que la veta ocupe el tablero entero sin repetirse
  const wood = createWoodTexture({ base: palette.deskTop, dark: palette.deskTopGrainDark, light: palette.deskTopGrainLight });
  wood.repeat.set(1 / width, 1 / depth);
  wood.offset.set(0.5, 0.5);

  const deskTop = new Mesh(geometry, new MeshStandardMaterial({ map: wood, roughness: 0.6 }));
  deskTop.castShadow = true;
  deskTop.receiveShadow = true;

  return deskTop;
};
