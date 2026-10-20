import { BoxGeometry, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial } from "three";
import deskKitUrl from "../../assets/models/desk-kit.glb?url";
import { loadModel } from "../models/loadModel";
import { palette } from "../palette";

// Colores de las teclas como el teclado de Guillermo: letras crema, modificadores beige y el
// acento en terracota suave (el modelo las traía más oscuras)
const KEYCAP_COLORS: Record<string, string> = {
  "Satin molded keycaps.001": palette.keycapAlpha,
  "Satin molded keycaps.002": palette.keycapModifier,
  "Satin molded keycaps": palette.keycapAccent,
  "Matte keyboard housing": palette.keyboardCase,
};
// Teclado y ratón se adelantan respecto a la alfombrilla (en unidades del modelo, que mide 0,9 m)
const KIT_FORWARD = 0.07;

// Alfombrilla, teclado y ratón generados con IA (Hyper3D) en un solo modelo. Se escala para que la
// alfombrilla mida 103 × 46 cm (algo más grande que la real, como el resto del equipo).
// Origen: centro de la alfombrilla en la mesa
const MODEL_MAT = { width: 0.9, depth: 0.4 };
const MAT_WIDTH = 1.03;
export const DESK_KIT_SIZE = { width: MAT_WIDTH, depth: MAT_WIDTH * (MODEL_MAT.depth / MODEL_MAT.width), height: 0.075 };

export const createDeskKit = (onLoad: () => void) => {
  const group = new Group();

  // Caja invisible con la medida final, para que el encuadre cuente con ella desde el principio
  const bounds = new Mesh(new BoxGeometry(DESK_KIT_SIZE.width, DESK_KIT_SIZE.height, DESK_KIT_SIZE.depth), new MeshBasicMaterial({ visible: false }));
  bounds.position.y = DESK_KIT_SIZE.height / 2;
  group.add(bounds);

  loadModel(deskKitUrl, MAT_WIDTH, "x")
    .then(({ model }) => {
      model.traverse((object) => {
        if (!(object instanceof Mesh)) return;
        if (!object.name.startsWith("Desk_mat")) object.position.z += KIT_FORWARD;
        if (object.material instanceof MeshStandardMaterial) {
          const color = KEYCAP_COLORS[object.material.name];
          if (color) object.material.color.set(color);
        }
      });
      group.add(model);
      onLoad();
    })
    .catch(() => {
      // Sin modelo (fallo de red) la mesa queda sin alfombrilla, teclado ni ratón
    });

  return group;
};
