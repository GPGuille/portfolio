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
    textures/                texturas generadas en código (madera, corcho, fieltro…), sin imágenes externas
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
- Escritorio en estilo juguete: tablero de nogal de 180 × 80 × 5 cm con esquinas y cantos redondeados (radio total de esquina 3 cm, igual que las cajoneras para que encajen a ras) sobre dos cajoneras de 42 × 77 × 70 cm con cantos muy redondeados y frentes gorditos (mesa a 75 cm, altura estándar), a ras de lados y fondo y con 3 cm de vuelo por delante, a 5 mm de la pared; sin suelo visible, solo sombra sobre el fondo crema.
- Sobre la mesa, en **estilo juguete** (referencia: el estilo de David, solo en los objetos; la luz no): monitor generado con IA (Hyper3D, `monitor.glb`) a 82 cm de ancho, con su pantalla tapada por una propia dibujada en código (`createProjectsScreenTexture`: ventana con la palabra "Proyectos" en la fuente pixelada, tres carpetas y "Haz clic para verlos", en el idioma de la página al cargar); será el acceso a Proyectos. Centrado con la trasera a 3 cm del fondo. Teclado, ratón y alfombrilla a 1,2 veces (`DESK_KIT_SCALE`) para mantener la proporción con el monitor (ancho teclado/monitor ≈ 0,55): alfombrilla de fieltro antracita muy redondeada a 8 cm del borde; teclado TKL de 87 teclas (unidad 19,05 mm) con carcasa champán gruesa y redondeada, teclas gorditas crema/beige, Esc y Enter marrones, zona de letras centrada bajo la pantalla; ratón plano tipo Magic Mouse a 5,5 cm a su derecha. Regla: los objetos se exageran juntos, nunca uno solo.
- **Sistema de color de la escena** (`palette.ts`): fondo crema; **una sola madera oscura protagonista** (nogal: mesa y marcos de los títulos); una madera clara (roble: marco del tablón y balda); grises grafito/piedra cálidos (alfombrilla, cajoneras más claras para no pesar abajo); acento azul (etiqueta y monitor) con la terracota de la alfombra como su complementario; pastel solo para detalles (libros, código, planta). No añadir nuevos marrones/beiges sin rol.
- Objetos de mesa (IA, `createDeskProps`): libreta y bote de bolígrafos a la izquierda de la alfombrilla; taza de café al fondo a la derecha. El pato de goma ("rubber duck debugging") va en la balda, en el hueco de la figurita de gato que se quitó del modelo de la balda (`createShelfDuck`). Unos 200 KB entre los cuatro. Su grupo lleva `userData.bleeds`: un grupo vacío mientras cargan mediría infinito y descuadraría la cámara (cualquier grupo que se llene después necesita esto o una caja invisible con su medida).
- Blancos y grises de objetos (ratón, monitor) van ligeramente fríos en `palette.ts` para compensar la luz cálida y leerse neutros.
- Silla de oficina de malla generada con IA (Hyper3D, `chair.glb`), 92 cm de alto; el modelo tenía 424.000 triángulos y se simplificó a ~37.000 (0,19 MB, sin juntar materiales). Se recolorea por material en blanco roto, mecanismo y pistón negro grisáceo y ruedas gris medio (`palette.chair*`) para que no se confunda con las cajoneras. Mira hacia +Z en el modelo, así que se gira media vuelta para mirar a la mesa (un poco girada a la derecha); 30 cm por delante de la mesa.
- Alfombra en **damero terracota y crema** (inspirada en una alfombra de lana tejida; la terracota es complementaria del azul): una sola placa de 12 × 8 cuadros de 28 cm (336 × 224 cm, centrada; cabe la cama del gato a la derecha), 4 cm de grosor con canto redondeado, grano de tejido sutil y el canto de un solo color (material aparte, para que no se manchen de naranja los cuadros crema). Entra bajo toda la mesa (borde de atrás a 6 cm de la pared) y por delante termina bien pasada la silla. Lleva `userData.bleeds`: el encuadre la ignora.
- El encuadre solo cuenta los muebles y las sombras en la pared; las sombras del suelo pueden cortarse (caen sobre la alfombra). Por abajo, la escena llega a medio margen del borde.
- Gato y cama: modelos generados con IA en Hyper3D (`src/assets/models/cat.glb`, con esqueleto; `cat-bed.glb`), optimizados con gltf-transform (meshopt + webp 1024): 17,8 → 0,73 MB y 4,9 → 0,58 MB. British Shorthair azul sentado en una cama redonda de peluche de 64 cm teñida de azul marino (`palette.catBed`, multiplica la textura) para que el gato resalte; gato de 40 cm, a la derecha de la cajonera y girado hacia la cámara. Reposo en bucle constante (`HeavyHoovedIdle2`, mira alrededor) y cada 8–16 s inclina la cabeza (`HeavyHoovedTossHead`, fundido cruzado). No anima con "reducir movimiento". Se cargan aparte con `loadModel` (`src/three/models/`); una caja invisible con su medida final hace que el encuadre cuente con ellos desde el principio.
- **Animaciones de la escena:** la escena 3D se dibuja en bucle solo mientras haya alguna animación registrada con `hooks.animate(fn)` (la función devuelve false al terminar), limitada a 30 fps; sin animaciones se dibuja bajo demanda. El reposo del gato es una animación permanente, así que la escena anima siempre (decisión de Guillermo); el navegador para el bucle con la pestaña oculta.
- **Modelos de IA:** para objetos orgánicos (personajes, animales, plantas, tela) se usan modelos de Hyper3D en estilo "soft clay toy", Quad Mesh (4000–8000 polígonos en objetos pequeños, 18000 en el avatar), De-light y textura 2K; se optimizan siempre con gltf-transform antes de añadirlos. Lo geométrico (muebles, monitor, teclado) sigue en código.
- **Pared** (modelos de IA de Hyper3D, colocados con `createWallProp`): tablón de corcho (Skills) a la izquierda y estantería de nogal de cubos con 4 títulos (Certificaciones) a la derecha, los dos de 85 × 68 cm (el tablón se estira un poco en vertical con `stretchToHeight`) y a 16 cm de la balda de 70 cm con planta colgante, libros y el pato de goma, que va justo encima de la pantalla. La balda se desplaza 12 cm a la derecha para compensar la perspectiva y verse centrada sobre la pantalla. Todo queda por debajo de la misma línea superior (monitor + 7 cm + 68 cm) para que la escena no crezca en altura: si crece, el encuadre aleja la cámara y todo se ve más pequeño. Una sola pared invisible recoge sus sombras. Los títulos son genéricos: se sustituirán por sus certificaciones reales.
- **Avatar** (`src/assets/models/avatar.glb`, `src/three/avatar/`, `Avatar.vue`): modelo 3D de Guillermo generado con IA (imagen conceptual en Meshy → 3D en Hyper3D/Rodin con esqueleto). Las animaciones de dos exportaciones se juntaron en un solo GLB con color (gltf-transform) y se optimizó: ~0,95 MB. Reposo: primer fotograma de `HumanHappyIdle` congelado, con cuello y cabeza corregidos para mirar al frente, + respiración en código (pecho y hombros, calculada desde la pose guardada). Esa corrección se mezcla según el peso del reposo, así los fundidos (0,9 s) de entrada y salida de los gestos no dan saltos de cabeza. Saludo `HumanSalute` al entrar, al pasar el ratón y con foco. Cada 15–25 s, un gesto al azar sin repetir el anterior: `HumanDwarfIdle`, `HumanArmStretching`, `HumanPointingForward`, `HumanSalute` (fundido cruzado con el reposo). `HumanSadIdle` no se usa (transmite tristeza). Va en su propio canvas bajo el nombre (solo pantallas ≥840px apaisadas); al hacer clic abre "Sobre mí". Anima solo con la pestaña visible; con "reducir movimiento" se queda quieto. Botones de contacto (correo, LinkedIn, GitHub, CV) pendientes, como enlaces HTML bajo el avatar.
- Las capturas sin ventana de Chrome no esperan a que cargue el GLB: para verificar el avatar usar una captura que espere (puppeteer) en vez de `--screenshot`.
- **Medidas reales al milímetro:** la escena usa metros reales y proporciones de muebles reales; cualquier pieza nueva debe respetar alturas y holguras reales.
- **Encuadre automático** (`src/three/framing.ts`): la cámara calcula la caja de los muebles y sus sombras y la encaja en el hueco libre de la pantalla con el mismo margen que el texto. Los elementos HTML que la escena no puede pisar llevan `data-stage="side"` (nombre, etiqueta) o `data-stage="top"` (menú). Nada de desplazamientos de cámara a mano.
- La escena va a la derecha del nombre solo en pantallas de ≥840px **y apaisadas**; en vertical (móvil y tablets) va debajo, con todo el ancho.
- El menú completo solo aparece desde 1280px; por debajo va plegado (si no, choca con el nombre). En móvil (<840px) el nombre baja bajo la fila del menú. Encima irán monitor, teclado crema como el suyo, ratón y alfombrilla de fieltro gris; delante, la silla; al lado, una estantería con baldas (Certificaciones).
- La habitación se empieza con formas básicas hechas en código; los modelos de Blender sustituirán los objetos uno a uno más adelante.
- Los comentarios del código van en español.
- **Sistema de espacios** (`variables.scss`): margen exterior único `--gutter` (texto, menú, panel y escena 3D lo comparten; el 3D lo lee ya resuelto en px) y escala fija `--space-1`…`--space-8` (4, 8, 12, 16, 24, 32, 48, 64 px). Prohibidos los valores sueltos de espaciado.
- **Tipografía por saltos** (`variables.scss`): `--font-size-title` 56/72/88 y `--font-size-banner` 18/22/28 cambian juntos en 480 y 1280 px (proporción ~3,2 constante). La etiqueta se coloca en proporción al tamaño del nombre.
- **Alineación al píxel:** el borde superior de la G del nombre y el del texto del menú coinciden con el margen (`text-box: trim-both cap alphabetic`, con aproximación para Firefox). El nombre lleva compensación óptica a la izquierda (-0,045em) para que la G toque el margen. Verificado midiendo capturas a 1280, 1440 y 1920 px.

## Próximos pasos

1. ~~Subir el proyecto a GitHub~~ → github.com/GPGuille/portfolio (público).
2. ~~Barra de menú superior~~ (hecha, con panel "Próximamente" por sección).
3. Escena 3D (en curso): hechos el escritorio, el tablón, la alfombrilla, el monitor, el teclado y el ratón. Hechas la estantería, la silla y la alfombra. Falta el avatar con los botones de contacto; después, objetos clicables.
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
