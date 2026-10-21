import { BufferAttribute, CanvasTexture, Mesh, MeshStandardMaterial, RepeatWrapping, SRGBColorSpace, Vector3 } from "three";
import type { Object3D } from "three";
import { CORK_TILE_METERS, createCorkCanvas } from "../textures/createCorkPattern";

const CORK_MATERIAL = "Matte cork panel";

// El corcho del modelo del tablón es un color liso y sin coordenadas de textura: se le pone el mismo
// corcho que la ventana de Skills, con coordenadas planas calculadas desde su posición (medida en el
// tablón, en metros reales: cada mosaico mide lo mismo que en la ventana)
export const applyCorkTexture = (board: Object3D) => {
  board.updateMatrixWorld(true);
  const texture = new CanvasTexture(createCorkCanvas());
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.anisotropy = 8;

  board.traverse((object) => {
    if (!(object instanceof Mesh) || !(object.material instanceof MeshStandardMaterial)) return;
    if (object.material.name !== CORK_MATERIAL) return;
    const position = object.geometry.getAttribute("position");
    const uv = new Float32Array(position.count * 2);
    const point = new Vector3();
    for (let index = 0; index < position.count; index++) {
      point.fromBufferAttribute(position, index).applyMatrix4(object.matrixWorld);
      board.worldToLocal(point);
      uv[index * 2] = point.x / CORK_TILE_METERS;
      uv[index * 2 + 1] = point.y / CORK_TILE_METERS;
    }
    object.geometry.setAttribute("uv", new BufferAttribute(uv, 2));
    object.material.map = texture;
    // El color del material multiplicaría la textura: el color ya va en el dibujo
    object.material.color.set("#ffffff");
    object.material.needsUpdate = true;
  });
};
