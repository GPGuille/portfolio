import { Group } from "three";
import { createCorkboard, CORKBOARD_SIZE } from "./createCorkboard";
import { createDeskMat, DESK_MAT_SIZE } from "./createDeskMat";
import { createDeskTop, DESK_TOP_SIZE } from "./createDeskTop";
import { createDrawerUnit, DRAWER_UNIT_SIZE } from "./createDrawerUnit";
import { createKeyboard, KEYBOARD_MAIN_BLOCK_OFFSET, KEYBOARD_SIZE } from "./createKeyboard";
import { createMonitor, MONITOR_FOOT_DEPTH, MONITOR_HEIGHT } from "./createMonitor";
import { createMouse, MOUSE_SIZE } from "./createMouse";
import { createFloorShadowCatcher, createWallShadowCatcher } from "./createShadowCatcher";

// La pared (invisible) queda a 5 mm del borde trasero del escritorio
export const WALL_Z = -DESK_TOP_SIZE.depth / 2 - 0.005;

// Teclado, ratón y alfombrilla, algo más grandes que en la realidad como todo el equipo
// de la mesa (estilo juguete), manteniendo la proporción con el monitor
const DESK_KIT_SCALE = 1.2;

// Hueco entre lo alto del monitor y el borde inferior del tablón
const CORKBOARD_GAP = 0.15;

// La habitación se monta por partes: escritorio (cajoneras, tablero, alfombrilla, monitor, teclado y ratón) y tablón
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

  // Tablón colgado en la pared, a la izquierda, dejando el centro libre para el monitor
  const corkboard = createCorkboard();
  // Cuelga 15 cm por encima del monitor, que es lo más alto de la mesa
  const corkboardBottom = deskHeight + MONITOR_HEIGHT + CORKBOARD_GAP;
  corkboard.position.set(-0.5, corkboardBottom + CORKBOARD_SIZE.height / 2, WALL_Z + CORKBOARD_SIZE.depth / 2);
  room.add(corkboard);

  // Pared invisible solo detrás del tablón, algo desplazada hacia donde cae su sombra
  // (derecha y abajo) y sin bajar hasta la mesa
  const corkboardWall = createWallShadowCatcher(CORKBOARD_SIZE.width + 0.3, CORKBOARD_SIZE.height + 0.2);
  corkboardWall.position.set(corkboard.position.x + 0.1, corkboard.position.y - 0.04, WALL_Z);
  room.add(corkboardWall);

  return room;
};
