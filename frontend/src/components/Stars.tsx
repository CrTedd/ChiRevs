// Отображение и ввод оценки звёздами (★/☆ — типографские символы, не эмодзи).

export function StarsDisplay({ value }: { value: number | null }) {
  if (value == null) return <span className="stars">—</span>;
  const full = Math.round(value);
  return (
    <span className="stars">
      {"★".repeat(full)}
      {"☆".repeat(Math.max(0, 5 - full))}
    </span>
  );
}

export function StarsInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <span className="star-input">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          type="button"
          key={i}
          className={i <= value ? "on" : ""}
          onClick={() => onChange(i)}
          aria-label={`Оценка ${i}`}
        >
          ★
        </button>
      ))}
    </span>
  );
}
