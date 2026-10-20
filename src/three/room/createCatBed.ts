import { AnimationMixer, BoxGeometry, Group, LoopOnce, Mesh, MeshBasicMaterial, MeshStandardMaterial } from "three";
import catBedUrl from "../../assets/models/cat-bed.glb?url";
import catUrl from "../../assets/models/cat.glb?url";
import { loadModel } from "../models/loadModel";
import { palette } from "../palette";
import type { SceneHooks } from "./index";

// Rincón del gato: cama redonda de peluche y un British Shorthair azul sentado dentro, los dos
// modelos generados con IA (Hyper3D). Medidas: cama de 64 cm de diámetro y gato de 40 cm de alto
// (algo más grandes que los reales, como el resto del equipo). Origen: centro de la base en el
// suelo; el gato mira hacia +Z
export const CAT_BED_SIZE = { diameter: 0.64 };
const CAT_HEIGHT = 0.4;
// Altura del cojín de la cama, donde se sienta el gato
const CUSHION_TOP = 0.05;

// Animaciones que trae el modelo: en reposo mira a su alrededor en bucle, y de vez en cuando
// inclina la cabeza con curiosidad
const CLIPS = { idle: "HeavyHoovedIdle2", toss: "HeavyHoovedTossHead" };
const PAUSE = { min: 8, max: 16 };
const FADE = 0.5;

export const createCatBed = ({ requestRender, animate }: SceneHooks) => {
  const group = new Group();
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let timer = 0;
  let disposed = false;

  // Caja invisible con la medida final del rincón: los modelos llegan después, pero el encuadre
  // de la cámara se calcula al empezar y tiene que contar con ellos
  const bounds = new Mesh(
    new BoxGeometry(CAT_BED_SIZE.diameter, CUSHION_TOP + CAT_HEIGHT, CAT_BED_SIZE.diameter),
    new MeshBasicMaterial({ visible: false }),
  );
  bounds.position.y = (CUSHION_TOP + CAT_HEIGHT) / 2;
  group.add(bounds);

  Promise.all([loadModel(catBedUrl, CAT_BED_SIZE.diameter, "x"), loadModel(catUrl, CAT_HEIGHT)])
    .then(([bed, cat]) => {
      if (disposed) return;
      // La cama se tiñe de azul para que el gato gris resalte sobre ella (el color multiplica
      // la textura de peluche, que conserva su relieve)
      bed.model.traverse((object) => {
        if (object instanceof Mesh && object.material instanceof MeshStandardMaterial) {
          object.material.color.set(palette.catBed);
        }
      });
      cat.model.position.y = CUSHION_TOP;
      group.add(bed.model, cat.model);
      requestRender();

      if (reducedMotion) return;
      const mixer = new AnimationMixer(cat.model);
      const clip = (name: string) => cat.animations.find((animation) => animation.name === name);
      const idleClip = clip(CLIPS.idle);
      const tossClip = clip(CLIPS.toss);
      if (!idleClip) return;
      const idle = mixer.clipAction(idleClip).play();
      const toss = tossClip ? mixer.clipAction(tossClip).setLoop(LoopOnce, 1) : null;
      if (toss) toss.clampWhenFinished = true;

      // Inclina la cabeza (fundido cruzado desde el reposo) y al acabar vuelve al reposo
      const scheduleToss = () => {
        if (!toss) return;
        const wait = PAUSE.min + Math.random() * (PAUSE.max - PAUSE.min);
        timer = window.setTimeout(() => {
          if (disposed) return;
          toss.reset().play().crossFadeFrom(idle, FADE, false);
        }, wait * 1000);
      };
      mixer.addEventListener("finished", () => {
        if (!toss) return;
        idle.reset().play().crossFadeFrom(toss, FADE, false);
        scheduleToss();
      });
      scheduleToss();

      // El reposo es continuo: la escena se dibuja en bucle mientras exista el gato
      animate((delta) => {
        mixer.update(delta);
        return !disposed;
      });
    })
    .catch(() => {
      // Sin modelos (fallo de red) el rincón queda vacío; el resto de la escena sigue igual
    });

  group.userData.dispose = () => {
    disposed = true;
    window.clearTimeout(timer);
  };
  return group;
};
