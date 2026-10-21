import { defineConfig, devices } from "@playwright/test";

// Pruebas de extremo a extremo: abren la web compilada en Chrome (el instalado en el equipo, sin
// descargar navegadores) y comprueban que cada sección se abre y se cierra. `npm test`
export default defineConfig({
  testDir: "tests",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: "http://localhost:4173",
    channel: "chrome",
  },
  webServer: {
    command: "npm run build && npx vite preview --port 4173 --strictPort",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    { name: "escritorio", use: { viewport: { width: 1440, height: 900 } } },
    { name: "movil", use: { ...devices["Pixel 7"], channel: "chrome" } },
  ],
});
