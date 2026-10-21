import { ref } from "vue";

// Etiqueta que acompaña al cursor cuando está sobre algo clicable de la escena 3D. La escena solo
// indica qué objeto es (su id) y dónde está el ratón; el texto lo pone la interfaz, en su idioma
export type HoverTarget = { id: string; x: number; y: number };

const hoverTarget = ref<HoverTarget | null>(null);

export const setHoverTarget = (target: HoverTarget | null) => {
  hoverTarget.value = target;
};

export const useHoverLabel = () => ({ hoverTarget });
