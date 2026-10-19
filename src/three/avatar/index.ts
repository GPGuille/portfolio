import {
  AnimationMixer,
  Box3,
  CircleGeometry,
  Clock,
  DirectionalLight,
  HemisphereLight,
  LoopOnce,
  Material,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from "three";
import type { AnimationAction } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import avatarUrl from "../../assets/models/avatar.glb?url";
import { palette } from "../palette";

// Nombres de las animaciones que trae el modelo (exportado desde Hyper3D/Rodin)
const CLIPS = { idle: "HumanHappyIdle", greet: "HumanSalute" };
const FADE = 0.4;

// Avatar 3D de Guillermo (modelo con esqueleto y animaciones) en su propio canvas, en la columna
// del nombre. En reposo se anima en bucle mientras la pestaña está visible; saluda al entrar y
// cuando se le pide (greet). Con "reducir movimiento" queda quieto en su pose de reposo
export const createAvatarExperience = (canvas: HTMLCanvasElement) => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = SRGBColorSpace;

  const scene = new Scene();
  scene.add(new HemisphereLight(palette.lightSky, palette.lightGround, 1.6));
  const key = new DirectionalLight(palette.lightSun, 1.6);
  key.position.set(-1.5, 2.5, 3);
  scene.add(key);
  const fill = new DirectionalLight(palette.lightSky, 0.6);
  fill.position.set(2, 1, 2);
  scene.add(fill);

  // Sombra de contacto bajo los pies: una mancha suave, sin el coste de las sombras reales
  const contactShadow = new Mesh(
    new CircleGeometry(0.17, 40),
    new MeshBasicMaterial({ color: "#000000", transparent: true, opacity: 0.1, depthWrite: false }),
  );
  contactShadow.rotation.x = -Math.PI / 2;
  contactShadow.scale.y = 0.55;
  contactShadow.position.y = 0.001;
  scene.add(contactShadow);

  // El modelo se escala a 1 unidad de alto con los pies en el suelo; la cámara lo encuadra
  // de frente con aire a los lados para el saludo
  const camera = new PerspectiveCamera(22, 1, 0.1, 20);
  camera.position.set(0, 0.62, 3.1);
  camera.lookAt(0, 0.5, 0);

  const resize = () => {
    const { clientWidth: width, clientHeight: height } = canvas;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  let mixer: AnimationMixer | null = null;
  const actions = new Map<string, AnimationAction>();
  let current: AnimationAction | null = null;
  const clock = new Clock();
  let frame = 0;
  let disposed = false;

  const render = () => renderer.render(scene, camera);

  const loop = () => {
    frame = requestAnimationFrame(loop);
    mixer?.update(clock.getDelta());
    render();
  };
  const play = () => {
    if (reducedMotion || frame || document.hidden || !mixer) return;
    clock.getDelta();
    frame = requestAnimationFrame(loop);
  };
  const pause = () => {
    cancelAnimationFrame(frame);
    frame = 0;
  };
  const onVisibility = () => (document.hidden ? pause() : play());

  const fadeTo = (name: string, instant = false) => {
    const next = actions.get(name);
    if (!next || next === current) return;
    next.reset().play();
    if (!instant) next.fadeIn(FADE);
    current?.fadeOut(FADE);
    current = next;
  };

  const greet = () => {
    if (reducedMotion || current === actions.get(CLIPS.greet)) return;
    fadeTo(CLIPS.greet);
  };

  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  loader.load(avatarUrl, (gltf) => {
    if (disposed) return;
    const model = gltf.scene;
    // Las mallas con esqueleto se deforman al animarse: sin esto three.js puede darlas por
    // fuera de cámara con su caja de reposo y no dibujarlas
    model.traverse((object) => {
      if (object instanceof Mesh) object.frustumCulled = false;
    });
    const box = new Box3().setFromObject(model);
    const size = box.getSize(new Vector3());
    model.scale.setScalar(1 / size.y);
    box.setFromObject(model);
    const center = box.getCenter(new Vector3());
    model.position.set(-center.x, -box.min.y, -center.z);
    scene.add(model);

    mixer = new AnimationMixer(model);
    for (const clip of gltf.animations) actions.set(clip.name, mixer.clipAction(clip));
    const greetAction = actions.get(CLIPS.greet);
    if (greetAction) {
      greetAction.setLoop(LoopOnce, 1);
      greetAction.clampWhenFinished = true;
    }
    // Al terminar el saludo vuelve al reposo
    mixer.addEventListener("finished", () => fadeTo(CLIPS.idle));

    // El reposo entra sin fundido para que el primer fotograma ya muestre la pose natural
    // (sin él se vería la pose en "A" del modelado)
    fadeTo(CLIPS.idle, true);
    mixer.update(0);
    render();
    play();
    // Saluda al entrar, cuando ya se ha visto la página un momento
    window.setTimeout(greet, 900);
  });

  const observer = new ResizeObserver(() => {
    resize();
    if (!frame) render();
  });
  observer.observe(canvas);
  document.addEventListener("visibilitychange", onVisibility);
  resize();

  return {
    greet,
    dispose: () => {
      disposed = true;
      pause();
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      scene.traverse((object) => {
        if (!(object instanceof Mesh)) return;
        object.geometry.dispose();
        (Array.isArray(object.material) ? object.material : [object.material]).forEach((m: Material) => m.dispose());
      });
      renderer.dispose();
    },
  };
};
