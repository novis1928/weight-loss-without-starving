import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const url = process.env.STARTER_KIT_URL ??
  "http://localhost:4321/weight-loss-without-starving/starter-kit/";
const output = path.resolve("public/downloads/free-healthy-weight-loss-starter-kit.pdf");
await fs.mkdir(path.dirname(output), { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(url, { waitUntil: "networkidle" });
await page.emulateMedia({ media: "print" });
await page.pdf({
  path: output, format: "A4", printBackground: true, preferCSSPageSize: true,
  displayHeaderFooter: true, headerTemplate: "<div></div>",
footerTemplate: `
<div style="
  width:100%;
  padding:0 18mm 5mm;
  display:flex;
  justify-content:space-between;
  align-items:center;
  font-family:Arial, Helvetica, sans-serif;
  font-size:9px;
  color:#64748b;
">

  <span>
    <a
      href="https://novis1928.github.io/weight-loss-without-starving/"
      style="
        color:#64748b;
        text-decoration:none;
      "
    >
      Weight Loss Without Starving
    </a>
  </span>

  <span>
    Page
    <span class="pageNumber"></span>
    of
    <span class="totalPages"></span>
  </span>

</div>
`,
  margin: { top: "0", right: "0", bottom: "12mm", left: "0" },
});
await browser.close();
console.log(`PDF created: ${output}`);
