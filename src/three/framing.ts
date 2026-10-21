import { Box3, Object3D, PerspectiveCamera, Vector3 } from "three";
import type { Stage } from "./layout";

// Puntos que tienen que verse: las esquinas de cada mueble y, para lo colgado
// (userData.isWallMounted), su sombra en la pared. Las sombras del suelo no cuentan: caen sobre
// la alfombra, que ya se sale de la pantalla, así que pueden cortarse sin que se note.
// Lo marcado con userData.bleeds (la alfombra) tampoco cuenta
export const collectFramePoints = (root: Object3D, lightDirection: Vector3, wallZ: number) => {
  root.updateMatrixWorld(true);
  const points: Vector3[] = [];
  const box = new Box3();

  for (const child of root.children) {
    if (child.userData.isShadowCatcher || child.userData.bleeds) continue;
    box.setFromObject(child);
    for (const x of [box.min.x, box.max.x]) {
      for (const y of [box.min.y, box.max.y]) {
        for (const z of [box.min.z, box.max.z]) {
          const corner = new Vector3(x, y, z);
          points.push(corner);
          if (child.userData.isWallMounted && z > wallZ) {
            points.push(corner.clone().addScaledVector(lightDirection, -(z - wallZ) / lightDirection.z));
          }
        }
      }
    }
  }

  return points;
};

const projectToScreen = (points: Vector3[], camera: PerspectiveCamera, width: number, height: number) => {
  let left = Infinity;
  let right = -Infinity;
  let top = Infinity;
  let bottom = -Infinity;
  let behindCamera = false;

  for (const point of points) {
    const projected = point.clone().project(camera);
    if (projected.z > 1) behindCamera = true;
    const x = ((projected.x + 1) / 2) * width;
    const y = ((1 - projected.y) / 2) * height;
    left = Math.min(left, x);
    right = Math.max(right, x);
    top = Math.min(top, y);
    bottom = Math.max(bottom, y);
  }

  return { left, right, top, bottom, behindCamera };
};

// Coloca la cámara en la dirección dada a la distancia justa para que todos los puntos quepan en el
// escenario, y desplaza la imagen para colocarlos en él. Devuelve el punto al que mira la cámara
export const fitCamera = (
  camera: PerspectiveCamera,
  points: Vector3[],
  direction: Vector3,
  stage: Stage,
  width: number,
  height: number,
) => {
  const target = new Box3().setFromPoints(points).getCenter(new Vector3());
  const stageWidth = stage.right - stage.left;
  const stageHeight = stage.bottom - stage.top;

  camera.aspect = width / height;
  camera.clearViewOffset();

  const placeAt = (distance: number) => {
    camera.position.copy(target).addScaledVector(direction, distance);
    camera.lookAt(target);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    return projectToScreen(points, camera, width, height);
  };

  // Búsqueda binaria de la distancia: lo más cerca posible sin salirse del escenario
  let near = 0.5;
  let far = 50;
  for (let step = 0; step < 30; step++) {
    const distance = (near + far) / 2;
    const bounds = placeAt(distance);
    const fits = !bounds.behindCamera && bounds.right - bounds.left <= stageWidth && bounds.bottom - bounds.top <= stageHeight;
    if (fits) far = distance;
    else near = distance;
  }

  const bounds = placeAt(far);
  // En horizontal se alinea a la derecha del escenario (la habitación se va a la derecha y deja la
  // columna del nombre y el avatar despejada); en vertical, centrada
  const offsetX = bounds.right - stage.right;
  const offsetY = (bounds.top + bounds.bottom) / 2 - (stage.top + stage.bottom) / 2;
  camera.setViewOffset(width, height, offsetX, offsetY, width, height);
  camera.updateProjectionMatrix();
  return target;
};
