import { Group, Mesh, MeshStandardMaterial } from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { palette } from "../palette";

// Unidad estándar de tecla (19,05 mm): todas las medidas del teclado salen de aquí
const U = 0.01905;
// Estilo juguete: teclas gorditas con más separación, carcasa gruesa y muy redondeada
const KEY_GAP = 0.003;
const KEYCAP_HEIGHT = 0.011;
const CASE_MARGIN = 0.013;
const CASE_HEIGHT = 0.028;
// Las teclas quedan algo hundidas en la carcasa y asoman por encima del borde
const KEYCAP_SINK = 0.004;
// Inclinación: la parte de atrás queda más alta, como un teclado real
const TILT = 0.06;

type KeyKind = "alpha" | "modifier" | "accent";
// [ancho en unidades, tipo]; sin tipo es un hueco
type KeySpec = [number, KeyKind?];

const repeat = (count: number, kind: KeyKind): KeySpec[] => Array.from({ length: count }, () => [1, kind]);
const NAV: KeySpec[] = [[0.25], ...repeat(3, "modifier")];

// Distribución TKL (80%) de 87 teclas, fila a fila desde atrás.
// Colores como su teclado: letras crema, modificadores beige, Esc y Enter marrones
const LAYOUT: KeySpec[][] = [
  [[1, "accent"], [1], ...repeat(4, "modifier"), [0.5], ...repeat(4, "alpha"), [0.5], ...repeat(4, "modifier"), ...NAV],
  [...repeat(13, "alpha"), [2, "modifier"], ...NAV],
  [[1.5, "modifier"], ...repeat(12, "alpha"), [1.5, "modifier"], ...NAV],
  [[1.75, "modifier"], ...repeat(11, "alpha"), [2.25, "accent"]],
  [[2.25, "modifier"], ...repeat(10, "alpha"), [2.75, "modifier"], [0.25], [1], [1, "modifier"], [1]],
  [...repeat(3, "modifier").map(([, kind]): KeySpec => [1.25, kind]), [6.25, "alpha"], ...Array.from({ length: 4 }, (): KeySpec => [1.25, "modifier"]), ...NAV],
];

const LAYOUT_WIDTH = 18.25 * U;
// Seis filas más medio hueco entre las teclas de función y el resto
const LAYOUT_DEPTH = 6.5 * U;
export const KEYBOARD_SIZE = { width: LAYOUT_WIDTH + CASE_MARGIN * 2, depth: LAYOUT_DEPTH + CASE_MARGIN * 2 };
// Centro del bloque principal (letras, 15 unidades) respecto al centro del teclado:
// queda a la izquierda porque a la derecha está el bloque de flechas (3,25 unidades)
export const KEYBOARD_MAIN_BLOCK_OFFSET = -((18.25 - 15) / 2) * U;

// Teclado mecánico TKL. El origen es el centro de la base del teclado
export const createKeyboard = () => {
  const group = new Group();
  const body = new Group();
  body.rotation.x = -TILT;
  // Gira sobre el borde delantero para que la parte de atrás se levante
  body.position.z = KEYBOARD_SIZE.depth / 2;
  group.add(body);

  const keyboardCase = new Mesh(
    new RoundedBoxGeometry(KEYBOARD_SIZE.width, CASE_HEIGHT, KEYBOARD_SIZE.depth, 6, 0.012),
    new MeshStandardMaterial({ color: palette.keyboardCase, metalness: 0.25, roughness: 0.55 }),
  );
  keyboardCase.position.set(0, CASE_HEIGHT / 2, -KEYBOARD_SIZE.depth / 2);
  keyboardCase.castShadow = true;
  keyboardCase.receiveShadow = true;
  body.add(keyboardCase);

  const materials: Record<KeyKind, MeshStandardMaterial> = {
    alpha: new MeshStandardMaterial({ color: palette.keycapAlpha, roughness: 0.7 }),
    modifier: new MeshStandardMaterial({ color: palette.keycapModifier, roughness: 0.7 }),
    accent: new MeshStandardMaterial({ color: palette.keycapAccent, roughness: 0.7 }),
  };
  const geometries = new Map<number, RoundedBoxGeometry>();
  const keycapGeometry = (units: number) => {
    if (!geometries.has(units)) {
      geometries.set(units, new RoundedBoxGeometry(units * U - KEY_GAP, KEYCAP_HEIGHT, U - KEY_GAP, 4, 0.0038));
    }
    return geometries.get(units)!;
  };

  const keycapY = CASE_HEIGHT - KEYCAP_SINK + KEYCAP_HEIGHT / 2;
  LAYOUT.forEach((row, rowIndex) => {
    const rowSlot = rowIndex === 0 ? 0 : rowIndex + 0.5;
    const z = -KEYBOARD_SIZE.depth + CASE_MARGIN + (rowSlot + 0.5) * U;
    let x = -LAYOUT_WIDTH / 2;
    for (const [units, kind] of row) {
      if (kind) {
        const keycap = new Mesh(keycapGeometry(units), materials[kind]);
        keycap.position.set(x + (units * U) / 2, keycapY, z);
        keycap.castShadow = true;
        keycap.receiveShadow = true;
        body.add(keycap);
      }
      x += units * U;
    }
  });

  return group;
};
