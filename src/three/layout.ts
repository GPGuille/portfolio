// Datos de maquetación que comparten la web y la escena 3D. No importa nada de three.js
// para que la web pueda usarlos sin cargar la librería 3D

// Zona de la pantalla (en píxeles) donde debe caber la habitación
export type Stage = { left: number; top: number; right: number; bottom: number };

// A partir de este ancho la habitación va a la derecha del nombre; por debajo, debajo de él
export const SIDE_BY_SIDE_MIN_WIDTH = 840;
