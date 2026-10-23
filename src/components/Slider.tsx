'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n/client';
import { fromRatio, keyValue, moveThumb, nearestThumb, toPercent } from '@/lib/slider';

export type SliderMark = number | { value: number; label?: React.ReactNode };

type Common = {
  min?: number;
  max?: number;
  step?: number;
  /** จุดบอกตำแหน่งบนราง (และป้ายใต้ราง ถ้าใส่ label) */
  marks?: SliderMark[];
  /** แปลงค่าเป็นข้อความ (ป้ายลอยเหนือปุ่ม + ที่ screen reader อ่าน) เช่น `(v) => `฿${v.toLocaleString()}`` */
  format?: (v: number) => string;
  /** ป้ายค่าลอยเหนือปุ่ม: `auto` = ตอนชี้/ลาก/โฟกัส · `always` · `never` */
  tooltip?: 'auto' | 'always' | 'never';
  /** ชื่อสำหรับ screen reader (ปุ่มของโหมดช่วงจะต่อท้ายว่า "ต่ำสุด"/"สูงสุด") */
  label?: string;
  /** ชื่อฟิลด์สำหรับส่งฟอร์ม (โหมดช่วงส่งเป็น name[0], name[1]) */
  name?: string;
  disabled?: boolean;
  className?: string;
};
type SingleProps = Common & {
  range?: false;
  value: number;
  onChange: (v: number) => void;
  /** เรียกตอนปล่อยปุ่ม/จบการกดคีย์ — ใช้ยิง API ครั้งเดียวแทนทุกการขยับ */
  onCommit?: (v: number) => void;
};
type RangeProps = Common & {
  range: true;
  value: [number, number];
  onChange: (v: [number, number]) => void;
  onCommit?: (v: [number, number]) => void;
  /** ระยะห่างน้อยสุดระหว่างสองปุ่ม */
  minGap?: number;
};
export type SliderProps = SingleProps | RangeProps;

const defaultFormat = (v: number) => v.toLocaleString();

/**
 * Slider / Range slider
 * - ลากปุ่ม หรือคลิก/แตะที่ราง (ปุ่มที่ใกล้กว่าวิ่งมาหา แล้วลากต่อได้ทันที) · โหมดช่วงสองปุ่มไม่ข้ามกัน
 * - คีย์บอร์ดตามแนวทาง ARIA: ← → ทีละขั้น · Shift/PageUp/PageDown ก้าวใหญ่ · Home/End
 * - ป้ายค่าลอยเหนือปุ่มตอนชี้/ลาก/โฟกัส · `marks` จุดบนรางพร้อมป้าย · ตอนคลิกหรือกดคีย์ปุ่มเลื่อนนุ่มๆ ตอนลากตามนิ้วตรงๆ
 * - ปุ่มเป็น role="slider" มี aria-valuetext ตาม `format` · มี input hidden ส่งค่าในฟอร์มได้
 */
export function Slider(props: SliderProps) {
  const { min = 0, max = 100, step = 1, marks, format = defaultFormat, tooltip = 'auto', label, name, disabled, className } = props;
  const values: number[] = props.range ? props.value : [props.value];
  const minGap = props.range ? props.minGap ?? 0 : 0;
  const t = useT();
  const rail = React.useRef<HTMLDivElement>(null);
  const thumbs = React.useRef<(HTMLDivElement | null)[]>([]);
  const [drag, setDrag] = React.useState<number | null>(null);
  const [last, setLast] = React.useState(0); // ปุ่มที่ขยับล่าสุดอยู่บนสุด (ตอนซ้อนกันจะได้คว้าตัวนั้นต่อ)
  const latest = React.useRef(values);
  latest.current = values;

  function emit(next: number[], commit = false) {
    if (props.range) {
      const v: [number, number] = [next[0], next[1]];
      if (v[0] !== props.value[0] || v[1] !== props.value[1]) props.onChange(v);
      if (commit) props.onCommit?.(v);
    } else {
      if (next[0] !== props.value) props.onChange(next[0]);
      if (commit) props.onCommit?.(next[0]);
    }
  }

  function valueAt(clientX: number) {
    const r = rail.current!.getBoundingClientRect();
    return fromRatio(r.width ? (clientX - r.left) / r.width : 0, min, max, step);
  }

  function set(i: number, v: number, commit = false) {
    const next = props.range ? moveThumb(latest.current, i, v, minGap) : [v];
    latest.current = next;
    emit(next, commit);
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (disabled || e.button !== 0) return;
    e.preventDefault(); // ไม่ให้ลากแล้วเลือกข้อความ
    const v = valueAt(e.clientX);
    const target = (e.target as HTMLElement).closest<HTMLElement>('[data-thumb]');
    const i = target ? Number(target.dataset.thumb) : nearestThumb(latest.current, v);
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag(i);
    setLast(i);
    thumbs.current[i]?.focus({ preventScroll: true });
    if (!target) set(i, v); // คลิกที่ราง → กระโดดไป · คว้าที่ปุ่ม → รอให้ขยับก่อน (ไม่สะดุ้ง)
  }
  function onPointerMove(e: React.PointerEvent) {
    if (drag == null) return;
    set(drag, valueAt(e.clientX));
  }
  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (drag == null) return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    setDrag(null);
    emit(latest.current, true);
  }

  function onKeyDown(e: React.KeyboardEvent, i: number) {
    const v = keyValue(e.key, values[i], min, max, step, e.shiftKey);
    if (v == null) return;
    e.preventDefault();
    setLast(i);
    set(i, v, true);
  }

  const pct = values.map((v) => toPercent(v, min, max));
  const fill = props.range ? { left: `${pct[0]}%`, width: `${pct[1] - pct[0]}%` } : { left: 0, width: `${pct[0]}%` };
  const markList = (marks ?? []).map((m) => (typeof m === 'number' ? { value: m } : m));
  const hasMarkLabels = markList.some((m) => m.label != null);

  return (
    <div className={cn('slider w-full select-none', hasMarkLabels && 'pb-6', tooltip === 'always' && 'pt-8', disabled && 'opacity-50', className)}>
      <div
        className={cn('relative flex h-6 touch-none items-center', disabled ? 'cursor-not-allowed' : 'cursor-pointer')}
        data-dragging={drag != null || undefined}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
      >
        <div ref={rail} className="relative h-1.5 w-full rounded-pill bg-ink/10">
          <div className="slider-anim absolute inset-y-0 rounded-pill bg-brand-500" style={fill} />
          {markList.map((m) => {
            const p = toPercent(m.value, min, max);
            const inFill = props.range ? m.value >= values[0] && m.value <= values[1] : m.value <= values[0];
            return (
              <React.Fragment key={m.value}>
                <span aria-hidden className={cn('absolute top-1/2 size-1 -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors', inFill ? 'bg-white/80' : 'bg-ink/25')} style={{ left: `${p}%` }} />
                {m.label != null && (
                  <span aria-hidden className={cn('absolute top-5 -translate-x-1/2 whitespace-nowrap text-[11px] transition-colors', inFill ? 'font-semibold text-ink-soft' : 'text-ink-mute')} style={{ left: `${p}%` }}>
                    {m.label}
                  </span>
                )}
              </React.Fragment>
            );
          })}
          {values.map((v, i) => {
            const thumbLabel = props.range ? `${label ?? ''} ${t(i === 0 ? 'slider.min' : 'slider.max')}`.trim() : label;
            return (
              <div
                key={i} ref={(el) => { thumbs.current[i] = el; }} data-thumb={i}
                role="slider" tabIndex={disabled ? -1 : 0} aria-label={thumbLabel} aria-disabled={disabled || undefined} aria-orientation="horizontal"
                aria-valuemin={props.range && i === 1 ? values[0] + minGap : min}
                aria-valuemax={props.range && i === 0 ? values[1] - minGap : max}
                aria-valuenow={v} aria-valuetext={format(v)}
                onKeyDown={(e) => onKeyDown(e, i)}
                data-tip={tooltip}
                className={cn(
                  'slider-thumb slider-anim group absolute top-1/2 grid size-5 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full outline-none',
                  last === i ? 'z-20' : 'z-10',
                )}
                style={{ left: `${pct[i]}%` }}
              >
                <span
                  aria-hidden
                  className={cn(
                    'size-full rounded-full border-2 border-brand-600 bg-white shadow-[0_1px_3px_rgb(0_0_0/0.2)] transition-[transform,box-shadow] duration-150',
                    'group-hover:shadow-[0_0_0_6px_rgb(var(--brand-500)/0.15)] group-focus-visible:shadow-[0_0_0_6px_rgb(var(--brand-500)/0.3)]',
                    drag === i && 'scale-110 shadow-[0_0_0_8px_rgb(var(--brand-500)/0.18)]',
                  )}
                />
                {tooltip !== 'never' && (
                  <span aria-hidden className="slider-tip pointer-events-none absolute bottom-full mb-2.5 whitespace-nowrap rounded-lg bg-ink px-2 py-1 text-[11px] font-semibold tabular-nums text-paper shadow-lift">
                    {format(v)}
                    <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-ink" />
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {name && values.map((v, i) => <input key={i} type="hidden" name={props.range ? `${name}[${i}]` : name} value={v} />)}
    </div>
  );
}

