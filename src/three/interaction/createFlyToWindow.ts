import { Box3, Matrix4, Quaternion, Vector2, Vector3 } from "three";
import type { Object3D, PerspectiveCamera } from "three";

// Un objeto de la pared (el tablón) sale hacia delante y vuela hasta quedar delante de la cámara,
// ocupando el rectángulo de su ventana HTML (el elemento con `data-fly-target="<id>"`). Al llegar,
// la ventana aparece encima con el mismo marco. Mientras está fuera va colgado de la cámara: así
// se queda quieto en pantalla aunque la cámara gire con el ratón. Al cerrar vuelve a su sitio
const DURATION = 0.9;

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

// Rectángulo de un elemento sin sus transformaciones (la ventana se deforma al volver, ver más abajo)
const layoutRect = (element: HTMLElement) => {
  let left = 0;
  let top = 0;
  for (let node: HTMLElement | null = element; node; node = node.offsetParent as HTMLElement | null) {
    left += node.offsetLeft;
    top += node.offsetTop;
  }
  return { left, top, width: element.offsetWidth, height: element.offsetHeight };
};

// Transformación CSS que lleva un rectángulo de `width` × `height` (origen arriba a la izquierda) a
// un cuadrilátero cualquiera en perspectiva (esquinas en orden: arriba izq., arriba der., abajo der.,
// abajo izq.). Homografía clásica del cuadrado unidad al cuadrilátero
const quadTransform = (width: number, height: number, [p0, p1, p2, p3]: Vector2[]) => {
  const dx1 = p1!.x - p2!.x;
  const dx2 = p3!.x - p2!.x;
  const dx3 = p0!.x - p1!.x + p2!.x - p3!.x;
  const dy1 = p1!.y - p2!.y;
  const dy2 = p3!.y - p2!.y;
  const dy3 = p0!.y - p1!.y + p2!.y - p3!.y;
  const det = dx1 * dy2 - dx2 * dy1;
  const g = det ? (dx3 * dy2 - dx2 * dy3) / det : 0;
  const h = det ? (dx1 * dy3 - dx3 * dy1) / det : 0;
  const a = (p1!.x - p0!.x + g * p1!.x) / width;
  const b = (p3!.x - p0!.x + h * p3!.x) / height;
  const d = (p1!.y - p0!.y + g * p1!.y) / width;
  const e = (p3!.y - p0!.y + h * p3!.y) / height;
  return `matrix3d(${a}, ${d}, 0, ${g / width}, ${b}, ${e}, 0, ${h / height}, 0, 0, 1, 0, ${p0!.x}, ${p0!.y}, 0, 1)`;
};

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
  let closeTimer = 0;
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
    const element = document.querySelector<HTMLElement>(`[data-fly-target="${id}"]`);
    const rect = (element && layoutRect(element)) ?? {
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

  // Al volver, la ventana HTML (mientras se desvanece) viaja pegada a la cara del objeto: se
  // deforma con la misma perspectiva, así sus post-its se recogen por el camino sobre los 3D
  const rideWindow = () => {
    const element = document.querySelector<HTMLElement>(`[data-fly-target="${id}"]`);
    if (!element) return;
    if (goal === 1) {
      element.style.transform = "";
      return;
    }
    const { center, size } = home!;
    object.updateMatrixWorld(true);
    const rect = layoutRect(element);
    const corners = [
      [-1, 1],
      [1, 1],
      [1, -1],
      [-1, -1],
    ].map(([x, y]) => {
      const point = object.localToWorld(new Vector3(center.x + (x! * size.x) / 2, center.y + (y! * size.y) / 2, center.z));
      point.project(camera);
      return new Vector2(
        ((point.x + 1) / 2) * window.innerWidth - rect.left,
        ((1 - point.y) / 2) * window.innerHeight - rect.top,
      );
    });
    element.style.transformOrigin = "0 0";
    element.style.transform = quadTransform(rect.width, rect.height, corners);
  };

  const apply = () => {
    camera.updateMatrixWorld(true);
    const from = wallPose();
    const to = windowPose(from.scale);
    const t = easeInOutCubic(progress);
    object.position.lerpVectors(from.position, to.position, t);
    object.quaternion.slerpQuaternions(from.quaternion, to.quaternion, t);
    object.scale.copy(from.scale);
    rideWindow();
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
      window.clearTimeout(closeTimer);
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
    // `delay` (segundos): tiempo para que la ventana HTML se recoja antes de que el objeto vuelva
    close: (delay = 0) => {
      if (!home || goal === 0) return;
      onArrive(false);
      window.clearTimeout(closeTimer);
      closeTimer = window.setTimeout(() => {
        goal = 0;
        run();
      }, delay * 1000);
    },
    // Fuera de la pared (volando o en la ventana): no se resalta al pasar el ratón
    isAway: () => object.parent === camera,
    // Si cambia el tamaño de la ventana con el tablón fuera, se recoloca
    place: () => {
      if (home && object.parent === camera) apply();
    },
  };
};
