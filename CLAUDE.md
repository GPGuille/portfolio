# Portfolio de Guillermo González

Contexto para cualquier asistente que trabaje en este repositorio. Léelo entero antes de tocar nada.

## Quién y qué

- **Autor:** Guillermo González Piqueras, Full Stack Developer. Escribe en español: responde siempre en español.
- **Objetivo:** su primer portfolio web. Quiere algo muy cuidado, divertido e interactivo en 3D, pero fácil de navegar.
- **Secciones previstas:** portada (nombre y título), sobre mí (quién es y dónde trabaja), habilidades (Docker, Java, Python, Vue y más), proyectos y contacto.
- **Cómo le gusta trabajar:** ir por partes y retocar sobre la marcha, viendo el resultado en cada paso. No le sirven maquetas planas ni wireframes: quiere ver la web real. Explícale cada paso con claridad, es su primer proyecto de este tipo.

## Referencia visual

La referencia principal es **david-hckh.com** (David Heckhoff): fondo crema, nombre enorme en Urbanist negrita, una etiqueta azul inclinada con el título en letra pixelada, y una habitación 3D de estilo suave y "mono" con un muñeco del autor programando en su escritorio. Al hacer scroll la cámara recorre distintas escenas.

Otras referencias que le gustan:
- **nareshkhatri.dev**: teclado 3D donde cada tecla es una tecnología (idea para la sección de habilidades).
- **robbowen.digital** (Robb Owen): autorretrato ilustrado que gira la cabeza siguiendo el ratón (idea para su avatar).

## Regla importante: nada de código de David

Guillermo **no quiere que aparezca nada de David** en su web. La licencia de David solo permite reutilizar su código manteniendo su crédito visible, así que **no se copia ni se adapta código, modelos, texturas ni textos de su repositorio** (github.com/davidhckh/portfolio-2025). Se usan las mismas herramientas y se escribe todo desde cero. Inspirarse en el aspecto está bien; copiar no.

## Tecnologías (las mismas que usa David)

| Herramienta | Para qué |
| --- | --- |
| Vue 3 + TypeScript (`<script setup>`) | La web y sus secciones |
| Vite | Desarrollo y compilación (`base: "./"`) |
| SCSS | Estilos; `mixins.scss` se inyecta en todos los `<style lang="scss">` |
| Three.js | Escena 3D en un canvas fijo detrás del contenido |
| vite-plugin-glsl | Importar shaders `.glsl` |
| GSAP | Animaciones de la interfaz (etiqueta) |
| Howler | Sonidos (aún sin usar) |
| @fontsource | Fuentes locales: Urbanist (400/700/900) |
| ProFont | Fuente de la etiqueta (negrita), en `public/fonts/profont/` como woff2 con su licencia MIT; descargada de tobiasjung.name/profont y precargada desde `index.html` |

Los modelos 3D se harán en Blender y se exportarán a `.glb` (Vite ya los acepta como assets).

## Estructura

```
src/
  main.ts                    arranque y fuentes
  App.vue                    canvas 3D + página + scroll suave
  assets/styles/
    variables.scss           colores, fuentes, tamaños, capas (z-index)
    mixins.scss              breakpoints: @include mixins.mq("md") { ... }
    reset.scss, index.scss   base
  components/
    Experience.vue           canvas fijo de Three.js
    Banner.vue               etiqueta azul inclinada con animación
  features/home/
    Home.vue                 página principal
    components/Hero.vue      portada: "Guillermo / González" + "Full Stack Developer"
  three/
    index.ts                 renderer, luces, sombras y cámara
    palette.ts               colores de la habitación (sacados de fotos de su oficina real)
    room/                    la habitación, una pieza por archivo (cajoneras, tablero…)
    textures/                texturas generadas en código (madera, corcho), sin imágenes externas
    shaders/                 shaders GLSL
```

## Decisiones de diseño ya tomadas

- Fondo `#f5efe6`, texto `#2d2a24`, etiqueta `#263c70` con texto blanco.
- Portada: "Guillermo" y "González" en dos líneas (sin "Piqueras"), Urbanist 900, y debajo la etiqueta inclinada -5° "Full Stack Developer" en ProFont (antes Pixelify Sans). El nombre va quieto, sin animación ni efectos, con los tamaños de David: 56px, 72px desde 480px de ancho y 88px desde 1280px. Mismo margen arriba y a la izquierda: `max(3vw, 16px)`.
- Animación de entrada: las líneas del nombre suben desde una máscara; la etiqueta se despliega de izquierda a derecha.
- Se probó un efecto "crucigrama" en la G y **se descartó** por lioso.
- Debe funcionar en móvil y respetar `prefers-reduced-motion`.
- **Sin scroll:** toda la web es una pantalla. La habitación 3D es el menú: cada objeto abre su sección (pantalla del ordenador → Proyectos con un "navegador" falso; tablón de corcho → Skills; estantería con títulos → Certificaciones; avatar → Sobre mí; teléfono o sobre → Contacto).
- **Menú superior** con las mismas secciones (Sobre mí, Skills, Proyectos, Certificaciones, Contacto). Es obligatorio, no un extra: es la navegación en móvil y para teclado o lector de pantalla. En móvil se pliega en un botón de menú.
- El menú y los objetos 3D comparten el estado `activeSection` de `src/composables/useSection.ts`; la sección abierta se muestra en `SectionPanel.vue`.
- **Dos idiomas** (español por defecto, botón ES/EN). Todos los textos van en `src/i18n/messages.ts`; nada de textos sueltos en los componentes.
- La habitación se inspira en la oficina real de Guillermo (suelo de madera clara, dos cajoneras grises de 5 cajones, tablero de nogal, dos monitores, teclado crema, alfombrilla de fieltro gris, estor beige), con estilo parecido pero no idéntico. Se construye pieza a pieza y él la revisa en cada paso.
- Escritorio: tablero de nogal de 180 × 80 × 5 cm sobre dos cajoneras de 42 × 77 × 70 cm (mesa a 75 cm, altura estándar), a ras de lados y fondo y con 3 cm de vuelo por delante, a 5 mm de la pared; sin suelo visible, solo sombra sobre el fondo crema.
- Sobre la mesa, en **estilo juguete** (referencia: el estilo de David, solo en estas piezas; la luz y el resto de la escena no): iMac de 24" como referencia, un 15 % más grande, cuerpo grueso azul pastel con esquinas muy redondeadas, marco blanco, barbilla de color, pie robusto y pantalla con un editor de código de líneas pastel dibujado en código (será el objeto de Proyectos), centrado con el pie a 5 cm del fondo. Alfombrilla de fieltro antracita 86 × 36 × 0,8 cm muy redondeada; teclado TKL de 87 teclas (unidad 19,05 mm) con carcasa champán gruesa y redondeada, teclas gorditas crema/beige, Esc y Enter marrones, con la zona de letras centrada bajo la pantalla; ratón plano tipo Magic Mouse gordito (12,4 × 6,4 × 2,7 cm) a 4,5 cm a su derecha.
- Blancos y grises de objetos (ratón, monitor) van ligeramente fríos en `palette.ts` para compensar la luz cálida y leerse neutros.
- Tablón (Skills): 100 × 68 cm, marco crema de una pieza con el corcho hundido, borde inferior a 1,40 m para dejar sitio al monitor. Vacío de momento.
- **Medidas reales al milímetro:** la escena usa metros reales y proporciones de muebles reales; cualquier pieza nueva debe respetar alturas y holguras reales.
- **Encuadre automático** (`src/three/framing.ts`): la cámara calcula la caja de los muebles y sus sombras y la encaja en el hueco libre de la pantalla con el mismo margen que el texto. Los elementos HTML que la escena no puede pisar llevan `data-stage="side"` (nombre, etiqueta) o `data-stage="top"` (menú). Nada de desplazamientos de cámara a mano.
- El menú completo solo aparece desde 1280px; por debajo va plegado (si no, choca con el nombre). En móvil (<840px) el nombre baja bajo la fila del menú. Encima irán monitor, teclado crema como el suyo, ratón y alfombrilla de fieltro gris; delante, la silla; al lado, una estantería con baldas (Certificaciones).
- La habitación se empieza con formas básicas hechas en código; los modelos de Blender sustituirán los objetos uno a uno más adelante.
- Los comentarios del código van en español.
- **Sistema de espacios** (`variables.scss`): margen exterior único `--gutter` (texto, menú, panel y escena 3D lo comparten; el 3D lo lee ya resuelto en px) y escala fija `--space-1`…`--space-8` (4, 8, 12, 16, 24, 32, 48, 64 px). Prohibidos los valores sueltos de espaciado.
- **Tipografía por saltos** (`variables.scss`): `--font-size-title` 56/72/88 y `--font-size-banner` 18/22/28 cambian juntos en 480 y 1280 px (proporción ~3,2 constante). La etiqueta se coloca en proporción al tamaño del nombre.
- **Alineación al píxel:** el borde superior de la G del nombre y el del texto del menú coinciden con el margen (`text-box: trim-both cap alphabetic`, con aproximación para Firefox). El nombre lleva compensación óptica a la izquierda (-0,045em) para que la G toque el margen. Verificado midiendo capturas a 1280, 1440 y 1920 px.

## Próximos pasos

1. ~~Subir el proyecto a GitHub~~ → github.com/GPGuille/portfolio (público).
2. ~~Barra de menú superior~~ (hecha, con panel "Próximamente" por sección).
3. Escena 3D (en curso): hechos el escritorio, el tablón, la alfombrilla, el monitor, el teclado y el ratón. Faltan silla, estantería y avatar; después, objetos clicables.
4. Secciones: sobre mí, skills, proyectos, certificaciones y contacto.
5. Favicon e imagen para compartir el enlace (og:image).
6. Publicar en Vercel con dominio propio.

## Rendimiento (no romper)

- La escena 3D se dibuja solo cuando algo cambia (`requestRender` en `src/three/index.ts`), no en bucle. Cualquier animación 3D futura debe pedir sus fotogramas mientras dure.
- three.js se carga con `import()` dinámico desde `Experience.vue`, en un archivo aparte, después del texto. Lo que la web necesite de la escena sin cargar three.js va en `src/three/layout.ts`.
- La web no tiene scroll: no hay librería de scroll suave.

## Comandos

- `npm install` instala dependencias.
- `npm run dev` arranca en http://localhost:3000.
- `npm run build` comprueba tipos con `vue-tsc` y compila a `dist/`. Debe pasar sin errores antes de dar algo por terminado.
