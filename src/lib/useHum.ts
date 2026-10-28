"use client";

import { useEffect } from "react";

/**
 * Procedural room tone with the Web Audio API: a low fan hum, a faint hiss and random
 * disk clicks. No audio files. Only runs while `enabled` is true, which is set by a user
 * gesture (the taskbar sound toggle), so autoplay policies are satisfied.
 */
export function useHum(enabled: boolean) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined" || !("AudioContext" in window)) return;
    const ctx = new AudioContext();
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    master.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 1.2);

    // Two seconds of white noise, looped by the noise voices.
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

    const noise = (type: BiquadFilterType, frequency: number, q: number, gain: number) => {
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

    // Fan: a soft 120 Hz tone with a detuned partner, plus filtered air noise.
    const fan = ctx.createOscillator();
    fan.type = "triangle";
    fan.frequency.value = 118;
    const fan2 = ctx.createOscillator();
    fan2.type = "sine";
    fan2.frequency.value = 236.5;
    const fanGain = ctx.createGain();
    fanGain.gain.value = 0.05;
    fan.connect(fanGain);
    fan2.connect(fanGain);
    fanGain.connect(master);
    fan.start();
    fan2.start();
    const air = noise("lowpass", 420, 0.6, 0.08);
    const hiss = noise("highpass", 6000, 0.5, 0.012);
    const click = noise("bandpass", 3200, 2.5, 0);

    let alive = true;
    const seek = () => {
      if (!alive) return;
      // a burst of 2 to 6 quick clicks, then silence: an old drive seeking
      const t = ctx.currentTime;
      const n = 2 + Math.floor(Math.random() * 5);
      click.g.gain.cancelScheduledValues(t);
      for (let i = 0; i < n; i++) {
        const at = t + i * (0.03 + Math.random() * 0.04);
        click.g.gain.setValueAtTime(0, at);
        click.g.gain.linearRampToValueAtTime(0.35 + Math.random() * 0.3, at + 0.004);
        click.g.gain.exponentialRampToValueAtTime(0.001, at + 0.03);
      }
      window.setTimeout(seek, 1500 + Math.random() * 6000);
    };
    seek();

    return () => {
      alive = false;
      const t = ctx.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.linearRampToValueAtTime(0, t + 0.4);
      window.setTimeout(() => {
        fan.stop();
        fan2.stop();
        for (const v of [air, hiss, click]) v.src.stop();
        void ctx.close();
      }, 450);
    };
  }, [enabled]);
}
