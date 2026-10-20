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
import type { AnimationAction, Euler, Object3D } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import avatarUrl from "../../assets/models/avatar.glb?url";
import { palette } from "../palette";

// Animaciones del modelo (Hyper3D/Rodin). El reposo es el primer fotograma de HappyIdle, quieto,
// con una respiración suave añadida en código; Salute es el saludo (al entrar y al pasar el ratón)
// y el resto son gestos que hace de vez en cuando. SadIdle no se usa: transmite tristeza
const CLIPS = { rest: "HumanHappyIdle", greet: "HumanSalute" };
const GESTURES = ["HumanDwarfIdle", "HumanArmStretching", "HumanPointingForward", "HumanSalute"];
const GESTURE_PAUSE = { min: 15, max: 25 };
// Fundido lento entre el reposo y los gestos, para que la vuelta sea suave
const FADE = 0.9;
// Respiración: ciclo de unos 4 s; el pecho se abre y los hombros suben un poco
const BREATH = { speed: 1.6, chest: 0.025, shoulders: 0.03 };

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
    const delta = Math.min(clock.getDelta(), 0.1);
    mixer?.update(delta);
    breathe(delta);
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

  // Cada gesto sustituye a la pose de reposo con un fundido cruzado, y al acabar vuelve a ella
  // (si se mezclaran a la vez, three.js las promediaría y el gesto quedaría a medias)
  const playClip = (name: string) => {
    const next = actions.get(name);
    const rest = actions.get(CLIPS.rest);
    if (!next || current) return;
    next.reset().play();
    if (rest) next.crossFadeFrom(rest, FADE, false);
    current = next;
  };

  let gestureTimer = 0;
  let lastGesture = "";
  const scheduleGesture = () => {
    window.clearTimeout(gestureTimer);
    const wait = GESTURE_PAUSE.min + Math.random() * (GESTURE_PAUSE.max - GESTURE_PAUSE.min);
    gestureTimer = window.setTimeout(() => {
      if (document.hidden || current) return scheduleGesture();
      const options = GESTURES.filter((name) => name !== lastGesture);
      lastGesture = options[Math.floor(Math.random() * options.length)]!;
      playClip(lastGesture);
    }, wait * 1000);
  };

  const greet = () => {
    if (reducedMotion || current) return;
    lastGesture = CLIPS.greet;
    playClip(CLIPS.greet);
  };

  // Respiración sobre la pose de reposo. Se calcula siempre desde la pose guardada (no sumando
  // al valor actual) porque la pose congelada no se reescribe en cada fotograma: sumar haría que
  // el giro se acumulara
  type BreathBone = { bone: Object3D; base: Euler; axis: "x" | "z"; amount: number };
  // La pose de reposo (primer fotograma de HappyIdle) mira algo hacia arriba: se baja la cabeza
  const HEAD_DOWN = { neck: 0.12, head: 0.16 };
  const breathBones: BreathBone[] = [];
  let breathTime = 0;
  // La corrección se mezcla según el peso del reposo: durante un gesto (peso 0) manda la
  // animación, y en los fundidos de entrada y salida pasa poco a poco, sin saltos de cabeza
  const breathe = (delta: number) => {
    breathTime += delta;
    const weight = actions.get(CLIPS.rest)?.getEffectiveWeight() ?? 1;
    if (weight <= 0) return;
    const wave = Math.sin(breathTime * BREATH.speed);
    for (const { bone, base, axis, amount } of breathBones) {
      const target = { x: base.x, y: base.y, z: base.z };
      target[axis] += wave * amount;
      bone.rotation.set(
        bone.rotation.x + (target.x - bone.rotation.x) * weight,
        bone.rotation.y + (target.y - bone.rotation.y) * weight,
        bone.rotation.z + (target.z - bone.rotation.z) * weight,
      );
    }
  };
  const captureBreathBones = (model: Object3D) => {
    breathBones.length = 0;
    const add = (name: string, axis: "x" | "z", amount: number) => {
      const bone = model.getObjectByName(name);
      if (bone) breathBones.push({ bone, base: bone.rotation.clone(), axis, amount });
    };
    add("Spine2", "x", -BREATH.chest);
    // Cuello y cabeza no respiran (cantidad 0); solo se corrige su pose para mirar al frente
    add("Neck", "x", 0);
    add("Head", "x", 0);
    for (const entry of breathBones) {
      if (entry.bone.name === "Neck") entry.base.x += HEAD_DOWN.neck;
      if (entry.bone.name === "Head") entry.base.x += HEAD_DOWN.head;
    }
    add("LeftShoulder", "z", BREATH.shoulders);
    add("RightShoulder", "z", -BREATH.shoulders);
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
    for (const clip of gltf.animations) {
      const action = mixer.clipAction(clip);
      if (clip.name !== CLIPS.rest) {
        action.setLoop(LoopOnce, 1);
        action.clampWhenFinished = true;
      }
      actions.set(clip.name, action);
    }
    // Pose de reposo: el primer fotograma de HappyIdle, congelado
    const rest = actions.get(CLIPS.rest);
    rest?.play();
    if (rest) rest.timeScale = 0;

    // Al terminar un gesto se funde de vuelta al reposo y se programa el siguiente
    mixer.addEventListener("finished", ({ action }) => {
      const restAction = actions.get(CLIPS.rest);
      if (restAction) {
        restAction.reset().play();
        restAction.timeScale = 0;
        restAction.crossFadeFrom(action, FADE, false);
      }
      window.setTimeout(() => {
        action.stop();
        if (current === action) current = null;
      }, FADE * 1000);
      scheduleGesture();
    });

    mixer.update(0);
    captureBreathBones(model);
    render();
    play();
    if (!reducedMotion) {
      // Saluda al entrar, cuando ya se ha visto la página un momento
      window.setTimeout(greet, 900);
    }
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
      window.clearTimeout(gestureTimer);
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
