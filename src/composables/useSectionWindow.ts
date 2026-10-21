import { ref } from "vue";
import type { SectionId } from "./useSection";

// Ventanas de sección a las que vuela un objeto de la habitación (el tablón → Skills). La escena
// indica qué secciones tienen vuelo (`flyable`, cuando su objeto ha cargado) y cuál ha llegado
// (`arrived`); la ventana HTML espera a esa llegada para aparecer encima del objeto. Sin escena
// (aún cargando, o con "reducir movimiento") la ventana aparece directamente
const flyable = ref<SectionId[]>([]);
const arrived = ref<SectionId | null>(null);

// Post-its del tablón 3D medidos en el propio tablón (marco incluido), en fracciones de su ancho y
// alto: centro, tamaño del papel, giro (radianes, antihorario) y dónde va la chincheta (respecto al
// centro del papel, en fracciones del papel). La ventana coloca los suyos justo encima para que el
// cambio de 3D a HTML no se note
export type NoteRect = { x: number; y: number; width: number; height: number; rotation: number; pinX: number; pinY: number };
const notes = ref<NoteRect[]>([]);

export const useSectionWindow = () => ({ flyable, arrived, notes });
