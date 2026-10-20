import { BoxGeometry, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial } from "three";
import chairUrl from "../../assets/models/chair.glb?url";
import { loadModel } from "../models/loadModel";
import { palette } from "../palette";

// Colores propios por material del modelo: estructura y malla en blanco roto (como las Herman
// Miller blancas), mecanismo y pistón en negro grisáceo y ruedas en gris medio, para que no se confunda con
// las cajoneras
const COLORS: Record<string, string> = {
  "Warm gray polymer": palette.chairFrame,
  "Gray woven mesh": palette.chairMesh,
  "Mechanism graphite": palette.chairMechanism,
  "Gas lift metal": palette.chairMechanism,
  "Graphite caster tread": palette.chairWheels,
};

// Silla de oficina de malla generada con IA (Hyper3D), de 92 cm de alto. El modelo original tenía
// 424.000 triángulos: se simplificó a ~37.000 (0,19 MB) sin diferencia visible a esta distancia.
// Origen: centro de la base en el suelo
const HEIGHT = 0.92;
const FOOTPRINT = 0.62;

export const createChair = (onLoad: () => void) => {
  const group = new Group();

  // Caja invisible con la medida final, para que el encuadre cuente con la silla desde el principio
  const bounds = new Mesh(new BoxGeometry(FOOTPRINT, HEIGHT, FOOTPRINT), new MeshBasicMaterial({ visible: false }));
  bounds.position.y = HEIGHT / 2;
  group.add(bounds);

  loadModel(chairUrl, HEIGHT)
    .then(({ model }) => {
      model.traverse((object) => {
        if (!(object instanceof Mesh) || !(object.material instanceof MeshStandardMaterial)) return;
        const color = COLORS[object.material.name];
        if (color) object.material.color.set(color);
      });
      group.add(model);
      onLoad();
    })
    .catch(() => {
      // Sin modelo (fallo de red) no hay silla; el resto de la escena sigue igual
    });

  return group;
};
