'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CalendarDays, ChevronLeft, ChevronRight, Clock, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLang, useT } from '@/lib/i18n/client';
import {
  MONTHS_FULL, MONTHS_SHORT, WEEKDAYS, addDays, addMonths, clampYmd, cmpYmd, displayYear, formatYmd, monthGrid, outOfRange, pad2, parseYmd, todayYmd, toYmd, type YMD,
} from '@/lib/calendar';

type Variant = 'field' | 'pill' | 'compact';
const TRIGGER: Record<Variant, string> = {
  field: 'h-12 rounded-2xl px-4 text-sm',
  pill: 'h-10 rounded-pill px-4 text-sm',
  compact: 'h-9 rounded-lg px-3 text-xs',
};

type Props = {
  /** `YYYY-MM-DD` (หรือ `YYYY-MM-DDTHH:mm` เมื่อ withTime) — ค่าว่าง = ยังไม่เลือก */
  value: string;
  onChange: (v: string) => void;
  /** ขอบเขตวันที่เลือกได้ `YYYY-MM-DD` */
  min?: string;
  max?: string;
  withTime?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  placeholder?: string;
  variant?: Variant;
  className?: string;
  id?: string;
  'aria-label'?: string;
};

/**
 * ปฏิทินเลือกวันที่ (แทน <input type="date"> ของเบราว์เซอร์ที่หน้าตาไม่เหมือนกันทุกเครื่อง)
 * - ไทยแสดงปี พ.ศ. · อังกฤษแสดง ค.ศ. แต่ค่าที่ส่งออกเป็น ISO (ค.ศ.) เสมอ
 * - คีย์บอร์ด: ลูกศรเลื่อนวัน/สัปดาห์ · PageUp/PageDown เปลี่ยนเดือน · Home/End ต้น/ท้ายสัปดาห์ · Enter เลือก · Esc ปิด
 * - วาดผ่าน portal และพลิกขึ้นบนเองเมื่อล่างจอไม่พอ จึงใช้ใน dialog/drawer/ตารางได้
 */
export function DatePicker({ value, onChange, min, max, withTime, clearable, disabled, placeholder, variant = 'field', className, id, ...rest }: Props) {
  const t = useT();
  const { lang } = useLang();
  const reduce = useReducedMotion();
  const uid = React.useId();
  const trigger = React.useRef<HTMLButtonElement>(null);
  const panel = React.useRef<HTMLDivElement>(null);

  const minY = parseYmd(min);
  const maxY = parseYmd(max);
  const selected = parseYmd(value);
  const time = withTime ? (/T(\d{2}):(\d{2})/.exec(value)?.slice(1, 3).map(Number) ?? [0, 0]) : [0, 0];

  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState<'days' | 'months' | 'years'>('days');
  const [view, setView] = React.useState<{ y: number; m: number }>(() => ({ y: (selected ?? todayYmd()).y, m: (selected ?? todayYmd()).m }));
  const [cursor, setCursor] = React.useState<YMD>(() => selected ?? todayYmd());
  const [yearPage, setYearPage] = React.useState(0);
  const [pos, setPos] = React.useState<{ left: number; top?: number; bottom?: number } | null>(null);

  const out = (v: string) => (withTime ? `${v}T${pad2(time[0])}:${pad2(time[1])}` : v);

  const place = React.useCallback(() => {
    const r = trigger.current?.getBoundingClientRect();
    if (!r) return;
    const width = 312;
    const height = withTime ? 430 : 380;
    const flip = window.innerHeight - r.bottom < height + 16 && r.top > window.innerHeight - r.bottom;
    const left = Math.min(Math.max(8, r.left), window.innerWidth - width - 8);
    setPos({ left, ...(flip ? { bottom: window.innerHeight - r.top + 6 } : { top: r.bottom + 6 }) });
  }, [withTime]);

  function show() {
    if (disabled) return;
    const start = clampYmd(selected ?? todayYmd(), minY, maxY);
    setView({ y: start.y, m: start.m });
    setCursor(start);
    setMode('days');
    place();
    setOpen(true);
  }
  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) trigger.current?.focus();
  };

  // ปิดเมื่อคลิกนอกปฏิทิน/เลื่อนหน้า/ย่อขยายจอ
  React.useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => {
      const el = e.target as Node;
      if (!panel.current?.contains(el) && !trigger.current?.contains(el)) setOpen(false);
    };
    // เลื่อนหน้า/ย่อขยายจอ: ตามตำแหน่งช่องไปเรื่อยๆ ไม่ปิด (dialog ที่เลื่อนได้ เลื่อนเองตอนโฟกัส ถ้าปิดทุกครั้งที่เลื่อนจะปิดทันทีที่เปิด)
    const follow = () => place();
    document.addEventListener('mousedown', down);
    window.addEventListener('scroll', follow, true);
    window.addEventListener('resize', follow);
    return () => {
      document.removeEventListener('mousedown', down);
      window.removeEventListener('scroll', follow, true);
      window.removeEventListener('resize', follow);
    };
  }, [open, place]);

  // ย้ายโฟกัสไปวันที่ cursor ชี้ (roving tabindex)
  React.useEffect(() => {
    if (open && mode === 'days') panel.current?.querySelector<HTMLElement>(`[data-ymd="${toYmd(cursor)}"]`)?.focus({ preventScroll: true });
  }, [open, mode, cursor, view.y, view.m]);

  function pick(c: YMD) {
    if (outOfRange(c, minY, maxY)) return;
    onChange(out(toYmd(c)));
    if (!withTime) close();
  }

  function moveCursor(next: YMD) {
    const c = clampYmd(next, minY, maxY);
    setCursor(c);
    setView({ y: c.y, m: c.m });
  }

  function onGridKey(e: React.KeyboardEvent) {
    const k = e.key;
    const delta = k === 'ArrowLeft' ? -1 : k === 'ArrowRight' ? 1 : k === 'ArrowUp' ? -7 : k === 'ArrowDown' ? 7 : 0;
    if (delta) { e.preventDefault(); moveCursor(addDays(cursor, delta)); }
    else if (k === 'PageUp' || k === 'PageDown') {
      e.preventDefault();
      const nm = addMonths(cursor.y, cursor.m, k === 'PageUp' ? -1 : 1);
      moveCursor({ y: nm.y, m: nm.m, d: Math.min(cursor.d, new Date(Date.UTC(nm.y, nm.m, 0)).getUTCDate()) });
    } else if (k === 'Home' || k === 'End') {
      e.preventDefault();
      const wd = new Date(Date.UTC(cursor.y, cursor.m - 1, cursor.d)).getUTCDay();
      moveCursor(addDays(cursor, k === 'Home' ? -wd : 6 - wd));
    } else if (k === 'Enter' || k === ' ') { e.preventDefault(); pick(cursor); }
  }

  const onPanelKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      // ไม่ปล่อยให้ Esc ลามไปปิด dialog/drawer ที่ครอบอยู่
      e.stopPropagation();
      e.preventDefault();
      if (mode !== 'days') setMode('days');
      else close();
    }
  };

  const today = todayYmd();
  const grid = React.useMemo(() => monthGrid(view.y, view.m), [view.y, view.m]);
  const monthNames = MONTHS_FULL[lang];
  const yearStart = Math.floor(view.y / 12) * 12 + yearPage * 12;

  const label = selected ? `${formatYmd(selected, lang)}${withTime ? ` ${pad2(time[0])}:${pad2(time[1])}` : ''}` : '';
  const nav = (d: -1 | 1) => {
    if (mode === 'days') { const n = addMonths(view.y, view.m, d); setView(n); }
    else if (mode === 'years') setYearPage((p) => p + d);
    else setView((v) => ({ ...v, y: v.y + d }));
  };
  const prevLabel = mode === 'years' ? t('cal.prev_years') : t('cal.prev_month');
  const nextLabel = mode === 'years' ? t('cal.next_years') : t('cal.next_month');

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
          <span className={cn('min-w-0 flex-1 truncate', !label && 'text-ink-mute/70', clearable && selected && 'mr-7')}>{label || placeholder || t('cal.pick_date')}</span>
          <CalendarDays size={variant === 'compact' ? 14 : 16} className={cn('shrink-0 text-ink-mute transition-colors', open && 'text-brand-link')} />
        </button>
        {clearable && selected && !disabled && (
          <button type="button" aria-label={t('cal.clear')} onClick={() => onChange('')} className="absolute right-9 top-1/2 -translate-y-1/2 rounded-full p-1 text-ink-mute hover:bg-ink/5 hover:text-ink">
            <X size={13} />
          </button>
        )}
      </div>

      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {open && pos && (
              <motion.div data-floating
                ref={panel} id={uid} role="dialog" aria-label={t('cal.pick_date')} onKeyDown={onPanelKey}
                initial={reduce ? false : { opacity: 0, y: pos.bottom !== undefined ? 6 : -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, transition: { duration: 0.12 } }} transition={{ duration: 0.16, ease: 'easeOut' }}
                style={{ position: 'fixed', left: pos.left, top: pos.top, bottom: pos.bottom }}
                className="z-[300] w-[312px] overflow-hidden rounded-3xl border border-ink/10 bg-surface p-4 text-ink shadow-lift"
              >
                <div className="mb-3 flex items-center gap-1">
                  <button type="button" onClick={() => nav(-1)} aria-label={prevLabel} className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft transition hover:bg-brand-50 hover:text-brand-link"><ChevronLeft size={18} /></button>
                  <button
                    type="button" aria-label={t('cal.choose_month_year')} aria-live="polite"
                    onClick={() => { setYearPage(0); setMode((m) => (m === 'days' ? 'months' : m === 'months' ? 'years' : 'days')); }}
                    className="flex-1 rounded-full px-2 py-1.5 text-center text-sm font-extrabold transition hover:bg-brand-50"
                  >
                    {mode === 'days' && `${monthNames[view.m - 1]} ${displayYear(view.y, lang)}`}
                    {mode === 'months' && `${displayYear(view.y, lang)}`}
                    {mode === 'years' && `${displayYear(yearStart, lang)} - ${displayYear(yearStart + 11, lang)}`}
                  </button>
                  <button type="button" onClick={() => nav(1)} aria-label={nextLabel} className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft transition hover:bg-brand-50 hover:text-brand-link"><ChevronRight size={18} /></button>
                </div>

                {mode === 'days' && (
                  <div role="grid" aria-label={`${monthNames[view.m - 1]} ${displayYear(view.y, lang)}`} onKeyDown={onGridKey}>
                    <div role="row" className="mb-1 grid grid-cols-7">
                      {WEEKDAYS[lang].map((w, i) => (
                        <span key={w} role="columnheader" className={cn('py-1.5 text-center text-[11px] font-bold', i === 0 ? 'text-danger-600' : 'text-ink-mute')}>{w}</span>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-y-0.5">
                      {grid.map((c) => {
                        const isSel = !!selected && cmpYmd(c, selected) === 0;
                        const isToday = cmpYmd(c, today) === 0;
                        const off = outOfRange(c, minY, maxY);
                        const isCursor = cmpYmd(c, cursor) === 0;
                        return (
                          <button
                            key={toYmd(c)} type="button" role="gridcell" data-ymd={toYmd(c)}
                            tabIndex={isCursor ? 0 : -1} disabled={off} aria-selected={isSel} aria-current={isToday ? 'date' : undefined}
                            aria-label={`${c.d} ${monthNames[c.m - 1]} ${displayYear(c.y, lang)}`}
                            onClick={() => { setCursor(c); pick(c); }}
                            className={cn(
                              'mx-auto flex h-10 w-10 items-center justify-center rounded-full text-sm tabular-nums outline-none transition',
                              !c.inMonth && 'text-ink-mute/45',
                              !isSel && !off && 'hover:bg-brand-50 hover:text-brand-link',
                              isToday && !isSel && 'font-extrabold text-brand-link ring-1 ring-brand-500/50',
                              isSel && 'bg-brand-600 font-bold text-white shadow-sm',
                              off && 'cursor-not-allowed text-ink-mute/30 line-through decoration-ink/20',
                              'focus-visible:ring-2 focus-visible:ring-brand-500/60',
                            )}
                          >
                            {c.d}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {mode === 'months' && (
                  <div className="grid grid-cols-3 gap-2">
                    {MONTHS_SHORT[lang].map((name, i) => {
                      const first: YMD = { y: view.y, m: i + 1, d: 1 };
                      const last: YMD = { y: view.y, m: i + 1, d: new Date(Date.UTC(view.y, i + 1, 0)).getUTCDate() };
                      const off = outOfRange(last, minY, null) || outOfRange(first, null, maxY);
                      const isSel = !!selected && selected.y === view.y && selected.m === i + 1;
                      return (
                        <button key={name} type="button" disabled={off} onClick={() => { setView({ y: view.y, m: i + 1 }); setCursor(clampYmd({ y: view.y, m: i + 1, d: Math.min(cursor.d, last.d) }, minY, maxY)); setMode('days'); }}
                          className={cn('h-11 rounded-xl text-sm font-semibold transition', isSel ? 'bg-brand-600 text-white' : 'hover:bg-brand-50 hover:text-brand-link', view.m === i + 1 && !isSel && 'ring-1 ring-brand-500/50', off && 'cursor-not-allowed opacity-30 hover:bg-transparent')}>
                          {name}
                        </button>
                      );
                    })}
                  </div>
                )}

                {mode === 'years' && (
                  <div className="grid grid-cols-3 gap-2">
                    {Array.from({ length: 12 }, (_, i) => yearStart + i).map((y) => {
                      const off = (!!minY && y < minY.y) || (!!maxY && y > maxY.y);
                      const isSel = !!selected && selected.y === y;
                      return (
                        <button key={y} type="button" disabled={off} onClick={() => { setView((v) => ({ ...v, y })); setMode('months'); }}
                          className={cn('h-11 rounded-xl text-sm font-semibold tabular-nums transition', isSel ? 'bg-brand-600 text-white' : 'hover:bg-brand-50 hover:text-brand-link', y === today.y && !isSel && 'ring-1 ring-brand-500/50', off && 'cursor-not-allowed opacity-30 hover:bg-transparent')}>
                          {displayYear(y, lang)}
                        </button>
                      );
                    })}
                  </div>
                )}

                {withTime && mode === 'days' && (
                  <div className="mt-3 flex items-center gap-2 border-t border-ink/8 pt-3">
                    <Clock size={15} className="text-ink-mute" />
                    <span className="mr-auto text-xs font-semibold text-ink-soft">{t('cal.time')}</span>
                    <select aria-label={t('cal.hour')} disabled={!selected} value={time[0]} onChange={(e) => selected && onChange(`${toYmd(selected)}T${pad2(Number(e.target.value))}:${pad2(time[1])}`)}
                      className="h-9 rounded-lg border border-ink/15 bg-surface px-2 text-sm tabular-nums outline-none focus:border-brand-500 disabled:opacity-40">
                      {Array.from({ length: 24 }, (_, h) => <option key={h} value={h}>{pad2(h)}</option>)}
                    </select>
                    <span className="font-bold">:</span>
                    <select aria-label={t('cal.minute')} disabled={!selected} value={time[1]} onChange={(e) => selected && onChange(`${toYmd(selected)}T${pad2(time[0])}:${pad2(Number(e.target.value))}`)}
                      className="h-9 rounded-lg border border-ink/15 bg-surface px-2 text-sm tabular-nums outline-none focus:border-brand-500 disabled:opacity-40">
                      {[...new Set([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, time[1]])].sort((a, b) => a - b).map((m) => <option key={m} value={m}>{pad2(m)}</option>)}
                    </select>
                  </div>
                )}

                <div className="mt-3 flex items-center justify-between border-t border-ink/8 pt-3">
                  <button
                    type="button" disabled={outOfRange(today, minY, maxY)}
                    onClick={() => { moveCursor(today); pick(today); }}
                    className="rounded-full px-3 py-1.5 text-xs font-bold text-brand-link transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent"
                  >
                    {t('cal.today')}
                  </button>
                  <div className="flex items-center gap-1">
                    {clearable && selected && (
                      <button type="button" onClick={() => { onChange(''); close(); }} className="rounded-full px-3 py-1.5 text-xs font-semibold text-ink-mute transition hover:bg-ink/5 hover:text-ink">{t('cal.clear')}</button>
                    )}
                    {withTime && (
                      <button type="button" onClick={() => close()} className="rounded-full bg-brand-600 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-brand-700">{t('cal.done')}</button>
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
