import { Mesh, PlaneGeometry, ShadowMaterial } from "three";

// Suelo invisible que solo muestra las sombras, para que los muebles
// parezcan apoyados sobre el fondo crema y no flotando
export const createShadowCatcher = () => {
  const catcher = new Mesh(new PlaneGeometry(6, 6), new ShadowMaterial({ opacity: 0.12 }));
  catcher.rotation.x = -Math.PI / 2;
  catcher.receiveShadow = true;
  return catcher;
};
