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
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
<style>
  html,body{margin:0;width:1200px;height:630px;overflow:hidden;background:#0a0d12;color:#e7ebf2;font-family:Inter,system-ui,sans-serif}
  .bg{position:absolute;inset:0;background:linear-gradient(180deg,#080b10,#0a0d12 60%,#0c1018)}
  .blob{position:absolute;border-radius:999px;filter:blur(70px);opacity:.6}
  .a{left:60px;top:40px;width:520px;height:520px;background:radial-gradient(circle,rgba(94,225,255,.6),transparent 70%)}
  .b{right:40px;bottom:-60px;width:600px;height:600px;background:radial-gradient(circle,rgba(179,136,255,.55),transparent 70%)}
  .grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px);background-size:56px 56px;mask-image:radial-gradient(80% 70% at 50% 45%,#000 40%,transparent 100%)}
  .monitor{position:absolute;left:50%;top:50%;width:1000px;height:430px;transform:translate(-50%,-52%);border-radius:18px;background:linear-gradient(180deg,rgba(22,28,39,.92),rgba(16,21,29,.96));border:1px solid rgba(255,255,255,.1);box-shadow:0 40px 90px -30px rgba(0,0,0,.9),inset 0 1px 0 rgba(255,255,255,.06)}
  .bar{position:absolute;left:0;right:0;top:0;height:46px;border-bottom:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.025);border-radius:18px 18px 0 0;font-family:'JetBrains Mono',monospace;font-size:16px;color:#9aa6b8;display:flex;align-items:center;gap:14px;padding:0 20px}
  .dot{width:14px;height:14px;border-radius:999px;background:#ff5f57}
  .body{position:absolute;inset:46px 0 0 0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
  .eyebrow{font-size:14px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#5ee1ff}
  h1{font-weight:700;font-size:92px;letter-spacing:-.03em;margin:14px 0 8px;text-shadow:0 0 40px rgba(94,225,255,.3)}
  .sub{font-size:22px;letter-spacing:.22em;text-transform:uppercase;color:#5ee1ff;font-weight:600}
  .tag{font-size:24px;color:#9aa6b8;margin-top:26px}
  .dock{position:absolute;left:50%;bottom:28px;transform:translateX(-50%);display:flex;gap:10px;padding:8px;border-radius:999px;background:rgba(16,21,29,.85);border:1px solid rgba(255,255,255,.1)}
  .dock span{width:40px;height:40px;border-radius:999px;background:linear-gradient(145deg,rgba(94,225,255,.25),rgba(179,136,255,.2));border:1px solid rgba(255,255,255,.1)}
</style></head><body>
<div class="bg"></div><div class="blob a"></div><div class="blob b"></div><div class="grid"></div>
<div class="monitor">
  <div class="bar"><span class="dot"></span><span>~ / 0x496C6B696E</span></div>
  <div class="body">
    <div class="eyebrow">Workstation · Backend · Systems · Automation</div>
    <h1>0x496C6B696E</h1>
    <div class="sub">Developer portfolio</div>
    <div class="tag">Boot. Build. Deploy. Repeat.</div>
  </div>
</div>
<div class="dock"><span></span><span></span><span></span><span></span><span></span><span></span></div>
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
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  const entry = Buffer.alloc(16);
  entry[0] = 32;
  entry[1] = 32;
  entry[2] = 0;
  entry[3] = 0;
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(22, 12);
  await writeFile(`${PUBLIC}favicon.ico`, Buffer.concat([header, entry, png]));
  await unlink(`${PUBLIC}favicon-32.png`);
  console.log("wrote public/favicon.ico");
} finally {
  await browser.close();
}
