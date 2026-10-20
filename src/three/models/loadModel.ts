import { Box3, Group, Mesh, Vector3 } from "three";
import type { AnimationClip, Object3D } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

// Cargador único para los modelos .glb (optimizados con meshopt)
const loader = new GLTFLoader();
loader.setMeshoptDecoder(MeshoptDecoder);

export type LoadedModel = { model: Object3D; animations: AnimationClip[] };

// Carga un modelo, lo escala para que su medida más larga en el eje dado sea `size`, lo centra
// en horizontal y lo apoya en el suelo (y = 0). Las mallas hacen y reciben sombras; las que
// tienen esqueleto no se recortan por la cámara (al animarse se salen de su caja de reposo)
export const loadModel = (url: string, size: number, axis: "x" | "y" | "z" = "y") =>
  new Promise<LoadedModel>((resolve, reject) => {
    loader.load(
      url,
      (gltf) => {
        const model = gltf.scene;
        model.traverse((object) => {
          if (!(object instanceof Mesh)) return;
          object.castShadow = true;
          object.receiveShadow = true;
          if ("isSkinnedMesh" in object) object.frustumCulled = false;
        });
        const box = new Box3().setFromObject(model);
        model.scale.setScalar(size / box.getSize(new Vector3())[axis]);
        box.setFromObject(model);
        const center = box.getCenter(new Vector3());
        model.position.set(-center.x, -box.min.y, -center.z);
        const wrapper = new Group();
        wrapper.add(model);
        resolve({ model: wrapper, animations: gltf.animations });
      },
      undefined,
      reject,
    );
  });
