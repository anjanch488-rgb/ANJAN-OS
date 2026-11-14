import type { TechGroup } from "@/lib/data";

/** Small animated SVG per tech domain — visual metaphors instead of skill bars. */
export default function TechViz({ kind }: { kind: TechGroup["viz"] }) {
  const common = { viewBox: "0 0 200 110", className: "h-full w-full", fill: "none", role: "img" as const };

  if (kind === "stack")
    return (
      <svg {...common} aria-label="Layered software stack">
        {[0, 1, 2, 3].map((i) => (
          <g key={i} transform={`translate(0 ${70 - i * 17})`}>
            <path d="M100 0 160 16 100 32 40 16Z" fill={i === 3 ? "#e50920" : "#1a1213"} stroke="#ff253a" strokeWidth="1" opacity={0.55 + i * 0.15} />
            <path d="M40 16v8l60 16v-8Z" fill="#0b0708" stroke="#ff253a" strokeOpacity=".5" />
            <path d="M160 16v8l-60 16v-8Z" fill="#150d0e" stroke="#ff253a" strokeOpacity=".5" />
          </g>
        ))}
        <text x="100" y="26" textAnchor="middle" fontSize="8" fill="#fff" fontFamily="monospace" opacity=".85">{"</>"}</text>
      </svg>
    );

  if (kind === "radar")
    return (
      <svg {...common} aria-label="Network radar">
        <g transform="translate(100 55)">
          {[18, 34, 50].map((r) => (
            <circle key={r} r={r} stroke="#e50920" strokeOpacity=".5" />
          ))}
          <line x1="-52" x2="52" stroke="#e50920" strokeOpacity=".3" />
          <line y1="-52" y2="52" stroke="#e50920" strokeOpacity=".3" />
          <g className="ring-a" style={{ animationDuration: "5s" }}>
            <path d="M0 0 50 0A50 50 0 0 0 35 -35Z" fill="#ff253a" opacity=".35" />
            <line x2="50" stroke="#ff253a" strokeWidth="1.5" />
          </g>
          {[[22, -18], [-30, 10], [12, 32], [-8, -36]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="2.5" fill="#fff" className="pulse" style={{ animationDelay: `${i * 0.5}s` }} />
          ))}
        </g>
      </svg>
    );

  if (kind === "neural") {
    const L = [[2, 5], [4, 5], [3, 5]]; // layer sizes encoded as [count, _]
    const xs = [30, 100, 170];
    const ys = (n: number) => Array.from({ length: n }, (_, i) => 55 + (i - (n - 1) / 2) * 20);
    const layers = [ys(L[0][0]), ys(L[1][0]), ys(L[2][0])];
    return (
      <svg {...common} aria-label="Neural network">
        {layers.slice(0, -1).map((a, li) =>
          a.map((ya, i) =>
            layers[li + 1].map((yb, j) => (
              <line key={`${li}${i}${j}`} x1={xs[li]} y1={ya} x2={xs[li + 1]} y2={yb} stroke="#e50920" strokeOpacity=".35" className={(i + j) % 3 === 0 ? "flow" : ""} />
            )),
          ),
        )}
        {layers.map((l, li) => l.map((y, i) => <circle key={`${li}-${i}`} cx={xs[li]} cy={y} r="4.5" fill="#0b0708" stroke="#ff253a" strokeWidth="1.5" />))}
      </svg>
    );
  }

  if (kind === "mesh") {
    const n = [[30, 30], [90, 18], [160, 34], [60, 80], [130, 86], [100, 52]];
    const e = [[0, 1], [1, 2], [0, 3], [3, 5], [5, 1], [5, 2], [5, 4], [3, 4], [4, 2]];
    return (
      <svg {...common} aria-label="Self-healing mesh network">
        {e.map(([a, b], i) => (
          <line key={i} x1={n[a][0]} y1={n[a][1]} x2={n[b][0]} y2={n[b][1]} stroke="#e50920" strokeOpacity=".5" className={i % 2 ? "flow" : ""} />
        ))}
        {/* a "failed" link that the mesh routes around */}
        <line x1={n[1][0]} y1={n[1][1]} x2={n[2][0]} y2={n[2][1]} stroke="#8b8d92" strokeDasharray="2 4" />
        {n.map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="9" fill="none" stroke="#ff253a" strokeOpacity=".35" className="pulse" style={{ animationDelay: `${i * 0.3}s` }} />
            <circle cx={x} cy={y} r="4.5" fill={i === 5 ? "#ff253a" : "#0b0708"} stroke="#ff253a" strokeWidth="1.5" />
          </g>
        ))}
      </svg>
    );
  }

  // pipeline
  const boxes = ["IN", "STORE", "PROC", "OUT"];
  return (
    <svg {...common} aria-label="Data pipeline">
      {boxes.map((t, i) => {
        const x = 8 + i * 48;
        return (
          <g key={t}>
            <rect x={x} y="38" width="38" height="34" fill="#120a0b" stroke="#ff253a" strokeWidth="1.2" />
            <text x={x + 19} y="59" textAnchor="middle" fontSize="8" fill="#f5f5f5" fontFamily="monospace">{t}</text>
            {i < 3 && <line x1={x + 38} y1="55" x2={x + 48} y2="55" stroke="#ff253a" strokeWidth="1.5" className="flow" />}
          </g>
        );
      })}
      <path d="M27 38V22h146v16" stroke="#e50920" strokeOpacity=".4" strokeDasharray="2 4" />
    </svg>
  );
}
