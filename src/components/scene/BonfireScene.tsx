"use client";

/**
 * The 3D camp. Lazy-loaded by <Backdrop/> only for Immersive mode on WebGL-capable devices.
 * Everything is procedural (no downloaded models or textures), so there are no asset licences
 * to track and the whole scene is a few kilobytes on top of three.js itself.
 */
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { Stage } from "@/components/experience/ExperienceProvider";

interface Props {
  stage: Stage;
  reducedMotion: boolean;
  lowPower: boolean;
  onContextLost: () => void;
}

const ABYSS = "#080a0d";
const STONE = "#1a212b";

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

/** Radial gradient texture built on a 2D canvas. Used for glow, flames, embers and mist. */
function useRadialTexture(stops: ReadonlyArray<readonly [number, string]>, size = 128) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    for (const [offset, color] of stops) gradient.addColorStop(offset, color);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
    // stops are static per call site
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

const CAMERA: Record<Stage, { pos: [number, number, number]; look: [number, number, number] }> = {
  entry: { pos: [0, 3.2, 15.5], look: [0, 2.7, 0] },
  hub: { pos: [0, 2.3, 8.4], look: [0, 1.15, 0] },
  panel: { pos: [1.4, 2.0, 6.6], look: [0, 1.0, 0] },
};

function CameraRig({ stage, reducedMotion }: { stage: Stage; reducedMotion: boolean }) {
  const { camera } = useThree();
  const look = useRef(new THREE.Vector3(0, 1.6, 0));
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

  useFrame((_, delta) => {
    const target = CAMERA[stage];
    const dt = Math.min(delta, 0.05);
    const px = reducedMotion ? 0 : pointer.current.x * 0.45;
    const py = reducedMotion ? 0 : pointer.current.y * 0.22;
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
      p.set(damp(p.x, tx, 1.6, dt), damp(p.y, ty, 1.6, dt), damp(p.z, tz, 1.1, dt));
      l.set(damp(l.x, target.look[0], 2, dt), damp(l.y, target.look[1], 2, dt), damp(l.z, target.look[2], 2, dt));
    }
    camera.lookAt(l);
  });
  return null;
}

function Fire() {
  const light = useRef<THREE.PointLight>(null);
  const core = useRef<THREE.Mesh>(null);
  const glow = useRef<THREE.Sprite>(null);
  const flames = useRef<THREE.Group>(null);

  const glowTex = useRadialTexture([
    [0, "rgba(255,225,170,1)"],
    [0.22, "rgba(229,108,53,0.6)"],
    [0.55, "rgba(229,108,53,0.14)"],
    [1, "rgba(0,0,0,0)"],
  ]);
  const flameTex = useRadialTexture([
    [0, "rgba(255,240,200,1)"],
    [0.3, "rgba(243,217,155,0.75)"],
    [0.7, "rgba(229,108,53,0.18)"],
    [1, "rgba(0,0,0,0)"],
  ]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const flicker = 0.84 + 0.16 * (Math.sin(t * 9.1) * 0.5 + Math.sin(t * 13.7 + 1.3) * 0.3 + Math.sin(t * 3.3) * 0.2);
    if (light.current) light.current.intensity = 30 * flicker;
    if (core.current) core.current.scale.setScalar(0.9 + 0.22 * flicker);
    if (glow.current) glow.current.scale.setScalar(3.3 + 0.7 * flicker);
    flames.current?.children.forEach((flame, i) => {
      const s = 0.5 + 0.5 * Math.sin(t * (4.5 + i * 1.3) + i * 2.1);
      flame.scale.set(0.55 + 0.15 * s, 1.0 + 0.55 * s, 1);
      flame.position.y = 0.72 + 0.28 * s;
    });
  });

  return (
    <group>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[0, 0.17, 0]} rotation={[0.3, (i * Math.PI * 2) / 5 + 0.4, 1.15]}>
          <cylinderGeometry args={[0.065, 0.09, 1.35, 7]} />
          <meshStandardMaterial color="#2a1b11" roughness={1} />
        </mesh>
      ))}
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 1.08, 0.12, Math.sin(a) * 1.08]} rotation={[a, a * 0.7, 0]}>
            <dodecahedronGeometry args={[0.16 + (i % 3) * 0.02, 0]} />
            <meshStandardMaterial color="#161b23" roughness={1} />
          </mesh>
        );
      })}
      <pointLight ref={light} position={[0, 1.0, 0]} color="#e56c35" distance={24} decay={2} intensity={30} />
      <mesh ref={core} position={[0, 0.42, 0]}>
        <icosahedronGeometry args={[0.13, 1]} />
        <meshBasicMaterial color="#ffd9a0" toneMapped={false} />
      </mesh>
      <group ref={flames}>
        {[0, 1, 2].map((i) => (
          <sprite key={i} position={[(i - 1) * 0.14, 0.8, (i - 1) * 0.05]}>
            <spriteMaterial map={flameTex} color={i === 1 ? "#f3d99b" : "#e56c35"} transparent opacity={0.8} depthWrite={false} blending={THREE.AdditiveBlending} />
          </sprite>
        ))}
      </group>
      <sprite ref={glow} position={[0, 0.9, 0]} scale={3.5}>
        <spriteMaterial map={glowTex} color="#e56c35" transparent opacity={0.55} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
    </group>
  );
}

function resetEmber(i: number, positions: Float32Array, seeds: Float32Array, initial: boolean, rand: () => number) {
  const i3 = i * 3;
  const i4 = i * 4;
  const radius = rand() * 0.4;
  const angle = rand() * Math.PI * 2;
  positions[i3] = Math.cos(angle) * radius;
  positions[i3 + 1] = initial ? rand() * 4.5 : 0.35 + rand() * 0.3;
  positions[i3 + 2] = Math.sin(angle) * radius;
  seeds[i4] = rand() * Math.PI * 2; // phase
  seeds[i4 + 1] = 0.45 + rand() * 0.9; // rise speed
  seeds[i4 + 2] = 0.15 + rand() * 0.3; // sway amplitude
  seeds[i4 + 3] = 2.6 + rand() * 2.6; // lifetime height
}

function Embers({ count }: { count: number }) {
  const points = useRef<THREE.Points>(null);
  const tex = useRadialTexture(
    [
      [0, "rgba(255,240,205,1)"],
      [0.4, "rgba(243,217,155,0.65)"],
      [1, "rgba(0,0,0,0)"],
    ],
    32,
  );
  const { positions, seeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count * 4);
    const rand = seeded(1337);
    for (let i = 0; i < count; i++) resetEmber(i, positions, seeds, true, rand);
    return { positions, seeds };
  }, [count]);

  useFrame(({ clock }, delta) => {
    const geometry = points.current?.geometry;
    const attr = geometry?.getAttribute("position") as THREE.BufferAttribute | undefined;
    if (!attr) return;
    const arr = attr.array as Float32Array;
    const dt = Math.min(delta, 0.05);
    const t = clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const i4 = i * 4;
      arr[i3 + 1] += seeds[i4 + 1] * dt;
      arr[i3] += Math.sin(t * 1.4 + seeds[i4]) * seeds[i4 + 2] * dt;
      arr[i3 + 2] += Math.cos(t * 1.1 + seeds[i4]) * seeds[i4 + 2] * dt;
      if (arr[i3 + 1] > seeds[i4 + 3]) resetEmber(i, arr, seeds, false, Math.random);
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial map={tex} size={0.085} sizeAttenuation transparent opacity={0.95} depthWrite={false} blending={THREE.AdditiveBlending} color="#f3d99b" />
    </points>
  );
}

/** [x, z, height, radius] of broken columns around the camp. */
const COLUMNS: ReadonlyArray<readonly [number, number, number, number]> = [
  [-6.5, -7, 4.2, 0.36],
  [-5.1, -8.6, 2.6, 0.3],
  [5.9, -6.4, 3.4, 0.33],
  [7.5, -8.2, 5.1, 0.4],
  [-9.2, -3.2, 2.1, 0.3],
  [9.6, -2.6, 2.9, 0.3],
  [0.9, -11.5, 3.7, 0.36],
  [-2.6, -12.5, 5.5, 0.42],
  [-11, -9, 6.0, 0.5],
  [11.5, -10, 4.4, 0.45],
];

function Ruins() {
  const stone = useMemo(() => new THREE.MeshStandardMaterial({ color: STONE, roughness: 0.95, metalness: 0.05 }), []);
  useEffect(() => () => stone.dispose(), [stone]);
  return (
    <group>
      {COLUMNS.map(([x, z, h, r], i) => (
        <mesh key={i} position={[x, h / 2, z]} rotation={[0, i * 0.8, 0]} material={stone}>
          <cylinderGeometry args={[r * 0.82, r, h, 7]} />
        </mesh>
      ))}
      {/* broken arch */}
      <mesh position={[3.3, 1.7, -9.6]} material={stone}>
        <boxGeometry args={[0.55, 3.4, 0.55]} />
      </mesh>
      <mesh position={[5.3, 2.0, -9.6]} material={stone}>
        <boxGeometry args={[0.55, 4.0, 0.55]} />
      </mesh>
      <mesh position={[4.3, 3.55, -9.6]} rotation={[0, 0, 0.09]} material={stone}>
        <boxGeometry args={[2.6, 0.42, 0.55]} />
      </mesh>
      {/* low walls */}
      <mesh position={[-4.2, 0.5, -5.2]} rotation={[0, 0.45, 0]} material={stone}>
        <boxGeometry args={[3.6, 1.0, 0.5]} />
      </mesh>
      <mesh position={[6.8, 0.35, -3.6]} rotation={[0, -0.6, 0]} material={stone}>
        <boxGeometry args={[2.4, 0.7, 0.5]} />
      </mesh>
    </group>
  );
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[48, 48]} />
      <meshStandardMaterial color="#0d1016" roughness={1} />
    </mesh>
  );
}

function Mist() {
  const group = useRef<THREE.Group>(null);
  const tex = useRadialTexture(
    [
      [0, "rgba(201,180,138,0.55)"],
      [0.5, "rgba(201,180,138,0.18)"],
      [1, "rgba(0,0,0,0)"],
    ],
    64,
  );
  useFrame((_, delta) => {
    group.current?.children.forEach((layer, i) => {
      layer.rotation.z += Math.min(delta, 0.05) * 0.02 * (i % 2 ? 1 : -1);
    });
  });
  return (
    <group ref={group}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, i * 2.1]} position={[(i - 1) * 3.5, 0.22 + i * 0.14, -2.5 - i * 1.5]}>
          <planeGeometry args={[20 + i * 5, 20 + i * 5]} />
          <meshBasicMaterial map={tex} transparent opacity={0.075} depthWrite={false} color="#c9b48a" />
        </mesh>
      ))}
    </group>
  );
}

function Stars() {
  const positions = useMemo(() => {
    const n = 260;
    const arr = new Float32Array(n * 3);
    const rand = seeded(2024);
    for (let i = 0; i < n; i++) {
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(0.25 + rand() * 0.7);
      const r = 70;
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.cos(phi);
      arr[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    return arr;
  }, []);
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.32} sizeAttenuation color="#9aa3b5" transparent opacity={0.5} depthWrite={false} fog={false} />
    </points>
  );
}

export default function BonfireScene({ stage, reducedMotion, lowPower, onContextLost }: Props) {
  const [visible, setVisible] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const onVisibility = () => setVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Render continuously at the camp; freeze the frame while a destination panel covers it.
  const frameloop = stage !== "panel" && visible ? "always" : "never";

  return (
    <div className={`absolute inset-0 transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`} data-scene={ready ? "ready" : "loading"}>
      {/* A failed renderer construction throws out of the Canvas and is caught by <SceneBoundary/> in Backdrop. */}
      <Canvas
        dpr={lowPower ? 1 : [1, 1.5]}
        frameloop={frameloop}
        camera={{ fov: 42, near: 0.1, far: 90, position: CAMERA.entry.pos }}
        gl={{ antialias: false, powerPreference: "high-performance", alpha: false, stencil: false }}
        onCreated={({ gl }) => {
          gl.setClearColor(ABYSS, 1);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.15;
          gl.domElement.addEventListener("webglcontextlost", (event) => {
            event.preventDefault();
            onContextLost();
          });
          setReady(true);
        }}
      >
        <color attach="background" args={[ABYSS]} />
        <fog attach="fog" args={[ABYSS, 7, 40]} />
        <hemisphereLight args={["#243047", "#05070a", 1.1]} />
        <directionalLight position={[-6, 9, -4]} color="#3b4a66" intensity={0.35} />
        <CameraRig stage={stage} reducedMotion={reducedMotion} />
        <Ground />
        <Ruins />
        <Fire />
        <Embers count={lowPower ? 60 : 170} />
        {!lowPower && <Mist />}
        <Stars />
      </Canvas>
    </div>
  );
}
