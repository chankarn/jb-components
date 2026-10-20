/** วงแหวนความคืบหน้า (SVG) — ตัวเลขกลางวง · ใช้สีแบรนด์ปัจจุบัน */
export function ProgressRing({ percent, size = 64, stroke = 7 }: { percent: number; size?: number; stroke?: number }) {
  const p = Math.min(100, Math.max(0, percent));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`${p}%`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-ink/10" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - p / 100)} className="stroke-brand-500 transition-[stroke-dashoffset] duration-500"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-extrabold">{p}%</span>
    </div>
  );
}
