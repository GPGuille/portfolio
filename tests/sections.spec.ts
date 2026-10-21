import { expect, test, type Page } from "@playwright/test";

// Secciones del menú, con su nombre en español (idioma por defecto)
const SECTIONS = ["Sobre mí", "Skills", "Proyectos", "Certificaciones", "Contacto"];

const isMobile = (page: Page) => (page.viewportSize()?.width ?? 0) < 840;

// En móvil el menú va plegado: primero se abre
const openFromMenu = async (page: Page, name: string) => {
  if (isMobile(page)) await page.getByRole("button", { name: "Abrir menú" }).click();
  await page.getByRole("navigation").getByRole("button", { name, exact: true }).click();
};

const skillsWindow = (page: Page) => page.locator(".board-layer");

test("carga sin errores en la consola", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    // El favicon aún no existe (pendiente): su 404 no cuenta
    if (message.type() === "error" && !message.text().includes("404")) errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Guillermo");
  await page.waitForTimeout(3000);
  expect(errors).toEqual([]);
});

for (const name of SECTIONS.filter((section) => section !== "Skills")) {
  test(`${name}: se abre desde el menú y se cierra con Escape`, async ({ page }) => {
    await page.goto("/");
    await openFromMenu(page, name);
    const panel = page.getByRole("region", { name });
    await expect(panel).toBeVisible();
    await expect(page).toHaveURL(/#\w+$/);
    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
    await expect(page).not.toHaveURL(/#/);
  });
}

test("Skills: se abre desde el menú con sus cuatro post-its y se cierra con Volver", async ({ page }) => {
  await page.goto("/");
  await openFromMenu(page, "Skills");
  await expect(skillsWindow(page)).toHaveClass(/is-visible/, { timeout: 15_000 });
  await expect(page).toHaveURL(/#skills$/);
  for (const title of ["Frontend", "Backend", "Database", "Herramientas"]) {
    await expect(page.getByRole("heading", { name: title, level: 3 })).toBeVisible();
  }
  await expect(page.getByText("TypeScript")).toBeVisible();
  await page.getByRole("button", { name: "Volver" }).click();
  await expect(skillsWindow(page)).toHaveCount(0);
  await expect(page).not.toHaveURL(/#/);
});

test("el botón atrás del navegador cierra la sección sin salir de la web", async ({ page }) => {
  await page.goto("/");
  await openFromMenu(page, "Skills");
  await expect(skillsWindow(page)).toHaveClass(/is-visible/, { timeout: 15_000 });
  await page.goBack();
  await expect(skillsWindow(page)).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("un enlace con #skills abre la página con la ventana de Skills", async ({ page }) => {
  await page.goto("/#skills");
  await expect(skillsWindow(page)).toHaveClass(/is-visible/, { timeout: 15_000 });
  await page.keyboard.press("Escape");
  await expect(skillsWindow(page)).toHaveCount(0);
  await expect(page).not.toHaveURL(/#/);
});

test("con la ventana abierta, el teclado no llega a lo de detrás", async ({ page }) => {
  await page.goto("/");
  await openFromMenu(page, "Skills");
  await expect(skillsWindow(page)).toHaveClass(/is-visible/, { timeout: 15_000 });
  for (let step = 0; step < 4; step++) {
    await page.keyboard.press("Tab");
    const insideHeader = await page.evaluate(() => Boolean(document.activeElement?.closest("header")));
    expect(insideHeader).toBe(false);
  }
});

test("el botón de idioma traduce los post-its", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Switch to English" }).click();
  if (isMobile(page)) await page.getByRole("button", { name: "Open menu" }).click();
  await page.getByRole("navigation").getByRole("button", { name: "Skills", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Tools", level: 3 })).toBeVisible({ timeout: 15_000 });
});
