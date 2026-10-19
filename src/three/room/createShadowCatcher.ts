import { Mesh, PlaneGeometry, ShadowMaterial } from "three";

// Superficie invisible que solo muestra las sombras, para que los muebles
// parezcan apoyados sobre el fondo crema y no flotando
const createCatcher = (width: number, height: number) => {
  const catcher = new Mesh(new PlaneGeometry(width, height), new ShadowMaterial({ opacity: 0.1 }));
  catcher.receiveShadow = true;
  // No cuenta como parte visible de la escena a la hora de encuadrar la cámara
  catcher.userData.isShadowCatcher = true;
  return catcher;
};

// Suelo invisible desde la pared hacia delante: detrás de la pared no hay suelo,
// así que ahí no deben verse sombras
export const createFloorShadowCatcher = (wallZ: number) => {
  const depth = 3;
  const catcher = createCatcher(4, depth);
  catcher.rotation.x = -Math.PI / 2;
  catcher.position.z = wallZ + depth / 2;
  return catcher;
};

// Trozo de pared invisible detrás de algo colgado (tablón, estantes…). Solo cubre
// esa zona: si fuera una pared entera, también recogería la sombra de la mesa
export const createWallShadowCatcher = (width: number, height: number) => createCatcher(width, height);
