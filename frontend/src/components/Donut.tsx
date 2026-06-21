// Пончиковая диаграмма распределения оценок (inline SVG, без библиотек).

interface Slice {
  score: number;
  count: number;
}

const COLORS = ["#c0392b", "#e67e22", "#d9a406", "#7cb342", "#1f9d55"];

export function Donut({ data }: { data: Slice[] }) {
  const total = data.reduce((s, d) => s + d.count, 0) || 1;
  const R = 70,
    r = 42,
    cx = 90,
    cy = 90;
  let angle = -Math.PI / 2;
  const paths: JSX.Element[] = [];

  data.forEach((d, i) => {
    const frac = d.count / total;
    const a2 = angle + frac * Math.PI * 2;
    const large = frac > 0.5 ? 1 : 0;
    const x1 = cx + R * Math.cos(angle),
      y1 = cy + R * Math.sin(angle);
    const x2 = cx + R * Math.cos(a2),
      y2 = cy + R * Math.sin(a2);
    const xi1 = cx + r * Math.cos(a2),
      yi1 = cy + r * Math.sin(a2);
    const xi2 = cx + r * Math.cos(angle),
      yi2 = cy + r * Math.sin(angle);
    if (d.count > 0) {
      paths.push(
        <path
          key={i}
          d={`M${x1} ${y1} A${R} ${R} 0 ${large} 1 ${x2} ${y2} L${xi1} ${yi1} A${r} ${r} 0 ${large} 0 ${xi2} ${yi2} Z`}
          fill={COLORS[i]}
        />
      );
    }
    angle = a2;
  });

  return (
    <div className="split">
      <svg width="180" height="180" viewBox="0 0 180 180" role="img" aria-label="Распределение оценок">
        {paths}
        <text x="90" y="86" textAnchor="middle" fontSize="13" fill="#6b7488">
          всего
        </text>
        <text x="90" y="104" textAnchor="middle" fontSize="18" fontWeight="700" fill="#1b2030">
          {total}
        </text>
      </svg>
      <div className="donut-legend">
        {data.map((d, i) => (
          <div key={i}>
            <span className="dot" style={{ background: COLORS[i] }} />
            {d.score} баллов — {d.count}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Bars({ rows, max }: { rows: { label: string; value: number }[]; max: number }) {
  if (rows.length === 0) return <div className="empty">Нет данных</div>;
  return (
    <>
      {rows.map((r, i) => {
        const pct = Math.max(0, Math.min(100, (r.value / max) * 100));
        return (
          <div className="barrow" key={i}>
            <span className="lbl">{r.label}</span>
            <span className="track">
              <span className="fill" style={{ width: pct + "%" }} />
            </span>
            <span className="val">{r.value}</span>
          </div>
        );
      })}
    </>
  );
}
