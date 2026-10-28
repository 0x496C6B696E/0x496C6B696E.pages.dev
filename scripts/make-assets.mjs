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
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Inter:wght@400;500&display=swap" rel="stylesheet">
<style>
  html,body{margin:0;width:1200px;height:630px;overflow:hidden;background:#080a0d;color:#e9e4d8;font-family:Inter,system-ui,sans-serif}
  .bg{position:absolute;inset:0;background:
    radial-gradient(55% 45% at 50% 108%, rgba(229,108,53,.55), transparent 70%),
    radial-gradient(35% 28% at 50% 108%, rgba(243,217,155,.5), transparent 70%),
    radial-gradient(120% 80% at 50% 0%, rgba(212,175,97,.08), transparent 60%),
    linear-gradient(180deg,#05070a 0%,#080a0d 55%,#0b0d11 100%)}
  .frame{position:absolute;inset:28px;border:1px solid rgba(212,175,97,.22)}
  .frame:before,.frame:after{content:"";position:absolute;width:34px;height:34px;border:2px solid #d4af61}
  .frame:before{left:-2px;top:-2px;border-right:0;border-bottom:0}
  .frame:after{right:-2px;bottom:-2px;border-left:0;border-top:0}
  .ruins{position:absolute;left:0;right:0;bottom:0;height:260px;fill:#0b0e13}
  .wrap{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding-bottom:40px}
  .eyebrow{font-family:Cinzel,serif;font-size:16px;letter-spacing:.42em;color:#d4af61;text-transform:uppercase}
  h1{font-family:Cinzel,serif;font-weight:600;font-size:112px;letter-spacing:.2em;margin:18px 0 0 .2em;text-shadow:0 0 40px rgba(212,175,97,.35),0 3px 0 rgba(0,0,0,.6)}
  .sub{font-family:Cinzel,serif;font-size:22px;letter-spacing:.36em;color:#d4af61;text-transform:uppercase;margin-top:22px}
  .tag{font-size:26px;color:#989a9f;font-style:italic;margin-top:38px}
  .handle{position:absolute;left:64px;bottom:56px;font-family:ui-monospace,Menlo,monospace;font-size:20px;color:#f3d99b;letter-spacing:.08em}
  .hl{position:absolute;right:64px;bottom:56px;font-size:18px;color:#989a9f}
  .glow{position:absolute;left:50%;bottom:-40px;width:420px;height:200px;transform:translateX(-50%);background:radial-gradient(50% 60% at 50% 100%,rgba(243,217,155,.9),rgba(229,108,53,.5) 35%,transparent 70%);filter:blur(10px)}
</style></head><body>
<div class="bg"></div>
<svg class="ruins" viewBox="0 0 1200 260" preserveAspectRatio="none"><path d="M0 260V200l40-6 10-60 24 4 6 54 50 2V160l20-40 22 40v40l60 4V110l18-8 16 12v96l70 2v-50l14-14 12 14v52l80 2V60l26-16 24 16v110l50 2V120l30-30 30 30v54l60 2V80l20-20 22 20v96l70 2v-60l16-16 18 16v62l64 4V90l22-26 24 26v94l60 4V130l18-20 20 20v54l70 2V140l16-8 16 8v56l44 2v62z"/></svg>
<div class="glow"></div>
<div class="frame"></div>
<div class="wrap">
  <div class="eyebrow">An immersive developer portfolio</div>
  <h1>BONFIREOS</h1>
  <div class="sub">Backend · Systems · Automation</div>
  <div class="tag">“Rest at the Bonfire. Build. Deploy. Repeat.”</div>
</div>
<div class="handle">0x496C6B696E</div>
<div class="hl">Projects · Skills · Stack · GitHub activity</div>
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
