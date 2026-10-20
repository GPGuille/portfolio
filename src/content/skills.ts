// Skills que aparecen en los post-its del tablón: una categoría por post-it.
// Edita esta lista para cambiar lo que se ve (máximo 4 elementos por post-it para que se lea bien)
export type SkillGroup = { title: string; items: string[] };

export const skillGroups: SkillGroup[] = [
  { title: "Frontend", items: ["Vue", "TypeScript", "HTML · CSS"] },
  { title: "Backend", items: ["Java", "Python"] },
  { title: "Database", items: ["SQL"] },
  { title: "Tools", items: ["Docker", "Git"] },
];
