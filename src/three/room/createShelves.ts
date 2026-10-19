import { CylinderGeometry, Group, Mesh, MeshStandardMaterial, PlaneGeometry, SphereGeometry } from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { palette } from "../palette";
import { createCertificateTexture } from "../textures/createCertificateTexture";
import { CORKBOARD_SIZE } from "./createCorkboard";

// Estantería de cubos colgada (Certificaciones), con el mismo contorno que el tablón
// para que los dos formen pareja a cada lado del monitor. Cuatro huecos en damero.
// Origen: centro de su base, pegado a la pared
export const SHELVES_SIZE = { width: CORKBOARD_SIZE.width, height: CORKBOARD_SIZE.height, depth: 0.2 };

const WALL = 0.03;
const ROW_HEIGHT = (SHELVES_SIZE.height - WALL * 3) / 2;
// Separador vertical de cada fila: arriba más a la derecha, abajo más a la izquierda (damero)
const TOP_DIVIDER_X = 0.12;
const BOTTOM_DIVIDER_X = -0.12;
const FRAME_DEPTH = 0.018;
const LEAN = -0.12;

const roundedBox = (width: number, height: number, depth: number, material: MeshStandardMaterial) => {
  const mesh = new Mesh(new RoundedBoxGeometry(width, height, depth, 4, Math.min(width, height, depth) * 0.45), material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
};

// Título enmarcado apoyado contra el fondo. Origen en su borde inferior trasero
const createCertificateFrame = (width: number, height: number) => {
  const group = new Group();
  const frame = new Mesh(
    new RoundedBoxGeometry(width, height, FRAME_DEPTH, 4, 0.006),
    new MeshStandardMaterial({ color: palette.certificateFrame, roughness: 0.6 }),
  );
  frame.position.set(0, height / 2, FRAME_DEPTH / 2);
  frame.castShadow = true;

  const paper = new Mesh(
    new PlaneGeometry(width - 0.04, height - 0.04),
    new MeshStandardMaterial({
      map: createCertificateTexture({ paper: palette.certificatePaper, ink: palette.certificateInk, seal: palette.certificateSeal }),
      roughness: 0.8,
    }),
  );
  paper.position.set(0, height / 2, FRAME_DEPTH + 0.0005);

  group.add(frame, paper);
  group.rotation.x = LEAN;
  return group;
};

const createBook = (thickness: number, height: number, color: string) => {
  const book = new Mesh(new RoundedBoxGeometry(thickness, height, 0.15, 3, 0.004), new MeshStandardMaterial({ color, roughness: 0.7 }));
  book.castShadow = true;
  book.receiveShadow = true;
  return book;
};

// Planta pequeña: maceta blanca y hojas redondeadas de dos verdes
const createPlant = () => {
  const group = new Group();
  const pot = new Mesh(new CylinderGeometry(0.05, 0.04, 0.09, 32), new MeshStandardMaterial({ color: palette.plantPot, roughness: 0.6 }));
  pot.position.y = 0.045;
  pot.castShadow = true;

  const leafMaterials = [palette.plantLeaves, palette.plantLeavesDark].map((color) => new MeshStandardMaterial({ color, roughness: 0.7 }));
  const leafGeometry = new SphereGeometry(1, 24, 16);
  const leaves: [number, number, number, number][] = [
    [0, 0.14, 0, 0.05],
    [-0.035, 0.12, 0.01, 0.038],
    [0.035, 0.125, -0.01, 0.04],
    [0.01, 0.17, -0.015, 0.035],
    [-0.015, 0.165, 0.02, 0.03],
  ];
  leaves.forEach(([x, y, z, size], index) => {
    const leaf = new Mesh(leafGeometry, leafMaterials[index % 2]);
    leaf.scale.set(size, size * 1.15, size);
    leaf.position.set(x, y, z);
    leaf.castShadow = true;
    group.add(leaf);
  });

  group.add(pot);
  return group;
};

export const createShelves = () => {
  const group = new Group();
  const { width, height, depth } = SHELVES_SIZE;
  const wood = new MeshStandardMaterial({ color: palette.shelf, roughness: 0.65 });
  const backWood = new MeshStandardMaterial({ color: palette.shelfBack, roughness: 0.75 });

  // Carcasa: fondo, laterales, techo, suelo y balda central
  const back = roundedBox(width, height, WALL / 2, backWood);
  back.position.set(0, height / 2, WALL / 4);
  group.add(back);

  for (const side of [-1, 1]) {
    const wall = roundedBox(WALL, height, depth, wood);
    wall.position.set(side * (width / 2 - WALL / 2), height / 2, depth / 2);
    group.add(wall);
  }
  const rowFloors = [WALL / 2, WALL * 1.5 + ROW_HEIGHT, height - WALL / 2];
  for (const y of rowFloors) {
    const board = roundedBox(width, WALL, depth, wood);
    board.position.set(0, y, depth / 2);
    group.add(board);
  }

  // Separadores verticales en damero
  const bottomRowY = WALL;
  const topRowY = WALL * 2 + ROW_HEIGHT;
  for (const [x, y] of [
    [TOP_DIVIDER_X, topRowY],
    [BOTTOM_DIVIDER_X, bottomRowY],
  ] as const) {
    const divider = roundedBox(WALL, ROW_HEIGHT, depth, wood);
    divider.position.set(x, y + ROW_HEIGHT / 2, depth / 2);
    group.add(divider);
  }

  const innerLeft = -width / 2 + WALL;
  const innerRight = width / 2 - WALL;
  const itemZ = WALL / 2 + 0.01;

  // Arriba a la izquierda: un título y dos libros tumbados
  const topLeftCenter = (innerLeft + TOP_DIVIDER_X - WALL / 2) / 2;
  const topTitle = createCertificateFrame(0.26, 0.2);
  topTitle.position.set(topLeftCenter - 0.08, topRowY, itemZ);
  group.add(topTitle);
  [palette.books[3]!, palette.books[1]!].forEach((color, index) => {
    const book = createBook(0.03, 0.18, color);
    book.rotation.z = Math.PI / 2;
    book.position.set(topLeftCenter + 0.17, topRowY + 0.015 + index * 0.031, 0.1);
    group.add(book);
  });

  // Arriba a la derecha: libros de pie
  const standing: [number, number, string][] = [
    [0.035, 0.24, palette.books[0]!],
    [0.03, 0.21, palette.books[1]!],
    [0.04, 0.25, palette.books[2]!],
    [0.032, 0.22, palette.books[3]!],
  ];
  let bookX = TOP_DIVIDER_X + WALL / 2 + 0.04;
  for (const [thickness, bookHeight, color] of standing) {
    const book = createBook(thickness, bookHeight, color);
    book.position.set(bookX + thickness / 2, topRowY + bookHeight / 2, 0.1);
    group.add(book);
    bookX += thickness + 0.004;
  }

  // Abajo a la izquierda: la planta
  const plant = createPlant();
  plant.position.set((innerLeft + BOTTOM_DIVIDER_X - WALL / 2) / 2, bottomRowY, 0.1);
  group.add(plant);

  // Abajo a la derecha: dos títulos
  const bottomRightCenter = (BOTTOM_DIVIDER_X + WALL / 2 + innerRight) / 2;
  const leftTitle = createCertificateFrame(0.22, 0.18);
  leftTitle.position.set(bottomRightCenter - 0.13, bottomRowY, itemZ);
  const rightTitle = createCertificateFrame(0.22, 0.17);
  rightTitle.position.set(bottomRightCenter + 0.13, bottomRowY, itemZ);
  group.add(leftTitle, rightTitle);

  return group;
};
