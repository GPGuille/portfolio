import { Group } from "three";
import { createDeskTop, DESK_TOP_SIZE } from "./createDeskTop";
import { createDrawerUnit, DRAWER_UNIT_SIZE } from "./createDrawerUnit";
import { createShadowCatcher } from "./createShadowCatcher";

// La habitación se monta por partes; de momento, el escritorio: dos cajoneras y el tablero
export const createRoom = () => {
  const room = new Group();

  room.add(createShadowCatcher());

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

  const deskTop = createDeskTop();
  deskTop.position.set(0, DRAWER_UNIT_SIZE.height + DESK_TOP_SIZE.thickness / 2, deskZ);
  room.add(deskTop);

  return room;
};
