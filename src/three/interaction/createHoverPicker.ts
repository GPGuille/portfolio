import { Raycaster, Vector2 } from "three";
import type { Camera, Object3D } from "three";

export type Clickable = { id: string; object: Object3D };

// Qué objeto clicable hay bajo un punto de la pantalla (coordenadas normalizadas -1…1)
export const createHoverPicker = (camera: Camera, getClickables: () => Clickable[]) => {
  const raycaster = new Raycaster();
  const pointer = new Vector2();

  return (x: number, y: number): Clickable | null => {
    pointer.set(x, y);
    raycaster.setFromCamera(pointer, camera);
    const clickables = getClickables();
    const hits = raycaster.intersectObjects(
      clickables.map((clickable) => clickable.object),
      true,
    );
    for (const hit of hits) {
      let node: Object3D | null = hit.object;
      while (node) {
        const found = clickables.find((clickable) => clickable.object === node);
        if (found) return found;
        node = node.parent;
      }
    }
    return null;
  };
};
