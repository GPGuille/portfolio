import { ConeGeometry, Group, Mesh, MeshStandardMaterial, SphereGeometry, TorusGeometry } from "three";
import { palette } from "../palette";

// Gato British Shorthair azul durmiendo enroscado, en estilo juguete: cuerpo como una "hogaza",
// cabeza redonda con mofletes, orejas pequeñas, ojos cerrados y la cola rodeando el cuerpo.
// Mide unos 42 cm de largo. Origen: debajo del centro del cuerpo; la cara mira hacia +Z
export const createCat = () => {
  const group = new Group();
  const fur = new MeshStandardMaterial({ color: palette.cat, roughness: 0.9 });
  const furLight = new MeshStandardMaterial({ color: palette.catLight, roughness: 0.9 });
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

  // Cola gruesa rodeando el cuerpo por la derecha hasta delante
  const tail = new Mesh(new TorusGeometry(0.15, 0.028, 14, 32, Math.PI * 0.9), fur);
  tail.rotation.x = -Math.PI / 2;
  tail.rotation.z = -Math.PI * 0.55;
  tail.position.set(0.0, 0.03, 0.0);
  tail.castShadow = true;
  group.add(tail);

  return group;
};
