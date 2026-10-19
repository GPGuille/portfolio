import {
  CatmullRomCurve3,
  ConeGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  SphereGeometry,
  TorusGeometry,
  TubeGeometry,
  Vector3,
} from "three";
import { palette } from "../palette";
import { createFurTexture } from "../textures/createFurTexture";

// Tubo que se afina a lo largo de una curva: se crea con grosor constante y luego cada anillo
// se acerca a su centro según lo avanzado del recorrido
const createTaperedTube = (path: CatmullRomCurve3, startRadius: number, endRadius: number, material: MeshStandardMaterial) => {
  const tubular = 48;
  const radial = 14;
  const geometry = new TubeGeometry(path, tubular, startRadius, radial);
  const positions = geometry.attributes.position!;
  const center = new Vector3();
  const vertex = new Vector3();
  for (let ring = 0; ring <= tubular; ring++) {
    const t = ring / tubular;
    path.getPointAt(t, center);
    const scale = (startRadius + (endRadius - startRadius) * t) / startRadius;
    for (let side = 0; side <= radial; side++) {
      const index = ring * (radial + 1) + side;
      vertex.fromBufferAttribute(positions, index).sub(center).multiplyScalar(scale).add(center);
      positions.setXYZ(index, vertex.x, vertex.y, vertex.z);
    }
  }
  geometry.computeVertexNormals();
  const mesh = new Mesh(geometry, material);
  mesh.castShadow = true;
  return mesh;
};

// Gato British Shorthair azul durmiendo enroscado, en estilo juguete: cuerpo como una "hogaza",
// cabeza redonda con mofletes, orejas pequeñas, ojos cerrados y la cola rodeando el cuerpo.
// Mide unos 42 cm de largo. Origen: debajo del centro del cuerpo; la cara mira hacia +Z
export const createCat = () => {
  const group = new Group();
  // Pelo corto y denso con relieve de mechones, como un British de verdad
  const furMaterial = (base: string, dark: string, light: string, seed: number) => {
    const { map, bumpMap } = createFurTexture({ base, dark, light }, seed);
    map.repeat.set(3, 2);
    bumpMap.repeat.set(3, 2);
    return new MeshStandardMaterial({ map, bumpMap, bumpScale: 1.2, roughness: 1 });
  };
  const fur = furMaterial(palette.cat, palette.catDark, palette.catLight, 41);
  const furLight = furMaterial(palette.catLight, palette.cat, palette.catLighter, 42);
  const nose = new MeshStandardMaterial({ color: palette.catNose, roughness: 0.6 });
  const line = new MeshStandardMaterial({ color: palette.catLine, roughness: 0.8 });
  const sphere = new SphereGeometry(1, 32, 20);

  const part = (material: MeshStandardMaterial, scale: [number, number, number], position: [number, number, number]) => {
    const mesh = new Mesh(sphere, material);
    mesh.scale.set(...scale);
    mesh.position.set(...position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
  };

  // Cuerpo enroscado y patas delanteras recogidas
  part(fur, [0.15, 0.095, 0.18], [0, 0.09, -0.02]);
  part(furLight, [0.035, 0.025, 0.045], [-0.045, 0.025, 0.15]);
  part(furLight, [0.035, 0.025, 0.045], [0.03, 0.025, 0.16]);

  // Cabeza apoyada delante, con mofletes y hocico claros
  const headY = 0.13;
  const headZ = 0.12;
  part(fur, [0.085, 0.075, 0.08], [0, headY, headZ]);
  part(fur, [0.05, 0.042, 0.045], [-0.045, headY - 0.025, headZ + 0.035]);
  part(fur, [0.05, 0.042, 0.045], [0.045, headY - 0.025, headZ + 0.035]);
  part(furLight, [0.035, 0.025, 0.025], [0, headY - 0.03, headZ + 0.065]);
  part(nose, [0.011, 0.008, 0.008], [0, headY - 0.012, headZ + 0.083]);

  // Orejas pequeñas y redondeadas, algo abiertas
  const earGeometry = new ConeGeometry(0.03, 0.045, 16);
  for (const side of [-1, 1]) {
    const ear = new Mesh(earGeometry, fur);
    ear.position.set(side * 0.05, headY + 0.07, headZ - 0.01);
    ear.rotation.z = -side * 0.35;
    ear.castShadow = true;
    group.add(ear);
  }

  // Ojos cerrados: dos arcos finos
  const eyeGeometry = new TorusGeometry(0.012, 0.0028, 8, 16, Math.PI);
  for (const side of [-1, 1]) {
    const eye = new Mesh(eyeGeometry, line);
    eye.position.set(side * 0.033, headY + 0.008, headZ + 0.075);
    eye.rotation.z = Math.PI;
    group.add(eye);
  }

  // Cola corta y gruesa de British: sale del costado trasero derecho, pasa por encima del borde
  // de la cama y la punta asoma por fuera, hacia atrás. Se afina de la base a la punta, que es redondeada.
  // Medidas en el sistema del gato, que va sobre el cojín de la cama (alfombra en y ≈ -0.045)
  const tailPath = new CatmullRomCurve3([
    new Vector3(0.12, 0.075, -0.06),
    new Vector3(0.18, 0.11, -0.07),
    new Vector3(0.245, 0.112, -0.08),
    new Vector3(0.285, 0.07, -0.095),
    new Vector3(0.298, 0.028, -0.115),
  ]);
  const baseRadius = 0.03;
  const tipRadius = 0.019;
  group.add(createTaperedTube(tailPath, baseRadius, tipRadius, fur));
  const tip = tailPath.getPointAt(1);
  part(fur, [tipRadius, tipRadius, tipRadius], [tip.x, tip.y, tip.z]);

  return group;
};
