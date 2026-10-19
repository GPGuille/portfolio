import { CylinderGeometry, Group, Mesh, MeshStandardMaterial, SphereGeometry } from "three";
import { palette } from "../palette";

const SIZE = { width: 0.057, length: 0.114, height: 0.0215 };
const BASE_HEIGHT = 0.004;

// Ratón blanco plano estilo Apple Magic Mouse (11,4 × 5,7 × 2,15 cm):
// una base ovalada fina y encima una cúpula muy baja y lisa, sin botones visibles
export const createMouse = () => {
  const group = new Group();
  const material = new MeshStandardMaterial({ color: palette.mouse, roughness: 0.4 });

  const base = new Mesh(new CylinderGeometry(1, 1, BASE_HEIGHT, 48), material);
  base.scale.set(SIZE.width / 2, 1, SIZE.length / 2);
  base.position.y = BASE_HEIGHT / 2;
  base.castShadow = true;

  const top = new Mesh(new SphereGeometry(1, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2), material);
  top.scale.set(SIZE.width / 2, SIZE.height - BASE_HEIGHT, SIZE.length / 2);
  top.position.y = BASE_HEIGHT;
  top.castShadow = true;

  group.add(base, top);
  return group;
};
