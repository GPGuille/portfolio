import {
  CatmullRomCurve3,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  Shape,
  SphereGeometry,
  TubeGeometry,
  Vector2,
  Vector3,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { palette } from "../palette";

// Silla sin brazos inspirada en la Herman Miller Setu, en estilo juguete. Su seña de identidad:
// asiento y respaldo son UNA sola pieza continua y curva, sostenida por dos laterales curvos
// ("columna" flexible) sobre una base de cinco patas. Origen: centro de la base en el suelo;
// el asiento mira hacia -Z
const SHELL_WIDTH = 0.46;
const SHELL_THICKNESS = 0.03;
const SHELL_EDGE = 0.012;
const CASTER_RADIUS = 0.022;
const LEG_LENGTH = 0.3;

// Perfil lateral de la pieza (z hacia atrás, y hacia arriba): borde delantero del asiento algo
// caído, asiento casi plano, curva suave en la zona lumbar y respaldo reclinado hasta 82 cm
const PROFILE = [
  new Vector3(0, 0.445, -0.23),
  new Vector3(0, 0.465, -0.15),
  new Vector3(0, 0.465, 0.02),
  new Vector3(0, 0.475, 0.15),
  new Vector3(0, 0.53, 0.22),
  new Vector3(0, 0.66, 0.255),
  new Vector3(0, 0.82, 0.29),
];

const shadowed = (mesh: Mesh) => {
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
};

// Pieza única: el perfil se engrosa (contorno de una línea gruesa) y se extruye a lo ancho,
// con los cantos redondeados
const createShellGeometry = (curve: CatmullRomCurve3) => {
  const samples = 60;
  const outer: Vector2[] = [];
  const inner: Vector2[] = [];
  for (let index = 0; index <= samples; index++) {
    const t = index / samples;
    const point = curve.getPoint(t);
    const tangent = curve.getTangent(t);
    // Normal del perfil en el plano lateral (z, y)
    const normal = new Vector2(-tangent.y, tangent.z).normalize();
    const half = SHELL_THICKNESS / 2;
    outer.push(new Vector2(point.z + normal.x * half, point.y + normal.y * half));
    inner.push(new Vector2(point.z - normal.x * half, point.y - normal.y * half));
  }
  const shape = new Shape([...outer, ...inner.reverse()]);
  const depth = SHELL_WIDTH - SHELL_EDGE * 2;
  const geometry = new ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: SHELL_EDGE,
    bevelSize: SHELL_EDGE * 0.9,
    bevelSegments: 5,
  });
  // La forma se dibujó en (z, y) y se extruyó en z: se gira para que el ancho quede en x
  geometry.translate(0, 0, -depth / 2);
  geometry.rotateY(-Math.PI / 2);
  return geometry;
};

export const createChair = () => {
  const group = new Group();
  const shell = new MeshStandardMaterial({ color: palette.chairShell, roughness: 0.45 });
  const frame = new MeshStandardMaterial({ color: palette.chairFrame, roughness: 0.35 });

  // Base de cinco patas que bajan en curva hasta ruedas dobles
  const legY = CASTER_RADIUS * 2 + 0.012;
  const legGeometry = new RoundedBoxGeometry(0.045, 0.026, LEG_LENGTH, 4, 0.012);
  const wheelGeometry = new CylinderGeometry(CASTER_RADIUS, CASTER_RADIUS, 0.014, 20);
  for (let index = 0; index < 5; index++) {
    const arm = new Group();
    arm.rotation.y = (index / 5) * Math.PI * 2 + Math.PI / 5;
    const leg = shadowed(new Mesh(legGeometry, frame));
    leg.position.set(0, legY, LEG_LENGTH / 2);
    arm.add(leg);
    for (const side of [-1, 1]) {
      const wheel = shadowed(new Mesh(wheelGeometry, frame));
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(side * 0.01, CASTER_RADIUS, LEG_LENGTH - 0.015);
      arm.add(wheel);
    }
    group.add(arm);
  }
  const hub = shadowed(new Mesh(new SphereGeometry(0.04, 20, 12), frame));
  hub.scale.y = 0.6;
  hub.position.y = legY;

  // Columna con funda y soporte bajo el asiento
  const mountTop = 0.42;
  const column = shadowed(new Mesh(new CylinderGeometry(0.024, 0.03, mountTop - legY, 20), frame));
  column.position.y = (mountTop + legY) / 2;
  const mount = shadowed(new Mesh(new RoundedBoxGeometry(0.24, 0.035, 0.22, 4, 0.014), frame));
  mount.position.set(0, mountTop, 0);

  const profile = new CatmullRomCurve3(PROFILE);
  const seatShell = shadowed(new Mesh(createShellGeometry(profile), shell));

  // Laterales: siguen el perfil por debajo y por detrás de la pieza, desde la mitad del asiento
  // hasta casi lo alto del respaldo, y bajan al soporte por delante
  for (const side of [-1, 1]) {
    const x = side * (SHELL_WIDTH / 2 - 0.004);
    const points = [
      new Vector3(x * 0.55, mountTop, -0.05),
      new Vector3(x, 0.44, -0.12),
      ...[0.35, 0.55, 0.7, 0.82, 0.93].map((t) => {
        const point = profile.getPoint(t);
        const normal = new Vector2(-profile.getTangent(t).y, profile.getTangent(t).z).normalize();
        // Desplazado hacia la cara de abajo/atrás de la pieza
        return new Vector3(x, point.y - normal.y * 0.03, point.z - normal.x * 0.03);
      }),
    ];
    const spine = shadowed(new Mesh(new TubeGeometry(new CatmullRomCurve3(points), 64, 0.016, 12), frame));
    group.add(spine);
  }

  group.add(hub, column, mount, seatShell);
  return group;
};
