import type { Locale } from "../i18n/messages";
import { siCss, siDocker, siGit, siHtml5, siOpenjdk, siPython, siTypescript, siVuedotjs } from "simple-icons";

// Categorías de skills: cada una es un post-it del tablón (icono + título) y, al abrir la sección
// Skills, muestra sus tecnologías con su logo (simple-icons, CC0). Sin logo se dibuja una base
// de datos genérica. Edita esta lista para cambiar lo que se ve
export type SkillIcon = "code" | "server" | "database" | "wrench";
export type Skill = { name: string; icon?: { path: string } };
// El título va en los dos idiomas
export type SkillGroup = { title: Record<Locale, string>; icon: SkillIcon; items: Skill[] };

export const skillGroups: SkillGroup[] = [
  {
    title: { es: "Frontend", en: "Frontend" },
    icon: "code",
    items: [
      { name: "Vue", icon: siVuedotjs },
      { name: "TypeScript", icon: siTypescript },
      { name: "HTML", icon: siHtml5 },
      { name: "CSS", icon: siCss },
    ],
  },
  {
    title: { es: "Backend", en: "Backend" },
    icon: "server",
    items: [
      { name: "Java", icon: siOpenjdk },
      { name: "Python", icon: siPython },
    ],
  },
  { title: { es: "Database", en: "Database" }, icon: "database", items: [{ name: "SQL" }] },
  {
    title: { es: "Herramientas", en: "Tools" },
    icon: "wrench",
    items: [
      { name: "Docker", icon: siDocker },
      { name: "Git", icon: siGit },
    ],
  },
];
