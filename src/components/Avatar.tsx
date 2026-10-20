import { cn } from '@/lib/utils';
import { coverGradient } from '@/lib/cover';

/** วงกลมตัวอักษรแรกของชื่อ — สีไล่ตาม seed (เช่น id ผู้ใช้) ให้แต่ละคนต่างกันแต่คงเดิมทุกครั้ง · `muted` ใช้กับบัญชีที่ถูกปิดสิทธิ์ */
export function Avatar({ name, seed, size = 36, muted, className }: { name: string; seed: number; size?: number; muted?: boolean; className?: string }) {
  const ch = Array.from(name.trim())[0] ?? '?';
  return (
    <span
      aria-hidden
      className={cn('flex shrink-0 select-none items-center justify-center rounded-full font-bold text-white', muted && 'opacity-45 grayscale', className)}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.42), background: coverGradient(seed) }}
    >
      {ch.toUpperCase()}
    </span>
  );
}
