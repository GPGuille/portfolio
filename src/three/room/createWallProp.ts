import { Box3, BoxGeometry, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial } from "three";
import { loadModel } from "../models/loadModel";

// Objeto colgado en la pared hecho con IA (tablón, estantería, balda). Se escala a `width` de ancho
// y se coloca con su parte trasera pegada a la pared (z = 0 del grupo) y su base en y = 0.
// Con `stretchToHeight` también se ajusta el alto exacto (escala distinta en vertical), para
// igualar medidas entre piezas.
// `size` es la medida final aproximada: una caja invisible la reserva para que el encuadre cuente
// con el objeto antes de que termine de cargar
export const createWallProp = (
  url: string,
  size: { width: number; height: number; depth: number },
  onLoad: () => void,
  stretchToHeight = false,
  // Colores propios por nombre de material del modelo (sustituyen su textura)
  recolor: Record<string, string> = {},
) => {
  const group = new Group();
  group.userData.isWallMounted = true;

  const bounds = new Mesh(new BoxGeometry(size.width, size.height, size.depth), new MeshBasicMaterial({ visible: false }));
  bounds.position.set(0, size.height / 2, size.depth / 2);
  group.add(bounds);

  loadModel(url, size.width, "x")
    .then(({ model }) => {
      // loadModel lo deja centrado: se mueve hacia delante para que la trasera toque la pared
      model.traverse((object) => {
        if (!(object instanceof Mesh) || !(object.material instanceof MeshStandardMaterial)) return;
        const color = recolor[object.material.name];
        if (!color) return;
        object.material.map = null;
        object.material.color.set(color);
        object.material.needsUpdate = true;
      });
      let box = new Box3().setFromObject(model);
      if (stretchToHeight) {
        model.scale.y *= size.height / (box.max.y - box.min.y);
        box = new Box3().setFromObject(model);
        model.position.y -= box.min.y;
      }
      model.position.z -= box.min.z;
      group.add(model);
      onLoad();
    })
    .catch(() => {
      // Sin modelo (fallo de red) el hueco queda vacío; el resto de la escena sigue igual
    });

  return group;
};

