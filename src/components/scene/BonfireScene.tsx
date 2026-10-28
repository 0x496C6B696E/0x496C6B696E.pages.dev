"use client";

/**
 * The 3D camp. Lazy-loaded by <Backdrop/> only for Immersive mode on WebGL-capable devices.
 * Everything is procedural (no downloaded models or textures), so there are no asset licences
 * to track and the whole scene is a few kilobytes on top of three.js itself.
 *
 * Six waystones stand in a ring around the fire; their screen positions are published to the
 * HTML hub (see lib/sceneAnchors.ts) so the real links sit "in the world". Opening a destination
 * dollies the camera toward its stone.
 */
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { Stage } from "@/components/experience/ExperienceProvider";
import { destinations, type DestinationSlug } from "@/config/site";
import { sceneAnchors, type Anchors } from "@/lib/sceneAnchors";

interface Props {
  stage: Stage;
  /** Destination whose stone the camera should approach while a panel is open. */
  focus: DestinationSlug | null;
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

/** Noisy, trampled earth with a darker ring where the fire has burnt the ground. */
function useGroundTexture() {
  const texture = useMemo(() => {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#12161c";
    ctx.fillRect(0, 0, size, size);
    const rand = seeded(7);
    for (let i = 0; i < 9000; i++) {
      const x = rand() * size;
      const y = rand() * size;
      const r = 1 + rand() * 3;
      const shade = 10 + Math.floor(rand() * 22);
      ctx.fillStyle = `rgb(${shade + 4}, ${shade + 6}, ${shade + 10})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let i = 0; i < 140; i++) {
      ctx.fillStyle = `rgba(0,0,0,${0.08 + rand() * 0.18})`;
      ctx.beginPath();
      ctx.ellipse(rand() * size, rand() * size, 8 + rand() * 40, 4 + rand() * 18, rand() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(6, 6);
    return tex;
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

/**
 * World positions of the six waystones: an ellipse around the fire, deeper on the far side so
 * the far labels sit high in frame and the near ones low, leaving the fire clear in the middle.
 */
const STONE_ANGLES: Record<DestinationSlug, number> = {
  skills: -90, // far centre
  about: -145, // far left
  projects: -35, // far right
  stack: 150, // near left
  stats: 30, // near right
  contact: 90, // near centre
};
function stonePosition(slug: DestinationSlug): [number, number] {
  const a = (STONE_ANGLES[slug] * Math.PI) / 180;
  const rz = Math.sin(a) < 0 ? 3.8 : 3.0;
  return [Math.cos(a) * 3.3, Math.sin(a) * rz];
}
/** Far stones carry their plaque above the stone, near stones at the foot. */
function anchorHeight(z: number): number {
  return z < 0 ? 2.4 : 0.55;
}
/** The stone directly in front of the camera stays low so it never hides the flames. */
function stoneHeight(slug: DestinationSlug): number {
  return slug === "contact" ? 0.7 : 1.6;
}

const CAMERA: Record<Exclude<Stage, "panel">, { pos: [number, number, number]; look: [number, number, number] }> = {
  entry: { pos: [0, 3.2, 15.5], look: [0, 2.7, 0] },
  hub: { pos: [0, 3.2, 9.2], look: [0, 1.4, 0] },
};

function CameraRig({ stage, focus, reducedMotion }: { stage: Stage; focus: DestinationSlug | null; reducedMotion: boolean }) {
  const { camera } = useThree();
  const look = useRef(new THREE.Vector3(0, 2.7, 0));
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
    let pos: [number, number, number];
    let target: [number, number, number];
    if (stage === "panel") {
      // Approach the chosen stone from the fire's side, slightly off-axis.
      const [sx, sz] = focus ? stonePosition(focus) : [0, 3.0];
      pos = [sx * 0.3 + sz * 0.15, 2.0, sz * 0.3 - sx * 0.15 + 1.2];
      target = [sx, 1.0, sz];
    } else {
      pos = CAMERA[stage].pos;
      target = CAMERA[stage].look;
    }
    // Slow breathing drift at the entry camp only: at the hub the HTML waystones are pinned to
    // the stones, so the camera must settle (pointer parallax stays, but smaller).
    const t = clock.elapsedTime;
    const drift = !reducedMotion && stage === "entry" ? 1 : 0;
    const parallax = stage === "hub" ? 0.22 : 0.45;
    const px = (reducedMotion ? 0 : pointer.current.x * parallax) + Math.sin(t * 0.18) * 0.18 * drift;
    const py = (reducedMotion ? 0 : pointer.current.y * parallax * 0.5) + Math.sin(t * 0.13 + 1) * 0.08 * drift;
    const tx = pos[0] + px;
    const ty = pos[1] + py;
    const tz = pos[2];

    const { damp } = THREE.MathUtils;
    const p = camera.position;
    const l = look.current;
    if (reducedMotion) {
      p.set(tx, ty, tz);
      l.set(...target);
    } else {
      p.set(damp(p.x, tx, 1.6, dt), damp(p.y, ty, 1.6, dt), damp(p.z, tz, 1.1, dt));
      l.set(damp(l.x, target[0], 2, dt), damp(l.y, target[1], 2, dt), damp(l.z, target[2], 2, dt));
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
    if (light.current) light.current.intensity = 34 * flicker;
    if (core.current) core.current.scale.setScalar(0.9 + 0.22 * flicker);
    if (glow.current) glow.current.scale.setScalar(3.4 + 0.7 * flicker);
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
      <pointLight ref={light} position={[0, 1.0, 0]} color="#e56c35" distance={26} decay={2} intensity={34} />
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

function resetParticle(i: number, positions: Float32Array, seeds: Float32Array, initial: boolean, rand: () => number, spread: number, height: number) {
  const i3 = i * 3;
  const i4 = i * 4;
  const radius = rand() * spread;
  const angle = rand() * Math.PI * 2;
  positions[i3] = Math.cos(angle) * radius;
  positions[i3 + 1] = initial ? rand() * height : 0.35 + rand() * 0.3;
  positions[i3 + 2] = Math.sin(angle) * radius;
  seeds[i4] = rand() * Math.PI * 2; // phase
  seeds[i4 + 1] = 0.45 + rand() * 0.9; // rise speed
  seeds[i4 + 2] = 0.15 + rand() * 0.3; // sway amplitude
  seeds[i4 + 3] = height * (0.55 + rand() * 0.45); // lifetime height
}

/** Rising sparks above the fire. */
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
    for (let i = 0; i < count; i++) resetParticle(i, positions, seeds, true, rand, 0.4, 5);
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
      const i4 = i * 4;
      arr[i3 + 1] += seeds[i4 + 1] * dt;
      arr[i3] += Math.sin(t * 1.4 + seeds[i4]) * seeds[i4 + 2] * dt;
      arr[i3 + 2] += Math.cos(t * 1.1 + seeds[i4]) * seeds[i4 + 2] * dt;
      if (arr[i3 + 1] > seeds[i4 + 3]) resetParticle(i, arr, seeds, false, Math.random, 0.4, 5);
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

/** Slow grey ash drifting down over the whole camp. */
function Ash({ count }: { count: number }) {
  const points = useRef<THREE.Points>(null);
  const tex = useRadialTexture(
    [
      [0, "rgba(200,195,185,0.9)"],
      [0.5, "rgba(200,195,185,0.35)"],
      [1, "rgba(0,0,0,0)"],
    ],
    32,
  );
  const { positions, seeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count * 2);
    const rand = seeded(99);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (rand() - 0.5) * 26;
      positions[i * 3 + 1] = rand() * 9;
      positions[i * 3 + 2] = (rand() - 0.5) * 26 - 2;
      seeds[i * 2] = rand() * Math.PI * 2;
      seeds[i * 2 + 1] = 0.18 + rand() * 0.3;
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
      arr[i3 + 1] -= seeds[i * 2 + 1] * dt;
      arr[i3] += Math.sin(t * 0.6 + seeds[i * 2]) * 0.12 * dt;
      if (arr[i3 + 1] < 0.05) arr[i3 + 1] = 9;
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial map={tex} size={0.07} sizeAttenuation transparent opacity={0.5} depthWrite={false} color="#b9b4aa" />
    </points>
  );
}

/** [x, z, height, radius, tilt] of broken columns around the camp. */
const COLUMNS: ReadonlyArray<readonly [number, number, number, number, number]> = [
  [-7.5, -8, 4.2, 0.36, 0.04],
  [-6.1, -9.6, 2.6, 0.3, -0.06],
  [6.9, -7.4, 3.4, 0.33, 0.03],
  [8.5, -9.2, 5.1, 0.4, -0.02],
  [-10.2, -4.2, 2.1, 0.3, 0.08],
  [10.6, -3.6, 2.9, 0.3, -0.05],
  [1.4, -12.5, 3.7, 0.36, 0.0],
  [-3.1, -13.5, 5.5, 0.42, 0.03],
  [-12, -10, 6.0, 0.5, 0.0],
  [12.5, -11, 4.4, 0.45, 0.04],
  [-9.5, 4.5, 1.6, 0.28, 0.1],
  [10.2, 5.2, 2.2, 0.3, -0.08],
];

function Ruins() {
  const stone = useMemo(() => new THREE.MeshStandardMaterial({ color: STONE, roughness: 0.95, metalness: 0.05 }), []);
  const darkStone = useMemo(() => new THREE.MeshStandardMaterial({ color: "#121820", roughness: 1 }), []);
  useEffect(
    () => () => {
      stone.dispose();
      darkStone.dispose();
    },
    [stone, darkStone],
  );
  return (
    <group>
      {COLUMNS.map(([x, z, h, r, tilt], i) => (
        <group key={i} position={[x, 0, z]} rotation={[tilt, i * 0.8, tilt * 0.5]}>
          <mesh position={[0, h / 2, 0]} material={stone}>
            <cylinderGeometry args={[r * 0.82, r, h, 7]} />
          </mesh>
          {/* plinth */}
          <mesh position={[0, 0.12, 0]} material={darkStone}>
            <boxGeometry args={[r * 2.6, 0.24, r * 2.6]} />
          </mesh>
          {/* capital on the taller columns */}
          {h > 4 && (
            <mesh position={[0, h + 0.1, 0]} material={stone}>
              <boxGeometry args={[r * 2.4, 0.22, r * 2.4]} />
            </mesh>
          )}
        </group>
      ))}
      {/* fallen column pieces */}
      <mesh position={[4.2, 0.3, 2.4]} rotation={[0, 0.6, Math.PI / 2]} material={stone}>
        <cylinderGeometry args={[0.28, 0.3, 2.6, 7]} />
      </mesh>
      <mesh position={[-5.4, 0.26, 1.2]} rotation={[0, -0.4, Math.PI / 2 + 0.08]} material={stone}>
        <cylinderGeometry args={[0.24, 0.27, 1.8, 7]} />
      </mesh>
      {/* broken arch */}
      <mesh position={[3.9, 1.7, -10.6]} material={stone}>
        <boxGeometry args={[0.55, 3.4, 0.55]} />
      </mesh>
      <mesh position={[5.9, 2.0, -10.6]} material={stone}>
        <boxGeometry args={[0.55, 4.0, 0.55]} />
      </mesh>
      <mesh position={[4.9, 3.55, -10.6]} rotation={[0, 0, 0.09]} material={stone}>
        <boxGeometry args={[2.6, 0.42, 0.55]} />
      </mesh>
      {/* low walls and steps */}
      <mesh position={[-4.8, 0.5, -6.2]} rotation={[0, 0.45, 0]} material={stone}>
        <boxGeometry args={[3.6, 1.0, 0.5]} />
      </mesh>
      <mesh position={[7.6, 0.35, -4.4]} rotation={[0, -0.6, 0]} material={stone}>
        <boxGeometry args={[2.4, 0.7, 0.5]} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[-1.5 + i * 0.1, 0.1 + i * 0.18, -7.6 - i * 0.5]} material={darkStone}>
          <boxGeometry args={[4.5 - i * 0.6, 0.18, 0.55]} />
        </mesh>
      ))}
    </group>
  );
}

/** Six standing stones, one per destination, with a rune that glows on hover/focus. */
function Waystones({ focus }: { focus: DestinationSlug | null }) {
  const runes = useRef<Record<string, THREE.Sprite | null>>({});
  const stone = useMemo(() => new THREE.MeshStandardMaterial({ color: "#1f2834", roughness: 0.9, metalness: 0.08 }), []);
  useEffect(() => () => stone.dispose(), [stone]);
  const runeTex = useRadialTexture(
    [
      [0, "rgba(243,217,155,1)"],
      [0.25, "rgba(212,175,97,0.7)"],
      [0.6, "rgba(212,175,97,0.15)"],
      [1, "rgba(0,0,0,0)"],
    ],
    64,
  );

  useFrame(({ clock }, delta) => {
    const hovered = sceneAnchors.getHovered();
    const t = clock.elapsedTime;
    for (const d of destinations) {
      const sprite = runes.current[d.slug];
      if (!sprite) continue;
      const lit = hovered === d.slug || focus === d.slug;
      const target = lit ? 1 : 0.32 + 0.06 * Math.sin(t * 1.5 + STONE_ANGLES[d.slug]);
      const material = sprite.material as THREE.SpriteMaterial;
      material.opacity = THREE.MathUtils.damp(material.opacity, target, 6, Math.min(delta, 0.05));
      sprite.scale.setScalar(lit ? 1.1 : 0.75);
    }
  });

  return (
    <group>
      {destinations.map((d, i) => {
        const [x, z] = stonePosition(d.slug);
        const h = stoneHeight(d.slug);
        const tilt = ((i % 2 ? 1 : -1) * (0.03 + (i % 3) * 0.015));
        return (
          <group key={d.slug} position={[x, 0, z]} rotation={[tilt, STONE_ANGLES[d.slug] * 0.01, -tilt]}>
            <mesh position={[0, h / 2, 0]} material={stone}>
              <cylinderGeometry args={[0.2, 0.3, h, 5]} />
            </mesh>
            <mesh position={[0, h + 0.02, 0]} rotation={[0.2, 0.5, 0.1]} material={stone}>
              <dodecahedronGeometry args={[0.24, 0]} />
            </mesh>
            <mesh position={[0, 0.06, 0]} material={stone}>
              <cylinderGeometry args={[0.55, 0.6, 0.12, 7]} />
            </mesh>
            <sprite
              ref={(el) => {
                runes.current[d.slug] = el;
              }}
              position={[0, h * 0.65, 0.26]}
              scale={0.75}
            >
              <spriteMaterial map={runeTex} color="#f3d99b" transparent opacity={0.35} depthWrite={false} blending={THREE.AdditiveBlending} />
            </sprite>
          </group>
        );
      })}
    </group>
  );
}

/** Projects the stones to screen space for the HTML hub, every frame while the hub is visible. */
function AnchorPublisher({ enabled }: { enabled: boolean }) {
  const { camera, size } = useThree();
  const v = useMemo(() => new THREE.Vector3(), []);
  const w = useMemo(() => new THREE.Vector3(), []);
  const last = useRef<Anchors>({});
  useFrame(() => {
    if (!enabled) return;
    const anchors: Anchors = {};
    let changed = false;
    for (const d of destinations) {
      const [x, z] = stonePosition(d.slug);
      v.set(x, anchorHeight(z), z).project(camera);
      const dist = camera.position.distanceTo(w.set(x, 1, z));
      // Half-pixel quantisation: once the camera settles the links stop moving entirely.
      const anchor = {
        x: Math.round(((v.x + 1) / 2) * size.width * 2) / 2,
        y: Math.round(((1 - v.y) / 2) * size.height * 2) / 2,
        scale: Math.round(THREE.MathUtils.clamp(1.3 - dist / 16, 0.82, 1.12) * 100) / 100,
        visible: v.z < 1,
      };
      const prev = last.current[d.slug];
      if (!prev || prev.x !== anchor.x || prev.y !== anchor.y || prev.scale !== anchor.scale || prev.visible !== anchor.visible) changed = true;
      anchors[d.slug] = anchor;
    }
    if (!changed) return;
    last.current = anchors;
    sceneAnchors.publish(anchors);
  });
  return null;
}

function Ground() {
  const tex = useGroundTexture();
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[48, 48]} />
      <meshStandardMaterial map={tex} color="#9aa0aa" roughness={1} />
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
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, i * 2.1]} position={[(i - 1.5) * 3.5, 0.22 + i * 0.12, -2.5 - i * 1.5]}>
          <planeGeometry args={[20 + i * 5, 20 + i * 5]} />
          <meshBasicMaterial map={tex} transparent opacity={0.07} depthWrite={false} color="#c9b48a" />
        </mesh>
      ))}
    </group>
  );
}

function Sky() {
  const positions = useMemo(() => {
    const n = 320;
    const arr = new Float32Array(n * 3);
    const rand = seeded(2024);
    for (let i = 0; i < n; i++) {
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(0.2 + rand() * 0.75);
      const r = 70;
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.cos(phi);
      arr[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    return arr;
  }, []);
  const moonTex = useRadialTexture(
    [
      [0, "rgba(220,228,240,1)"],
      [0.42, "rgba(220,228,240,0.95)"],
      [0.5, "rgba(190,200,220,0.25)"],
      [1, "rgba(0,0,0,0)"],
    ],
    128,
  );
  return (
    <group>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.32} sizeAttenuation color="#9aa3b5" transparent opacity={0.5} depthWrite={false} fog={false} />
      </points>
      <sprite position={[-22, 26, -58]} scale={7}>
        <spriteMaterial map={moonTex} color="#dfe6f3" transparent opacity={0.55} depthWrite={false} fog={false} />
      </sprite>
    </group>
  );
}

export default function BonfireScene({ stage, focus, reducedMotion, lowPower, onContextLost }: Props) {
  const [visible, setVisible] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const onVisibility = () => setVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Render continuously at the camp; while a panel covers it, keep a slow 12 fps so the
  // dolly toward the chosen stone still plays, then settle.
  const frameloop = visible && stage !== "panel" ? "always" : "demand";
  const invalidate = useRef<(() => void) | null>(null);
  useInvalidateWhen(frameloop === "demand", lowPower ? 6 : 12, invalidate);

  return (
    <div className={`absolute inset-0 transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`} data-scene={ready ? "ready" : "loading"}>
      {/* A failed renderer construction throws out of the Canvas and is caught by <SceneBoundary/> in Backdrop. */}
      <Canvas
        dpr={lowPower ? 1 : [1, 1.5]}
        frameloop={frameloop}
        camera={{ fov: 42, near: 0.1, far: 90, position: CAMERA.entry.pos }}
        gl={{ antialias: false, powerPreference: "high-performance", alpha: false, stencil: false }}
        onCreated={({ gl, invalidate: inv }) => {
          gl.setClearColor(ABYSS, 1);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.15;
          gl.domElement.addEventListener("webglcontextlost", (event) => {
            event.preventDefault();
            onContextLost();
          });
          invalidate.current = inv;
          setReady(true);
        }}
      >
        <color attach="background" args={[ABYSS]} />
        <fog attach="fog" args={[ABYSS, 7, 42]} />
        <hemisphereLight args={["#243047", "#05070a", 1.1]} />
        <directionalLight position={[-6, 9, -4]} color="#3b4a66" intensity={0.35} />
        <CameraRig stage={stage} focus={focus} reducedMotion={reducedMotion} />
        <AnchorPublisher enabled={stage === "hub"} />
        <Ground />
        <Ruins />
        <Waystones focus={focus} />
        <Fire />
        <Embers count={lowPower ? 60 : 170} />
        {!lowPower && <Ash count={120} />}
        {!lowPower && <Mist />}
        <Sky />
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
