/**
 * One-off asset generation with Playwright's Chromium (already installed for the e2e tests):
 *   public/og.png              1200x630 social preview rendered from inline HTML
 *   public/apple-touch-icon.png, icon-192.png, icon-512.png   rasterised from favicon.svg
 *   public/favicon.ico         32x32 PNG-in-ICO container
 * Run: node scripts/make-assets.mjs   (outputs are committed; rerun only when the brand changes)
 */
import { readFile, unlink, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const PUBLIC = fileURLToPath(new URL("../public/", import.meta.url));

const OG_HTML = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Inter:wght@400;500&display=swap" rel="stylesheet">
<style>
  html,body{margin:0;width:1200px;height:630px;overflow:hidden;background:#0a0c0f;color:#e4e8ec;font-family:Inter,system-ui,sans-serif}
  .bg{position:absolute;inset:0;background:
    radial-gradient(60% 50% at 50% 52%, rgba(255,180,84,.16), transparent 70%),
    linear-gradient(180deg,#06080a 0%,#0a0c0f 60%,#0c0f13 100%)}
  .scan{position:absolute;inset:0;background:repeating-linear-gradient(180deg, rgba(0,0,0,.18) 0 2px, transparent 2px 5px);opacity:.6}
  .monitor{position:absolute;left:50%;top:50%;width:980px;height:520px;transform:translate(-50%,-50%);border:14px solid #1b2028;border-radius:26px;background:radial-gradient(90% 80% at 50% 50%, #241a0b, #140f08 80%);box-shadow:0 0 0 2px #0a0c0f, 0 0 90px rgba(255,180,84,.22), 0 40px 80px -30px rgba(0,0,0,.9)}
  .screen{position:absolute;inset:34px 44px;font-family:'JetBrains Mono',monospace;color:#ffb454}
  .line{font-size:22px;line-height:40px;white-space:pre}
  .dim{color:#b8782a}
  .bright{color:#ffd79a}
  h1{font-family:'JetBrains Mono',monospace;font-weight:700;font-size:84px;letter-spacing:.06em;margin:18px 0 6px;color:#e4e8ec;text-shadow:0 0 30px rgba(255,180,84,.35)}
  .sub{font-size:22px;letter-spacing:.3em;text-transform:uppercase;color:#ffb454;font-weight:600}
  .foot{position:absolute;left:0;right:0;bottom:0;display:flex;justify-content:space-between;font-size:18px;color:#98a2ad}
  .cursor{display:inline-block;width:14px;height:26px;background:#ffb454;vertical-align:-4px;margin-left:6px}
</style></head><body>
<div class="bg"></div>
<div class="monitor"><div class="screen">
  <div class="line dim">0x496C6B696E BIOS v1.0 · WORKSTATION</div>
  <div class="line">&gt; memory test ............ OK</div>
  <div class="line">&gt; detecting drives ....... 6 projects</div>
  <div class="line bright">&gt; boot complete. welcome back, operator.</div>
  <h1>0x496C6B696E</h1>
  <div class="sub">Backend · Systems · Automation</div>
  <div class="line" style="margin-top:22px">$ open portfolio<span class="cursor"></span></div>
  <div class="foot"><span>Boot. Build. Deploy. Repeat.</span><span>projects · capabilities · toolchain · telemetry · mail</span></div>
</div></div>
<div class="scan"></div>
</body></html>`;

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.setContent(OG_HTML, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `${PUBLIC}og.png` });
  console.log("wrote public/og.png");

  const svg = await readFile(`${PUBLIC}favicon.svg`, "utf8");
  const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  for (const [name, size] of [
    ["apple-touch-icon.png", 180],
    ["icon-192.png", 192],
    ["icon-512.png", 512],
    ["favicon-32.png", 32],
  ]) {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(`<style>html,body{margin:0;background:transparent}img{display:block}</style><img src="${dataUri}" width="${size}" height="${size}">`);
    await page.screenshot({ path: `${PUBLIC}${name}`, omitBackground: true });
    console.log(`wrote public/${name}`);
  }

  // ICO container holding one 32x32 PNG (supported by every current browser).
  const png = await readFile(`${PUBLIC}favicon-32.png`);
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // count
  const entry = Buffer.alloc(16);
  entry[0] = 32; // width
  entry[1] = 32; // height
  entry[2] = 0; // palette
  entry[3] = 0; // reserved
  entry.writeUInt16LE(1, 4); // planes
  entry.writeUInt16LE(32, 6); // bit depth
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(22, 12); // offset = 6 + 16
  await writeFile(`${PUBLIC}favicon.ico`, Buffer.concat([header, entry, png]));
  await unlink(`${PUBLIC}favicon-32.png`);
  console.log("wrote public/favicon.ico");
} finally {
  await browser.close();
}
