import { Group } from "three";
import { createCorkboard, CORKBOARD_SIZE } from "./createCorkboard";
import { createDeskTop, DESK_TOP_SIZE } from "./createDeskTop";
import { createDrawerUnit, DRAWER_UNIT_SIZE } from "./createDrawerUnit";
import { createFloorShadowCatcher, createWallShadowCatcher } from "./createShadowCatcher";

// La pared (invisible) queda justo detrás del borde trasero del escritorio
const WALL_Z = -DESK_TOP_SIZE.depth / 2 - 0.02;

// La habitación se monta por partes: escritorio (dos cajoneras y tablero) y tablón
export const createRoom = () => {
  const room = new Group();

  room.add(createFloorShadowCatcher());

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

  // Tablón colgado en la pared, a la izquierda, dejando el centro libre para el monitor
  const corkboard = createCorkboard();
  corkboard.position.set(-0.5, deskHeight + 0.55, WALL_Z + CORKBOARD_SIZE.depth / 2);
  room.add(corkboard);

  // Pared invisible solo detrás del tablón, algo desplazada hacia donde cae su sombra
  // (derecha y abajo) y sin bajar hasta la mesa
  const corkboardWall = createWallShadowCatcher(CORKBOARD_SIZE.width + 0.3, CORKBOARD_SIZE.height + 0.2);
  corkboardWall.position.set(corkboard.position.x + 0.1, corkboard.position.y - 0.04, WALL_Z);
  room.add(corkboardWall);

  return room;
};
