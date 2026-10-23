'use client';

import * as React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n/client';
import { addTags, splitTags, tagKey } from '@/lib/tags';
import { shake as shakeEl } from '@/lib/motion-fx';

type Variant = 'brand' | 'colorful';

export type TagInputProps = {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  /** จำนวนแท็กสูงสุด (แสดงตัวนับ n/max) */
  max?: number;
  /** ความยาวสูงสุดต่อแท็ก */
  maxLength?: number;
  /** ตรวจแท็กก่อนเพิ่ม (เช่น รูปแบบอีเมล) · ไม่ผ่าน = ช่องสั่นพร้อมข้อความ `invalidText` */
  validate?: (tag: string) => boolean;
  invalidText?: string;
  /** แปลงก่อนเพิ่ม เช่น ตัด # หรือทำเป็นตัวเล็ก */
  transform?: (tag: string) => string;
  /** `colorful` = ชิปแต่ละแท็กได้สีประจำตัว (จากชุดสีกราฟที่ตามสี CI · แท็กเดิมได้สีเดิมเสมอ) */
  variant?: Variant;
  disabled?: boolean;
  id?: string;
  className?: string;
  'aria-label'?: string;
};

const SPRING = { type: 'spring' as const, stiffness: 520, damping: 26, mass: 0.7 };

/** แท็กเดิม → สีเดิมเสมอ (แฮชชื่อ → ช่องสี 1–8) */
function hue(tag: string) {
  let h = 0;
  for (const ch of tagKey(tag)) h = (h * 31 + ch.codePointAt(0)!) >>> 0;
  return (h % 8) + 1;
}

/**
 * TagInput: พิมพ์แล้วกด Enter หรือ comma เป็นชิป
 * - วางข้อความหลายบรรทัด/คั่นด้วย comma → แตกเป็นหลายแท็กทีเดียว
 * - ชิปเด้งเข้าแบบสปริงพร้อมวงกระเพื่อม · ลบแล้วหดหาย ชิปที่เหลือเลื่อนเข้าที่นุ่มๆ
 * - พิมพ์ซ้ำ → ชิปเดิมสั่นบอกว่ามีแล้ว · ไม่ผ่าน `validate`/ยาวเกิน → ช่องสั่น + ข้อความ
 * - Backspace ตอนช่องว่าง: ครั้งแรกเล็งชิปท้าย (ขอบแดง) ครั้งที่สองลบ
 * - คีย์บอร์ด: ← จากช่องว่างเข้าไปเลือกชิป · ← → เลื่อน · Backspace/Delete ลบ · Enter/F2 หรือดับเบิลคลิกแก้ไขชิป · Esc ยกเลิกการแก้
 * - ประกาศการเพิ่ม/ลบ/ซ้ำผ่าน aria-live · ใช้กับ Field ได้ (กรอบแดงตอน error)
 */
export function TagInput({
  value, onChange, placeholder, max, maxLength, validate, invalidText, transform, variant = 'brand', disabled, id, className, 'aria-label': ariaLabel,
}: TagInputProps) {
  const t = useT();
  const reduce = useReducedMotion();
  const box = React.useRef<HTMLDivElement>(null);
  const input = React.useRef<HTMLInputElement>(null);
  const chips = React.useRef(new Map<string, HTMLElement>());
  const [text, setText] = React.useState('');
  const [armed, setArmed] = React.useState(false); // Backspace ครั้งแรกเล็งชิปท้าย
  const [editing, setEditing] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [announce, setAnnounce] = React.useState('');
  const [fresh, setFresh] = React.useState<Set<string>>(new Set()); // เพิ่งเพิ่ม → เล่นวงกระเพื่อม
  const full = max != null && value.length >= max;

  // ชิปที่เพิ่งเพิ่มเล่นวงกระเพื่อม (CSS 700ms) แล้วล้างทิ้ง
  const flashTimer = React.useRef<ReturnType<typeof setTimeout>>(undefined);
  const flash = (tags: string[]) => {
    clearTimeout(flashTimer.current);
    setFresh(new Set(tags));
    flashTimer.current = setTimeout(() => setFresh(new Set()), 750);
  };
  React.useEffect(() => () => clearTimeout(flashTimer.current), []);

  const shake = shakeEl;

  function commit(raw: string[]) {
    const r = addTags(value, raw, { max, maxLength, validate, transform });
    if (r.added.length) {
      onChange(r.tags);
      flash(r.added);
      setAnnounce(t('tag.added', { name: r.added.join(', ') }));
    }
    r.duplicates.forEach((d) => shake(chips.current.get(d)));
    if (r.duplicates.length && !r.added.length) setAnnounce(t('tag.duplicate', { name: r.duplicates.join(', ') }));
    if (r.invalid.length || r.overflow.length) {
      shake(box.current);
      setError(r.invalid.length ? (invalidText ?? t('tag.invalid', { name: r.invalid.join(', ') })) : t('tag.max', { n: max ?? 0 }));
    } else setError(null);
    return r;
  }

  function remove(tag: string, focusAfter?: 'prev' | 'next' | 'input') {
    const i = value.indexOf(tag);
    const next = value.filter((x) => x !== tag);
    onChange(next);
    setArmed(false);
    setError(null);
    setAnnounce(t('tag.removed', { name: tag }));
    requestAnimationFrame(() => {
      const target = focusAfter === 'prev' ? next[Math.max(0, i - 1)] : focusAfter === 'next' ? next[i] : undefined;
      if (target !== undefined && focusAfter !== 'input') chips.current.get(target)?.focus();
      else input.current?.focus();
    });
  }

  function onInputKey(e: React.KeyboardEvent<HTMLInputElement>) {
    const caretAtStart = e.currentTarget.selectionStart === 0 && e.currentTarget.selectionEnd === 0;
    if ((e.key === 'Enter' || e.key === ',' || (e.key === 'Tab' && text.trim())) && !e.nativeEvent.isComposing) {
      if (!text.trim()) { if (e.key !== 'Tab') e.preventDefault(); return; }
      e.preventDefault();
      commit(splitTags(text));
      setText('');
    } else if (e.key === 'Backspace' && !text && value.length) {
      e.preventDefault();
      if (armed) remove(value[value.length - 1], 'input');
      else setArmed(true);
    } else if (e.key === 'ArrowLeft' && caretAtStart && value.length) {
      e.preventDefault();
      setArmed(false);
      chips.current.get(value[value.length - 1])?.focus();
    } else if (e.key === 'Escape' && (text || armed)) {
      e.stopPropagation();
      setText('');
      setArmed(false);
    } else if (armed) setArmed(false);
  }

  function onChipKey(e: React.KeyboardEvent, tag: string, i: number) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); chips.current.get(value[Math.max(0, i - 1)])?.focus(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); if (i === value.length - 1) input.current?.focus(); else chips.current.get(value[i + 1])?.focus(); }
    else if (e.key === 'Backspace') { e.preventDefault(); remove(tag, i > 0 ? 'prev' : value.length > 1 ? 'next' : 'input'); }
    else if (e.key === 'Delete') { e.preventDefault(); remove(tag, i < value.length - 1 ? 'next' : i > 0 ? 'prev' : 'input'); }
    else if (e.key === 'Enter' || e.key === 'F2') { e.preventDefault(); if (!disabled) setEditing(tag); }
  }

  function finishEdit(old: string, raw: string, keepFocus = true) {
    setEditing(null);
    const v = (transform ? transform(raw) : raw).trim().replace(/\s+/g, ' ');
    if (!v || v === old) { if (keepFocus) requestAnimationFrame(() => chips.current.get(old)?.focus()); return; }
    const others = value.filter((x) => x !== old);
    const dup = others.find((x) => tagKey(x) === tagKey(v));
    if (dup) { shake(chips.current.get(dup)); setAnnounce(t('tag.duplicate', { name: dup })); return; }
    if ((maxLength != null && v.length > maxLength) || (validate && !validate(v))) {
      shake(box.current);
      setError(invalidText ?? t('tag.invalid', { name: v }));
      return;
    }
    setError(null);
    onChange(value.map((x) => (x === old ? v : x)));
    flash([v]);
    if (keepFocus) requestAnimationFrame(() => chips.current.get(v)?.focus());
  }

  return (
    <div className={cn('space-y-1.5', className)}>
      <div
        ref={box} data-tag-input
        onMouseDown={(e) => { if (e.target === e.currentTarget) { e.preventDefault(); input.current?.focus(); } }}
        className={cn(
          'flex min-h-12 w-full cursor-text flex-wrap items-center gap-1.5 rounded-2xl border bg-surface px-2.5 py-2 text-sm transition-[border-color,box-shadow]',
          'focus-within:border-brand-500 focus-within:shadow-glow',
          error ? 'border-danger-500 focus-within:!shadow-glow-danger' : 'border-ink/15',
          disabled && 'pointer-events-none opacity-50',
        )}
      >
        <AnimatePresence initial={false} mode="popLayout">
          {value.map((tag, i) => {
            const n = hue(tag);
            const colorful = variant === 'colorful';
            const isArmed = armed && i === value.length - 1;
            if (editing === tag) {
              return (
                <motion.input
                  key={`edit-${tag}`} layout autoFocus defaultValue={tag} aria-label={t('tag.edit', { name: tag })}
                  size={Math.max(4, tag.length + 1)}
                  onFocus={(e) => e.currentTarget.select()} // เปิดแก้แล้วเลือกข้อความทั้งหมด (พิมพ์ทับได้ทันที แบบเปลี่ยนชื่อไฟล์)
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); finishEdit(tag, e.currentTarget.value); }
                    else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); setEditing(null); requestAnimationFrame(() => chips.current.get(tag)?.focus()); }
                  }}
                  onBlur={(e) => { if (editing === tag) finishEdit(tag, e.currentTarget.value, false); }}
                  className="h-7 min-w-0 rounded-lg border border-brand-500 bg-surface px-2 text-sm outline-none ring-4 ring-brand-500/15"
                />
              );
            }
            return (
              <motion.span
                key={tag} layout={!reduce}
                ref={(el: HTMLElement | null) => { if (el) chips.current.set(tag, el); else chips.current.delete(tag); }}
                initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.4, y: 6, filter: 'blur(4px)' }}
                animate={{ opacity: 1, scale: isArmed ? 1.06 : 1, y: 0, filter: 'blur(0px)' }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.3, filter: 'blur(4px)', transition: { duration: 0.18 } }}
                transition={SPRING}
                tabIndex={-1} role="button" aria-label={tag}
                aria-description={t('tag.hint')}
                onKeyDown={(e) => onChipKey(e, tag, i)}
                onDoubleClick={() => { if (!disabled) setEditing(tag); }}
                style={colorful ? { ['--tag' as string]: `var(--chart-${n})` } : undefined}
                className={cn(
                  'tag-chip group relative inline-flex h-7 max-w-full select-none items-center gap-1.5 rounded-lg pl-2.5 pr-1 font-medium outline-none transition-[background-color,box-shadow,color]',
                  colorful ? 'border border-[rgb(var(--tag)/0.35)] bg-[rgb(var(--tag)/0.12)] text-ink' : 'bg-brand-100 text-brand-link',
                  'focus-visible:ring-2 focus-visible:ring-brand-500/60',
                  isArmed && '!border-transparent !bg-danger-600 !text-white shadow-[0_0_0_4px_rgb(var(--danger-500)/0.2)]',
                )}
              >
                {fresh.has(tag) && !reduce && <span aria-hidden className="tag-ripple pointer-events-none absolute inset-0 rounded-[inherit]" />}
                {colorful && !isArmed && <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-[rgb(var(--tag))]" />}
                <span className="truncate">{tag}</span>
                <button
                  type="button" tabIndex={-1} aria-label={t('tag.remove', { name: tag })}
                  onClick={(e) => { e.stopPropagation(); remove(tag); }}
                  className="grid size-5 shrink-0 place-items-center rounded-md opacity-60 transition hover:bg-ink/10 hover:opacity-100"
                >
                  <X size={12} strokeWidth={2.6} />
                </button>
              </motion.span>
            );
          })}
        </AnimatePresence>
        <input
          ref={input} id={id} value={text} disabled={disabled} aria-label={ariaLabel}
          aria-invalid={error ? true : undefined}
          placeholder={full ? t('tag.full', { n: max ?? 0 }) : value.length ? '' : (placeholder ?? t('tag.placeholder'))}
          readOnly={full}
          onChange={(e) => {
            const v = e.target.value;
            setArmed(false);
            // พิมพ์/IME ใส่ comma มาท้ายคำ → ตัดเป็นแท็กทันที
            if (/[,，、]$/.test(v)) { commit(splitTags(v)); setText(''); return; }
            setText(v);
          }}
          onPaste={(e) => {
            const pasted = e.clipboardData.getData('text');
            if (!/[,，、;\n\t]/.test(pasted)) return; // คำเดียว → ให้วางลงช่องตามปกติ
            e.preventDefault();
            commit(splitTags(text + pasted));
            setText('');
          }}
          onKeyDown={onInputKey}
          onBlur={() => { setArmed(false); if (text.trim()) { commit(splitTags(text)); setText(''); } }}
          className="h-7 min-w-[6rem] flex-1 border-0 bg-transparent px-1 outline-none placeholder:text-ink-mute/60 read-only:cursor-default"
        />
        {max != null && (
          <span aria-hidden className={cn('ml-auto shrink-0 pr-1 text-[11px] font-semibold tabular-nums transition-colors', full ? 'text-warn-700' : 'text-ink-mute')}>
            {value.length}/{max}
          </span>
        )}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            role="alert" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            className="text-[11px] font-semibold text-danger-700"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
      <span aria-live="polite" className="sr-only">{announce}</span>
    </div>
  );
}
