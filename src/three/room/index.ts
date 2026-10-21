import { Group, Mesh } from "three";
import type { Material } from "three";
import certificateShelfUrl from "../../assets/models/certificate-shelf.glb?url";
import corkboardUrl from "../../assets/models/corkboard.glb?url";
import wallShelfUrl from "../../assets/models/wall-shelf.glb?url";
import { createChair } from "./createChair";
import { createDeskKit, DESK_KIT_SIZE } from "./createDeskKit";
import { createDeskProps, createShelfDuck } from "./createDeskProps";
import { createPostIts } from "./createPostIts";
import { createDeskTop, DESK_TOP_SIZE } from "./createDeskTop";
import { createDrawerUnit, DRAWER_UNIT_SIZE } from "./createDrawerUnit";
import { createMonitor, MONITOR_HEIGHT } from "./createMonitor";
import { createCatBed, CAT_BED_SIZE } from "./createCatBed";
import { createRug, RUG_SIZE } from "./createRug";
import { createFloorShadowCatcher, createWallShadowCatcher } from "./createShadowCatcher";
import { createWallProp } from "./createWallProp";

// La pared (invisible) queda a 5 mm del borde trasero del escritorio
export const WALL_Z = -DESK_TOP_SIZE.depth / 2 - 0.005;


// Pared: hueco sobre el monitor, alto de los objetos colgados, anchos y separación entre ellos
const WALL_GAP = 0.07;
const WALL_ITEM_HEIGHT = 0.68;
// Tablón de 1 m y estantería de 85 cm, con el mismo alto (68 cm, bordes alineados) y a la misma
// distancia de la balda de 70 cm, que va centrada sobre la pantalla. El tablón es más ancho porque
// la estantería sobresale de la pared y, con la perspectiva, ya se ve más grande
const CORKBOARD_WIDTH = 1;
const SIDE_WIDTH = 0.85;
const SIDE_HEIGHT = SIDE_WIDTH * (0.96 / 1.2);
const SHELF_WIDTH = 0.7;
// Materiales de madera de la estantería que se sustituyen por la madera del marco del tablón
const SHELF_WOOD = new Set(["Satin cabinet wood", "Dark satin frame wood"]);
const WALL_SPACING = 0.16;
// La cámara mira desde la derecha: lo que está en la pared se ve desplazado a la izquierda respecto
// al monitor (que está más adelante). Se compensa para que la balda se vea centrada sobre la pantalla
const SHELF_PARALLAX = 0.12;

// La habitación se monta por partes: escritorio (cajoneras, tablero, alfombrilla, monitor,
// teclado y ratón), alfombra, silla, tablón a la izquierda y estantería a la derecha
// Lo que la habitación necesita de la escena: volver a dibujar cuando llega un modelo cargado
// aparte, y registrar animaciones que se dibujan en bucle hasta que terminan (devuelven false)
export type SceneHooks = { requestRender: () => void; animate: (animation: (delta: number) => boolean) => void };

export const createRoom = (hooks: SceneHooks) => {
  const room = new Group();

  room.add(createFloorShadowCatcher(WALL_Z));

  // Una cajonera en cada extremo, enrasadas con los lados y el fondo del tablero;
  // el tablero solo sobresale un poco por delante (la diferencia de profundidad)
  const deskZ = 0;
  const drawerX = DESK_TOP_SIZE.width / 2 - DRAWER_UNIT_SIZE.width / 2;
  const drawerZ = deskZ - DESK_TOP_SIZE.depth / 2 + DRAWER_UNIT_SIZE.depth / 2;
  for (const side of [-1, 1]) {
    const drawerUnit = createDrawerUnit();
    drawerUnit.position.set(side * drawerX, 0, drawerZ);
    room.add(drawerUnit);
  }

  const deskHeight = DRAWER_UNIT_SIZE.height + DESK_TOP_SIZE.thickness;
  const deskTop = createDeskTop();
  deskTop.position.set(0, deskHeight - DESK_TOP_SIZE.thickness / 2, deskZ);
  room.add(deskTop);

  // Alfombrilla, teclado y ratón en un solo modelo de IA, a 8 cm del borde delantero de la mesa
  const matFront = DESK_TOP_SIZE.depth / 2 - 0.08;
  const deskKit = createDeskKit(() => hooks.requestRender());
  deskKit.position.set(0, deskHeight, matFront - DESK_KIT_SIZE.depth / 2);
  room.add(deskKit);

  // Objetos pequeños a los lados de la alfombrilla: libreta, bolígrafos y taza
  const deskProps = createDeskProps(() => hooks.requestRender());
  deskProps.position.y = deskHeight;
  room.add(deskProps);

  // Monitor centrado, con el pie a 3 cm del borde trasero de la mesa
  // (su borde delantero queda a unos 3,5 cm de la alfombrilla)
  const monitor = createMonitor(() => hooks.requestRender());
  monitor.position.set(0, deskHeight, -DESK_TOP_SIZE.depth / 2 + 0.03);
  room.add(monitor);


  // Alfombra bajo toda la mesa (su borde de atrás a 6 cm de la pared) que termina pasada la silla;
  // con una columna de más a cada lado de la mesa para que quepa la cama del gato a la derecha
  const rug = createRug();
  // Centrada en la mesa: por la derecha termina justo pasada la cama del gato
  rug.position.set(0, 0, WALL_Z + 0.06 + RUG_SIZE.depth / 2);
  room.add(rug);

  // Cama con el gato dormido a la derecha de la cajonera, sobre la alfombra, con su frente
  // alineado con el borde delantero de la mesa y girada hacia la cámara
  const catBed = createCatBed(hooks);
  room.userData.dispose = catBed.userData.dispose;
  catBed.position.set(
    DESK_TOP_SIZE.width / 2 + 0.06 + CAT_BED_SIZE.diameter / 2,
    RUG_SIZE.thickness,
    DESK_TOP_SIZE.depth / 2 - CAT_BED_SIZE.diameter / 2,
  );
  catBed.rotation.y = 0.5;
  room.add(catBed);

  // Silla vacía delante del teclado, algo separada de la mesa y girada unos 23° hacia la
  // derecha (hacia la cámara): como si alguien se acabara de levantar
  const chair = createChair(() => hooks.requestRender());
  chair.position.set(0.06, RUG_SIZE.thickness, DESK_TOP_SIZE.depth / 2 + 0.3);
  // El modelo mira hacia +Z: se gira media vuelta para que mire a la mesa, algo girada a la derecha
  chair.rotation.y = Math.PI - 0.4;
  room.add(chair);

  // Pared: tablón (Skills) a la izquierda, baldas con planta, libros y figurita de gato en el
  // centro, sobre el monitor, y estantería con títulos (Certificaciones) a la derecha. Modelos de
  // IA (Hyper3D). Todo queda por debajo de la misma línea superior que antes, para que la escena
  // no crezca en altura (la altura es lo que manda en el encuadre: si crece, todo se ve más pequeño)
  const wallTopLine = deskHeight + MONITOR_HEIGHT + WALL_GAP + WALL_ITEM_HEIGHT;
  const shelfX = SHELF_PARALLAX;
  const hooksLoad = () => hooks.requestRender();

  // El tablón se ajusta al mismo alto que la estantería (apenas cambia su proporción)
  const corkboard = createWallProp(corkboardUrl, { width: CORKBOARD_WIDTH, height: SIDE_HEIGHT, depth: 0.05 }, () => onWallWoodLoad(), true);
  corkboard.position.set(shelfX - SHELF_WIDTH / 2 - WALL_SPACING - CORKBOARD_WIDTH / 2, wallTopLine - SIDE_HEIGHT, WALL_Z);
  // Post-its con las skills, sobre el corcho (su cara está a 3,3 cm de la pared)
  corkboard.add(createPostIts(0.033, hooksLoad));
  room.add(corkboard);

  const shelfHeight = SHELF_WIDTH * 0.42;
  const wallShelf = createWallProp(wallShelfUrl, { width: SHELF_WIDTH, height: shelfHeight, depth: 0.2 }, hooksLoad);
  // Justo encima de la pantalla, centrada sobre ella
  const monitorTop = deskHeight + MONITOR_HEIGHT;
  wallShelf.position.set(shelfX, monitorTop + 0.1, WALL_Z);
  wallShelf.add(createShelfDuck(SHELF_WIDTH, hooksLoad));
  room.add(wallShelf);

  // La estantería usa la misma madera (material y textura) que el marco del tablón: así forman
  // pareja y el nogal se queda solo en la mesa. Los marcos de los títulos siguen en nogal.
  // Se aplica cuando han cargado los dos modelos
  const matchWallWood = () => {
    let frameWood: Material | undefined;
    corkboard.traverse((object) => {
      if (object instanceof Mesh && object.material.name === "Soft finished wood frame") frameWood = object.material;
    });
    if (!frameWood) return;
    certificates.traverse((object) => {
      if (object instanceof Mesh && SHELF_WOOD.has(object.material.name)) object.material = frameWood!;
    });
  };
  const onWallWoodLoad = () => {
    matchWallWood();
    hooksLoad();
  };
  const certificates = createWallProp(certificateShelfUrl, { width: SIDE_WIDTH, height: SIDE_HEIGHT, depth: 0.42 }, onWallWoodLoad);
  certificates.position.set(shelfX + SHELF_WIDTH / 2 + WALL_SPACING + SIDE_WIDTH / 2, wallTopLine - SIDE_HEIGHT, WALL_Z);
  room.add(certificates);

  // Una sola pared invisible para las sombras de lo colgado, desde lo alto del monitor
  // (por debajo no recoge la sombra de la mesa)
  const wallBottom = deskHeight + MONITOR_HEIGHT - 0.2;
  const wallTop = wallTopLine + 0.2;
  const wall = createWallShadowCatcher(3.6, wallTop - wallBottom);
  wall.position.set(0.15, (wallTop + wallBottom) / 2, WALL_Z);
  room.add(wall);

  // Objetos clicables de la habitación (contorno al pasar el ratón; más adelante abrirán su sección)
  room.userData.clickables = [
    { id: "projects", object: monitor },
    { id: "skills", object: corkboard },
    { id: "certifications", object: certificates },
  ];

  return room;
};
