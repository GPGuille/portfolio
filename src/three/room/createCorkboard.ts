import { BoxGeometry, ExtrudeGeometry, Group, Mesh, MeshStandardMaterial, Path, PlaneGeometry, Shape } from "three";
import { palette } from "../palette";
import { roundedRect } from "../geometry/roundedRect";
import { createSpeckleTexture } from "../textures/createSpeckleTexture";

export const CORKBOARD_SIZE = { width: 1, height: 0.68, depth: 0.06 };

// Ancho del marco y cuánto se redondean sus cantos
const FRAME = 0.06;
const BEVEL = 0.016;
// El corcho queda hundido dentro del marco
const CORK_Z = -0.008;

// Marco de una sola pieza: un rectángulo redondeado con un hueco, extruido
// con los cantos biselados para que quede gordito por dentro y por fuera
const createFrameGeometry = (width: number, height: number, depth: number) => {
  const outer = roundedRect(new Shape(), width - BEVEL * 2, height - BEVEL * 2, 0.04);
  const innerWidth = width - FRAME * 2 + BEVEL * 2;
  const innerHeight = height - FRAME * 2 + BEVEL * 2;
  outer.holes.push(roundedRect(new Path(), innerWidth, innerHeight, 0.02));

  const extrudeDepth = depth - BEVEL * 2;
  const geometry = new ExtrudeGeometry(outer, {
    depth: extrudeDepth,
    bevelEnabled: true,
    bevelThickness: BEVEL,
    bevelSize: BEVEL,
    bevelSegments: 6,
    curveSegments: 16,
  });
  geometry.translate(0, 0, -extrudeDepth / 2);
  return geometry;
};

// Tablón de corcho (Skills): marco de madera clara de una pieza y el corcho hundido.
// De momento vacío; más adelante llevará las skills
export const createCorkboard = () => {
  const { width, height, depth } = CORKBOARD_SIZE;
  const group = new Group();

  const frameMaterial = new MeshStandardMaterial({ color: palette.corkboardFrame, roughness: 0.75 });
  const frame = new Mesh(createFrameGeometry(width, height, depth), frameMaterial);
  frame.castShadow = true;
  frame.receiveShadow = true;

  // Fondo detrás del corcho, para que no se vea a través del hueco
  const backFront = CORK_Z - 0.003;
  const back = new Mesh(new BoxGeometry(width - FRAME, height - FRAME, depth / 2 + backFront), frameMaterial);
  back.position.z = (-depth / 2 + backFront) / 2;

  const cork = new Mesh(
    new PlaneGeometry(width - FRAME * 2 + 0.01, height - FRAME * 2 + 0.01),
    new MeshStandardMaterial({
      map: createSpeckleTexture({ base: palette.cork, dark: palette.corkDark, light: palette.corkLight }),
      roughness: 1,
    }),
  );
  cork.position.z = CORK_Z;
  cork.receiveShadow = true;
  group.add(frame, back, cork);

  return group;
};
