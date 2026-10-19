import { Mesh, PlaneGeometry, ShadowMaterial } from "three";

// Superficie invisible que solo muestra las sombras, para que los muebles
// parezcan apoyados sobre el fondo crema y no flotando
const createCatcher = (width: number, height: number) => {
  const catcher = new Mesh(new PlaneGeometry(width, height), new ShadowMaterial({ opacity: 0.1 }));
  catcher.receiveShadow = true;
  return catcher;
};

export const createFloorShadowCatcher = () => {
  const catcher = createCatcher(4, 4);
  catcher.rotation.x = -Math.PI / 2;
  return catcher;
};

// Trozo de pared invisible detrás de algo colgado (tablón, estantes…). Solo cubre
// esa zona: si fuera una pared entera, también recogería la sombra de la mesa
export const createWallShadowCatcher = (width: number, height: number) => createCatcher(width, height);
