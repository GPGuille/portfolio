import { Box3, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneGeometry, Vector3 } from "three";
import postItUrl from "../../assets/models/post-it.glb?url";
import { skillGroups } from "../../content/skills";
import { loadModel } from "../models/loadModel";
import { palette } from "../palette";
import { createPostItTextTexture } from "../textures/createPostItTextTexture";

// Post-its del tablón (Skills), uno por categoría de `src/content/skills.ts`, con papel y chincheta de
// colores distintos y algo girados. El modelo (IA) se carga una vez y se clona. Medidas relativas al
// tablón: `width` × `height` y el corcho a `surfaceZ` de la pared. Origen: centro de la base del tablón
const NOTE_WIDTH = 0.2;
// Chincheta: algo más pequeña que en el modelo y arriba a la izquierda del papel, para dejar sitio
// a la lista cuando el post-it se abre en la ventana de Skills (que la mide y la copia)
const PIN_SCALE = 0.8;
const PIN_POSITION = { x: 0.22, lift: 0.025 };
const LAYOUT = [
  { x: -0.2, y: 0.34, rotation: 0.05 },
  { x: 0.19, y: 0.35, rotation: -0.06 },
  { x: -0.18, y: 0.08, rotation: -0.04 },
  { x: 0.2, y: 0.075, rotation: 0.07 },
];

export const createPostIts = (surfaceZ: number, onLoad: () => void) => {
  const group = new Group();
  // Vacío hasta que carga: el encuadre no lo cuenta (está dentro del tablón)
  group.userData.bleeds = true;

  loadModel(postItUrl, NOTE_WIDTH, "x")
    .then(({ model }) => {
      skillGroups.slice(0, LAYOUT.length).forEach((skills, index) => {
        const layout = LAYOUT[index]!;
        const note = model.clone(true);
        note.traverse((object) => {
          if (!(object instanceof Mesh) || !(object.material instanceof MeshStandardMaterial)) return;
          object.material = object.material.clone();
          if (object.material.name === "Matte yellow paper") {
            object.material.color.set(palette.postItPapers[index % palette.postItPapers.length]!);
          }
          if (object.material.name === "Glossy red plastic") {
            object.material.color.set(palette.postItPins[index % palette.postItPins.length]!);
          }

        });

        // Texto pegado al papel, en la parte de abajo (arriba está la chincheta)
        let paper: Mesh | undefined;
        note.traverse((object) => {
          if (object instanceof Mesh && object.material.name === "Matte yellow paper") paper = object;
        });
        if (!paper) return;
        note.updateMatrixWorld(true);
        const paperBox = new Box3().setFromObject(paper);
        const paperSize = paperBox.getSize(new Vector3());

        // Cabeza y aguja de la chincheta van juntas en un grupo, que se encoge sobre su centro y se
        // lleva a su nuevo sitio (a PIN_POSITION.x del ancho desde la izquierda, algo más arriba)
        const pinParts: Mesh[] = [];
        note.traverse((object) => {
          if (object instanceof Mesh && object.material.name !== "Matte yellow paper") pinParts.push(object);
        });
        const pin = new Group();
        note.add(pin);
        for (const part of pinParts) pin.attach(part);
        const pinCenter = new Box3().setFromObject(pin).getCenter(new Vector3());
        for (const part of pinParts) part.position.sub(pinCenter);
        pin.position.set(
          paperBox.min.x + paperSize.x * PIN_POSITION.x,
          pinCenter.y + paperSize.x * PIN_POSITION.lift,
          pinCenter.z,
        );
        pin.scale.setScalar(PIN_SCALE);
        const side = paperSize.x * 0.86;
        const text = new Mesh(
          new PlaneGeometry(side, side),
          new MeshBasicMaterial({ map: createPostItTextTexture(skills, palette.postItInk), transparent: true }),
        );
        text.position.set((paperBox.min.x + paperBox.max.x) / 2, paperBox.min.y + side * 0.47, paperBox.max.z + 0.0008);

        const holder = new Group();
        holder.add(note, text);
        // La trasera del papel toca el corcho
        holder.position.set(layout.x, layout.y, surfaceZ - paperBox.min.z);
        holder.rotation.z = layout.rotation;
        group.add(holder);
      });
      onLoad();
    })
    .catch(() => {});

  return group;
};
