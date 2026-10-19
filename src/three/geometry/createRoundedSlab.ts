import { ExtrudeGeometry, Shape } from "three";
import { roundedRect } from "./roundedRect";

// Placa con las esquinas redondeadas vistas de frente y los cantos suavizados:
// la pieza base del estilo "juguete" (monitor, alfombrilla…). Queda de pie, centrada
// en el origen y con el grosor en el eje Z
export const createRoundedSlab = (width: number, height: number, depth: number, cornerRadius: number, edge: number) => {
  const outline = roundedRect(new Shape(), width - edge * 2, height - edge * 2, cornerRadius);
  const extrudeDepth = Math.max(depth - edge * 2, 0.0001);
  const geometry = new ExtrudeGeometry(outline, {
    depth: extrudeDepth,
    bevelEnabled: true,
    bevelThickness: edge,
    bevelSize: edge,
    bevelSegments: 5,
    curveSegments: 16,
  });
  geometry.translate(0, 0, -extrudeDepth / 2);
  return geometry;
};
