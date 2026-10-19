# Portfolio de Guillermo González

Portfolio interactivo en 3D.

## Tecnologías

| Herramienta | Para qué |
| --- | --- |
| Vue 3 + TypeScript | La web y sus secciones |
| Vite | Servidor de desarrollo y compilación |
| SCSS | Estilos (con mixins de breakpoints en `src/assets/styles/mixins.scss`) |
| Three.js | La escena 3D (`src/three`) |
| vite-plugin-glsl | Importar shaders `.glsl` (`src/three/shaders`) |
| GSAP | Animaciones de la interfaz |
| Howler | Sonidos |

## Comandos

| Comando | Qué hace |
| --- | --- |
| `npm install` | Instala las dependencias (solo la primera vez) |
| `npm run dev` | Arranca la web en http://localhost:3000 y se recarga al guardar |
| `npm run build` | Comprueba los tipos y genera la web final en `dist/` |
| `npm run preview` | Sirve la versión final para probarla |

## Estructura

```
src/
  assets/styles/     colores, fuentes, reset y mixins
  components/        piezas reutilizables (Banner, Experience)
  composables/       estado compartido (idioma, sección abierta)
  features/home/     la página principal y sus secciones
  three/             la escena 3D
    shaders/         shaders GLSL
```
