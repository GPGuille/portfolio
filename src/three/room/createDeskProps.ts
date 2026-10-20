import { Group } from "three";
import mugUrl from "../../assets/models/mug.glb?url";
import notebookUrl from "../../assets/models/notebook.glb?url";
import penCupUrl from "../../assets/models/pen-cup.glb?url";
import duckUrl from "../../assets/models/rubber-duck.glb?url";
import { loadModel } from "../models/loadModel";

type DeskProp = {
  url: string;
  // Medida final en metros a lo largo del eje indicado (algo más grande que la real, como el resto)
  size: number;
  axis: "x" | "y" | "z";
  position: [number, number];
  rotation: number;
};

// Objetos pequeños sobre la mesa, generados con IA (Hyper3D), en las zonas libres a los lados de la
// alfombrilla: a la izquierda una libreta y un bote de bolígrafos; a la derecha, al fondo, una taza
// de café. El pato de goma va en la balda de la pared (createShelfDuck).
// Posiciones (x, z) respecto al centro de la mesa; el grupo va a la altura del tablero
const PROPS: DeskProp[] = [
  { url: notebookUrl, size: 0.28, axis: "z", position: [-0.7, 0.13], rotation: 0.35 },
  { url: penCupUrl, size: 0.19, axis: "y", position: [-0.74, -0.2], rotation: 0 },
  { url: mugUrl, size: 0.11, axis: "y", position: [0.72, -0.14], rotation: -2.2 },
];

// Pato de goma (el clásico de la depuración "rubber duck") sentado en la balda, en el hueco que
// ocupaba la figurita de gato del modelo, girado hacia la cámara. Se añade al grupo de la balda:
// `scale` es la escala a la que se dibujó la balda (su ancho real / 1 m del modelo)
export const createShelfDuck = (scale: number, onLoad: () => void) => {
  const group = new Group();
  loadModel(duckUrl, 0.12, "y")
    .then(({ model }) => {
      // Posición en el modelo de la balda (1 m de ancho): x 0,37, sobre la tabla (y 0,143), a 13 cm
      // de la trasera
      model.position.set(0.37 * scale, 0.143 * scale, 0.13 * scale);
      model.rotation.y = 0.6;
      group.add(model);
      onLoad();
    })
    .catch(() => {});
  return group;
};

export const createDeskProps = (onLoad: () => void) => {
  const group = new Group();
  // Al empezar está vacío (los modelos llegan después): el encuadre no lo cuenta, porque una caja
  // vacía mide infinito y descuadraría la cámara. Además todo queda dentro de la mesa
  group.userData.bleeds = true;
  for (const prop of PROPS) {
    loadModel(prop.url, prop.size, prop.axis)
      .then(({ model }) => {
        model.position.set(prop.position[0], 0, prop.position[1]);
        model.rotation.y = prop.rotation;
        group.add(model);
        onLoad();
      })
      .catch(() => {
        // Sin modelo (fallo de red) falta ese objeto; el resto de la escena sigue igual
      });
  }
  return group;
};
