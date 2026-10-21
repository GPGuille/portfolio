import { ref } from "vue";
import type { SectionId } from "./useSection";

// Ventanas de sección a las que vuela un objeto de la habitación (el tablón → Skills). La escena
// indica qué secciones tienen vuelo (`flyable`, cuando su objeto ha cargado) y cuál ha llegado
// (`arrived`); la ventana HTML espera a esa llegada para aparecer encima del objeto. Sin escena
// (aún cargando, o con "reducir movimiento") la ventana aparece directamente
const flyable = ref<SectionId[]>([]);
const arrived = ref<SectionId | null>(null);

export const useSectionWindow = () => ({ flyable, arrived });
