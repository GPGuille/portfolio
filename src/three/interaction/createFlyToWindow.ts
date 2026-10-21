import { Box3, Matrix4, Quaternion, Vector3 } from "three";
import type { Object3D, PerspectiveCamera } from "three";

// Un objeto de la pared (el tablón) sale hacia delante y vuela hasta quedar delante de la cámara,
// ocupando el rectángulo de su ventana HTML (el elemento con `data-fly-target="<id>"`). Al llegar,
// la ventana aparece encima con el mismo marco. Mientras está fuera va colgado de la cámara: así
// se queda quieto en pantalla aunque la cámara gire con el ratón. Al cerrar vuelve a su sitio
const DURATION = 0.9;

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

type Pose = { position: Vector3; quaternion: Quaternion; scale: Vector3 };

export const createFlyToWindow = (
  object: Object3D,
  camera: PerspectiveCamera,
  id: string,
  animate: (animation: (delta: number) => boolean) => void,
  onArrive: (arrived: boolean) => void,
) => {
  // Sitio en la pared y medidas, tomados la primera vez que vuela (con el modelo ya cargado)
  let home: { parent: Object3D; matrix: Matrix4; center: Vector3; size: Vector3 } | null = null;
  let progress = 0;
  let goal = 0;
  let running = false;
  const shadows = new Map<Object3D, boolean>();

  const measure = () => {
    const parent = object.parent!;
    object.updateMatrixWorld(true);
    // Solo el tablón: lo que sobresale (chinchetas de los post-its) lo alejaría y se vería más pequeño
    const box = new Box3();
    for (const child of object.children) if (!child.userData.bleeds) box.expandByObject(child);
    // Centro de la cara delantera, en coordenadas del propio objeto (cuelga recto en la pared)
    const center = object.worldToLocal(new Vector3((box.min.x + box.max.x) / 2, (box.min.y + box.max.y) / 2, box.max.z));
    home = { parent, matrix: object.matrix.clone(), center, size: box.getSize(new Vector3()) };
  };

  // Postura en la pared vista desde la cámara de ahora (la cámara se mueve con el ratón)
  const wallPose = (): Pose => {
    const pose = { position: new Vector3(), quaternion: new Quaternion(), scale: new Vector3() };
    home!.parent.updateMatrixWorld(true);
    new Matrix4()
      .copy(camera.matrixWorldInverse)
      .multiply(home!.parent.matrixWorld)
      .multiply(home!.matrix)
      .decompose(pose.position, pose.quaternion, pose.scale);
    return pose;
  };

  // Postura delante de la cámara: de frente y del tamaño del rectángulo de la ventana
  const windowPose = (scale: Vector3): Pose => {
    // El canvas ocupa toda la ventana
    const { innerWidth: screenWidth, innerHeight: screenHeight } = window;
    const rect = document.querySelector(`[data-fly-target="${id}"]`)?.getBoundingClientRect() ?? {
      left: screenWidth * 0.1,
      top: screenHeight * 0.1,
      width: screenWidth * 0.8,
      height: screenHeight * 0.8,
    };
    const { size, center } = home!;
    const pixelsPerMeter = Math.min(rect.width / size.x, rect.height / size.y);
    const halfHeight = Math.tan((camera.fov * Math.PI) / 360);
    const distance = screenHeight / (pixelsPerMeter * 2 * halfHeight);
    // El encuadre desplaza la imagen (setViewOffset): un píxel de pantalla está desplazado en la vista completa
    const offsetX = camera.view?.enabled ? camera.view.offsetX : 0;
    const offsetY = camera.view?.enabled ? camera.view.offsetY : 0;
    const x = ((rect.left + rect.width / 2 + offsetX) / screenWidth) * 2 - 1;
    const y = 1 - ((rect.top + rect.height / 2 + offsetY) / screenHeight) * 2;
    const position = new Vector3(x * distance * halfHeight * camera.aspect, y * distance * halfHeight, -distance);
    // El origen del objeto no es el centro de su cara: se compensa
    position.sub(center.clone().multiply(scale));
    return { position, quaternion: new Quaternion(), scale };
  };

  const apply = () => {
    camera.updateMatrixWorld(true);
    const from = wallPose();
    const to = windowPose(from.scale);
    const t = easeInOutCubic(progress);
    object.position.lerpVectors(from.position, to.position, t);
    object.quaternion.slerpQuaternions(from.quaternion, to.quaternion, t);
    object.scale.copy(from.scale);
  };

  const leaveWall = () => {
    camera.add(object);
    // Cerca de la cámara proyectaría una sombra enorme sobre la habitación
    object.traverse((child) => {
      shadows.set(child, child.castShadow);
      child.castShadow = false;
    });
  };

  const backToWall = () => {
    home!.parent.add(object);
    home!.matrix.decompose(object.position, object.quaternion, object.scale);
    for (const [child, castShadow] of shadows) child.castShadow = castShadow;
    shadows.clear();
  };

  const run = () => {
    if (running) return;
    running = true;
    animate((delta) => {
      const step = delta / DURATION;
      progress = goal > progress ? Math.min(goal, progress + step) : Math.max(goal, progress - step);
      apply();
      if (progress !== goal) return true;
      running = false;
      if (goal === 0) backToWall();
      else onArrive(true);
      return false;
    });
  };

  return {
    // `instant`: sin vuelo, ya colocado (la página se abrió con la sección en la dirección, #skills)
    open: (instant = false) => {
      if (!home) measure();
      if (object.parent !== camera) leaveWall();
      goal = 1;
      if (instant && !running) {
        progress = 1;
        apply();
        onArrive(true);
        return;
      }
      run();
    },
    close: () => {
      if (!home || goal === 0) return;
      onArrive(false);
      goal = 0;
      run();
    },
    // Fuera de la pared (volando o en la ventana): no se resalta al pasar el ratón
    isAway: () => object.parent === camera,
    // Si cambia el tamaño de la ventana con el tablón fuera, se recoloca
    place: () => {
      if (home && object.parent === camera) apply();
    },
  };
};
