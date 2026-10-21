import { Color, CustomBlending, Mesh, OneFactor, OneMinusSrcAlphaFactor, Vector2 } from "three";
import type { Camera, Object3D, Scene, WebGLRenderer } from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { palette } from "../palette";

// Contorno de lo que es clicable al pasar el ratón por encima. Sustituye a renderer.render: la
// escena se dibuja con un paso de contorno (OutlinePass) sobre los objetos señalados.
// El contorno de three.js suma luz (solo aclara), y sobre el fondo crema no se vería: se cambia a
// mezcla normal para poder dibujarlo oscuro, como el trazo de una ilustración
export const createOutline = (renderer: WebGLRenderer, scene: Scene, camera: Camera) => {
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  const outline = new OutlinePass(new Vector2(1, 1), scene, camera);
  outline.visibleEdgeColor = new Color(palette.outline);
  outline.hiddenEdgeColor = new Color(palette.outline);
  outline.edgeStrength = 6;
  outline.edgeThickness = 1;
  outline.edgeGlow = 0;
  outline.overlayMaterial.blending = CustomBlending;
  outline.overlayMaterial.blendSrc = OneFactor;
  outline.overlayMaterial.blendDst = OneMinusSrcAlphaFactor;
  composer.addPass(outline);
  composer.addPass(new OutputPass());

  // Solo las mallas que se ven: las cajas invisibles que reservan sitio para el encuadre no
  // deben dibujarse como contorno
  const setSelection = (object: Object3D | null) => {
    const meshes: Object3D[] = [];
    object?.traverse((child) => {
      if (child instanceof Mesh && child.visible && !(Array.isArray(child.material) ? false : child.material.visible === false)) {
        meshes.push(child);
      }
    });
    outline.selectedObjects = meshes;
  };

  return {
    render: () => composer.render(),
    setSize: (width: number, height: number) => {
      composer.setPixelRatio(renderer.getPixelRatio());
      composer.setSize(width, height);
    },
    setSelection,
    dispose: () => composer.dispose(),
  };
};
