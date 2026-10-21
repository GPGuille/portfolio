import {
  AlwaysStencilFunc,
  BackSide,
  BufferAttribute,
  Color,
  KeepStencilOp,
  Mesh,
  NotEqualStencilFunc,
  ReplaceStencilOp,
  ShaderMaterial,
  SkinnedMesh,
  Vector2,
} from "three";
import type { BufferGeometry, Camera, Material, Object3D, Scene, WebGLRenderer } from "three";
import { palette } from "../palette";

// Contorno de lo clicable al pasar el ratón, con la técnica de "casco invertido": cada malla
// resaltada se dibuja otra vez por detrás, inflada unos píxeles hacia fuera y de un solo color.
// Como se dibuja con la escena (no como efecto posterior) tiene el antialiasing del renderer y un
// grosor constante en píxeles. Un stencil hace que solo se vea el borde exterior de la silueta:
// ni líneas por dentro del objeto ni trazos encima de lo que lo tapa.
// El renderer tiene que crearse con `stencil: true`
const THICKNESS = 3.2;
const STENCIL_REF = 1;

const vertexShader = /* glsl */ `
  #include <common>
  #include <skinning_pars_vertex>
  attribute vec3 outlineNormal;
  uniform float thickness;
  uniform vec2 resolution;

  void main() {
    vec3 objectNormal = outlineNormal;
    #include <skinbase_vertex>
    #include <skinnormal_vertex>
    vec3 transformed = position;
    #include <skinning_vertex>
    vec4 clip = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
    vec2 direction = (projectionMatrix * vec4(normalMatrix * objectNormal, 0.0)).xy;
    clip.xy += normalize(direction + 1e-6) * thickness * clip.w * 2.0 / resolution;
    gl_Position = clip;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 color;
  void main() {
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;

// Normales promediadas por posición: en las aristas vivas (un cubo) cada cara tiene su normal y,
// al inflar, el casco se abriría en las esquinas. Con la media queda cerrado
const withOutlineNormals = (geometry: BufferGeometry) => {
  if (geometry.getAttribute("outlineNormal")) return geometry;
  const position = geometry.getAttribute("position");
  const normal = geometry.getAttribute("normal");
  const sums = new Map<string, [number, number, number]>();
  const key = (index: number) =>
    `${position.getX(index).toFixed(4)},${position.getY(index).toFixed(4)},${position.getZ(index).toFixed(4)}`;
  for (let index = 0; index < position.count; index++) {
    const sum = sums.get(key(index)) ?? [0, 0, 0];
    if (normal) {
      sum[0] += normal.getX(index);
      sum[1] += normal.getY(index);
      sum[2] += normal.getZ(index);
    }
    sums.set(key(index), sum);
  }
  const values = new Float32Array(position.count * 3);
  for (let index = 0; index < position.count; index++) {
    const [x, y, z] = sums.get(key(index))!;
    const length = Math.hypot(x, y, z) || 1;
    values.set([x / length, y / length, z / length], index * 3);
  }
  geometry.setAttribute("outlineNormal", new BufferAttribute(values, 3));
  return geometry;
};

export const createOutline = (renderer: WebGLRenderer, scene: Scene, camera: Camera) => {
  const material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      color: { value: new Color(palette.outline) },
      thickness: { value: THICKNESS * renderer.getPixelRatio() },
      resolution: { value: new Vector2(1, 1) },
    },
    side: BackSide,
    stencilWrite: true,
    stencilRef: STENCIL_REF,
    stencilFunc: NotEqualStencilFunc,
    stencilFail: KeepStencilOp,
    stencilZFail: KeepStencilOp,
    stencilZPass: KeepStencilOp,
  });

  let hulls: Mesh[] = [];
  let marked: Material[] = [];

  const clear = () => {
    for (const hull of hulls) hull.removeFromParent();
    for (const mat of marked) mat.stencilWrite = false;
    hulls = [];
    marked = [];
  };

  // Solo las mallas que se ven: las cajas invisibles que reservan sitio para el encuadre no cuentan
  const setSelection = (object: Object3D | null) => {
    clear();
    const meshes: Mesh[] = [];
    object?.traverse((child) => {
      if (!(child instanceof Mesh) || !child.visible || Array.isArray(child.material)) return;
      if (child.material.visible !== false) meshes.push(child);
    });
    for (const mesh of meshes) {
      // La malla marca su silueta en el stencil, y el casco solo se dibuja fuera de ella
      const mat = mesh.material as Material;
      mat.stencilWrite = true;
      mat.stencilRef = STENCIL_REF;
      mat.stencilFunc = AlwaysStencilFunc;
      mat.stencilZPass = ReplaceStencilOp;
      marked.push(mat);

      const geometry = withOutlineNormals(mesh.geometry);
      let hull: Mesh;
      if (mesh instanceof SkinnedMesh) {
        const skinned = new SkinnedMesh(geometry, material);
        skinned.bind(mesh.skeleton, mesh.bindMatrix);
        skinned.bindMode = mesh.bindMode;
        hull = skinned;
      } else {
        hull = new Mesh(geometry, material);
      }
      hull.frustumCulled = false;
      // Después de todo lo demás, para que el stencil ya esté marcado
      hull.renderOrder = 10;
      mesh.add(hull);
      hulls.push(hull);
    }
  };

  return {
    render: () => renderer.render(scene, camera),
    setSize: (width: number, height: number) => {
      const ratio = renderer.getPixelRatio();
      material.uniforms.resolution!.value.set(width * ratio, height * ratio);
      material.uniforms.thickness!.value = THICKNESS * ratio;
    },
    setSelection,
    dispose: () => {
      clear();
      material.dispose();
    },
  };
};
