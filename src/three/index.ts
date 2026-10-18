import { PerspectiveCamera, Scene, WebGLRenderer } from "three";
import gsap from "gsap";

// La escena 3D vive en un canvas fijo detrás del contenido.
// Aquí irán la habitación, el avatar y el resto de objetos.
export const createExperience = (canvas: HTMLCanvasElement) => {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new Scene();
  const camera = new PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 2, 10);

  const resize = () => {
    const { innerWidth: width, innerHeight: height } = window;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
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
      renderer.dispose();
    },
  };
};
