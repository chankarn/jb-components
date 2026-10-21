'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowLeftRight, ArrowUp, Plus, RotateCcw, X } from 'lucide-react';
import { Button, Chip, Field, Input } from '@/components/ui';
import { PillSwitch } from '@/components/PillSwitch';
import { ciTheme, ciThemeCss, parseHex, toHex, DEFAULT_DECOR, DEFAULT_SECONDARY } from '@/lib/ci-theme';
import { cn } from '@/lib/utils';

/**
 * แผงใส่สี CI ของ Gallery: ใส่อย่างน้อย 1 สี (ได้หลายสี) แล้วทั้งหน้าเปลี่ยนตามทันที
 * ลำดับของสี = บทบาท (หลัก → รอง → ตกแต่ง) · สลับ/เลื่อนลำดับเพื่อเปลี่ยนว่าสีไหนใช้ตรงไหน
 * จำค่าไว้ในเบราว์เซอร์นี้ (localStorage) — ใช้ไม่ได้ก็ทำงานต่อโดยไม่จำ
 */
const ROLES = [
  { name: 'สีหลัก', where: 'ปุ่ม แท็บ เส้นใต้ ลิงก์ วงแหวนความคืบหน้า' },
  { name: 'สีรอง', where: 'ภาพประกอบ (โฟลเดอร์ใน EmptyState) ลวดลาย' },
  { name: 'ตกแต่ง', where: 'ลวดลายเสริม จุด/เส้นประใน Backdrop' },
];
const DEFAULT_COLORS = ['#FF0000', DEFAULT_SECONDARY, DEFAULT_DECOR];
const SUGGEST = ['#006989', '#7B4BC4', '#D63C76', '#0E8C8C', '#E8302F', '#3FA3C2', '#F5A623', '#00B295'];
const STORAGE_KEY = 'jb-ci-colors';
const STYLE_ID = 'ci-theme';

type Saved = { colors: string[]; harmonize: boolean; active: boolean };

function load(): Saved | null {
  try {
    const v = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    return v && Array.isArray(v.colors) && v.colors.length ? v : null;
  } catch {
    return null;
  }
}

function save(v: Saved) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(v));
  } catch {
    /* ใช้ได้โดยไม่จำค่า */
  }
}

const valid = (s: string) => parseHex(s) !== null;
const norm = (s: string) => toHex(parseHex(s)!);
const rgbOf = (channels: string) => `rgb(${channels.split(' ').join(',')})`;

export function CiPanel({ onActiveChange }: { onActiveChange?: (active: boolean) => void }) {
  const [colors, setColors] = useState<string[]>(DEFAULT_COLORS);
  const [tune, setTune] = useState(true);
  // false = ใช้สีตั้งต้นของระบบ (globals.css) · true = ใช้สีที่สร้างจาก CI
  const [active, setActive] = useState(false);

  const loaded = useRef(false);
  useEffect(() => {
    const v = load();
    if (v) { setColors(v.colors); setTune(v.harmonize); setActive(v.active); }
    loaded.current = true;
  }, []);

  // ใช้แค่ 3 สีแรก (หลัก/รอง/ตกแต่ง) · สีที่ 4 ขึ้นไปเป็นสำรอง
  const roleKey = colors.slice(0, 3).join('|');
  const theme = useMemo(() => {
    const [primary, secondary, decor] = roleKey.split('|').map((c) => (valid(c) ? norm(c) : undefined));
    return primary ? ciTheme({ primary, secondary, decor, harmonize: tune }) : null;
  }, [roleKey, tune]);

  // เขียน <style> ทับตัวแปรสี · สีหลักผิดรูปแบบชั่วคราว (กำลังพิมพ์) คงธีมล่าสุดไว้
  useEffect(() => {
    if (!active) { document.getElementById(STYLE_ID)?.remove(); return; }
    if (!theme) return;
    let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
    if (!el) { el = document.createElement('style'); el.id = STYLE_ID; document.head.appendChild(el); }
    el.textContent = ciThemeCss(theme);
  }, [active, theme]);
  useEffect(() => () => document.getElementById(STYLE_ID)?.remove(), []);

  useEffect(() => { onActiveChange?.(active); }, [active, onActiveChange]);
  useEffect(() => { if (loaded.current) save({ colors, harmonize: tune, active }); }, [colors, tune, active]);

  const update = (next: string[]) => { setColors(next); setActive(true); };
  const setAt = (i: number, v: string) => update(colors.map((c, j) => (j === i ? v : c)));
  const move = (i: number, d: -1 | 1) => {
    const next = [...colors];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    update(next);
  };
  const add = () => update([...colors, SUGGEST.find((s) => !colors.map((c) => c.toUpperCase()).includes(s)) ?? '#7B4BC4']);
  const remove = (i: number) => update(colors.filter((_, j) => j !== i));
  const reset = () => { setColors(DEFAULT_COLORS); setTune(true); setActive(false); };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Chip tone={active ? 'brand' : 'mute'}>{active ? 'กำลังใช้สี CI' : 'ใช้สีตั้งต้นของระบบ'}</Chip>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-2 text-xs font-semibold text-ink-soft">
            ปรับโทนให้เข้ากัน
            <PillSwitch label="ปรับโทนให้เข้ากัน" index={tune ? 1 : 0} onChange={(i) => { setTune(i === 1); setActive(true); }} options={['ปิด', 'เปิด']} />
          </span>
          {colors.length >= 2 && (
            <Button size="sm" variant="outline" onClick={() => move(0, 1)}><ArrowLeftRight size={14} /> สลับสีหลัก↔สีรอง</Button>
          )}
          <Button size="sm" variant="ghost" onClick={reset}><RotateCcw size={14} /> รีเซ็ต</Button>
        </div>
      </div>

      <ul className="space-y-2">
        {colors.map((c, i) => {
          const ok = valid(c);
          const role = ROLES[i];
          return (
            <li key={i} className="flex flex-wrap items-start gap-3 rounded-2xl border border-ink/10 p-3 sm:flex-nowrap">
              <div className="w-24 shrink-0 pt-1">
                <p className={cn('text-sm font-bold', role ? 'text-ink' : 'text-ink-mute')}>{role?.name ?? `สีที่ ${i + 1}`}</p>
                <p className="text-[11px] leading-snug text-ink-mute">{role ? `#${i + 1}` : 'สำรอง ยังไม่ได้ใช้'}</p>
              </div>
              {/* ช่องสี: กดที่สี่เหลี่ยมเพื่อเปิดตัวเลือกสีของเครื่อง หรือพิมพ์รหัส hex ในช่องข้างๆ */}
              <label className="relative h-12 w-12 shrink-0 cursor-pointer overflow-hidden rounded-2xl border border-ink/15 shadow-card" style={{ background: ok ? norm(c) : 'transparent' }} title="เลือกสี">
                <input type="color" aria-label={`เลือก${role?.name ?? `สีที่ ${i + 1}`}`} value={ok ? norm(c).toLowerCase() : '#000000'} onChange={(e) => setAt(i, e.target.value.toUpperCase())} className="absolute inset-0 cursor-pointer opacity-0" />
              </label>
              <div className="min-w-[9rem] flex-1">
                <Field label="รหัสสี" error={ok ? undefined : 'รหัสสีไม่ถูกต้อง เช่น #D60000'} hint={role?.where}>
                  <Input value={c} onChange={(e) => setAt(i, e.target.value)} spellCheck={false} className="font-mono uppercase" />
                </Field>
              </div>
              <div className="flex shrink-0 gap-1 pt-6">
                <IconBtn label="เลื่อนขึ้น" disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp size={15} /></IconBtn>
                <IconBtn label="เลื่อนลง" disabled={i === colors.length - 1} onClick={() => move(i, 1)}><ArrowDown size={15} /></IconBtn>
                <IconBtn label="ลบสีนี้" disabled={colors.length === 1} onClick={() => remove(i)}><X size={15} /></IconBtn>
              </div>
            </li>
          );
        })}
      </ul>

      <Button size="sm" variant="outline" onClick={add}><Plus size={14} /> เพิ่มสี</Button>

      {theme && (
        <div className="space-y-3 rounded-2xl bg-ink/[.04] p-4">
          <p className="text-xs font-semibold text-ink-soft">ผลลัพธ์ที่ระบบสร้างให้</p>
          <div className="flex flex-wrap items-end gap-1.5">
            {['50', '100', '200', '300', '400', '500', '600', '700'].map((k) => (
              <div key={k} className="flex flex-col items-center gap-1">
                <span className={cn('h-9 w-9 rounded-lg border border-ink/10', theme.info.exactAt === k && 'ring-2 ring-ink ring-offset-2 ring-offset-surface')} style={{ background: rgbOf(theme.light[`brand-${k}`]) }} />
                <span className="text-[10px] tabular-nums text-ink-mute">{k}</span>
              </div>
            ))}
            <span className="ml-2 h-9 rounded-pill px-3 text-xs font-semibold leading-9 text-white" style={{ background: rgbOf(theme.light['brand-600']) }}>
              ตัวหนังสือขาวบน 600 · {theme.info.whiteOn600.toFixed(1)}:1 {theme.info.whiteOn600 >= 4.5 ? '✓' : '✗'}
            </span>
          </div>
          <p className="text-[11px] text-ink-mute">
            กรอบดำ = สี CI ที่ใส่ตรงๆ (ช่อง {theme.info.exactAt}) · {theme.info.exactAt === '500' ? 'สีนี้สดเกินให้ตัวหนังสือขาวทับ ระบบหรี่เป็น 600 ให้ใช้กับปุ่ม' : 'สีนี้เข้มพอให้ตัวหนังสือขาวทับ ระบบใช้เป็น 600 และทำ 500 ให้สดขึ้นสำหรับไอคอน/เส้น'}
          </p>
          <div className="flex flex-wrap gap-4 text-xs text-ink-soft">
            <Swatch label="สีรองที่ใช้จริง" hex={theme.info.secondary} given={colors[1]} tuned={tune} />
            <Swatch label="สีตกแต่งที่ใช้จริง" hex={theme.info.decor} given={colors[2]} tuned={tune} />
          </div>
        </div>
      )}
    </div>
  );
}

function Swatch({ label, hex, given, tuned }: { label: string; hex: string; given?: string; tuned: boolean }) {
  const source = given && valid(given) ? norm(given) : null;
  return (
    <span className="flex items-center gap-2">
      <span className="h-6 w-6 rounded-md border border-ink/10" style={{ background: hex }} />
      {label} <span className="font-mono">{hex}</span>
      <span className="text-ink-mute">{!source ? '(ค่าเริ่มต้น)' : tuned && source !== hex ? `(ปรับจาก ${source})` : ''}</span>
    </span>
  );
}

function IconBtn({ label, disabled, onClick, children }: { label: string; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-label={label} title={label} disabled={disabled} onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-full text-ink-mute transition hover:bg-ink/8 hover:text-ink disabled:pointer-events-none disabled:opacity-30">
      {children}
    </button>
  );
}
