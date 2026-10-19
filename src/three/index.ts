import {
  DirectionalLight,
  HemisphereLight,
  Material,
  Mesh,
  PCFSoftShadowMap,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import gsap from "gsap";
import { collectFramePoints, fitCamera, type Stage } from "./framing";
import { palette } from "./palette";
import { createRoom, WALL_Z } from "./room";

// Desde dónde mira la cámara (solo cuenta la dirección; la distancia la calcula el encuadre)
const CAMERA_DIRECTION = new Vector3(2.4, 1.9, 4.2).normalize();

// La escena 3D vive en un canvas fijo detrás del contenido.
// getStage indica en qué zona de la pantalla debe caber la habitación
export const createExperience = (canvas: HTMLCanvasElement, getStage: (width: number, height: number) => Stage) => {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;

  const scene = new Scene();
  const room = createRoom();
  scene.add(room);

  // Luz suave y cálida: cielo claro arriba, rebote de madera abajo y un "sol" que da sombras
  scene.add(new HemisphereLight(palette.lightSky, palette.lightGround, 1.3));
  const sun = new DirectionalLight(palette.lightSun, 2.4);
  sun.position.set(-2, 5, 3);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -2.5;
  sun.shadow.camera.right = 2.5;
  sun.shadow.camera.top = 2.5;
  sun.shadow.camera.bottom = -2.5;
  // Rango de profundidad ajustado a la habitación: si es enorme, las sombras se despegan de los muebles
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 15;
  sun.shadow.radius = 4;
  sun.shadow.bias = -0.0002;
  scene.add(sun);

  const camera = new PerspectiveCamera(35, 1, 0.1, 100);
  const framePoints = collectFramePoints(room, sun.position.clone().normalize(), WALL_Z);

  const resize = () => {
    const { innerWidth: width, innerHeight: height } = window;
    renderer.setSize(width, height, false);
    fitCamera(camera, framePoints, CAMERA_DIRECTION, getStage(width, height), width, height);
  };

  const tick = () => renderer.render(scene, camera);

  resize();
  window.addEventListener("resize", resize);
  // Las fuentes cambian el tamaño del nombre al cargar: se vuelve a encuadrar
  document.fonts.ready.then(resize);
  gsap.ticker.add(tick);

  return {
    scene,
    camera,
    resize,
    dispose: () => {
      gsap.ticker.remove(tick);
      window.removeEventListener("resize", resize);
      scene.traverse((object) => {
        if (!(object instanceof Mesh)) return;
        object.geometry.dispose();
        (Array.isArray(object.material) ? object.material : [object.material]).forEach((material: Material) =>
          material.dispose(),
        );
      });
      renderer.dispose();
    },
  };
};
