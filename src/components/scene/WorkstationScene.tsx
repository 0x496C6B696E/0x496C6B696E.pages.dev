"use client";

/**
 * The 3D room: a modern desk with an ultrawide monitor, a low-profile keyboard with RGB
 * underglow, a glass-sided tower with lit fans, speakers, a headphone stand, a plant, bias
 * lighting on the wall and dust in the air. Lazy-loaded by <Backdrop/> only for Immersive mode
 * on WebGL-capable devices. Everything is procedural (no downloaded models or textures).
 *
 * Powering on dollies the camera from a three-quarter view of the desk until the screen fills
 * the viewport; the HTML desktop then sits on that screen. The tower's power button is a real
 * click target that powers the machine on too.
 */
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { Stage } from "@/components/experience/ExperienceProvider";

interface Props {
  stage: Stage;
  reducedMotion: boolean;
  lowPower: boolean;
  onContextLost: () => void;
  onPowerOn: () => void;
}

const VOID = "#0a0d12";
const CYAN = "#5ee1ff";
const VIOLET = "#b388ff";

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

/** Ultrawide panel geometry shared by the monitor and the camera rig. */
const SCREEN = { x: 0, y: 1.21, z: 0.27, w: 0.96, h: 0.41 };

const CAMERA: Record<Stage, { pos: [number, number, number]; look: [number, number, number] }> = {
  lock: { pos: [2.05, 1.5, 2.55], look: [-0.15, 0.98, 0.05] },
  desktop: { pos: [SCREEN.x, SCREEN.y, SCREEN.z + 0.5], look: [SCREEN.x, SCREEN.y, SCREEN.z] },
  window: { pos: [SCREEN.x, SCREEN.y, SCREEN.z + 0.46], look: [SCREEN.x, SCREEN.y, SCREEN.z] },
};

/** Hue-cycling colour for the RGB parts; one call per frame per part is cheap. */
function rgbColor(target: THREE.Color, time: number, offset: number, saturation = 0.75, lightness = 0.6) {
  target.setHSL(((time * 0.05 + offset) % 1 + 1) % 1, saturation, lightness);
}

function CameraRig({ stage, reducedMotion }: { stage: Stage; reducedMotion: boolean }) {
  const { camera } = useThree();
  const look = useRef(new THREE.Vector3(...CAMERA.lock.look));
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
    // Hand-held sway at the lock view only; at the screen the camera must hold still.
    const sway = stage === "lock" && !reducedMotion ? 1 : 0;
    const parallax = stage === "lock" ? 0.14 : 0.01;
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
      p.set(damp(p.x, tx, 1.8, dt), damp(p.y, ty, 1.8, dt), damp(p.z, tz, 1.4, dt));
      l.set(damp(l.x, target.look[0], 2.2, dt), damp(l.y, target.look[1], 2.2, dt), damp(l.z, target.look[2], 2.2, dt));
    }
    camera.lookAt(l);
  });
  return null;
}

type ScreenMode = "lock" | "desktop";

/** Canvas-drawn panel: a lock-screen wallpaper while locked, a dim wallpaper once the HTML desktop is on top. */
class ScreenPainter {
  readonly texture: THREE.CanvasTexture;
  private mode: ScreenMode = "lock";
  private readonly canvas = document.createElement("canvas");
  private readonly ctx: CanvasRenderingContext2D;
  private last = -1;

  constructor() {
    this.canvas.width = 1024;
    this.canvas.height = 438;
    this.ctx = this.canvas.getContext("2d")!;
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
  }

  tick(time: number, mode: ScreenMode) {
    if (mode !== this.mode) {
      this.mode = mode;
      this.last = -1;
    }
    if (time - this.last < 0.1) return;
    this.last = time;
    const { ctx, canvas } = this;
    const dim = this.mode === "desktop";

    ctx.fillStyle = dim ? "#070a0f" : "#0a0d12";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // two slow colour blobs
    const a = ctx.createRadialGradient(260 + Math.sin(time * 0.15) * 40, 150, 10, 260, 150, 420);
    a.addColorStop(0, dim ? "rgba(94,225,255,0.18)" : "rgba(94,225,255,0.6)");
    a.addColorStop(1, "rgba(94,225,255,0)");
    ctx.fillStyle = a;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const b = ctx.createRadialGradient(780 + Math.cos(time * 0.12) * 40, 330, 10, 780, 330, 460);
    b.addColorStop(0, dim ? "rgba(179,136,255,0.16)" : "rgba(179,136,255,0.55)");
    b.addColorStop(1, "rgba(179,136,255,0)");
    ctx.fillStyle = b;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!dim) {
      // a soft breathing dot, like a sleeping machine; the HTML lock screen carries the words
      const pulse = 0.5 + 0.5 * Math.sin(time * 1.6);
      ctx.fillStyle = `rgba(94,225,255,${0.35 + pulse * 0.5})`;
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2 + 60, 6 + pulse * 2, 0, Math.PI * 2);
      ctx.fill();
    }
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
  const texture = useScreenTexture(stage === "lock" ? "lock" : "desktop");
  const glow = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    if (glow.current) glow.current.intensity = (stage === "lock" ? 0.9 : 0.5) + Math.sin(clock.elapsedTime * 1.3) * 0.05;
  });
  const dark = useMemo(() => new THREE.MeshStandardMaterial({ color: "#0c0f14", roughness: 0.5, metalness: 0.4 }), []);
  useEffect(() => () => dark.dispose(), [dark]);
  return (
    <group>
      {/* thin bezel just behind the glass */}
      <mesh position={[SCREEN.x, SCREEN.y, SCREEN.z - 0.012]} material={dark}>
        <boxGeometry args={[SCREEN.w + 0.03, SCREEN.h + 0.04, 0.016]} />
      </mesh>
      {/* back housing */}
      <mesh position={[SCREEN.x, SCREEN.y, SCREEN.z - 0.055]}>
        <boxGeometry args={[SCREEN.w - 0.1, SCREEN.h - 0.06, 0.07]} />
        <meshStandardMaterial color="#171b22" roughness={0.6} metalness={0.3} />
      </mesh>
      {/* glass */}
      <mesh position={[SCREEN.x, SCREEN.y, SCREEN.z]}>
        <planeGeometry args={[SCREEN.w, SCREEN.h]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      {/* stand: post and flat base */}
      <mesh position={[0, 0.92, 0.2]} material={dark}>
        <boxGeometry args={[0.05, 0.3, 0.03]} />
      </mesh>
      <mesh position={[0, 0.775, 0.22]} material={dark}>
        <cylinderGeometry args={[0.24, 0.26, 0.012, 32]} />
      </mesh>
      <pointLight ref={glow} position={[SCREEN.x, SCREEN.y, SCREEN.z + 0.45]} color="#9fd8ff" distance={2.6} decay={2} intensity={0.9} />
    </group>
  );
}

/** Low-profile 75% keyboard with instanced keycaps and an RGB underglow strip. */
function Keyboard() {
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
    if (glowMat.current) rgbColor(glowMat.current.color, clock.elapsedTime, 0.1, 0.9, 0.55);
  });
  return (
    <group>
      <mesh position={[0, 0.784, 0.645]}>
        <boxGeometry args={[0.39, 0.02, 0.145]} />
        <meshStandardMaterial color="#13161c" roughness={0.6} metalness={0.3} />
      </mesh>
      <instancedMesh ref={keys} args={[undefined, undefined, count]}>
        <boxGeometry args={[0.02, 0.008, 0.02]} />
        <meshStandardMaterial color="#262b33" roughness={0.7} />
      </instancedMesh>
      {/* underglow */}
      <mesh position={[0, 0.7745, 0.645]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.42, 0.17]} />
        <meshBasicMaterial ref={glowMat} color={CYAN} transparent opacity={0.55} toneMapped={false} />
      </mesh>
      {/* mouse */}
      <mesh position={[0.36, 0.79, 0.65]} rotation={[0, -0.25, 0]}>
        <boxGeometry args={[0.062, 0.034, 0.11]} />
        <meshStandardMaterial color="#13161c" roughness={0.55} metalness={0.3} />
      </mesh>
      {/* desk mat */}
      <mesh position={[0.08, 0.767, 0.64]}>
        <boxGeometry args={[1.1, 0.005, 0.5]} />
        <meshStandardMaterial color="#0f1217" roughness={1} />
      </mesh>
    </group>
  );
}

/** Glass-sided tower with three lit fans and a clickable power button. */
function Tower({ onPowerOn, interactive }: { onPowerOn: () => void; interactive: boolean }) {
  const fans = useRef<Array<THREE.MeshBasicMaterial | null>>([]);
  const inner = useRef<THREE.PointLight>(null);
  const button = useRef<THREE.MeshBasicMaterial>(null);
  const [hover, setHover] = useState(false);
  const x = -1.72;
  const metal = useMemo(() => new THREE.MeshStandardMaterial({ color: "#0e1116", roughness: 0.45, metalness: 0.5 }), []);
  const glass = useMemo(() => new THREE.MeshStandardMaterial({ color: "#8fd3ff", roughness: 0.1, metalness: 0.1, transparent: true, opacity: 0.16 }), []);
  useEffect(
    () => () => {
      metal.dispose();
      glass.dispose();
    },
    [metal, glass],
  );
  useEffect(() => {
    document.body.style.cursor = hover && interactive ? "pointer" : "";
    return () => {
      document.body.style.cursor = "";
    };
  }, [hover, interactive]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    fans.current.forEach((m, i) => {
      if (m) rgbColor(m.color, t, 0.33 * i, 0.9, 0.58);
    });
    if (inner.current) {
      rgbColor(inner.current.color, t, 0.2, 0.9, 0.55);
      inner.current.intensity = 0.55;
    }
    if (button.current) {
      const pulse = 0.5 + 0.5 * Math.sin(t * 1.8);
      button.current.color.set(hover && interactive ? "#ffffff" : CYAN).multiplyScalar(0.55 + pulse * 0.45);
    }
  });
  const stop = (e: ThreeEvent<PointerEvent>) => e.stopPropagation();
  return (
    <group position={[x, 0, 0.3]}>
      <mesh position={[0, 0.26, 0]} material={metal}>
        <boxGeometry args={[0.44, 0.52, 0.5]} />
      </mesh>
      {/* glass side panel facing the camera */}
      <mesh position={[0.222, 0.27, 0]} rotation={[0, Math.PI / 2, 0]} material={glass}>
        <planeGeometry args={[0.46, 0.46]} />
      </mesh>
      {/* three fans behind the glass */}
      {[0.1, 0.26, 0.42].map((y, i) => (
        <mesh key={y} position={[0.2, y, -0.12]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.055, 0.007, 12, 36]} />
          <meshBasicMaterial
            ref={(el) => {
              fans.current[i] = el;
            }}
            color={CYAN}
            toneMapped={false}
          />
        </mesh>
      ))}
      <pointLight ref={inner} position={[0.12, 0.3, -0.05]} color={CYAN} distance={1.4} decay={2} intensity={0.55} />
      {/* power button on the top front edge */}
      <mesh
        position={[0.1, 0.526, 0.2]}
        rotation={[0, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          if (interactive) onPowerOn();
        }}
        onPointerOver={(e) => {
          stop(e);
          setHover(true);
        }}
        onPointerOut={() => setHover(false)}
      >
        <cylinderGeometry args={[0.018, 0.018, 0.012, 20]} />
        <meshBasicMaterial ref={button} color={CYAN} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Room() {
  const metal = useMemo(() => new THREE.MeshStandardMaterial({ color: "#0e1116", roughness: 0.5, metalness: 0.5 }), []);
  const wood = useMemo(() => new THREE.MeshStandardMaterial({ color: "#2a2320", roughness: 0.55, metalness: 0.05 }), []);
  const plastic = useMemo(() => new THREE.MeshStandardMaterial({ color: "#13161c", roughness: 0.6, metalness: 0.2 }), []);
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
    if (strip.current) rgbColor(strip.current.color, clock.elapsedTime, 0.6, 0.85, 0.6);
    if (stripLight.current) rgbColor(stripLight.current.color, clock.elapsedTime, 0.6, 0.85, 0.6);
  });
  return (
    <group>
      {/* floor and back wall */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#0b0e13" roughness={0.9} metalness={0.05} />
      </mesh>
      <mesh position={[0, 1.8, -0.7]}>
        <boxGeometry args={[14, 3.8, 0.1]} />
        <meshStandardMaterial color="#0f1319" roughness={1} />
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
      {/* bias-light strip behind the monitor and the light it throws on the wall */}
      <mesh position={[0, 1.02, -0.05]}>
        <boxGeometry args={[1.1, 0.014, 0.014]} />
        <meshBasicMaterial ref={strip} color={CYAN} toneMapped={false} />
      </mesh>
      <pointLight ref={stripLight} position={[0, 1.15, -0.3]} color={CYAN} distance={3.4} decay={2} intensity={2.2} />
      <pointLight position={[-0.9, 1.6, -0.4]} color={VIOLET} distance={2.6} decay={2} intensity={0.8} />
      {/* speakers */}
      {[-0.72, 0.72].map((sx) => (
        <group key={sx} position={[sx, 0.845, 0.3]}>
          <mesh material={plastic}>
            <boxGeometry args={[0.09, 0.16, 0.09]} />
          </mesh>
          <mesh position={[0, -0.06, 0.046]}>
            <boxGeometry args={[0.01, 0.01, 0.003]} />
            <meshBasicMaterial color={CYAN} toneMapped={false} />
          </mesh>
        </group>
      ))}
      {/* headphone stand to the right */}
      <group position={[1.05, 0.765, 0.45]}>
        <mesh position={[0, 0.005, 0]} material={metal}>
          <cylinderGeometry args={[0.06, 0.06, 0.01, 24]} />
        </mesh>
        <mesh position={[0, 0.12, 0]} material={metal}>
          <cylinderGeometry args={[0.008, 0.008, 0.24, 12]} />
        </mesh>
        <mesh position={[0, 0.25, 0]} rotation={[0, 0, 0]} material={plastic}>
          <torusGeometry args={[0.075, 0.012, 12, 32, Math.PI]} />
        </mesh>
        {[-0.075, 0.075].map((hx) => (
          <mesh key={hx} position={[hx, 0.2, 0]} material={plastic}>
            <boxGeometry args={[0.03, 0.08, 0.07]} />
          </mesh>
        ))}
      </group>
      {/* plant to the left */}
      <group position={[-1.15, 0.765, 0.15]}>
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.065, 0.05, 0.12, 20]} />
          <meshStandardMaterial color="#2b2a30" roughness={0.9} />
        </mesh>
        {[
          [0, 0.2, 0, 0.09],
          [-0.06, 0.17, 0.03, 0.07],
          [0.06, 0.18, -0.03, 0.075],
        ].map(([px, py, pz, r], i) => (
          <mesh key={i} position={[px, py, pz]} scale={[1, 0.75, 1]}>
            <sphereGeometry args={[r, 14, 10]} />
            <meshStandardMaterial color="#2f7a4a" roughness={0.9} />
          </mesh>
        ))}
      </group>
      {/* mug */}
      <mesh position={[0.62, 0.815, 0.55]}>
        <cylinderGeometry args={[0.045, 0.04, 0.095, 20]} />
        <meshStandardMaterial color="#e8e4dc" roughness={0.5} />
      </mesh>
      {/* a shelf of books on the wall for depth */}
      <mesh position={[1.6, 1.75, -0.6]} material={wood}>
        <boxGeometry args={[0.9, 0.03, 0.22]} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[1.25 + i * 0.12, 1.86, -0.62]}>
          <boxGeometry args={[0.07, 0.2 + (i % 3) * 0.03, 0.16]} />
          <meshStandardMaterial color={["#1f3a5f", "#3b2d5a", "#2a2f36", "#1b4a4e", "#4a2f2f"][i]} roughness={0.9} />
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
    g.addColorStop(0, "rgba(220,240,255,1)");
    g.addColorStop(0.5, "rgba(220,240,255,0.35)");
    g.addColorStop(1, "rgba(220,240,255,0)");
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
    const dt = Math.min(delta, 0.05);
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
      <pointsMaterial map={tex} size={0.02} sizeAttenuation transparent opacity={0.45} depthWrite={false} color="#dff2ff" />
    </points>
  );
}

export default function WorkstationScene({ stage, reducedMotion, lowPower, onContextLost, onPowerOn }: Props) {
  const [visible, setVisible] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const onVisibility = () => setVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Full rate at the desk and the desktop; a slow demand loop while a window covers the screen.
  const frameloop = visible && stage !== "window" ? "always" : "demand";
  const invalidate = useRef<(() => void) | null>(null);
  useInvalidateWhen(frameloop === "demand", lowPower ? 4 : 8, invalidate);

  return (
    <div className={`absolute inset-0 transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`} data-scene={ready ? "ready" : "loading"}>
      {/* A failed renderer construction throws out of the Canvas and is caught by <SceneBoundary/> in Backdrop. */}
      <Canvas
        dpr={lowPower ? 1 : [1, 1.5]}
        frameloop={frameloop}
        camera={{ fov: 42, near: 0.05, far: 40, position: CAMERA.lock.pos }}
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
        }}
      >
        <color attach="background" args={[VOID]} />
        <fog attach="fog" args={[VOID, 4.5, 12]} />
        <hemisphereLight args={["#1a2535", "#05070a", 0.7]} />
        <pointLight position={[1.6, 2.4, 1.9]} color="#9fb3c8" distance={6} decay={2} intensity={1.2} />
        <CameraRig stage={stage} reducedMotion={reducedMotion} />
        <Room />
        <Monitor stage={stage} />
        <Keyboard />
        <Tower onPowerOn={onPowerOn} interactive={stage === "lock"} />
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
