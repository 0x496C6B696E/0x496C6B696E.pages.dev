import { attributes } from "@/data/skills";

const SIZE = 320;
const CENTER = SIZE / 2;
const RADIUS = 112;

function point(index: number, value: number): [number, number] {
  const angle = -Math.PI / 2 + (index / attributes.length) * Math.PI * 2;
  const r = (value / 100) * RADIUS;
  return [CENTER + Math.cos(angle) * r, CENTER + Math.sin(angle) * r];
}

/** Seven-axis radar of the thematic levels. Pure SVG, server-rendered. */
export function AttributeRadar() {
  const rings = [25, 50, 75, 100];
  const shape = attributes.map((a, i) => point(i, a.level).join(",")).join(" ");
  const summary = attributes.map((a) => `${a.meaning} ${a.level}`).join(", ");

  return (
    <figure className="card flex flex-col items-center gap-2 p-4">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full max-w-[20rem]" role="img" aria-label={`Attribute radar: ${summary}. Thematic self-assessment out of 100.`}>
        <defs>
          <radialGradient id="radar-fill" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#f3d99b" stopOpacity="0.55" />
            <stop offset="1" stopColor="#e56c35" stopOpacity="0.18" />
          </radialGradient>
        </defs>
        {rings.map((r) => (
          <polygon key={r} points={attributes.map((_, i) => point(i, r).join(",")).join(" ")} fill="none" stroke="#d4af61" strokeOpacity={r === 100 ? 0.45 : 0.16} strokeWidth="1" />
        ))}
        {attributes.map((_, i) => {
          const [x, y] = point(i, 100);
          return <line key={i} x1={CENTER} y1={CENTER} x2={x} y2={y} stroke="#d4af61" strokeOpacity="0.14" />;
        })}
        <polygon points={shape} fill="url(#radar-fill)" stroke="#f3d99b" strokeWidth="1.5" strokeLinejoin="round" />
        {attributes.map((a, i) => {
          const [x, y] = point(i, a.level);
          return <circle key={a.key} cx={x} cy={y} r="3" fill="#f3d99b" />;
        })}
        {attributes.map((a, i) => {
          const [x, y] = point(i, 124);
          const anchor = Math.abs(x - CENTER) < 6 ? "middle" : x > CENTER ? "start" : "end";
          return (
            <text key={a.key} x={x} y={y + 4} textAnchor={anchor} className="fill-ink" style={{ fontFamily: "var(--font-display)", fontSize: 11, letterSpacing: "0.06em" }}>
              {a.name}
            </text>
          );
        })}
      </svg>
      <figcaption className="text-center text-xs text-dust">Attribute radar · thematic levels, not certifications</figcaption>
    </figure>
  );
}
