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
  html,body{margin:0;width:1200px;height:630px;overflow:hidden;background:#0b0a08;color:#f1ebdf;font-family:Inter,system-ui,sans-serif}
  .bg{position:absolute;inset:0;background:radial-gradient(55% 50% at 72% 30%,rgba(245,183,59,.38),transparent 70%),radial-gradient(45% 45% at 18% 85%,rgba(232,116,59,.2),transparent 70%),linear-gradient(160deg,#120e08 0%,#17110a 45%,#0a0806 100%)}
  .ribbons{position:absolute;inset:-20%;background:linear-gradient(115deg,transparent 44%,rgba(245,183,59,.09) 44%,rgba(245,183,59,.09) 50%,transparent 50%),linear-gradient(115deg,transparent 54%,rgba(232,116,59,.06) 54%,rgba(232,116,59,.06) 57%,transparent 57%)}
  .panel{position:absolute;left:0;right:0;top:0;height:44px;background:rgba(14,12,9,.92);border-bottom:1px solid rgba(255,255,255,.06);display:flex;align-items:center;gap:14px;padding:0 18px;font-size:16px;color:#f1ebdf}
  .panel .sq{width:16px;height:16px;border-radius:4px;background:#f5b73b}
  .panel .sep{width:1px;height:18px;background:rgba(255,255,255,.12)}
  .panel .clock{margin-left:auto;font-family:'JetBrains Mono',monospace;color:#b3a893}
  .icons{position:absolute;left:24px;top:70px;display:flex;flex-direction:column;gap:22px;font-size:13px;text-align:center;color:#f1ebdf;text-shadow:0 1px 2px #000}
  .icons div{width:84px;display:flex;flex-direction:column;align-items:center;gap:8px}
  .folder{width:44px;height:34px;border-radius:4px;background:linear-gradient(180deg,#ffd36a,#f5b73b);box-shadow:inset 0 1px 0 rgba(255,255,255,.25)}
  .file{width:34px;height:42px;border-radius:3px;background:linear-gradient(180deg,#f6efe0,#d8ccb3);clip-path:polygon(0 0,68% 0,100% 24%,100% 100%,0 100%)}
  .win{position:absolute;left:170px;top:92px;width:960px;height:470px;border-radius:10px;background:rgba(23,20,15,.985);border:1px solid rgba(255,255,255,.09);box-shadow:0 0 0 1px rgba(0,0,0,.5),0 40px 90px -30px rgba(0,0,0,.95);overflow:hidden}
  .bar{height:40px;background:#110f0b;border-bottom:1px solid rgba(255,255,255,.06);display:flex;align-items:center;justify-content:center;font-size:15px;color:#f1ebdf;font-weight:500;position:relative}
  .bar .ctl{position:absolute;right:12px;display:flex;gap:6px}
  .bar .ctl span{width:24px;height:24px;border-radius:6px;background:rgba(255,255,255,.06)}
  .bar .ctl span:last-child{background:#e5484d}
  .path{height:36px;display:flex;align-items:center;gap:8px;padding:0 16px;border-bottom:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.02);font-family:'JetBrains Mono',monospace;font-size:14px;color:#b3a893}
  .path span{padding:3px 10px;border-radius:4px;background:rgba(255,255,255,.05)}
  .path span.cur{background:rgba(245,183,59,.2);color:#ffe9b8}
  .body{padding:44px 56px;display:flex;flex-direction:column;align-items:flex-start}
  h1{font-weight:700;font-size:92px;letter-spacing:-.03em;margin:0 0 10px;text-shadow:0 0 40px rgba(245,183,59,.3)}
  .sub{font-size:24px;color:#f5b73b;font-weight:600}
  .tag{font-size:24px;color:#b3a893;margin-top:22px}
  .prompt{margin-top:34px;font-family:'JetBrains Mono',monospace;font-size:18px;line-height:1.5}
  .g{color:#8fd16b}.b{color:#f5b73b;font-weight:600}.w{color:#f1ebdf;font-weight:600}
</style></head><body>
<div class="bg"></div><div class="ribbons"></div>
<div class="panel"><span class="sq"></span><span class="sep"></span><span>profile.md — Text Editor</span><span class="clock">09:41</span></div>
<div class="icons">
  <div><span class="folder"></span>Home</div>
  <div><span class="folder"></span>projects</div>
  <div><span class="file"></span>profile.md</div>
  <div><span class="file"></span>skills.json</div>
  <div><span class="file"></span>stack.yaml</div>
</div>
<div class="win">
  <div class="bar">profile.md — Text Editor<div class="ctl"><span></span><span></span></div></div>
  <div class="path"><span>~</span>›<span class="cur">profile.md</span></div>
  <div class="body">
    <h1>0x496C6B696E</h1>
    <div class="sub">Backend · Systems · Automation</div>
    <div class="tag">Boot. Build. Deploy. Repeat.</div>
    <div class="prompt"><span class="g">┌──(</span><span class="b">0x496c6b696e㉿workstation</span><span class="g">)-[</span><span class="w">~</span><span class="g">]</span><br><span class="g">└─</span><span class="b">$</span> cd projects</div>
  </div>
</div>
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
