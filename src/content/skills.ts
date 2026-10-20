// Categorías de skills: cada una es un post-it del tablón (icono + título). Los elementos se
// mostrarán al abrir la sección Skills. Edita esta lista para cambiar lo que se ve
export type SkillIcon = "code" | "server" | "database" | "wrench";
export type SkillGroup = { title: string; icon: SkillIcon; items: string[] };

export const skillGroups: SkillGroup[] = [
  { title: "Frontend", icon: "code", items: ["Vue", "TypeScript", "HTML · CSS"] },
  { title: "Backend", icon: "server", items: ["Java", "Python"] },
  { title: "Database", icon: "database", items: ["SQL"] },
  { title: "Tools", icon: "wrench", items: ["Docker", "Git"] },
];
