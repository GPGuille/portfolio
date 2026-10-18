import { Mesh, MeshStandardMaterial } from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { palette } from "../palette";
import { createWoodTexture } from "../textures/createWoodTexture";

// Tamaño pensado para que quepan monitor, teclado, ratón y alfombrilla con holgura;
// el grosor exagerado es parte del estilo "maqueta"
export const DESK_TOP_SIZE = { width: 1.8, depth: 0.8, thickness: 0.06 };

// Tablero de nogal que apoya sobre las dos cajoneras
export const createDeskTop = () => {
  const { width, depth, thickness } = DESK_TOP_SIZE;

  const deskTop = new Mesh(
    new RoundedBoxGeometry(width, thickness, depth, 3, 0.012),
    new MeshStandardMaterial({
      map: createWoodTexture({ base: palette.deskTop, dark: palette.deskTopGrainDark, light: palette.deskTopGrainLight }),
      roughness: 0.55,
    }),
  );
  deskTop.castShadow = true;
  deskTop.receiveShadow = true;

  return deskTop;
};
