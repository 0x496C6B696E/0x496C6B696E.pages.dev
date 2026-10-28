"use client";

import { useEffect } from "react";

/**
 * Procedural room tone with the Web Audio API: a quiet fan hum (two detuned oscillators)
 * and filtered air noise. No audio files, no disk clicks (the machine is all-flash). Only
 * runs while `enabled` is true, which is set by a user gesture (the dock sound toggle), so
 * autoplay policies are satisfied.
 */
export function useHum(enabled: boolean) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined" || !("AudioContext" in window)) return;
    const ctx = new AudioContext();
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    master.gain.linearRampToValueAtTime(0.26, ctx.currentTime + 1.2);

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
      return src;
    };

    const fan = ctx.createOscillator();
    fan.type = "triangle";
    fan.frequency.value = 96;
    const fan2 = ctx.createOscillator();
    fan2.type = "sine";
    fan2.frequency.value = 193.5;
    const fanGain = ctx.createGain();
    fanGain.gain.value = 0.045;
    fan.connect(fanGain);
    fan2.connect(fanGain);
    fanGain.connect(master);
    fan.start();
    fan2.start();
    const air = noise("lowpass", 380, 0.6, 0.07);
    const hiss = noise("highpass", 7000, 0.5, 0.008);

    // very slow fan curve, like thermal control nudging the speed
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.05;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 4;
    lfo.connect(lfoGain).connect(fan.frequency);
    lfo.start();

    return () => {
      const t = ctx.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.linearRampToValueAtTime(0, t + 0.4);
      window.setTimeout(() => {
        fan.stop();
        fan2.stop();
        lfo.stop();
        air.stop();
        hiss.stop();
        void ctx.close();
      }, 450);
    };
  }, [enabled]);
}
