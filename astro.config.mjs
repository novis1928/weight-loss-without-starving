import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://novis1928.github.io",
  base: "/weight-loss-without-starving",

  integrations: [sitemap()],
});