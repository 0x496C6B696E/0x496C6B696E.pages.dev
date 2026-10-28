"use client";

/**
 * The 3D room: a modern desk with three monitors (a 21:9 centre panel and two angled side
 * panels), a low-profile keyboard with RGB underglow, a glass-sided tower with lit fans, a desk
 * lamp, speakers, a headphone stand, a plant, a mug, bias lighting on the wall and dust in the
 * air. Lazy-loaded by <Backdrop/> only for Immersive mode on WebGL-capable devices. Everything
 * is procedural (no downloaded models or textures).
 *
 * Camera views: `lock` (three-quarter view), `desk` (frontal, every object clickable),
 * `desktop`/`window` (the centre screen fills the viewport and the HTML OS sits on it).
 * The boot log is painted onto the centre screen while the camera travels, and the camera
 * reports when it has settled so the HTML never appears before the screen does.
 */
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import * as THREE from "three";
import type { Stage } from "@/components/experience/ExperienceProvider";
import { destinations, site } from "@/config/site";
import { projects } from "@/data/projects";
import { BOOT_STEP_MS, bootLines } from "@/lib/boot";

export type ScreenMode = "off" | "boot" | "desktop";

interface Props {
  stage: Stage;
  screen: ScreenMode;
  reducedMotion: boolean;
  lowPower: boolean;
  sound: boolean;
  onContextLost: () => void;
  onReady: (ready: boolean) => void;
  onSettled: (settled: boolean) => void;
  onHint: Dispatch<SetStateAction<string | null>>;
  onPowerOn: () => void;
  onPowerOff: () => void;
  /** Click on the centre monitor at the desk: zoom back into the screen. */
  onMonitor: () => void;
  /** Click on the keyboard at the desk: zoom in and open the terminal. */
  onKeyboard: () => void;
  /** Click on the speakers: toggle the room tone. */
  onSpeakers: () => void;
}

const VOID = "#0b0a08";
const AMBER = "#f5b73b";
const ORANGE = "#e8743b";
const MONO = "600 24px 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace";

/** Small seeded PRNG (mulberry32) so procedural placement is deterministic and pure. */
function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Centre panel (21:9) shared by the monitor and the camera rig. */
const SCREEN = { x: 0, y: 1.2, z: 0.27, w: 0.88, h: 0.375 };
/** Side panels (16:9), angled in towards the chair. */
const SIDE = { w: 0.5, h: 0.28, x: 0.7, y: 1.17, z: 0.2, yaw: 0.5 };

const CAMERA: Record<Stage, { pos: [number, number, number]; look: [number, number, number] }> = {
  lock: { pos: [2.05, 1.5, 2.55], look: [-0.15, 0.98, 0.05] },
  desk: { pos: [0.05, 1.45, 2.8], look: [-0.05, 1.0, 0.15] },
  desktop: { pos: [SCREEN.x, SCREEN.y, SCREEN.z + 0.56], look: [SCREEN.x, SCREEN.y, SCREEN.z] },
  window: { pos: [SCREEN.x, SCREEN.y, SCREEN.z + 0.52], look: [SCREEN.x, SCREEN.y, SCREEN.z] },
};

type RgbTheme = "amber" | "spectrum" | "ember" | "off";
const THEMES: readonly RgbTheme[] = ["amber", "spectrum", "ember", "off"];

/** Colour for the RGB parts under the current theme; one call per frame per part is cheap. */
function rgbColor(target: THREE.Color, time: number, offset: number, theme: RgbTheme, saturation = 0.85, lightness = 0.58) {
  switch (theme) {
    case "spectrum":
      target.setHSL((((time * 0.05 + offset) % 1) + 1) % 1, saturation, lightness);
      break;
    case "amber":
      target.setHSL(0.105 + Math.sin(time * 0.3 + offset * 6) * 0.012, 0.92, 0.56);
      break;
    case "ember":
      target.setHSL(0.03 + Math.sin(time * 0.5 + offset * 6) * 0.03, 0.95, 0.55);
      break;
    case "off":
      target.set("#100d0a");
  }
}

function CameraRig({ stage, reducedMotion, onSettled }: { stage: Stage; reducedMotion: boolean; onSettled: (settled: boolean) => void }) {
  const { camera } = useThree();
  const look = useRef(new THREE.Vector3(...CAMERA[stage].look));
  const pointer = useRef({ x: 0, y: 0 });
  const previous = useRef(stage);
  const flying = useRef(false);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const onMove = (e: PointerEvent) => {
      pointer.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -((e.clientY / window.innerHeight) * 2 - 1),
      };
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame(({ clock }, delta) => {
    if (previous.current !== stage) {
      previous.current = stage;
      flying.current = true;
      onSettled(false);
    }
    const dt = Math.min(delta, 0.1);
    const target = CAMERA[stage];
    const t = clock.elapsedTime;
    const wide = stage === "lock" || stage === "desk";
    // Hand-held sway at the wide views only; at the screen the camera must hold still.
    const sway = wide && !reducedMotion ? (stage === "lock" ? 1 : 0.4) : 0;
    const parallax = stage === "lock" ? 0.14 : stage === "desk" ? 0.06 : 0.01;
    const px = (reducedMotion ? 0 : pointer.current.x * parallax) + Math.sin(t * 0.21) * 0.05 * sway;
    const py = (reducedMotion ? 0 : pointer.current.y * parallax * 0.6) + Math.sin(t * 0.17 + 1) * 0.025 * sway;
    const tx = target.pos[0] + px;
    const ty = target.pos[1] + py;
    const tz = target.pos[2];

    const { damp } = THREE.MathUtils;
    const p = camera.position;
    const l = look.current;
    if (reducedMotion) {
      p.set(tx, ty, tz);
      l.set(...target.look);
    } else {
      p.set(damp(p.x, tx, 2.2, dt), damp(p.y, ty, 2.2, dt), damp(p.z, tz, 2.2, dt));
      l.set(damp(l.x, target.look[0], 2.6, dt), damp(l.y, target.look[1], 2.6, dt), damp(l.z, target.look[2], 2.6, dt));
    }
    camera.lookAt(l);

    if (flying.current) {
      const dx = p.x - target.pos[0];
      const dy = p.y - target.pos[1];
      const dz = p.z - target.pos[2];
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (reducedMotion || distance < (wide ? 0.12 : 0.02)) {
        flying.current = false;
        onSettled(true);
      }
    }
  });
  return null;
}

/* ----------------------------------------------------------------------------------------- */
/* Canvas-painted panels                                                                      */
/* ----------------------------------------------------------------------------------------- */

/** Centre panel: dark while locked, the boot log while booting, a small painted desktop after. */
class ScreenPainter {
  readonly texture: THREE.CanvasTexture;
  private mode: ScreenMode = "off";
  private readonly canvas = document.createElement("canvas");
  private readonly ctx: CanvasRenderingContext2D;
  private readonly lines = bootLines();
  private bootStart = 0;
  private last = -1;

  constructor() {
    this.canvas.width = 1024;
    this.canvas.height = 436;
    this.ctx = this.canvas.getContext("2d")!;
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
  }

  tick(time: number, mode: ScreenMode) {
    if (mode !== this.mode) {
      this.mode = mode;
      this.last = -1;
      if (mode === "boot") this.bootStart = time;
    }
    const interval = mode === "boot" ? 0.07 : mode === "off" ? 0.12 : 0.5;
    if (time - this.last < interval) return;
    this.last = time;
    if (mode === "off") this.paintOff(time);
    else if (mode === "boot") this.paintBoot(time);
    else this.paintDesktop();
    this.texture.needsUpdate = true;
  }

  private paintOff(time: number) {
    const { ctx, canvas } = this;
    ctx.fillStyle = "#070604";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const sheen = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    sheen.addColorStop(0, "rgba(255,255,255,0.035)");
    sheen.addColorStop(0.5, "rgba(255,255,255,0)");
    sheen.addColorStop(1, "rgba(255,255,255,0.02)");
    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // a sleeping machine: one breathing dot
    const pulse = 0.5 + 0.5 * Math.sin(time * 1.6);
    ctx.fillStyle = `rgba(245,183,59,${0.3 + pulse * 0.6})`;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height - 40, 5 + pulse * 2, 0, Math.PI * 2);
    ctx.fill();
  }

  private paintBoot(time: number) {
    const { ctx, canvas, lines } = this;
    const elapsed = (time - this.bootStart) * 1000;
    const shown = Math.min(lines.length, Math.floor(elapsed / BOOT_STEP_MS) + 1);
    ctx.fillStyle = "#070604";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.textBaseline = "alphabetic";
    ctx.textAlign = "left";
    ctx.font = MONO;
    ctx.fillStyle = AMBER;
    ctx.fillText(`${site.name.toLowerCase()} ${site.system.toLowerCase()} v${site.version}`, 48, 58);
    ctx.font = MONO.replace("600", "500");
    for (let i = 0; i < shown; i++) {
      const last = i === shown - 1;
      const ready = i === lines.length - 1;
      ctx.fillStyle = ready ? "#8fd16b" : last ? "#f1ebdf" : "#a89c86";
      ctx.fillText(`> ${lines[i]}`, 48, 104 + i * 30);
    }
    if (shown < lines.length && Math.floor(time * 2) % 2 === 0) {
      ctx.fillStyle = "#f1ebdf";
      ctx.fillRect(48, 104 + shown * 30 - 20, 12, 24);
    }
    // progress
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fillRect(48, 392, canvas.width - 96, 6);
    const fill = ctx.createLinearGradient(48, 0, canvas.width - 48, 0);
    fill.addColorStop(0, "#c98a12");
    fill.addColorStop(1, ORANGE);
    ctx.fillStyle = fill;
    ctx.fillRect(48, 392, ((canvas.width - 96) * shown) / lines.length, 6);
  }

  private paintDesktop() {
    const { ctx, canvas } = this;
    const w = canvas.width;
    const h = canvas.height;
    ctx.fillStyle = "#17110a";
    ctx.fillRect(0, 0, w, h);
    const blue = ctx.createRadialGradient(720, 120, 10, 720, 120, 520);
    blue.addColorStop(0, "rgba(245,183,59,0.45)");
    blue.addColorStop(1, "rgba(245,183,59,0)");
    ctx.fillStyle = blue;
    ctx.fillRect(0, 0, w, h);
    const teal = ctx.createRadialGradient(180, 400, 10, 180, 400, 420);
    teal.addColorStop(0, "rgba(232,116,59,0.22)");
    teal.addColorStop(1, "rgba(232,116,59,0)");
    ctx.fillStyle = teal;
    ctx.fillRect(0, 0, w, h);
    // two diagonal ribbons
    ctx.save();
    ctx.translate(w * 0.62, h * 0.5);
    ctx.rotate(-0.55);
    ctx.fillStyle = "rgba(245,183,59,0.08)";
    ctx.fillRect(-900, -60, 1800, 90);
    ctx.fillStyle = "rgba(232,116,59,0.06)";
    ctx.fillRect(-900, 70, 1800, 40);
    ctx.restore();
    // top panel
    ctx.fillStyle = "rgba(14,12,9,0.92)";
    ctx.fillRect(0, 0, w, 26);
    ctx.fillStyle = AMBER;
    ctx.beginPath();
    ctx.roundRect(10, 6, 14, 14, 3);
    ctx.fill();
    ctx.font = "500 13px 'JetBrains Mono', ui-monospace, monospace";
    ctx.fillStyle = "#b3a893";
    const now = new Date();
    ctx.textAlign = "right";
    ctx.fillText(`${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`, w - 14, 18);
    ctx.textAlign = "left";
    // desktop icons: folders first, then the files
    const items = ["Home", ...destinations.map((d) => d.file.replace(/\/$/, ""))];
    ctx.font = "500 11px Inter, system-ui, sans-serif";
    items.slice(0, 6).forEach((name, i) => {
      const y = 48 + i * 60;
      const folder = name === "Home" || name === "projects";
      ctx.fillStyle = folder ? AMBER : "#f6efe0";
      ctx.beginPath();
      ctx.roundRect(folder ? 24 : 28, y, folder ? 34 : 26, folder ? 28 : 32, 4);
      ctx.fill();
      ctx.fillStyle = "#f1ebdf";
      ctx.textAlign = "center";
      ctx.fillText(name, 41, y + 46);
      ctx.textAlign = "left";
    });
  }

  dispose() {
    this.texture.dispose();
  }
}

export type SideMode = "monitor" | "log" | "off";
const SIDE_MODES: readonly SideMode[] = ["monitor", "log", "off"];

const LOG_POOL = [
  "$ git fetch --all --prune",
  ...projects.map((p) => `${p.repo}: up to date`),
  "$ npm run build",
  `✓ ${destinations.length + projects.length + 2} routes exported to out/`,
  "✓ verify-export: no placeholders, no secrets",
  "$ npm test",
  "✓ unit tests passed",
  "$ playwright test",
  "✓ chromium · firefox · webkit · pixel 7 passed",
  `$ wrangler pages deploy out/ --project-name ${site.developer.handle.toLowerCase()}`,
  `✓ deployed ${site.url}`,
  `$ curl -sI ${site.url} | head -1`,
  "HTTP/2 200",
  "$ journalctl --since today | tail -1",
  "thermal: fan curve nudged to 1180 rpm",
];

const PROCESSES = ["next-server", "node scripts/serve-out.mjs", "three.js render", "zsh", "ssh-agent", "room-tone (web audio)"];

/** Side panel: an htop-like system monitor, a scrolling build log, or off. */
class SidePainter {
  readonly texture: THREE.CanvasTexture;
  private mode: SideMode = "monitor";
  private readonly canvas = document.createElement("canvas");
  private readonly ctx: CanvasRenderingContext2D;
  private readonly rand: () => number;
  private readonly loads: number[];
  private readonly log: Array<{ stamp: string; text: string }> = [];
  private logIndex: number;
  private last = -1;

  constructor(seed: number) {
    this.canvas.width = 512;
    this.canvas.height = 288;
    this.ctx = this.canvas.getContext("2d")!;
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.rand = seeded(seed);
    this.loads = Array.from({ length: 6 }, () => 0.1 + this.rand() * 0.5);
    this.logIndex = Math.floor(this.rand() * LOG_POOL.length);
  }

  tick(time: number, mode: SideMode) {
    if (mode !== this.mode) {
      this.mode = mode;
      this.last = -1;
    }
    const interval = mode === "monitor" ? 0.25 : mode === "log" ? 0.6 : 2;
    if (time - this.last < interval) return;
    this.last = time;
    const { ctx, canvas } = this;
    ctx.fillStyle = mode === "off" ? "#070604" : "#0e0c09";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (mode === "monitor") this.paintMonitor();
    else if (mode === "log") this.paintLog();
    this.texture.needsUpdate = true;
  }

  private header(title: string) {
    const { ctx, canvas } = this;
    ctx.fillStyle = "#110f0b";
    ctx.fillRect(0, 0, canvas.width, 24);
    ctx.font = "500 12px 'JetBrains Mono', ui-monospace, monospace";
    ctx.fillStyle = "#b3a893";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(title, 12, 16);
  }

  private bar(label: string, y: number, load: number) {
    const { ctx } = this;
    ctx.fillStyle = "#8a8068";
    ctx.fillText(label, 16, y + 9);
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fillRect(60, y, 320, 10);
    ctx.fillStyle = load < 0.6 ? "#8fd16b" : load < 0.85 ? "#facc15" : "#f87171";
    ctx.fillRect(60, y, 320 * load, 10);
    ctx.fillStyle = "#b3a893";
    ctx.fillText(`${Math.round(load * 100)}%`.padStart(4), 392, y + 9);
  }

  private paintMonitor() {
    const { ctx } = this;
    this.header("system monitor");
    ctx.font = "500 12px 'JetBrains Mono', ui-monospace, monospace";
    for (let i = 0; i < this.loads.length; i++) {
      this.loads[i] = Math.min(0.97, Math.max(0.03, this.loads[i] + (this.rand() - 0.5) * 0.14));
      this.bar(`cpu${i}`, 40 + i * 20, this.loads[i]);
    }
    this.bar("mem", 168, 0.42 + Math.sin(this.last * 0.1) * 0.03);
    this.bar("gpu", 188, 0.3 + this.loads[0] * 0.4);
    ctx.fillStyle = "#8a8068";
    ctx.fillText("PID    CPU%   CMD", 16, 222);
    PROCESSES.slice(0, 3).forEach((cmd, i) => {
      ctx.fillStyle = i === 0 ? "#f1ebdf" : "#b3a893";
      const pid = String(1180 + i * 37).padEnd(6);
      const cpu = `${(this.loads[i] * 40).toFixed(1)}`.padStart(5);
      ctx.fillText(`${pid} ${cpu}   ${cmd}`, 16, 242 + i * 18);
    });
  }

  private paintLog() {
    const { ctx } = this;
    const now = new Date();
    const stamp = [now.getHours(), now.getMinutes(), now.getSeconds()].map((n) => String(n).padStart(2, "0")).join(":");
    this.log.push({ stamp, text: LOG_POOL[this.logIndex] });
    this.logIndex = (this.logIndex + 1) % LOG_POOL.length;
    if (this.log.length > 12) this.log.shift();
    this.header("build log");
    ctx.font = "500 12px 'JetBrains Mono', ui-monospace, monospace";
    this.log.forEach((line, i) => {
      const last = i === this.log.length - 1;
      ctx.fillStyle = "#8a8068";
      ctx.fillText(line.stamp, 12, 46 + i * 20);
      ctx.fillStyle = line.text.startsWith("✓") ? "#8fd16b" : last ? "#f1ebdf" : "#b3a893";
      ctx.fillText(line.text, 84, 46 + i * 20);
    });
  }

  dispose() {
    this.texture.dispose();
  }
}

/* ----------------------------------------------------------------------------------------- */
/* Interaction                                                                                */
/* ----------------------------------------------------------------------------------------- */

interface InteractiveProps {
  label: string;
  enabled: boolean;
  onClick: () => void;
  onHint: Dispatch<SetStateAction<string | null>>;
  children: ReactNode;
}

/** Makes a group clickable with a pointer cursor and a hint label while hovered. */
function Interactive({ label, enabled, onClick, onHint, children }: InteractiveProps) {
  const [over, setOver] = useState(false);
  const active = over && enabled;
  useEffect(() => {
    if (!active) return;
    document.body.style.cursor = "pointer";
    onHint(label);
    return () => {
      document.body.style.cursor = "";
      onHint((current) => (current === label ? null : current));
    };
  }, [active, label, onHint]);
  const stop = (e: ThreeEvent<PointerEvent | MouseEvent>) => e.stopPropagation();
  return (
    <group
      onClick={(e) => {
        if (!enabled) return;
        stop(e);
        onClick();
      }}
      onPointerOver={(e) => {
        if (!enabled) return;
        stop(e);
        setOver(true);
      }}
      onPointerOut={() => setOver(false)}
    >
      {children}
    </group>
  );
}

/* ----------------------------------------------------------------------------------------- */
/* Objects                                                                                    */
/* ----------------------------------------------------------------------------------------- */

function useDarkMaterials() {
  const mats = useMemo(
    () => ({
      dark: new THREE.MeshStandardMaterial({ color: "#0d0b09", roughness: 0.5, metalness: 0.4 }),
      housing: new THREE.MeshStandardMaterial({ color: "#1a1611", roughness: 0.6, metalness: 0.3 }),
    }),
    [],
  );
  useEffect(
    () => () => {
      mats.dark.dispose();
      mats.housing.dispose();
    },
    [mats],
  );
  return mats;
}

interface CenterMonitorProps {
  screen: ScreenMode;
  stage: Stage;
  onHint: Dispatch<SetStateAction<string | null>>;
  onPowerOn: () => void;
  onMonitor: () => void;
}

function CenterMonitor({ screen, stage, onHint, onPowerOn, onMonitor }: CenterMonitorProps) {
  const painter = useMemo(() => new ScreenPainter(), []);
  useEffect(() => () => painter.dispose(), [painter]);
  useFrame(({ clock }) => painter.tick(clock.elapsedTime, screen));
  const glow = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    if (glow.current) glow.current.intensity = (screen === "off" ? 0.25 : 0.7) + Math.sin(clock.elapsedTime * 1.3) * 0.05;
  });
  const { dark, housing } = useDarkMaterials();
  const atLock = stage === "lock";
  return (
    <Interactive label={atLock ? "Monitor: power on" : "Monitor: back to the screen"} enabled={atLock || stage === "desk"} onClick={atLock ? onPowerOn : onMonitor} onHint={onHint}>
      <group>
        <mesh position={[SCREEN.x, SCREEN.y, SCREEN.z - 0.012]} material={dark}>
          <boxGeometry args={[SCREEN.w + 0.026, SCREEN.h + 0.034, 0.016]} />
        </mesh>
        <mesh position={[SCREEN.x, SCREEN.y, SCREEN.z - 0.055]} material={housing}>
          <boxGeometry args={[SCREEN.w - 0.1, SCREEN.h - 0.06, 0.07]} />
        </mesh>
        <mesh position={[SCREEN.x, SCREEN.y, SCREEN.z]}>
          <planeGeometry args={[SCREEN.w, SCREEN.h]} />
          <meshBasicMaterial map={painter.texture} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.9, 0.2]} material={dark}>
          <boxGeometry args={[0.05, 0.27, 0.03]} />
        </mesh>
        <mesh position={[0, 0.772, 0.22]} material={dark}>
          <cylinderGeometry args={[0.22, 0.24, 0.012, 32]} />
        </mesh>
        <pointLight ref={glow} position={[SCREEN.x, SCREEN.y, SCREEN.z + 0.45]} color="#ffd9a8" distance={2.6} decay={2} intensity={0.7} />
      </group>
    </Interactive>
  );
}

interface SideMonitorProps {
  side: -1 | 1;
  mode: SideMode;
  interactive: boolean;
  onCycle: () => void;
  onHint: Dispatch<SetStateAction<string | null>>;
}

function SideMonitor({ side, mode, interactive, onCycle, onHint }: SideMonitorProps) {
  const painter = useMemo(() => new SidePainter(side < 0 ? 11 : 23), [side]);
  useEffect(() => () => painter.dispose(), [painter]);
  useFrame(({ clock }) => painter.tick(clock.elapsedTime, mode));
  const { dark, housing } = useDarkMaterials();
  const next = SIDE_MODES[(SIDE_MODES.indexOf(mode) + 1) % SIDE_MODES.length];
  const name = side < 0 ? "Left monitor" : "Right monitor";
  const what = next === "off" ? "turn it off" : next === "log" ? "show the build log" : "show the system monitor";
  return (
    <Interactive label={`${name}: ${what}`} enabled={interactive} onClick={onCycle} onHint={onHint}>
      <group position={[side * SIDE.x, SIDE.y, SIDE.z]} rotation={[0, -side * SIDE.yaw, 0]}>
        <mesh position={[0, 0, -0.011]} material={dark}>
          <boxGeometry args={[SIDE.w + 0.024, SIDE.h + 0.03, 0.014]} />
        </mesh>
        <mesh position={[0, 0, -0.05]} material={housing}>
          <boxGeometry args={[SIDE.w - 0.08, SIDE.h - 0.05, 0.06]} />
        </mesh>
        <mesh>
          <planeGeometry args={[SIDE.w, SIDE.h]} />
          <meshBasicMaterial map={painter.texture} toneMapped={false} />
        </mesh>
        <mesh position={[0, -0.27, -0.03]} material={dark}>
          <boxGeometry args={[0.04, 0.27, 0.025]} />
        </mesh>
        <mesh position={[0, -0.4, -0.02]} material={dark}>
          <cylinderGeometry args={[0.13, 0.15, 0.01, 28]} />
        </mesh>
      </group>
    </Interactive>
  );
}

/** Low-profile 75% keyboard with instanced keycaps and an RGB underglow strip, plus the mouse and desk mat. */
function Keyboard({ theme, interactive, onClick, onHint }: { theme: RgbTheme; interactive: boolean; onClick: () => void; onHint: Dispatch<SetStateAction<string | null>> }) {
  const keys = useRef<THREE.InstancedMesh>(null);
  const glowMat = useRef<THREE.MeshBasicMaterial>(null);
  const count = 75;
  useEffect(() => {
    const mesh = keys.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    let i = 0;
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 15; col++) {
        m.setPosition(-0.166 + col * 0.0237, 0.797, 0.595 + row * 0.0237);
        mesh.setMatrixAt(i++, m);
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, []);
  useFrame(({ clock }) => {
    if (glowMat.current) {
      rgbColor(glowMat.current.color, clock.elapsedTime, 0.1, theme, 0.9, 0.55);
      glowMat.current.opacity = theme === "off" ? 0 : 0.55;
    }
  });
  return (
    <group>
      <Interactive label="Keyboard: type a command (opens the terminal)" enabled={interactive} onClick={onClick} onHint={onHint}>
        <group>
          <mesh position={[0, 0.784, 0.645]}>
            <boxGeometry args={[0.39, 0.02, 0.145]} />
            <meshStandardMaterial color="#15120e" roughness={0.6} metalness={0.3} />
          </mesh>
          <instancedMesh ref={keys} args={[undefined, undefined, count]}>
            <boxGeometry args={[0.02, 0.008, 0.02]} />
            <meshStandardMaterial color="#2a251d" roughness={0.7} />
          </instancedMesh>
        </group>
      </Interactive>
      <mesh position={[0, 0.7745, 0.645]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.42, 0.17]} />
        <meshBasicMaterial ref={glowMat} color={AMBER} transparent opacity={0.55} toneMapped={false} />
      </mesh>
      <mesh position={[0.36, 0.79, 0.65]} rotation={[0, -0.25, 0]}>
        <boxGeometry args={[0.062, 0.034, 0.11]} />
        <meshStandardMaterial color="#15120e" roughness={0.55} metalness={0.3} />
      </mesh>
      <mesh position={[0.08, 0.767, 0.64]}>
        <boxGeometry args={[1.1, 0.005, 0.5]} />
        <meshStandardMaterial color="#100d0a" roughness={1} />
      </mesh>
    </group>
  );
}

interface TowerProps {
  theme: RgbTheme;
  stage: Stage;
  onPowerOn: () => void;
  onPowerOff: () => void;
  onCycleTheme: () => void;
  onHint: Dispatch<SetStateAction<string | null>>;
}

/** Glass-sided tower with three lit fans, a clickable power button and a clickable RGB panel. */
function Tower({ theme, stage, onPowerOn, onPowerOff, onCycleTheme, onHint }: TowerProps) {
  const fans = useRef<Array<THREE.MeshBasicMaterial | null>>([]);
  const inner = useRef<THREE.PointLight>(null);
  const button = useRef<THREE.MeshBasicMaterial>(null);
  const x = -1.72;
  const metal = useMemo(() => new THREE.MeshStandardMaterial({ color: "#100d0a", roughness: 0.45, metalness: 0.5 }), []);
  const glass = useMemo(() => new THREE.MeshStandardMaterial({ color: "#ffd9a0", roughness: 0.1, metalness: 0.1, transparent: true, opacity: 0.16 }), []);
  useEffect(
    () => () => {
      metal.dispose();
      glass.dispose();
    },
    [metal, glass],
  );
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    fans.current.forEach((m, i) => {
      if (m) rgbColor(m.color, t, 0.33 * i, theme, 0.9, 0.58);
    });
    if (inner.current) {
      rgbColor(inner.current.color, t, 0.2, theme, 0.9, 0.55);
      inner.current.intensity = theme === "off" ? 0 : 0.55;
    }
    if (button.current) {
      const pulse = 0.5 + 0.5 * Math.sin(t * 1.8);
      button.current.color.set(stage === "lock" ? AMBER : "#8fd16b").multiplyScalar(0.55 + pulse * 0.45);
    }
  });
  const atLock = stage === "lock";
  const atDesk = stage === "desk";
  const next = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
  return (
    <group position={[x, 0, 0.3]}>
      <Interactive label={`Tower: switch the RGB to ${next}`} enabled={atDesk} onClick={onCycleTheme} onHint={onHint}>
        <group>
          <mesh position={[0, 0.26, 0]} material={metal}>
            <boxGeometry args={[0.44, 0.52, 0.5]} />
          </mesh>
          <mesh position={[0.222, 0.27, 0]} rotation={[0, Math.PI / 2, 0]} material={glass}>
            <planeGeometry args={[0.46, 0.46]} />
          </mesh>
          {[0.1, 0.26, 0.42].map((y, i) => (
            <mesh key={y} position={[0.2, y, -0.12]} rotation={[0, Math.PI / 2, 0]}>
              <torusGeometry args={[0.055, 0.007, 12, 36]} />
              <meshBasicMaterial
                ref={(el) => {
                  fans.current[i] = el;
                }}
                color={AMBER}
                toneMapped={false}
              />
            </mesh>
          ))}
        </group>
      </Interactive>
      <pointLight ref={inner} position={[0.12, 0.3, -0.05]} color={AMBER} distance={1.4} decay={2} intensity={0.55} />
      <Interactive label={atLock ? "Power button: power on" : "Power button: shut down"} enabled={atLock || atDesk} onClick={atLock ? onPowerOn : onPowerOff} onHint={onHint}>
        <mesh position={[0.1, 0.526, 0.2]}>
          <cylinderGeometry args={[0.018, 0.018, 0.012, 20]} />
          <meshBasicMaterial ref={button} color={AMBER} toneMapped={false} />
        </mesh>
      </Interactive>
    </group>
  );
}

function Lamp({ on, interactive, onToggle, onHint }: { on: boolean; interactive: boolean; onToggle: () => void; onHint: Dispatch<SetStateAction<string | null>> }) {
  const metal = useMemo(() => new THREE.MeshStandardMaterial({ color: "#1e1a14", roughness: 0.4, metalness: 0.6 }), []);
  useEffect(() => () => metal.dispose(), [metal]);
  return (
    <Interactive label={`Desk lamp: turn ${on ? "off" : "on"}`} enabled={interactive} onClick={onToggle} onHint={onHint}>
      <group position={[-1.22, 0.765, 0.0]}>
        <mesh position={[0, 0.008, 0]} material={metal}>
          <cylinderGeometry args={[0.075, 0.08, 0.016, 28]} />
        </mesh>
        <mesh position={[0, 0.21, 0]} material={metal}>
          <cylinderGeometry args={[0.011, 0.011, 0.4, 12]} />
        </mesh>
        <mesh position={[0.15, 0.47, 0]} rotation={[0, 0, -0.95]} material={metal}>
          <cylinderGeometry args={[0.009, 0.009, 0.36, 12]} />
        </mesh>
        <group position={[0.31, 0.5, 0]} rotation={[0, 0, 0.6]}>
          <mesh material={metal}>
            <coneGeometry args={[0.075, 0.11, 28, 1, true]} />
          </mesh>
          <mesh position={[0, -0.02, 0]}>
            <sphereGeometry args={[0.022, 12, 10]} />
            <meshBasicMaterial color={on ? "#ffe2b8" : "#2a2a2e"} toneMapped={false} />
          </mesh>
        </group>
        <pointLight position={[0.3, 0.42, 0.02]} color="#ffb64a" distance={2.6} decay={2} intensity={on ? 2.2 : 0} />
      </group>
    </Interactive>
  );
}

function Mug({ coffee, interactive, onSip, onHint }: { coffee: number; interactive: boolean; onSip: () => void; onHint: Dispatch<SetStateAction<string | null>> }) {
  const level = coffee / 4;
  const label = coffee > 0 ? `Coffee: take a sip (${coffee * 25}% left)` : "Coffee: refill the mug";
  return (
    <Interactive label={label} enabled={interactive} onClick={onSip} onHint={onHint}>
      <group position={[0.62, 0.765, 0.55]}>
        <mesh position={[0, 0.0475, 0]}>
          <cylinderGeometry args={[0.045, 0.04, 0.095, 24, 1, true]} />
          <meshStandardMaterial color="#e8e4dc" roughness={0.5} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.002, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.004, 24]} />
          <meshStandardMaterial color="#d9d4ca" roughness={0.6} />
        </mesh>
        <mesh position={[0.052, 0.05, 0]}>
          <torusGeometry args={[0.026, 0.007, 10, 24, Math.PI]} />
          <meshStandardMaterial color="#e8e4dc" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.03 + level * 0.058, 0]} visible={coffee > 0}>
          <cylinderGeometry args={[0.042, 0.042, 0.004, 24]} />
          <meshStandardMaterial color="#3a2415" roughness={0.3} />
        </mesh>
      </group>
    </Interactive>
  );
}

function Plant({ interactive, onHint }: { interactive: boolean; onHint: Dispatch<SetStateAction<string | null>> }) {
  const leaves = useRef<THREE.Group>(null);
  const kickAt = useRef(-10);
  const clock = useThree((s) => s.clock);
  useFrame(() => {
    if (!leaves.current) return;
    const k = (clock.elapsedTime - kickAt.current) / 0.9;
    leaves.current.rotation.z = k < 1 ? Math.sin(k * 22) * 0.12 * (1 - k) : 0;
  });
  return (
    <Interactive
      label="Plant: give it a poke"
      enabled={interactive}
      onClick={() => {
        kickAt.current = clock.elapsedTime;
      }}
      onHint={onHint}
    >
      <group position={[1.32, 0.765, 0.1]}>
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.065, 0.05, 0.12, 20]} />
          <meshStandardMaterial color="#2b2a30" roughness={0.9} />
        </mesh>
        <group ref={leaves} position={[0, 0.12, 0]}>
          {[
            [0, 0.08, 0, 0.09],
            [-0.06, 0.05, 0.03, 0.07],
            [0.06, 0.06, -0.03, 0.075],
          ].map(([px, py, pz, r], i) => (
            <mesh key={i} position={[px, py, pz]} scale={[1, 0.75, 1]}>
              <sphereGeometry args={[r, 14, 10]} />
              <meshStandardMaterial color="#2f7a4a" roughness={0.9} />
            </mesh>
          ))}
        </group>
      </group>
    </Interactive>
  );
}

function Speakers({ sound, interactive, onToggle, onHint }: { sound: boolean; interactive: boolean; onToggle: () => void; onHint: Dispatch<SetStateAction<string | null>> }) {
  const plastic = useMemo(() => new THREE.MeshStandardMaterial({ color: "#15120e", roughness: 0.6, metalness: 0.2 }), []);
  useEffect(() => () => plastic.dispose(), [plastic]);
  return (
    <Interactive label={`Speakers: turn the room tone ${sound ? "off" : "on"}`} enabled={interactive} onClick={onToggle} onHint={onHint}>
      <group>
        {[-0.98, 0.98].map((sx) => (
          <group key={sx} position={[sx, 0.845, 0.42]} rotation={[0, -sx * 0.25, 0]}>
            <mesh material={plastic}>
              <boxGeometry args={[0.09, 0.16, 0.09]} />
            </mesh>
            <mesh position={[0, 0.02, 0.046]}>
              <circleGeometry args={[0.03, 20]} />
              <meshStandardMaterial color="#0a0c10" roughness={0.9} />
            </mesh>
            <mesh position={[0, -0.06, 0.046]}>
              <boxGeometry args={[0.01, 0.01, 0.003]} />
              <meshBasicMaterial color={sound ? AMBER : "#3a3128"} toneMapped={false} />
            </mesh>
          </group>
        ))}
      </group>
    </Interactive>
  );
}

function Room({ theme }: { theme: RgbTheme }) {
  const metal = useMemo(() => new THREE.MeshStandardMaterial({ color: "#100d0a", roughness: 0.5, metalness: 0.5 }), []);
  const wood = useMemo(() => new THREE.MeshStandardMaterial({ color: "#3a2a1e", roughness: 0.55, metalness: 0.05 }), []);
  const plastic = useMemo(() => new THREE.MeshStandardMaterial({ color: "#15120e", roughness: 0.6, metalness: 0.2 }), []);
  useEffect(
    () => () => {
      metal.dispose();
      wood.dispose();
      plastic.dispose();
    },
    [metal, wood, plastic],
  );
  const strip = useRef<THREE.MeshBasicMaterial>(null);
  const stripLight = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    if (strip.current) rgbColor(strip.current.color, clock.elapsedTime, 0.6, theme, 0.85, 0.6);
    if (stripLight.current) {
      rgbColor(stripLight.current.color, clock.elapsedTime, 0.6, theme, 0.85, 0.6);
      stripLight.current.intensity = theme === "off" ? 0 : 2.2;
    }
  });
  return (
    <group>
      {/* floor and back wall */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#0e0b08" roughness={0.9} metalness={0.05} />
      </mesh>
      <mesh position={[0, 1.8, -0.7]}>
        <boxGeometry args={[14, 3.8, 0.1]} />
        <meshStandardMaterial color="#15110c" roughness={1} />
      </mesh>
      {/* desk: slab and two steel frame legs */}
      <mesh position={[0, 0.74, 0.3]} material={wood}>
        <boxGeometry args={[3.0, 0.05, 1.3]} />
      </mesh>
      {[-1.35, 1.35].map((lx) => (
        <group key={lx} position={[lx, 0, 0.3]}>
          <mesh position={[0, 0.36, -0.5]} material={metal}>
            <boxGeometry args={[0.05, 0.72, 0.05]} />
          </mesh>
          <mesh position={[0, 0.36, 0.5]} material={metal}>
            <boxGeometry args={[0.05, 0.72, 0.05]} />
          </mesh>
          <mesh position={[0, 0.03, 0]} material={metal}>
            <boxGeometry args={[0.05, 0.05, 1.05]} />
          </mesh>
        </group>
      ))}
      {/* bias-light strip behind the monitors and the light it throws on the wall */}
      <mesh position={[0, 1.0, -0.05]}>
        <boxGeometry args={[1.9, 0.014, 0.014]} />
        <meshBasicMaterial ref={strip} color={AMBER} toneMapped={false} />
      </mesh>
      <pointLight ref={stripLight} position={[0, 1.15, -0.3]} color={AMBER} distance={3.6} decay={2} intensity={2.2} />
      <pointLight position={[-0.9, 1.6, -0.4]} color={ORANGE} distance={2.6} decay={2} intensity={0.5} />
      {/* headphone stand to the right */}
      <group position={[1.08, 0.765, 0.5]}>
        <mesh position={[0, 0.005, 0]} material={metal}>
          <cylinderGeometry args={[0.06, 0.06, 0.01, 24]} />
        </mesh>
        <mesh position={[0, 0.12, 0]} material={metal}>
          <cylinderGeometry args={[0.008, 0.008, 0.24, 12]} />
        </mesh>
        <mesh position={[0, 0.25, 0]} material={plastic}>
          <torusGeometry args={[0.075, 0.012, 12, 32, Math.PI]} />
        </mesh>
        {[-0.075, 0.075].map((hx) => (
          <mesh key={hx} position={[hx, 0.2, 0]} material={plastic}>
            <boxGeometry args={[0.03, 0.08, 0.07]} />
          </mesh>
        ))}
      </group>
      {/* a shelf of books on the wall for depth */}
      <mesh position={[1.6, 1.75, -0.6]} material={wood}>
        <boxGeometry args={[0.9, 0.03, 0.22]} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[1.25 + i * 0.12, 1.86, -0.62]}>
          <boxGeometry args={[0.07, 0.2 + (i % 3) * 0.03, 0.16]} />
          <meshStandardMaterial color={["#5a3a2a", "#4a3a5a", "#2f2a24", "#5a4a1b", "#4a2f2f"][i]} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

/** Soft round sprite for the dust so near particles never read as squares. */
function useDustTexture() {
  const texture = useMemo(() => {
    const size = 32;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(255,230,184,1)");
    g.addColorStop(0.5, "rgba(255,230,184,0.35)");
    g.addColorStop(1, "rgba(255,230,184,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

/** Dust drifting in the bias light, kept behind and beside the desk so nothing floats between camera and screen. */
function Dust({ count }: { count: number }) {
  const points = useRef<THREE.Points>(null);
  const tex = useDustTexture();
  const { positions, seeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count * 2);
    const rand = seeded(5);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = -1.6 + rand() * 3.2;
      positions[i * 3 + 1] = 0.9 + rand() * 1.4;
      positions[i * 3 + 2] = -0.6 + rand() * 0.5;
      seeds[i * 2] = rand() * Math.PI * 2;
      seeds[i * 2 + 1] = 0.015 + rand() * 0.04;
    }
    return { positions, seeds };
  }, [count]);
  useFrame(({ clock }, delta) => {
    const attr = points.current?.geometry.getAttribute("position") as THREE.BufferAttribute | undefined;
    if (!attr) return;
    const arr = attr.array as Float32Array;
    const dt = Math.min(delta, 0.1);
    const t = clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      arr[i3] += Math.sin(t * 0.3 + seeds[i * 2]) * 0.03 * dt;
      arr[i3 + 1] -= seeds[i * 2 + 1] * dt;
      if (arr[i3 + 1] < 0.85) arr[i3 + 1] = 2.3;
    }
    attr.needsUpdate = true;
  });
  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial map={tex} size={0.02} sizeAttenuation transparent opacity={0.45} depthWrite={false} color="#ffe6b8" />
    </points>
  );
}

/* ----------------------------------------------------------------------------------------- */

export default function WorkstationScene({ stage, screen, reducedMotion, lowPower, sound, onContextLost, onReady, onSettled, onHint, onPowerOn, onPowerOff, onMonitor, onKeyboard, onSpeakers }: Props) {
  const [visible, setVisible] = useState(true);
  const [ready, setReady] = useState(false);
  // Things on the desk that can be fiddled with.
  const [theme, setTheme] = useState<RgbTheme>("amber");
  const [lamp, setLamp] = useState(true);
  const [coffee, setCoffee] = useState(3);
  const [sides, setSides] = useState<[SideMode, SideMode]>(["monitor", "log"]);
  const [initialCamera] = useState(() => ({ fov: 42, near: 0.05, far: 40, position: CAMERA[stage].pos }));

  useEffect(() => {
    const onVisibility = () => setVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);
  useEffect(() => () => onReady(false), [onReady]);

  // Full rate at the desk and the desktop; a slow demand loop while a window covers the screen.
  const frameloop = visible && stage !== "window" ? "always" : "demand";
  const invalidate = useRef<(() => void) | null>(null);
  useInvalidateWhen(frameloop === "demand", lowPower ? 4 : 8, invalidate);

  const atDesk = stage === "desk";
  const cycleSide = (index: 0 | 1) =>
    setSides((s) => {
      const next = [...s] as [SideMode, SideMode];
      next[index] = SIDE_MODES[(SIDE_MODES.indexOf(s[index]) + 1) % SIDE_MODES.length];
      return next;
    });

  return (
    <div className={`absolute inset-0 transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`} data-scene={ready ? "ready" : "loading"} data-screen={screen}>
      {/* A failed renderer construction throws out of the Canvas and is caught by <SceneBoundary/> in Backdrop. */}
      <Canvas
        dpr={lowPower ? 1 : [1, 1.5]}
        frameloop={frameloop}
        camera={initialCamera}
        gl={{ antialias: true, powerPreference: "high-performance", alpha: false, stencil: false }}
        onCreated={({ gl, invalidate: inv }) => {
          gl.setClearColor(VOID, 1);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.1;
          gl.domElement.addEventListener("webglcontextlost", (event) => {
            event.preventDefault();
            onContextLost();
          });
          invalidate.current = inv;
          setReady(true);
          onReady(true);
        }}
      >
        <color attach="background" args={[VOID]} />
        <fog attach="fog" args={[VOID, 4.5, 12]} />
        <hemisphereLight args={["#3a2a16", "#070608", 0.7]} />
        <pointLight position={[1.6, 2.4, 1.9]} color="#ffd9a8" distance={6} decay={2} intensity={1.1} />
        <CameraRig stage={stage} reducedMotion={reducedMotion} onSettled={onSettled} />
        <Room theme={theme} />
        <CenterMonitor screen={screen} stage={stage} onHint={onHint} onPowerOn={onPowerOn} onMonitor={onMonitor} />
        <SideMonitor side={-1} mode={sides[0]} interactive={atDesk} onCycle={() => cycleSide(0)} onHint={onHint} />
        <SideMonitor side={1} mode={sides[1]} interactive={atDesk} onCycle={() => cycleSide(1)} onHint={onHint} />
        <Keyboard theme={theme} interactive={atDesk} onClick={onKeyboard} onHint={onHint} />
        <Tower theme={theme} stage={stage} onPowerOn={onPowerOn} onPowerOff={onPowerOff} onCycleTheme={() => setTheme((t) => THEMES[(THEMES.indexOf(t) + 1) % THEMES.length])} onHint={onHint} />
        <Lamp on={lamp} interactive={atDesk} onToggle={() => setLamp((v) => !v)} onHint={onHint} />
        <Mug coffee={coffee} interactive={atDesk} onSip={() => setCoffee((c) => (c > 0 ? c - 1 : 4))} onHint={onHint} />
        <Plant interactive={atDesk} onHint={onHint} />
        <Speakers sound={sound} interactive={atDesk} onToggle={onSpeakers} onHint={onHint} />
        {!lowPower && <Dust count={120} />}
      </Canvas>
    </div>
  );
}

/** Ticks `invalidate()` at a low rate while the canvas is in demand mode. */
function useInvalidateWhen(active: boolean, fps: number, invalidate: React.RefObject<(() => void) | null>) {
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => invalidate.current?.(), 1000 / fps);
    return () => window.clearInterval(id);
  }, [active, fps, invalidate]);
}
