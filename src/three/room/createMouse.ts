import { CylinderGeometry, Group, Mesh, MeshStandardMaterial, SphereGeometry } from "three";
import { palette } from "../palette";

// Ratón plano tipo Magic Mouse en estilo juguete: algo más grande y gordito que el real
export const MOUSE_SIZE = { width: 0.064, length: 0.124, height: 0.027 };
const BASE_HEIGHT = 0.006;

// Base ovalada y encima una cúpula baja y lisa, sin botones visibles
export const createMouse = () => {
  const group = new Group();
  const material = new MeshStandardMaterial({ color: palette.mouse, roughness: 0.55 });

  const base = new Mesh(new CylinderGeometry(1, 1, BASE_HEIGHT, 48), material);
  base.scale.set(MOUSE_SIZE.width / 2, 1, MOUSE_SIZE.length / 2);
  base.position.y = BASE_HEIGHT / 2;
  base.castShadow = true;

  const top = new Mesh(new SphereGeometry(1, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2), material);
  top.scale.set(MOUSE_SIZE.width / 2, MOUSE_SIZE.height - BASE_HEIGHT, MOUSE_SIZE.length / 2);
  top.position.y = BASE_HEIGHT;
  top.castShadow = true;

  group.add(base, top);
  return group;
};
