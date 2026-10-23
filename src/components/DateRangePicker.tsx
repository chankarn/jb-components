'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CalendarRange, Check, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { mergeRefs, useFloating } from '@/components/Popover';
import { cn } from '@/lib/utils';
import { useLang, useT } from '@/lib/i18n/client';
import {
  MONTHS_FULL, WEEKDAYS, addDays, addMonths, clampYmd, cmpYmd, displayYear, formatYmd, monthGrid, parseYmd, todayYmd, toYmd, type YMD,
} from '@/lib/calendar';
import {
  PRESET_KEYS, clampRange, displayRange, formatRange, inRange, isSameRange, isSelectable, parseRange, pickDay, rangeLength, rangePresets, type DateRange, type PresetKey,
} from '@/lib/calendar-range';

export type { DateRange, PresetKey };

type Variant = 'field' | 'pill' | 'compact';
const TRIGGER: Record<Variant, string> = {
  field: 'h-12 rounded-2xl px-4 text-sm',
  pill: 'h-10 rounded-pill px-4 text-sm',
  compact: 'h-9 rounded-lg px-3 text-xs',
};

const MONTH_W = 252; // 7 ช่อง × 36px
const MONTH_GAP = 24;

type Props = {
  /** ช่วงที่เลือก `{ from, to }` เป็น `YYYY-MM-DD` (ค.ศ.) · null = ยังไม่เลือก */
  value: DateRange | null;
  onChange: (v: DateRange | null) => void;
  /** ขอบเขตวันที่เลือกได้ `YYYY-MM-DD` */
  min?: string;
  max?: string;
  /** ช่วงยาวสุดที่เลือกได้ (จำนวนวัน รวมวันเริ่มและวันจบ) */
  maxDays?: number;
  /** true = ค่าสำเร็จรูปมาตรฐาน (วันนี้ · 7/30/90 วัน · เดือนนี้ · เดือนก่อน) · false = ไม่แสดง · หรือระบุเองเช่น ['last7','last30'] */
  presets?: boolean | PresetKey[];
  clearable?: boolean;
  disabled?: boolean;
  placeholder?: string;
  variant?: Variant;
  className?: string;
  id?: string;
  'aria-label'?: string;
};

/**
 * ตัวเลือกช่วงวันที่ (ต่อยอดจาก DatePicker) — ไทยแสดงปี พ.ศ. · อังกฤษ ค.ศ. · ค่าที่ส่งออกเป็น ISO (ค.ศ.) เสมอ
 * - คลิกแรก = วันเริ่ม · คลิกที่สอง = วันสิ้นสุด (คลิกย้อนก็ได้ ระบบเรียงให้) · ระหว่างรอวันสิ้นสุดเห็นตัวอย่างช่วงตามเมาส์/โฟกัส
 * - ค่าสำเร็จรูปเป็นแถวให้กดทีเดียว (มีเครื่องหมายถูกที่ช่วงที่ตรงกับค่าปัจจุบัน) · จอกว้างปฏิทินสองเดือน จอแคบหนึ่งเดือน + ชิปค่าสำเร็จรูปด้านบน
 * - `maxDays` จำกัดความยาวช่วง (วันที่ไกลเกินจะกดไม่ได้ระหว่างเลือกวันสิ้นสุด) · `min`/`max` จำกัดขอบเขต
 * - คีย์บอร์ด: ลูกศรเลื่อนวัน/สัปดาห์ · PageUp/PageDown เดือน (Shift = ปี) · Home/End ต้น/ท้ายสัปดาห์ · Enter/Space เลือก
 *   · Esc ขณะรอวันสิ้นสุด = ยกเลิกการเลือก (ค่าเดิมไม่เปลี่ยน) · Esc อีกครั้งปิด (ไม่ลามไปปิด dialog ที่ครอบอยู่)
 * - วาดผ่าน portal และพลิกขึ้นบนเองเมื่อล่างจอไม่พอ จึงใช้ใน dialog/drawer/แถวตัวกรองได้ · ค่าเปลี่ยนเมื่อเลือกวันสิ้นสุดแล้วเท่านั้น
 */
export function DateRangePicker({
  value, onChange, min, max, maxDays, presets = true, clearable, disabled, placeholder, variant = 'field', className, id, ...rest
}: Props) {
  const t = useT();
  const { lang } = useLang();
  const reduce = useReducedMotion();
  const uid = React.useId();
  const trigger = React.useRef<HTMLButtonElement>(null);
  const panel = React.useRef<HTMLDivElement>(null);

  const minY = parseYmd(min);
  const maxY = parseYmd(max);
  const bounds = React.useMemo(() => ({ min: minY, max: maxY, maxDays }), [min, max, maxDays]); // eslint-disable-line react-hooks/exhaustive-deps
  const committed = parseRange(value);
  const today = todayYmd();

  const [open, setOpen] = React.useState(false);
  const [months, setMonths] = React.useState<1 | 2>(2);
  const [view, setView] = React.useState<{ y: number; m: number }>(() => ({ y: (committed?.from ?? today).y, m: (committed?.from ?? today).m }));
  const [cursor, setCursor] = React.useState<YMD>(() => committed?.from ?? today);
  const [anchor, setAnchor] = React.useState<YMD | null>(null);
  const [hover, setHover] = React.useState<YMD | null>(null);

  const presetKeys: PresetKey[] = presets === false ? [] : Array.isArray(presets) ? presets : PRESET_KEYS;
  const presetList = React.useMemo(
    () =>
      rangePresets(today)
        .filter((p) => presetKeys.includes(p.key))
        .map((p) => {
          const clamped = clampRange(p.range, bounds);
          return { key: p.key, range: clamped, ok: !!clamped && (!maxDays || rangeLength(clamped) <= maxDays) };
        }),
    [toYmd(today), presetKeys.join(','), bounds, maxDays], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const hasPresets = presetList.length > 0;

  // จอกว้างแสดง 2 เดือน จอแคบ 1 เดือน (คิดใหม่ตอนเปิดและตอนย่อขยายจอ)
  const syncMonths = React.useCallback(() => setMonths(window.innerWidth >= 720 ? 2 : 1), []);
  // ตำแหน่งแผง: ตัววางตำแหน่งกลาง (พลิกขึ้นเมื่อด้านล่างไม่พอ · เลื่อนหนีขอบจอ · ตามช่องตอนเลื่อนหน้า · จำนวนเดือนเปลี่ยนก็จัดใหม่เอง)
  const { setFloating, pos } = useFloating(open, trigger, { side: 'bottom', align: 'start', offset: 6 });

  function show() {
    if (disabled) return;
    const start = clampYmd(committed?.from ?? today, minY, maxY);
    setView({ y: start.y, m: start.m });
    setCursor(start);
    setAnchor(null);
    setHover(null);
    syncMonths();
    setOpen(true);
  }
  const close = (refocus = true) => {
    setOpen(false);
    setAnchor(null);
    setHover(null);
    if (refocus) trigger.current?.focus();
  };

  React.useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => {
      const el = e.target as Node;
      if (!panel.current?.contains(el) && !trigger.current?.contains(el)) close(false);
    };
    document.addEventListener('mousedown', down);
    window.addEventListener('resize', syncMonths);
    return () => {
      document.removeEventListener('mousedown', down);
      window.removeEventListener('resize', syncMonths);
    };
  }, [open, syncMonths]); // eslint-disable-line react-hooks/exhaustive-deps

  // ย้ายโฟกัสไปวันที่ cursor ชี้ (roving tabindex)
  React.useEffect(() => {
    if (open) panel.current?.querySelector<HTMLElement>(`[data-ymd="${toYmd(cursor)}"]`)?.focus({ preventScroll: true });
  }, [open, cursor, view.y, view.m, months]);

  function ensureVisible(c: YMD) {
    setView((v) => {
      const idx = (c.y - v.y) * 12 + (c.m - v.m);
      if (idx < 0) return { y: c.y, m: c.m };
      if (idx > months - 1) return addMonths(c.y, c.m, -(months - 1));
      return v;
    });
  }
  function moveCursor(next: YMD) {
    const c = clampYmd(next, minY, maxY);
    setCursor(c);
    ensureVisible(c);
    if (anchor) setHover(c);
  }

  function pick(c: YMD) {
    const r = pickDay(anchor, c, bounds);
    if (!r.range && r.anchor === anchor) return; // เลือกวันนี้ไม่ได้ (นอกขอบเขต/ยาวเกิน maxDays)
    setCursor(c);
    setAnchor(r.anchor);
    setHover(null);
    if (r.range) {
      onChange(r.range);
      close();
    }
  }

  function onGridKey(e: React.KeyboardEvent) {
    const k = e.key;
    const delta = k === 'ArrowLeft' ? -1 : k === 'ArrowRight' ? 1 : k === 'ArrowUp' ? -7 : k === 'ArrowDown' ? 7 : 0;
    if (delta) { e.preventDefault(); moveCursor(addDays(cursor, delta)); }
    else if (k === 'PageUp' || k === 'PageDown') {
      e.preventDefault();
      const step = (k === 'PageUp' ? -1 : 1) * (e.shiftKey ? 12 : 1);
      const nm = addMonths(cursor.y, cursor.m, step);
      moveCursor({ y: nm.y, m: nm.m, d: Math.min(cursor.d, new Date(Date.UTC(nm.y, nm.m, 0)).getUTCDate()) });
    } else if (k === 'Home' || k === 'End') {
      e.preventDefault();
      const wd = new Date(Date.UTC(cursor.y, cursor.m - 1, cursor.d)).getUTCDay();
      moveCursor(addDays(cursor, k === 'Home' ? -wd : 6 - wd));
    } else if (k === 'Enter' || k === ' ') { e.preventDefault(); pick(cursor); }
  }

  const onPanelKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'Escape') return;
    e.stopPropagation(); // ไม่ปล่อยให้ Esc ลามไปปิด dialog/drawer ที่ครอบอยู่
    e.preventDefault();
    if (anchor) { setAnchor(null); setHover(null); } // ยกเลิกการเลือกที่ค้างอยู่ ค่าเดิมไม่เปลี่ยน
    else close();
  };

  const monthNames = MONTHS_FULL[lang];
  const shown = displayRange(anchor, hover ?? (anchor ? cursor : null), committed);
  const label = committed ? formatRange({ from: toYmd(committed.from), to: toYmd(committed.to) }, lang) : '';
  const navPrev = () => setView((v) => addMonths(v.y, v.m, -1));
  const navNext = () => setView((v) => addMonths(v.y, v.m, 1));

  const presetsList = (
    <ul className="space-y-0.5" aria-label={t('cal.range_presets')}>
      {presetList.map((p) => {
        const active = !!committed && !anchor && isSameRange(value, p.range);
        return (
          <li key={p.key}>
            <button
              type="button" disabled={!p.ok} aria-pressed={active}
              onClick={() => { if (p.range) { onChange(p.range); close(); } }}
              className={cn(
                'flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm outline-none transition',
                'hover:bg-ink/5 focus-visible:ring-2 focus-visible:ring-brand-500/50 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent',
                active ? 'font-semibold text-ink' : 'text-ink-soft',
              )}
            >
              <span className="flex w-4 shrink-0 justify-center text-brand-link">{active && <Check size={16} strokeWidth={3} />}</span>
              {t(`cal.preset_${p.key}`)}
            </button>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      <div className={cn('relative', className)}>
        <button
          ref={trigger} id={id} type="button" disabled={disabled}
          aria-haspopup="dialog" aria-expanded={open} aria-controls={open ? uid : undefined} aria-label={rest['aria-label']}
          onClick={() => (open ? close(false) : show())}
          className={cn(
            'flex w-full min-w-0 items-center justify-between gap-2 border border-ink/15 bg-surface text-left outline-none transition',
            'hover:border-ink/30 focus-visible:border-brand-500 focus-visible:shadow-glow',
            open && 'border-brand-500 shadow-glow',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-ink/15',
            TRIGGER[variant],
          )}
        >
          <span className={cn('min-w-0 flex-1 truncate', !label && 'text-ink-mute/70', clearable && committed && 'mr-7')}>{label || placeholder || t('cal.pick_range')}</span>
          <CalendarRange size={variant === 'compact' ? 14 : 16} className={cn('shrink-0 text-ink-mute transition-colors', open && 'text-brand-link')} />
        </button>
        {clearable && committed && !disabled && (
          <button type="button" aria-label={t('cal.clear')} onClick={() => onChange(null)} className="absolute right-9 top-1/2 -translate-y-1/2 rounded-full p-1 text-ink-mute hover:bg-ink/5 hover:text-ink">
            <X size={13} />
          </button>
        )}
      </div>

      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div data-floating
                ref={mergeRefs(panel, setFloating)} id={uid} role="dialog" aria-label={t('cal.pick_range')} onKeyDown={onPanelKey}
                initial={reduce ? false : { opacity: 0, y: pos?.side === 'top' ? 6 : -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, transition: { duration: 0.12 } }} transition={{ duration: 0.16, ease: 'easeOut' }}
                style={{ position: 'fixed', left: pos?.left ?? 0, top: pos?.top ?? 0, maxWidth: 'calc(100vw - 16px)', visibility: pos ? undefined : 'hidden' }}
                className="z-[300] overflow-hidden rounded-3xl border border-ink/10 bg-surface p-4 text-ink shadow-lift"
              >
                <div className="flex gap-4">
                  {hasPresets && months === 2 && <div className="w-[148px] shrink-0 border-r border-ink/8 pr-3">{presetsList}</div>}

                  <div className="min-w-0">
                    {hasPresets && months === 1 && (
                      <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]" role="group" aria-label={t('cal.range_presets')}>
                        {presetList.map((p) => {
                          const active = !!committed && !anchor && isSameRange(value, p.range);
                          return (
                            <button
                              key={p.key} type="button" disabled={!p.ok} aria-pressed={active}
                              onClick={() => { if (p.range) { onChange(p.range); close(); } }}
                              className={cn(
                                'flex h-8 shrink-0 items-center gap-1 whitespace-nowrap rounded-pill border px-3 text-xs font-semibold outline-none transition',
                                'focus-visible:ring-2 focus-visible:ring-brand-500/50 disabled:cursor-not-allowed disabled:opacity-35',
                                active ? 'border-brand-500 bg-brand-50 text-brand-link' : 'border-ink/15 text-ink-soft hover:bg-ink/5',
                              )}
                            >
                              {active && <Check size={13} strokeWidth={3} />}
                              {t(`cal.preset_${p.key}`)}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* สรุปช่วงที่เลือก/กำลังเลือก */}
                    <div className="mb-3 flex items-center gap-2 text-xs" aria-live="polite">
                      <span className="rounded-lg bg-ink/[.05] px-2.5 py-1.5 font-semibold tabular-nums">{shown ? formatYmd(shown.from, lang) : t('cal.range_start')}</span>
                      <span aria-hidden className="text-ink-mute">→</span>
                      <span className={cn('rounded-lg px-2.5 py-1.5 font-semibold tabular-nums', anchor && !hover ? 'border border-dashed border-brand-500/60 text-brand-link' : 'bg-ink/[.05]')}>
                        {anchor && !hover ? t('cal.range_pick_end') : shown ? formatYmd(shown.to, lang) : t('cal.range_end')}
                      </span>
                      {shown && <span className="ml-auto text-ink-mute">{t('cal.range_days', { n: rangeLength({ from: toYmd(shown.from), to: toYmd(shown.to) }) })}</span>}
                    </div>

                    <div className="flex" style={{ gap: MONTH_GAP }} onMouseLeave={() => setHover(null)}>
                      {Array.from({ length: months }, (_, i) => {
                        const mv = addMonths(view.y, view.m, i);
                        const grid = monthGrid(mv.y, mv.m);
                        return (
                          <div key={`${mv.y}-${mv.m}`} style={{ width: MONTH_W }} role="grid" aria-label={`${monthNames[mv.m - 1]} ${displayYear(mv.y, lang)}`} onKeyDown={onGridKey}>
                            <div className="mb-2 flex items-center">
                              {i === 0 ? (
                                <button type="button" onClick={navPrev} aria-label={t('cal.prev_month')} className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft transition hover:bg-brand-50 hover:text-brand-link"><ChevronLeft size={18} /></button>
                              ) : <span className="h-8 w-8" />}
                              <span className="flex-1 text-center text-sm font-extrabold" aria-live="polite">{monthNames[mv.m - 1]} {displayYear(mv.y, lang)}</span>
                              {i === months - 1 ? (
                                <button type="button" onClick={navNext} aria-label={t('cal.next_month')} className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft transition hover:bg-brand-50 hover:text-brand-link"><ChevronRight size={18} /></button>
                              ) : <span className="h-8 w-8" />}
                            </div>
                            <div role="row" className="mb-1 grid grid-cols-7">
                              {WEEKDAYS[lang].map((w, d) => (
                                <span key={w} role="columnheader" className={cn('py-1 text-center text-[11px] font-bold', d === 0 ? 'text-danger-600' : 'text-ink-mute')}>{w}</span>
                              ))}
                            </div>
                            <div className="grid grid-cols-7 gap-y-0.5">
                              {grid.map((c, idx) => {
                                if (!c.inMonth) return <div key={toYmd(c)} aria-hidden className="h-9" />;
                                const col = idx % 7;
                                const inBand = !!shown && inRange(c, shown.from, shown.to);
                                const isStart = !!shown && cmpYmd(c, shown.from) === 0;
                                const isEnd = !!shown && cmpYmd(c, shown.to) === 0;
                                const edge = isStart || isEnd;
                                const single = !!shown && cmpYmd(shown.from, shown.to) === 0;
                                const isToday = cmpYmd(c, today) === 0;
                                const selectable = isSelectable(c, anchor, bounds);
                                const isCursor = cmpYmd(c, cursor) === 0;
                                return (
                                  <div
                                    key={toYmd(c)}
                                    className={cn(
                                      'flex h-9 items-center justify-center',
                                      inBand && !single && (anchor ? 'bg-brand-50' : 'bg-brand-100'),
                                      inBand && !single && (isStart || col === 0) && 'rounded-l-full',
                                      inBand && !single && (isEnd || col === 6) && 'rounded-r-full',
                                    )}
                                  >
                                    <button
                                      type="button" role="gridcell" data-ymd={toYmd(c)}
                                      tabIndex={isCursor ? 0 : -1} aria-disabled={!selectable || undefined} aria-selected={inBand} aria-current={isToday ? 'date' : undefined}
                                      aria-label={`${c.d} ${monthNames[c.m - 1]} ${displayYear(c.y, lang)}`}
                                      onClick={() => pick(c)} onMouseEnter={() => anchor && setHover(c)}
                                      className={cn(
                                        'flex h-9 w-9 items-center justify-center rounded-full text-sm tabular-nums outline-none transition',
                                        edge ? 'bg-brand-600 font-bold text-white shadow-sm' : inBand ? 'text-ink' : selectable && 'hover:bg-brand-50 hover:text-brand-link',
                                        isToday && !edge && 'font-extrabold text-brand-link ring-1 ring-brand-500/50',
                                        !selectable && 'cursor-not-allowed text-ink-mute/30',
                                        'focus-visible:ring-2 focus-visible:ring-brand-500/60',
                                      )}
                                    >
                                      {c.d}
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {(clearable && committed) && (
                      <div className="mt-3 flex items-center justify-end border-t border-ink/8 pt-3">
                        <button type="button" onClick={() => { onChange(null); close(); }} className="rounded-full px-3 py-1.5 text-xs font-semibold text-ink-mute transition hover:bg-ink/5 hover:text-ink">{t('cal.clear')}</button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
