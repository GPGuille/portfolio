import type { Object3D } from "three";
import {
  Box3,
  DirectionalLight,
  HemisphereLight,
  Material,
  Mesh,
  PCFSoftShadowMap,
  PerspectiveCamera,
  Scene,
  Spherical,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import gsap from "gsap";
import { watch } from "vue";
import { setHoverTarget } from "../composables/useHoverLabel";
import { useSection, type SectionId } from "../composables/useSection";
import { useSectionWindow } from "../composables/useSectionWindow";
import { collectFramePoints, fitCamera } from "./framing";
import { createFlyToWindow } from "./interaction/createFlyToWindow";
import { createHoverPicker, type Clickable } from "./interaction/createHoverPicker";
import { createOutline } from "./interaction/createOutline";
import { modelsSettled } from "./models/loadModel";
import type { Stage } from "./layout";
import { palette } from "./palette";
import { createRoom, WALL_Z } from "./room";

// Desde dónde mira la cámara (solo cuenta la dirección; la distancia la calcula el encuadre)
// Altura del salto de un objeto al resaltarse (metros)
const HOP_HEIGHT = 0.03;

// Giro máximo de la cámara al mover el ratón (radianes) y rapidez con la que lo sigue
const PARALLAX = { yaw: 0.02, pitch: 0.011, ease: 2.5 };

const CAMERA_DIRECTION = new Vector3(2.4, 1.9, 4.2).normalize();

// La escena 3D vive en un canvas fijo detrás del contenido.
// getStage indica en qué zona de la pantalla debe caber la habitación
// onReady avisa cuando han cargado los modelos, para mostrar la escena con un fundido
export const createExperience = (
  canvas: HTMLCanvasElement,
  getStage: (width: number, height: number) => Stage,
  onReady: () => void,
) => {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, stencil: true });
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
  // En la escena para que se dibuje lo que cuelga de ella (el tablón cuando vuela a su ventana)
  scene.add(camera);
  const outline = createOutline(renderer, scene, camera);
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
    outline.render();
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

  // Cámara que sigue al ratón: gira muy poco alrededor del punto al que mira, con inercia.
  // Solo con ratón (no en táctil) y sin "reducir movimiento"
  const parallaxEnabled =
    window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let target = new Vector3();
  const baseOffset = new Spherical();
  const aim = { x: 0, y: 0 };
  const tilt = { x: 0, y: 0 };
  const applyParallax = () => {
    const offset = new Spherical(baseOffset.radius, baseOffset.phi - tilt.y * PARALLAX.pitch, baseOffset.theta - tilt.x * PARALLAX.yaw);
    camera.position.setFromSpherical(offset).add(target);
    camera.lookAt(target);
  };
  // Contorno del objeto clicable bajo el ratón (salvo si está encima de la interfaz: menú,
  // panel, avatar…)
  const pick = createHoverPicker(camera, () => (room.userData.clickables ?? []) as Clickable[]);
  let hovered: Clickable | null = null;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // El objeto resaltado da un pequeño salto: sube unos centímetros con rebote y baja al dejarlo
  const hop = (object: Object3D, up: boolean) => {
    if (reducedMotion) return;
    object.userData.baseY ??= object.position.y;
    gsap.to(object.position, {
      y: object.userData.baseY + (up ? HOP_HEIGHT : 0),
      duration: up ? 0.45 : 0.3,
      ease: up ? "back.out(3)" : "power2.out",
      overwrite: true,
      onUpdate: requestRender,
    });
  };
  const setHovered = (next: Clickable | null) => {
    if (next?.id === hovered?.id) return;
    if (hovered) hop(hovered.object, false);
    if (next) hop(next.object, true);
    hovered = next;
    outline.setSelection(next?.object ?? null);
    document.documentElement.style.cursor = next ? "pointer" : "";
    requestRender();
  };
  const { activeSection, openSection } = useSection();
  const onPointerMove = (event: PointerEvent) => {
    aim.x = (event.clientX / window.innerWidth) * 2 - 1;
    aim.y = (event.clientY / window.innerHeight) * 2 - 1;
    // Con una sección abierta (o un objeto volviendo a su sitio) la habitación no se resalta
    if (activeSection.value || [...flights.values()].some((flight) => flight.isAway())) {
      if (hovered) {
        setHovered(null);
        setHoverTarget(null);
      }
      return;
    }
    const overInterface = (event.target as Element | null)?.closest?.("button, a, header, .panel");
    const hadLabel = Boolean(hovered);
    setHovered(overInterface ? null : pick(aim.x, -aim.y));
    // La etiqueta solo se toca si la puso la habitación (sobre el avatar la gestiona su lienzo)
    if (hovered) setHoverTarget({ id: hovered.id, x: event.clientX, y: event.clientY });
    else if (hadLabel) setHoverTarget(null);
  };

  // Clic en un objeto de la habitación: abre su sección (su id es el de la sección)
  // En táctil no hay "pasar por encima": se mira qué objeto hay bajo el dedo al tocar
  const onClick = (event: MouseEvent) => {
    if (activeSection.value) return;
    let target = hovered;
    if (!target && !hasMouse && !(event.target as Element | null)?.closest?.("button, a, header, .panel")) {
      target = pick((event.clientX / window.innerWidth) * 2 - 1, 1 - (event.clientY / window.innerHeight) * 2);
    }
    if (target) openSection(target.id as SectionId);
  };

  // Objetos que vuelan a su ventana al abrir la sección: el tablón (Skills). Sin vuelo con
  // "reducir movimiento": la ventana aparece directamente
  const { flyable, arrived, notes } = useSectionWindow();
  const flights = new Map<string, ReturnType<typeof createFlyToWindow>>();
  // Al llegar, los post-its de la ventana aparecen encima de los 3D (fundido de NOTES_SWAP s) y
  // entonces se ocultan los 3D; al cerrar se muestran ya (debajo de los HTML) y el tablón vuelve
  // enseguida: la ventana viaja con él mientras sus post-its se recogen y se desvanece
  const NOTES_SWAP = 0.25;
  const CLOSE_DELAY = 0;
  let notesTimer = 0;
  if (!reducedMotion) {
    for (const { id, object } of (room.userData.clickables ?? []) as Clickable[]) {
      if (id !== "skills") continue;
      const postIts = object.userData.postIts as Object3D | undefined;
      flights.set(
        id,
        createFlyToWindow(object, camera, id, animate, (done) => {
          if (done) measureNotes(object, id);
          arrived.value = done ? (id as SectionId) : null;
          window.clearTimeout(notesTimer);
          if (!postIts) return;
          if (!done) postIts.visible = true;
          else notesTimer = window.setTimeout(() => (postIts.visible = false), NOTES_SWAP * 1000);
          requestRender();
        }),
      );
    }
  }

  // Medida de los post-its del tablón ya en la ventana: se proyectan las esquinas de cada papel a la
  // pantalla (con la perspectiva real) y se expresan en fracciones del rectángulo de la ventana:
  // centro, ancho, alto, giro y dónde está la chincheta
  const measureNotes = (board: Object3D, id: string) => {
    const postIts = board.userData.postIts as Object3D | undefined;
    const rect = document.querySelector(`[data-fly-target="${id}"]`)?.getBoundingClientRect();
    if (!postIts?.children.length || !rect) return;
    camera.updateMatrixWorld(true);
    board.updateMatrixWorld(true);
    const toScreen = (point: Vector3) => {
      point.project(camera);
      return new Vector2(((point.x + 1) / 2) * window.innerWidth, ((1 - point.y) / 2) * window.innerHeight);
    };
    notes.value = postIts.children.map((holder) => {
      let paper: Mesh | undefined;
      let pin: Mesh | undefined;
      holder.traverse((child) => {
        if (!(child instanceof Mesh)) return;
        if (child.material.name === "Matte yellow paper") paper = child;
        if (child.material.name === "Glossy red plastic") pin = child;
      });
      if (!paper) return { x: 0.5, y: 0.5, width: 0, height: 0, rotation: 0, pinX: 0, pinY: 0 };
      paper.geometry.computeBoundingBox();
      const { min, max } = paper.geometry.boundingBox!;
      const corner = (x: number, y: number) => toScreen(paper!.localToWorld(new Vector3(x, y, max.z)));
      const bottomLeft = corner(min.x, min.y);
      const bottomRight = corner(max.x, min.y);
      const topLeft = corner(min.x, max.y);
      const across = bottomRight.clone().sub(bottomLeft);
      const up = topLeft.clone().sub(bottomLeft);
      const center = bottomLeft.clone().add(across.clone().multiplyScalar(0.5)).add(up.clone().multiplyScalar(0.5));
      const pinOffset = pin ? toScreen(new Box3().setFromObject(pin).getCenter(new Vector3())).sub(center) : new Vector2();
      return {
        x: (center.x - rect.left) / rect.width,
        y: (center.y - rect.top) / rect.height,
        width: across.length() / rect.width,
        height: up.length() / rect.height,
        rotation: Math.atan2(-across.y, across.x),
        pinX: pinOffset.dot(across) / across.lengthSq(),
        pinY: pinOffset.dot(up) / up.lengthSq(),
      };
    });
  };

  // Después de que la interfaz pinte la ventana, para poder medir su rectángulo
  const stopSectionWatch = watch(
    activeSection,
    (id, previous) => {
      if (previous) flights.get(previous)?.close(CLOSE_DELAY);
      if (!id) return;
      setHovered(null);
      setHoverTarget(null);
      const flight = flights.get(id);
      if (!flight) return;
      // El objeto puede estar a mitad del salto de resaltado: vuela desde su sitio
      const object = ((room.userData.clickables ?? []) as Clickable[]).find((clickable) => clickable.id === id)!.object;
      gsap.killTweensOf(object.position);
      if (object.userData.baseY !== undefined) object.position.y = object.userData.baseY;
      flight.open();
    },
    { flush: "post" },
  );

  const resize = () => {
    const { innerWidth: width, innerHeight: height } = window;
    renderer.setSize(width, height, false);
    outline.setSize(width, height);
    target = fitCamera(camera, framePoints, CAMERA_DIRECTION, getStage(width, height), width, height);
    baseOffset.setFromVector3(camera.position.clone().sub(target));
    if (parallaxEnabled) applyParallax();
    for (const flight of flights.values()) flight.place();
    requestRender();
  };

  resize();
  window.addEventListener("resize", resize);
  // Las fuentes cambian el tamaño del nombre al cargar: se vuelve a encuadrar
  document.fonts.ready.then(resize);
  modelsSettled().then(() => {
    requestRender();
    onReady();
    // Si la sección ya estaba abierta (enlace con #skills), el tablón se coloca directamente en su ventana
    const open = activeSection.value;
    const openObject = ((room.userData.clickables ?? []) as Clickable[]).find((clickable) => clickable.id === open)?.object;
    if (open && openObject && flights.has(open)) flights.get(open)!.open(true);
    flyable.value = [...flights.keys()] as SectionId[];
  });

  // El contorno funciona con ratón aunque la cámara no se mueva ("reducir movimiento")
  const hasMouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (hasMouse) window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("click", onClick);
  if (parallaxEnabled) {
    animate((delta) => {
      const ease = Math.min(1, delta * PARALLAX.ease);
      tilt.x += (aim.x - tilt.x) * ease;
      tilt.y += (aim.y - tilt.y) * ease;
      applyParallax();
      return true;
    });
  }

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
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("click", onClick);
      stopSectionWatch();
      flyable.value = [];
      arrived.value = null;
      document.documentElement.style.cursor = "";
      outline.dispose();
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
