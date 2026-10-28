"use client";

import { useEffect } from "react";

/**
 * Procedural bonfire ambience with the Web Audio API: filtered noise for the low roar and
 * short random bursts for crackles. No audio files, nothing downloaded. Only runs while
 * `enabled` is true, which is set by a user gesture (the HUD sound toggle), so autoplay
 * policies are satisfied.
 */
export function useCrackle(enabled: boolean) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined" || !("AudioContext" in window)) return;
    const ctx = new AudioContext();
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    master.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 1.5);

    // Two seconds of white noise, looped by every voice.
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

    const voice = (type: BiquadFilterType, frequency: number, q: number, gain: number) => {
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = type;
      filter.frequency.value = frequency;
      filter.Q.value = q;
      const g = ctx.createGain();
      g.gain.value = gain;
      src.connect(filter).connect(g).connect(master);
      src.start();
      return { src, g };
    };

    const roar = voice("lowpass", 180, 0.7, 0.22);
    const hiss = voice("bandpass", 900, 0.6, 0.05);
    const crackle = voice("bandpass", 2600, 1.2, 0);

    // Slow breathing on the roar, random short bursts on the crackle voice.
    let alive = true;
    const breathe = () => {
      if (!alive) return;
      const t = ctx.currentTime;
      roar.g.gain.cancelScheduledValues(t);
      roar.g.gain.linearRampToValueAtTime(0.16 + Math.random() * 0.12, t + 1.2 + Math.random());
      window.setTimeout(breathe, 900 + Math.random() * 900);
    };
    const pop = () => {
      if (!alive) return;
      const t = ctx.currentTime;
      const peak = 0.25 + Math.random() * 0.55;
      crackle.g.gain.cancelScheduledValues(t);
      crackle.g.gain.setValueAtTime(0, t);
      crackle.g.gain.linearRampToValueAtTime(peak, t + 0.008);
      crackle.g.gain.exponentialRampToValueAtTime(0.001, t + 0.05 + Math.random() * 0.12);
      window.setTimeout(pop, 70 + Math.random() * 420);
    };
    breathe();
    pop();

    return () => {
      alive = false;
      const t = ctx.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.linearRampToValueAtTime(0, t + 0.4);
      window.setTimeout(() => {
        for (const v of [roar, hiss, crackle]) v.src.stop();
        void ctx.close();
      }, 450);
    };
  }, [enabled]);
}
