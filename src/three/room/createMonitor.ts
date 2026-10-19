import { Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, ShapeGeometry, Shape, Vector3 } from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { createRoundedSlab } from "../geometry/createRoundedSlab";
import { roundedRect } from "../geometry/roundedRect";
import { palette } from "../palette";
import { createCodeScreenTexture } from "../textures/createCodeScreenTexture";

// iMac de 24" como referencia, en estilo juguete: un 15 % más grande, cuerpo grueso
// con esquinas muy redondeadas, marco blanco gordito, barbilla de color y pie robusto
const BODY = { width: 0.63, height: 0.44, depth: 0.034, corner: 0.03 };
const CHIN = 0.085;
const BEZEL = 0.022;
const FOOT = { width: 0.15, depth: 0.17, thickness: 0.016 };
const PLATE = { width: 0.15, thickness: 0.016 };
const BODY_BOTTOM = 0.09;

// Origen del monitor: centro del pie apoyado en la mesa
const BODY_CENTER_Z = 0.045;
const BODY_FRONT_Z = BODY_CENTER_Z + BODY.depth / 2;
const STAND_BOTTOM = new Vector3(0, FOOT.thickness, -FOOT.depth / 2 + 0.03);
const STAND_TOP = new Vector3(0, BODY_BOTTOM + BODY.height * 0.35, BODY_CENTER_Z - BODY.depth / 2 - PLATE.thickness / 2 + 0.004);

const WHITE_PANEL = { width: BODY.width - 0.012, height: BODY.height - CHIN };
const SCREEN = { width: WHITE_PANEL.width - BEZEL * 2, height: WHITE_PANEL.height - BEZEL * 2 };

export const MONITOR_FOOT_DEPTH = FOOT.depth;
// Centro de la pantalla respecto al origen del monitor (para encuadres y para Proyectos)
export const MONITOR_SCREEN_CENTER = new Vector3(0, BODY_BOTTOM + CHIN + WHITE_PANEL.height / 2, BODY_FRONT_Z);

const roundedPlane = (width: number, height: number, radius: number) =>
  new ShapeGeometry(roundedRect(new Shape(), width, height, radius), 16);

export const createMonitor = () => {
  const group = new Group();
  const shell = new MeshStandardMaterial({ color: palette.monitorBody, roughness: 0.6 });

  const foot = new Mesh(new RoundedBoxGeometry(FOOT.width, FOOT.thickness, FOOT.depth, 5, 0.007), shell);
  foot.position.y = FOOT.thickness / 2;
  foot.castShadow = true;
  foot.receiveShadow = true;

  // Placa del pie: de la parte trasera de la base hasta la espalda del cuerpo
  const rise = new Vector3().subVectors(STAND_TOP, STAND_BOTTOM);
  const plate = new Mesh(new RoundedBoxGeometry(PLATE.width, rise.length(), PLATE.thickness, 5, 0.007), shell);
  plate.position.addVectors(STAND_BOTTOM, STAND_TOP).multiplyScalar(0.5);
  plate.rotation.x = Math.atan2(rise.z, rise.y);
  plate.castShadow = true;

  const body = new Mesh(createRoundedSlab(BODY.width, BODY.height, BODY.depth, BODY.corner, 0.008), shell);
  body.position.set(0, BODY_BOTTOM + BODY.height / 2, BODY_CENTER_Z);
  body.castShadow = true;
  body.receiveShadow = true;

  // Frontal blanco sobre la barbilla de color, y dentro la pantalla con el editor de código.
  // La pantalla no recibe luces: brilla por sí misma, como una pantalla encendida
  const whitePanel = new Mesh(
    roundedPlane(WHITE_PANEL.width, WHITE_PANEL.height, BODY.corner - 0.006),
    new MeshStandardMaterial({ color: palette.monitorBezel, roughness: 0.5 }),
  );
  whitePanel.position.set(0, MONITOR_SCREEN_CENTER.y, BODY_FRONT_Z + 0.0005);

  const screen = new Mesh(
    roundedPlane(SCREEN.width, SCREEN.height, 0.012),
    new MeshBasicMaterial({
      map: createCodeScreenTexture({
        background: palette.monitorScreen,
        panel: palette.monitorScreenPanel,
        muted: palette.monitorScreenMuted,
        syntax: palette.monitorScreenSyntax,
      }),
    }),
  );
  // Las coordenadas de la forma van en metros: se pasan a 0–1 para que la textura ocupe la pantalla
  const uv = screen.geometry.attributes.uv!;
  for (let index = 0; index < uv.count; index++) {
    uv.setXY(index, uv.getX(index) / SCREEN.width + 0.5, uv.getY(index) / SCREEN.height + 0.5);
  }
  screen.position.set(0, MONITOR_SCREEN_CENTER.y, BODY_FRONT_Z + 0.001);

  group.add(foot, plate, body, whitePanel, screen);
  return group;
};
