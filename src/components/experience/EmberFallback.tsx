/**
 * CSS-only camp: the base layer under the WebGL scene and the whole scene when
 * WebGL is unavailable, reduced motion is requested, or Explorer mode is on.
 * Deterministic ember positions keep server and client markup identical.
 */
const EMBER_COUNT = 26;

const embers = Array.from({ length: EMBER_COUNT }, (_, i) => {
  const t = (i * 0.618033988749895) % 1; // golden-ratio spread
  const u = ((i * 7 + 3) % EMBER_COUNT) / EMBER_COUNT;
  return {
    left: `${30 + t * 40}%`,
    delay: `${(u * 9).toFixed(2)}s`,
    duration: `${(7 + t * 6).toFixed(2)}s`,
    drift: `${Math.round((t - 0.5) * 120)}px`,
    opacity: (0.5 + u * 0.5).toFixed(2),
    size: `${2 + Math.round(t * 2)}px`,
  };
});

export function EmberFallback({ animated }: { animated: boolean }) {
  return (
    <div className="ember-scene" data-animated={animated ? "true" : "false"}>
      <svg
        className="absolute inset-x-0 bottom-0 h-[42%] w-full text-[#0b0e13]"
        viewBox="0 0 1200 400"
        preserveAspectRatio="xMidYMax slice"
        fill="currentColor"
        aria-hidden="true"
      >
        {/* distant ruins, drawn as simple silhouettes */}
        <path d="M0 400V300l40-6 10-60 24 4 6 54 50 2V260l20-40 22 40v40l60 4V210l18-8 16 12v96l70 2v-50l14-14 12 14v52l80 2V160l26-16 24 16v110l50 2V220l30-30 30 30v54l60 2V180l20-20 22 20v96l70 2v-60l16-16 18 16v62l64 4V190l22-26 24 26v94l60 4V230l18-20 20 20v54l70 2V240l16-8 16 8v56l44 2v102z" opacity="0.9" />
        <path d="M0 400V340l1200-10v70z" opacity="1" />
      </svg>
      <div className="haze" />
      <div className="hearth" />
      {embers.map((e, i) => (
        <span
          key={i}
          className="ember"
          style={
            {
              left: e.left,
              width: e.size,
              height: e.size,
              "--ember-delay": e.delay,
              "--ember-duration": e.duration,
              "--ember-drift": e.drift,
              "--ember-opacity": e.opacity,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
