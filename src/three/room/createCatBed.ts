import { CylinderGeometry, Group, Mesh, MeshStandardMaterial, TorusGeometry } from "three";
import { palette } from "../palette";
import { createFurTexture } from "../textures/createFurTexture";
import { createCat } from "./createCat";

// Cama ovalada para mascota como la UTSÅDD de IKEA, en estilo juguete: un borde redondo continuo
// y gordito alrededor de un cojín, todo de peluche de pelo corto (con relieve de mechones).
// Mide 64 × 52 cm. Origen: centro de la base en el suelo
export const CAT_BED_SIZE = { diameter: 0.64, depth: 0.52 };

const BED_RIM = { radiusX: 0.25, radiusZ: 0.19, tube: 0.07 };

export const createCatBed = () => {
  const group = new Group();

  const plush = (base: string, seed: number, repeat: [number, number]) => {
    const { map, bumpMap } = createFurTexture({ base, dark: palette.catBedDark, light: palette.catBedLight }, seed);
    map.repeat.set(...repeat);
    bumpMap.repeat.set(...repeat);
    return new MeshStandardMaterial({ map, bumpMap, bumpScale: 2.5, roughness: 1 });
  };

  // Borde: un toro (aro) estirado en óvalo y algo aplastado, como un cojín
  const rim = new Mesh(new TorusGeometry(1, BED_RIM.tube / BED_RIM.radiusX, 24, 64), plush(palette.catBed, 31, [10, 1.5]));
  rim.rotation.x = -Math.PI / 2;
  rim.scale.set(BED_RIM.radiusX, BED_RIM.radiusZ, BED_RIM.radiusX * 0.85);
  rim.position.y = BED_RIM.tube * 0.85;
  rim.castShadow = true;
  rim.receiveShadow = true;

  const cushion = new Mesh(new CylinderGeometry(1, 1, 0.05, 48), plush(palette.catBedInner, 32, [2, 2]));
  cushion.scale.set(BED_RIM.radiusX, 1, BED_RIM.radiusZ);
  cushion.position.y = 0.025;
  cushion.receiveShadow = true;

  const cat = createCat();
  cat.position.y = 0.045;

  group.add(rim, cushion, cat);
  return group;
};
