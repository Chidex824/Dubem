import { useEffect, useRef, useState } from "react";

export default function LineChart({ name, data, yMax, ticks, labels }) {
  const hostRef = useRef(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = hostRef.current;
    setWidth(el.clientWidth);
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const n = data.length;
  const W = Math.max(260, width), H = 220, L = 40, R = 14, T = 16, B = 28;
  const pw = W - L - R, ph = H - T - B;
  const X = (i) => L + (pw * i) / (n - 1);
  const Y = (v) => T + ph * (1 - v / yMax);
  const line = data.map((v, i) => `${i ? "L" : "M"}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join(" ");
  const area = `${line} L${X(n - 1).toFixed(1)} ${Y(0)} L${X(0).toFixed(1)} ${Y(0)} Z`;

  return (
    <div ref={hostRef} className="chart-host">
      {width > 0 && (
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${name}, ${labels[0]} to ${labels[n - 1]}`}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={L} x2={W - R} y1={Y(t)} y2={Y(t)} stroke="var(--line)" strokeWidth="1" />
              <text x={L - 8} y={Y(t) + 4} textAnchor="end" fontSize="11" fill="var(--muted)">{t}</text>
            </g>
          ))}
          <path d={area} fill="var(--blue-100)" />
          <path d={line} fill="none" stroke="var(--blue-600)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
          {labels.map((l, i) =>
            (n - 1 - i) % 4 === 0 ? (
              <text key={i} x={X(i)} y={H - 8} textAnchor={i === n - 1 ? "end" : "middle"} fontSize="11" fill="var(--muted)">{l}</text>
            ) : null
          )}
          <circle cx={X(n - 1)} cy={Y(data[n - 1])} r="5" fill="var(--white)" stroke="var(--blue-600)" strokeWidth="3" />
          <text x={X(n - 1) - 10} y={Y(data[n - 1]) - 9} textAnchor="end" fontSize="12" fontWeight="700" fill="var(--blue-950)">{data[n - 1]}</text>
        </svg>
      )}
    </div>
  );
}