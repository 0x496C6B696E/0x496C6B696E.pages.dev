"use client";

/**
 * The 3D room: a desk, a CRT terminal, a tower, server racks, a lamp and dust in the air.
 * Lazy-loaded by <Backdrop/> only for Immersive mode on WebGL-capable devices. Everything
 * is procedural (no downloaded models or textures). Entering the machine dollies the camera
 * from a three-quarter view of the desk until the screen fills the viewport; the HTML
 * desktop then sits "on" that screen.
 */
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { Stage } from "@/components/experience/ExperienceProvider";
import { destinations, site } from "@/config/site";
import { quests } from "@/data/projects";

interface Props {
  stage: Stage;
  reducedMotion: boolean;
  lowPower: boolean;
  onContextLost: () => void;
}

const VOID = "#0a0c0f";
const AMBER = "#ffb454";

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

/** Screen geometry shared by the monitor and the camera rig. The glass sits just proud of the bezel. */
const SCREEN = { x: 0, y: 1.19, z: 0.32, w: 0.72, h: 0.54 };

const CAMERA: Record<Stage, { pos: [number, number, number]; look: [number, number, number] }> = {
  entry: { pos: [2.4, 1.75, 3.1], look: [0.15, 1.0, -0.1] },
  hub: { pos: [SCREEN.x, SCREEN.y, SCREEN.z + 0.66], look: [SCREEN.x, SCREEN.y, SCREEN.z] },
  panel: { pos: [SCREEN.x, SCREEN.y, SCREEN.z + 0.6], look: [SCREEN.x, SCREEN.y, SCREEN.z] },
};

function CameraRig({ stage, reducedMotion }: { stage: Stage; reducedMotion: boolean }) {
  const { camera } = useThree();
  const look = useRef(new THREE.Vector3(...CAMERA.entry.look));
  const pointer = useRef({ x: 0, y: 0 });

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
    const dt = Math.min(delta, 0.05);
    const target = CAMERA[stage];
    const t = clock.elapsedTime;
    // Hand-held sway at the entry view only; at the screen the camera must hold still.
    const sway = stage === "entry" && !reducedMotion ? 1 : 0;
    const parallax = stage === "entry" ? 0.12 : 0.012;
    const px = (reducedMotion ? 0 : pointer.current.x * parallax) + Math.sin(t * 0.21) * 0.06 * sway;
    const py = (reducedMotion ? 0 : pointer.current.y * parallax * 0.6) + Math.sin(t * 0.17 + 1) * 0.03 * sway;
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
      p.set(damp(p.x, tx, 1.8, dt), damp(p.y, ty, 1.8, dt), damp(p.z, tz, 1.4, dt));
      l.set(damp(l.x, target.look[0], 2.2, dt), damp(l.y, target.look[1], 2.2, dt), damp(l.z, target.look[2], 2.2, dt));
    }
    camera.lookAt(l);
  });
  return null;
}

/** Lines "printed" on the monitor: real file names and repositories, not lorem. */
function screenLines(): string[] {
  return [
    `${site.name} ${site.system} v${site.version}`,
    `login: ${site.developer.handle.toLowerCase()}`,
    "",
    "$ ls ~",
    ...destinations.map((d) => `  ${d.file.padEnd(12)} ${d.title}`),
    "",
    "$ ls ~/projects",
    ...quests.map((q) => `  ${q.repo}`),
    "",
    "$ uptime",
    "  services still running.",
    "",
    "$ _",
  ];
}

/** Canvas-drawn CRT screen: amber monospace text, scanlines, blinking cursor, typed line by line. */
type ScreenMode = "log" | "desktop";

class ScreenPainter {
  readonly texture: THREE.CanvasTexture;
  private mode: ScreenMode = "log";
  private readonly canvas = document.createElement("canvas");
  private readonly ctx: CanvasRenderingContext2D;
  private readonly lines = screenLines();
  private last = -1;

  constructor() {
    this.canvas.width = 512;
    this.canvas.height = 384;
    this.ctx = this.canvas.getContext("2d")!;
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
  }

  /**
   * Redraws at most ~8 times a second. In "log" mode (standby) the shell output is typed in
   * line by line; in "desktop" mode (HTML desktop or a window on top) the glass shows only a
   * dim phosphor field so the real UI stays readable.
   */
  tick(time: number, mode: ScreenMode) {
    if (mode !== this.mode) {
      this.mode = mode;
      this.last = -1;
    }
    if (time - this.last < 0.12) return;
    this.last = time;
    const { ctx, canvas } = this;

    ctx.fillStyle = this.mode === "log" ? "#17120a" : "#100d08";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (this.mode === "log") {
      const revealed = Math.min(this.lines.length, Math.floor(time * 4));
      const shown = this.lines.slice(0, revealed);
      if (revealed < this.lines.length) shown.push("$ _");
      ctx.font = "600 17px ui-monospace, Menlo, Consolas, monospace";
      ctx.textBaseline = "top";
      const lineHeight = 22;
      const visible = Math.floor((canvas.height - 32) / lineHeight);
      const start = Math.max(0, shown.length - visible);
      for (let i = 0; i < visible; i++) {
        const line = shown[start + i];
        if (line === undefined) break;
        ctx.fillStyle = line.startsWith("$") ? "#ffd79a" : "#ffb454";
        const text = line === "$ _" ? (Math.floor(time * 2) % 2 ? "$ █" : "$  ") : line;
        ctx.fillText(text, 20, 16 + i * lineHeight);
      }
    } else {
      // faint grid, like a desktop wallpaper drawn in phosphor
      ctx.strokeStyle = "rgba(255,180,84,0.07)";
      ctx.lineWidth = 1;
      for (let x = 0; x <= canvas.width; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y <= canvas.height; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(canvas.width, y + 0.5);
        ctx.stroke();
      }
    }
    // phosphor glow falloff at the edges and scanlines
    const vignette = ctx.createRadialGradient(256, 192, 120, 256, 192, 330);
    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(1, "rgba(0,0,0,0.55)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    for (let y = 0; y < canvas.height; y += 3) ctx.fillRect(0, y, canvas.width, 1);
    this.texture.needsUpdate = true;
  }

  dispose() {
    this.texture.dispose();
  }
}

function useScreenTexture(mode: ScreenMode) {
  const painter = useMemo(() => new ScreenPainter(), []);
  useEffect(() => () => painter.dispose(), [painter]);
  useFrame(({ clock }) => painter.tick(clock.elapsedTime, mode));
  return painter.texture;
}

function Monitor({ stage }: { stage: Stage }) {
  const texture = useScreenTexture(stage === "entry" ? "log" : "desktop");
  const glow = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    if (glow.current) glow.current.intensity = 0.7 + Math.sin(clock.elapsedTime * 7.3) * 0.05 + Math.sin(clock.elapsedTime * 1.7) * 0.04;
  });
  return (
    <group>
      {/* body, deep at the back like a real CRT; its front face sits behind the bezel */}
      <mesh position={[SCREEN.x, SCREEN.y - 0.02, SCREEN.z - 0.47]}>
        <boxGeometry args={[0.98, 0.78, 0.84]} />
        <meshStandardMaterial color="#9f9888" roughness={0.85} />
      </mesh>
      {/* bezel: front face at SCREEN.z - 0.01, so the glass is the frontmost surface */}
      <mesh position={[SCREEN.x, SCREEN.y, SCREEN.z - 0.025]}>
        <boxGeometry args={[0.9, 0.7, 0.03]} />
        <meshStandardMaterial color="#8d8778" roughness={0.9} />
      </mesh>
      {/* glass */}
      <mesh position={[SCREEN.x, SCREEN.y, SCREEN.z]}>
        <planeGeometry args={[SCREEN.w, SCREEN.h]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      {/* stand */}
      <mesh position={[0, 0.8, -0.1]}>
        <cylinderGeometry args={[0.18, 0.22, 0.08, 16]} />
        <meshStandardMaterial color="#8a8373" roughness={0.9} />
      </mesh>
      <pointLight ref={glow} position={[SCREEN.x, SCREEN.y, SCREEN.z + 0.45]} color={AMBER} distance={2.6} decay={2} intensity={0.7} />
    </group>
  );
}

function Keyboard() {
  const keys = useRef<THREE.InstancedMesh>(null);
  const count = 60;
  useEffect(() => {
    const mesh = keys.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    let i = 0;
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 15; col++) {
        m.setPosition(-0.31 + col * 0.044, 0.805, 0.74 + row * 0.044 - (row === 3 && col > 3 && col < 11 ? 0.004 : 0));
        mesh.setMatrixAt(i++, m);
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, []);
  return (
    <group>
      <mesh position={[0, 0.79, 0.8]}>
        <boxGeometry args={[0.72, 0.03, 0.24]} />
        <meshStandardMaterial color="#b6ae9e" roughness={0.9} />
      </mesh>
      <instancedMesh ref={keys} args={[undefined, undefined, count]}>
        <boxGeometry args={[0.036, 0.012, 0.036]} />
        <meshStandardMaterial color="#d8d0bf" roughness={0.8} />
      </instancedMesh>
      {/* mouse */}
      <mesh position={[0.52, 0.795, 0.78]} rotation={[0, -0.3, 0]}>
        <boxGeometry args={[0.07, 0.035, 0.11]} />
        <meshStandardMaterial color="#cfc7b6" roughness={0.8} />
      </mesh>
    </group>
  );
}

/** Blinking LEDs: a small set of emissive squares whose colour is driven per frame. */
function Leds({ positions, seed, color }: { positions: ReadonlyArray<readonly [number, number, number]>; seed: number; color: string }) {
  const refs = useRef<Array<THREE.MeshBasicMaterial | null>>([]);
  const phases = useMemo(() => {
    const rand = seeded(seed);
    return positions.map(() => ({ phase: rand() * 10, rate: 0.4 + rand() * 2.2 }));
  }, [positions, seed]);
  const on = useMemo(() => new THREE.Color(color), [color]);
  const off = useMemo(() => new THREE.Color(color).multiplyScalar(0.12), [color]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    phases.forEach(({ phase, rate }, i) => {
      const m = refs.current[i];
      if (!m) return;
      const lit = Math.sin(t * rate + phase) > 0.2 || Math.sin(t * 13 + phase * 3) > 0.92;
      m.color.copy(lit ? on : off);
    });
  });
  return (
    <group>
      {positions.map((p, i) => (
        <mesh key={i} position={[p[0], p[1], p[2]]}>
          <boxGeometry args={[0.012, 0.012, 0.004]} />
          <meshBasicMaterial
            ref={(el) => {
              refs.current[i] = el;
            }}
            color={color}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

const TOWER_LEDS: ReadonlyArray<readonly [number, number, number]> = [
  [1.02, 1.05, 0.12],
  [1.02, 1.0, 0.12],
];

function rackLeds(x: number, z: number, seed: number): Array<[number, number, number]> {
  const rand = seeded(seed);
  const out: Array<[number, number, number]> = [];
  for (let u = 0; u < 14; u++) {
    const y = 0.25 + u * 0.13;
    const n = 2 + Math.floor(rand() * 4);
    for (let k = 0; k < n; k++) out.push([x - 0.22 + k * 0.03 + rand() * 0.01, y, z + 0.251]);
  }
  return out;
}

function Room() {
  const rackA = useMemo(() => rackLeds(-2.3, -1.6, 11), []);
  const rackB = useMemo(() => rackLeds(-1.7, -1.6, 12), []);
  const dark = useMemo(() => new THREE.MeshStandardMaterial({ color: "#14181d", roughness: 0.95 }), []);
  const metal = useMemo(() => new THREE.MeshStandardMaterial({ color: "#1b2129", roughness: 0.7, metalness: 0.3 }), []);
  useEffect(
    () => () => {
      dark.dispose();
      metal.dispose();
    },
    [dark, metal],
  );
  return (
    <group>
      {/* floor and back wall */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#0d1013" roughness={1} />
      </mesh>
      <mesh position={[0, 1.8, -2.1]}>
        <boxGeometry args={[14, 3.8, 0.1]} />
        <meshStandardMaterial color="#0f1216" roughness={1} />
      </mesh>
      {/* desk */}
      <mesh position={[0, 0.74, 0.3]} material={dark}>
        <boxGeometry args={[3.2, 0.06, 1.5]} />
      </mesh>
      {[-1.5, 1.5].map((x) =>
        [-0.35, 0.95].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, 0.36, z]} material={metal}>
            <boxGeometry args={[0.06, 0.72, 0.06]} />
          </mesh>
        )),
      )}
      {/* tower on the desk, to the right */}
      <mesh position={[1.12, 0.98, 0.0]} material={metal}>
        <boxGeometry args={[0.22, 0.42, 0.5]} />
      </mesh>
      <Leds positions={TOWER_LEDS} seed={3} color="#59d4ff" />
      {/* mug and papers */}
      <mesh position={[-0.78, 0.82, 0.62]}>
        <cylinderGeometry args={[0.05, 0.045, 0.1, 14]} />
        <meshStandardMaterial color="#d8c8a8" roughness={0.6} />
      </mesh>
      <mesh position={[-1.0, 0.775, 0.3]} rotation={[0, 0.2, 0]}>
        <boxGeometry args={[0.3, 0.012, 0.42]} />
        <meshStandardMaterial color="#cfc9bb" roughness={1} />
      </mesh>
      {/* desk lamp */}
      <mesh position={[-1.25, 0.78, -0.25]} material={metal}>
        <cylinderGeometry args={[0.07, 0.09, 0.04, 16]} />
      </mesh>
      <mesh position={[-1.18, 1.1, -0.25]} rotation={[0, 0, -0.35]} material={metal}>
        <cylinderGeometry args={[0.012, 0.012, 0.68, 8]} />
      </mesh>
      <mesh position={[-0.98, 1.36, -0.25]} rotation={[0, 0, 0.9]} material={metal}>
        <coneGeometry args={[0.12, 0.16, 16, 1, true]} />
      </mesh>
      <pointLight position={[-0.95, 1.3, -0.2]} color="#ffd79a" distance={2.6} decay={2} intensity={1.6} />
      {/* server racks against the back wall */}
      {[-2.3, -1.7].map((x) => (
        <mesh key={x} position={[x, 1.1, -1.6]} material={metal}>
          <boxGeometry args={[0.55, 2.2, 0.5]} />
        </mesh>
      ))}
      <Leds positions={rackA} seed={21} color={AMBER} />
      <Leds positions={rackB} seed={22} color="#59d4ff" />
      {/* a second desk silhouette far left for depth */}
      <mesh position={[2.9, 0.74, -1.2]} material={dark}>
        <boxGeometry args={[1.6, 0.06, 0.8]} />
      </mesh>
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
    g.addColorStop(0, "rgba(255,230,191,1)");
    g.addColorStop(0.5, "rgba(255,230,191,0.35)");
    g.addColorStop(1, "rgba(255,230,191,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

/** Dust drifting in the lamp light, kept to the left half of the desk so nothing floats between the camera and the screen. */
function Dust({ count }: { count: number }) {
  const points = useRef<THREE.Points>(null);
  const tex = useDustTexture();
  const { positions, seeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count * 2);
    const rand = seeded(5);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = -2.3 + rand() * 1.7;
      positions[i * 3 + 1] = 0.6 + rand() * 1.6;
      positions[i * 3 + 2] = -1.3 + rand() * 1.5;
      seeds[i * 2] = rand() * Math.PI * 2;
      seeds[i * 2 + 1] = 0.02 + rand() * 0.05;
    }
    return { positions, seeds };
  }, [count]);
  useFrame(({ clock }, delta) => {
    const attr = points.current?.geometry.getAttribute("position") as THREE.BufferAttribute | undefined;
    if (!attr) return;
    const arr = attr.array as Float32Array;
    const dt = Math.min(delta, 0.05);
    const t = clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      arr[i3] += Math.sin(t * 0.3 + seeds[i * 2]) * 0.03 * dt;
      arr[i3 + 1] -= seeds[i * 2 + 1] * dt;
      if (arr[i3 + 1] < 0.6) arr[i3 + 1] = 2.2;
    }
    attr.needsUpdate = true;
  });
  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial map={tex} size={0.02} sizeAttenuation transparent opacity={0.55} depthWrite={false} color="#ffe6bf" />
    </points>
  );
}

export default function WorkstationScene({ stage, reducedMotion, lowPower, onContextLost }: Props) {
  const [visible, setVisible] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const onVisibility = () => setVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Full rate at the desk and the desktop; a slow demand loop while a window covers the screen.
  const frameloop = visible && stage !== "panel" ? "always" : "demand";
  const invalidate = useRef<(() => void) | null>(null);
  useInvalidateWhen(frameloop === "demand", lowPower ? 4 : 8, invalidate);

  return (
    <div className={`absolute inset-0 transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`} data-scene={ready ? "ready" : "loading"}>
      {/* A failed renderer construction throws out of the Canvas and is caught by <SceneBoundary/> in Backdrop. */}
      <Canvas
        dpr={lowPower ? 1 : [1, 1.5]}
        frameloop={frameloop}
        camera={{ fov: 42, near: 0.05, far: 40, position: CAMERA.entry.pos }}
        gl={{ antialias: true, powerPreference: "high-performance", alpha: false, stencil: false }}
        onCreated={({ gl, invalidate: inv }) => {
          gl.setClearColor(VOID, 1);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
          gl.domElement.addEventListener("webglcontextlost", (event) => {
            event.preventDefault();
            onContextLost();
          });
          invalidate.current = inv;
          setReady(true);
        }}
      >
        <color attach="background" args={[VOID]} />
        <fog attach="fog" args={[VOID, 4, 12]} />
        <hemisphereLight args={["#1d2633", "#05070a", 0.9]} />
        <CameraRig stage={stage} reducedMotion={reducedMotion} />
        <Room />
        <Monitor stage={stage} />
        <Keyboard />
        {!lowPower && <Dust count={140} />}
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
