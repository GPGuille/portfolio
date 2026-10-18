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
import { palette } from "./palette";
import { createRoom } from "./room";

const CAMERA_TARGET = new Vector3(0, 0.4, 0);
const CAMERA_OFFSET = new Vector3(2.2, 2, 3.6);
const DESKTOP_MIN_WIDTH = 840;

// La escena 3D vive en un canvas fijo detrás del contenido
export const createExperience = (canvas: HTMLCanvasElement) => {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;

  const scene = new Scene();
  scene.add(createRoom());

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

  const resize = () => {
    const { innerWidth: width, innerHeight: height } = window;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;

    // En pantallas verticales la cámara se aleja para que quepa la habitación
    const distance = camera.aspect < 1 ? 1.7 : 1;
    camera.position.copy(CAMERA_TARGET).addScaledVector(CAMERA_OFFSET, distance);
    camera.lookAt(CAMERA_TARGET);

    // En ordenador la habitación se desplaza a la derecha para dejar sitio al nombre;
    // en móvil baja para quedar debajo
    if (width >= DESKTOP_MIN_WIDTH) camera.setViewOffset(width, height, -width * 0.15, -height * 0.05, width, height);
    else camera.setViewOffset(width, height, 0, -height * 0.12, width, height);

    camera.updateProjectionMatrix();
  };

  const tick = () => renderer.render(scene, camera);

  resize();
  window.addEventListener("resize", resize);
  gsap.ticker.add(tick);

  return {
    scene,
    camera,
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
