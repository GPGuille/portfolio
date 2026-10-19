import { Group } from "three";
import { createChair } from "./createChair";
import { createCorkboard, CORKBOARD_SIZE } from "./createCorkboard";
import { createDeskMat, DESK_MAT_SIZE } from "./createDeskMat";
import { createDeskTop, DESK_TOP_SIZE } from "./createDeskTop";
import { createDrawerUnit, DRAWER_UNIT_SIZE } from "./createDrawerUnit";
import { createKeyboard, KEYBOARD_MAIN_BLOCK_OFFSET, KEYBOARD_SIZE } from "./createKeyboard";
import { createMonitor, MONITOR_FOOT_DEPTH, MONITOR_HEIGHT } from "./createMonitor";
import { createMouse, MOUSE_SIZE } from "./createMouse";
import { createRug, RUG_SIZE } from "./createRug";
import { createFloorShadowCatcher, createWallShadowCatcher } from "./createShadowCatcher";
import { createShelves } from "./createShelves";

// La pared (invisible) queda a 5 mm del borde trasero del escritorio
export const WALL_Z = -DESK_TOP_SIZE.depth / 2 - 0.005;

// Teclado, ratón y alfombrilla, algo más grandes que en la realidad como todo el equipo
// de la mesa (estilo juguete), manteniendo la proporción con el monitor
const DESK_KIT_SCALE = 1.2;

// Hueco entre lo alto del monitor y el borde inferior del tablón
const CORKBOARD_GAP = 0.15;

// La habitación se monta por partes: escritorio (cajoneras, tablero, alfombrilla, monitor,
// teclado y ratón), alfombra, silla, tablón a la izquierda y estantería a la derecha
export const createRoom = () => {
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

  // Alfombrilla centrada, a 8 cm del borde delantero de la mesa
  const kit = DESK_KIT_SCALE;
  const matFront = DESK_TOP_SIZE.depth / 2 - 0.08;
  const mat = createDeskMat();
  mat.scale.setScalar(kit);
  mat.position.set(0, deskHeight, matFront - (DESK_MAT_SIZE.depth * kit) / 2);
  room.add(mat);

  // Monitor centrado, con el pie a 3 cm del borde trasero de la mesa
  // (su borde delantero queda a unos 3,5 cm de la alfombrilla)
  const monitor = createMonitor();
  monitor.position.set(0, deskHeight, -DESK_TOP_SIZE.depth / 2 + 0.03 + MONITOR_FOOT_DEPTH / 2);
  room.add(monitor);

  // Teclado a 7 cm del borde delantero de la alfombrilla, con la zona de letras
  // justo debajo del centro de la pantalla
  const onMat = deskHeight + DESK_MAT_SIZE.thickness * kit;
  const keyboard = createKeyboard();
  keyboard.scale.setScalar(kit);
  keyboard.position.set(-KEYBOARD_MAIN_BLOCK_OFFSET * kit, onMat, matFront - 0.07 - (KEYBOARD_SIZE.depth * kit) / 2);
  room.add(keyboard);

  // Ratón a 5,5 cm a la derecha del teclado, ligeramente girado hacia dentro como al usarlo
  const mouse = createMouse();
  mouse.scale.setScalar(kit);
  const mouseX = keyboard.position.x + ((KEYBOARD_SIZE.width + MOUSE_SIZE.width) / 2) * kit + 0.055;
  mouse.position.set(mouseX, onMat, keyboard.position.z + 0.01);
  mouse.rotation.y = 0.12;
  room.add(mouse);

  // Alfombra grande que abarca toda la zona de trabajo: entra bajo la mesa hasta cerca de
  // la pared y sobresale por delante y por los lados, como en las escenas de estudio
  const rug = createRug();
  rug.position.set(0, 0, WALL_Z + 0.06 + RUG_SIZE.depth / 2);
  room.add(rug);

  // Silla vacía delante del teclado, algo separada de la mesa y girada unos 23° hacia la
  // derecha (hacia la cámara): como si alguien se acabara de levantar
  const chair = createChair();
  chair.position.set(0.06, RUG_SIZE.thickness, DESK_TOP_SIZE.depth / 2 + 0.3);
  chair.rotation.y = -0.4;
  room.add(chair);

  // Tablón y estantería colgados simétricos respecto al monitor (que está en el centro),
  // con 28 cm de hueco entre los dos (la estantería sobresale 20 cm y en perspectiva
  // un hueco menor parece que se tocan)
  const wallItemsOffset = 0.64;

  // Tablón colgado en la pared, a la izquierda
  const corkboard = createCorkboard();
  corkboard.userData.isWallMounted = true;
  // Cuelga 15 cm por encima del monitor, que es lo más alto de la mesa
  const corkboardBottom = deskHeight + MONITOR_HEIGHT + CORKBOARD_GAP;
  corkboard.position.set(-wallItemsOffset, corkboardBottom + CORKBOARD_SIZE.height / 2, WALL_Z + CORKBOARD_SIZE.depth / 2);
  room.add(corkboard);

  // Paredes invisibles detrás del tablón y de la estantería: cada una desde el centro hacia
  // su lado, sin solaparse (donde se solapan la sombra se duplica). Empiezan a la altura
  // de lo alto del monitor para no recoger su sombra
  const wallTop = corkboardBottom + CORKBOARD_SIZE.height + 0.15;
  const wallBottom = deskHeight + MONITOR_HEIGHT;
  const corkboardWall = createWallShadowCatcher(1.6, wallTop - wallBottom);
  corkboardWall.position.set(-0.8, (wallTop + wallBottom) / 2, WALL_Z);
  room.add(corkboardWall);

  // Estantería de cubos en la pared a la derecha: mismo contorno y altura que el tablón
  const shelves = createShelves();
  shelves.userData.isWallMounted = true;
  shelves.position.set(wallItemsOffset, corkboardBottom, WALL_Z);
  room.add(shelves);

  // Su sombra cae más lejos hacia abajo y a la derecha (sobresale 20 cm de la pared): baja
  // 20 cm más que la otra; lo que quede detrás del monitor no se ve
  const shelvesWallBottom = wallBottom - 0.2;
  const shelvesWall = createWallShadowCatcher(1.9, wallTop - shelvesWallBottom);
  shelvesWall.position.set(0.95, (wallTop + shelvesWallBottom) / 2, WALL_Z);
  room.add(shelvesWall);

  return room;
};
