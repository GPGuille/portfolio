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
import { collectFramePoints, fitCamera } from "./framing";
import type { Stage } from "./layout";
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
  // Los modelos cargados aparte (gato, cama) piden un nuevo dibujado al llegar, y pueden
  // registrar animaciones (definidas más abajo; solo se llaman después de crear la escena)
  const room = createRoom({ requestRender: () => requestRender(), animate: (animation) => animate(animation) });
  scene.add(room);

  // Luz suave y cálida: cielo claro arriba, rebote de madera abajo y un "sol" que da sombras
  scene.add(new HemisphereLight(palette.lightSky, palette.lightGround, 1.3));
  // Relleno suave desde el lado de la cámara (sin sombras): aclara las caras en sombra
  // (laterales de cajoneras, cantos) para que no se lean como bloques oscuros
  const fill = new DirectionalLight(palette.lightSky, 0.55);
  fill.position.set(3, 2, 4);
  scene.add(fill);
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

  // La escena está quieta: solo se dibuja cuando algo cambia (tamaño de ventana,
  // y más adelante interacciones o animaciones), no 60 veces por segundo.
  // Así no gasta batería ni enciende el ventilador
  // Las animaciones (el gato, más adelante los objetos clicables) se registran aquí y la escena
  // se dibuja en bucle solo mientras alguna esté en marcha: cada una devuelve false al terminar
  // Mientras anima se limita a 30 fotogramas por segundo: suficiente para un movimiento suave
  // y la mitad de trabajo para la tarjeta gráfica (el navegador ya para el bucle con la pestaña oculta)
  const FRAME_TIME = 1000 / 30;
  let frame = 0;
  const animations = new Set<(delta: number) => boolean>();
  let lastTime = 0;
  const draw = (time: number) => {
    frame = 0;
    if (animations.size && lastTime && time - lastTime < FRAME_TIME - 1) {
      frame = requestAnimationFrame(draw);
      return;
    }
    const delta = lastTime ? Math.min((time - lastTime) / 1000, 0.1) : 0;
    for (const animation of animations) if (!animation(delta)) animations.delete(animation);
    renderer.render(scene, camera);
    if (animations.size) {
      lastTime = time;
      frame = requestAnimationFrame(draw);
    } else {
      lastTime = 0;
    }
  };
  const requestRender = () => {
    if (frame) return;
    frame = requestAnimationFrame(draw);
  };
  const animate = (animation: (delta: number) => boolean) => {
    animations.add(animation);
    requestRender();
  };

  const resize = () => {
    const { innerWidth: width, innerHeight: height } = window;
    renderer.setSize(width, height, false);
    fitCamera(camera, framePoints, CAMERA_DIRECTION, getStage(width, height), width, height);
    requestRender();
  };

  resize();
  window.addEventListener("resize", resize);
  // Las fuentes cambian el tamaño del nombre al cargar: se vuelve a encuadrar
  document.fonts.ready.then(resize);

  return {
    scene,
    camera,
    resize,
    requestRender,
    dispose: () => {
      cancelAnimationFrame(frame);
      animations.clear();
      room.userData.dispose?.();
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
