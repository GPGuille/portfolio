import { Group, Mesh, MeshStandardMaterial, Shape, ShapeGeometry } from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { palette } from "../palette";

// Proporcionada al tablero de 180 × 80: casi tan profunda como él
export const DRAWER_UNIT_SIZE = { width: 0.42, height: 0.74, depth: 0.77 };

const DRAWER_COUNT = 5;
const GAP = 0.008;

// Tirador: el hueco en forma de arco en el borde superior de cada cajón
const createHandleGeometry = () => {
  const halfWidth = 0.07;
  const depth = 0.022;
  const shape = new Shape();
  shape.moveTo(-halfWidth, 0);
  shape.quadraticCurveTo(0, -depth * 2, halfWidth, 0);
  shape.lineTo(-halfWidth, 0);
  return new ShapeGeometry(shape, 12);
};

// Cajonera de cinco cajones, como las de debajo del escritorio
export const createDrawerUnit = () => {
  const { width, height, depth } = DRAWER_UNIT_SIZE;
  const group = new Group();

  const bodyMaterial = new MeshStandardMaterial({ color: palette.drawerBody, roughness: 0.7 });
  const frontMaterial = new MeshStandardMaterial({ color: palette.drawerFront, roughness: 0.65 });
  const handleMaterial = new MeshStandardMaterial({ color: palette.drawerHandle, roughness: 0.9 });
  const handleGeometry = createHandleGeometry();

  const body = new Mesh(new RoundedBoxGeometry(width, height, depth, 3, 0.012), bodyMaterial);
  body.position.y = height / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // Frentes de los cajones, un poco salientes respecto al cuerpo
  const frontHeight = (height - GAP * (DRAWER_COUNT + 1)) / DRAWER_COUNT;
  const frontGeometry = new RoundedBoxGeometry(width - GAP * 2, frontHeight, 0.02, 2, 0.006);

  for (let index = 0; index < DRAWER_COUNT; index++) {
    const y = GAP + frontHeight / 2 + index * (frontHeight + GAP);

    const front = new Mesh(frontGeometry, frontMaterial);
    front.position.set(0, y, depth / 2 + 0.006);
    front.castShadow = true;
    front.receiveShadow = true;

    const handle = new Mesh(handleGeometry, handleMaterial);
    handle.position.set(0, y + frontHeight / 2 - 0.004, depth / 2 + 0.0165);

    group.add(front, handle);
  }

  return group;
};
