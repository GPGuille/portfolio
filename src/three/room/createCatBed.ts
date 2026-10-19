import { CylinderGeometry, Group, Mesh, MeshStandardMaterial, TorusGeometry } from "three";
import { palette } from "../palette";
import { createCat } from "./createCat";

// Cama redonda para mascota inspirada en la UTSÅDD de IKEA, en estilo juguete: borde alto y
// mullido alrededor de un cojín, algo más grande que la real (58 cm) para que el gato quepa
// enroscado. Origen: centro de la base en el suelo
export const CAT_BED_SIZE = { diameter: 0.58, height: 0.13 };

const RIM_TUBE = 0.075;

export const createCatBed = () => {
  const group = new Group();
  const plush = new MeshStandardMaterial({ color: palette.catBed, roughness: 1 });
  const inner = new MeshStandardMaterial({ color: palette.catBedInner, roughness: 1 });

  const rimRadius = CAT_BED_SIZE.diameter / 2 - RIM_TUBE;
  const rim = new Mesh(new TorusGeometry(rimRadius, RIM_TUBE, 20, 48), plush);
  rim.rotation.x = -Math.PI / 2;
  // Algo aplastado, como un cojín
  rim.scale.z = 0.85;
  rim.position.y = RIM_TUBE * 0.85;
  rim.castShadow = true;
  rim.receiveShadow = true;

  const cushion = new Mesh(new CylinderGeometry(rimRadius, rimRadius, 0.05, 40), inner);
  cushion.position.y = 0.025;
  cushion.receiveShadow = true;

  const cat = createCat();
  cat.position.y = 0.045;

  group.add(rim, cushion, cat);
  return group;
};
