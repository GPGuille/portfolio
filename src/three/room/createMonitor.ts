import { Box3, BoxGeometry, Group, Mesh, MeshBasicMaterial, PlaneGeometry, Vector3 } from "three";
import monitorUrl from "../../assets/models/monitor.glb?url";
import { loadModel } from "../models/loadModel";
import { createProjectsScreenTexture } from "../textures/createProjectsScreenTexture";

// Monitor generado con IA (Hyper3D) a 82 cm de ancho. Su pantalla se tapa con una propia dibujada
// en código ("Proyectos"), que se puede cambiar o animar sin tocar el modelo. Origen: centro del
// borde trasero del pie, en la mesa
const WIDTH = 0.82;
// Proporciones del modelo: 0,60 × 0,456 × 0,154 m
export const MONITOR_HEIGHT = WIDTH * (0.456 / 0.6);
export const MONITOR_DEPTH = WIDTH * (0.154 / 0.6);

export const createMonitor = (onLoad: () => void) => {
  const group = new Group();

  // Caja invisible con la medida final, para que el encuadre cuente con el monitor desde el principio
  const bounds = new Mesh(new BoxGeometry(WIDTH, MONITOR_HEIGHT, MONITOR_DEPTH), new MeshBasicMaterial({ visible: false }));
  bounds.position.set(0, MONITOR_HEIGHT / 2, MONITOR_DEPTH / 2);
  group.add(bounds);

  loadModel(monitorUrl, WIDTH, "x")
    .then(({ model }) => {
      const box = new Box3().setFromObject(model);
      model.position.z -= box.min.z;
      model.updateMatrixWorld(true);

      // La pantalla original y los pilotos de ventana se sustituyen por la pantalla propia,
      // un plano justo delante del cristal
      let screenBox: Box3 | null = null;
      model.traverse((object) => {
        if (!(object instanceof Mesh)) return;
        // three.js cambia los espacios de los nombres por guiones bajos al cargar
        const name = object.name.replace(/_/g, " ");
        if (name.startsWith("Recessed screen")) screenBox = new Box3().setFromObject(object);
        if (name.startsWith("Status light")) object.visible = false;
      });
      if (screenBox) {
        const size = (screenBox as Box3).getSize(new Vector3());
        const center = (screenBox as Box3).getCenter(new Vector3());
        const screen = new Mesh(
          new PlaneGeometry(size.x, size.y),
          new MeshBasicMaterial({ map: createProjectsScreenTexture(size.x / size.y, onLoad), toneMapped: false }),
        );
        screen.position.set(center.x, center.y, (screenBox as Box3).max.z + 0.002);
        screen.name = "projects-screen";
        group.add(screen);
      }

      group.add(model);
      onLoad();
    })
    .catch(() => {
      // Sin modelo (fallo de red) la mesa queda sin monitor; el resto de la escena sigue igual
    });

  return group;
};
