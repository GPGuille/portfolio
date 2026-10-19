import { Mesh, MeshStandardMaterial } from "three";
import { createRoundedSlab } from "../geometry/createRoundedSlab";
import { palette } from "../palette";
import { createRugTexture } from "../textures/createRugTexture";

// Alfombra muy grande de pelo corto en estilo juguete (340 × 260 cm, 1,2 cm de grosor), con las
// esquinas redondeadas: da base a toda la escena y se sale de la pantalla para que la
// habitación parezca continuar (más inmersivo)
export const RUG_SIZE = { width: 3.4, depth: 2.6, thickness: 0.012 };

export const createRug = () => {
  const { width, depth, thickness } = RUG_SIZE;

  const geometry = createRoundedSlab(width, depth, thickness, 0.1, 0.005);
  // La placa se crea de pie: se tumba en el suelo
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, thickness / 2, 0);

  // Coordenadas de textura en metros y centradas: se escalan para que el dibujo ocupe toda la alfombra
  const pattern = createRugTexture(
    { field: palette.rugField, band: palette.rugBand, stripe: palette.rugStripe, border: palette.rugBorder },
    width / depth,
  );
  pattern.repeat.set(1 / width, 1 / depth);
  pattern.offset.set(0.5, 0.5);

  const rug = new Mesh(geometry, new MeshStandardMaterial({ map: pattern, roughness: 1 }));
  rug.receiveShadow = true;
  // El encuadre no la tiene en cuenta: puede salirse por los bordes de la pantalla
  rug.userData.bleeds = true;
  return rug;
};
