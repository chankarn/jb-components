'use client';

import { useMemo } from 'react';
import { ArrowDown, ArrowLeftRight, ArrowUp, Plus, RotateCcw, X } from 'lucide-react';
import { Button, Chip, Field, Input } from '@/components/ui';
import { PillSwitch } from '@/components/PillSwitch';
import { ciTheme, parseHex, toHex } from '@/lib/ci-theme';
import { chartPalette, checkPalette, similarCiPairs } from '@/lib/chart-palette';
import { resetCi, setCiState, useCiState } from '@/lib/ci-store';
import { cn } from '@/lib/utils';

/**
 * แผงใส่สี CI: ใส่อย่างน้อย 1 สี (ได้หลายสี) แล้วทั้งแอปเปลี่ยนตามทันที (ทุกหน้า รวมถึง /dashboard)
 * ลำดับของสี = บทบาท (หลัก → รอง → ตกแต่ง) · สลับ/เลื่อนลำดับเพื่อเปลี่ยนว่าสีไหนใช้ตรงไหน
 * ค่าอยู่ใน store กลาง (`lib/ci-store`) จำไว้ในเบราว์เซอร์นี้ — แผงนี้วางกี่หน้าก็ได้ แก้ที่ไหนก็ได้ผลเหมือนกัน
 */
const ROLES = [
  { name: 'สีหลัก', where: 'ปุ่ม แท็บ เส้นใต้ ลิงก์ วงแหวนความคืบหน้า' },
  { name: 'สีรอง', where: 'ภาพประกอบ (โฟลเดอร์ใน EmptyState) ลวดลาย' },
  { name: 'ตกแต่ง', where: 'ลวดลายเสริม จุด/เส้นประใน Backdrop' },
];
const SUGGEST = ['#006989', '#7B4BC4', '#D63C76', '#0E8C8C', '#E8302F', '#3FA3C2', '#F5A623', '#00B295'];

const valid = (s: string) => parseHex(s) !== null;
const norm = (s: string) => toHex(parseHex(s)!);
const rgbOf = (channels: string) => `rgb(${channels.split(' ').join(',')})`;

/** แผงแก้สี CI — แก้ค่าใน store กลาง (`lib/ci-store`) ส่วนการทาสีทั้งแอปทำโดย <CiThemeApplier/> ที่ root layout */
export function CiPanel() {
  const { colors, harmonize: tune, active } = useCiState();

  // ใช้แค่ 3 สีแรก (หลัก/รอง/ตกแต่ง) · สีที่ 4 ขึ้นไปเป็นสำรอง
  const roleKey = colors.slice(0, 3).join('|');
  const theme = useMemo(() => {
    const [primary, secondary, decor] = roleKey.split('|').map((c) => (valid(c) ? norm(c) : undefined));
    return primary ? ciTheme({ primary, secondary, decor, harmonize: tune }) : null;
  }, [roleKey, tune]);

  // สีกราฟ (--chart-N): ช่อง 1–3 ตามสีหลัก/รอง/ตกแต่งที่ระบบสร้าง (หลังปรับโทน) แล้วบีบเข้าเกณฑ์ตาบอดสีของกราฟ
  const chartCi = useMemo(() => {
    const primary = roleKey.split('|')[0];
    return theme && valid(primary) ? { primary: norm(primary), secondary: theme.info.secondary, decor: theme.info.decor } : null;
  }, [roleKey, theme]);
  const chartChecks = useMemo(
    () => (chartCi ? (['light', 'dark'] as const).map((m) => ({ mode: m, hexes: chartPalette(chartCi, m), check: checkPalette(chartPalette(chartCi, m), m) })) : null),
    [chartCi],
  );

  const similar = useMemo(() => (chartChecks ? similarCiPairs(chartChecks[0].hexes.slice(0, 3)) : []), [chartChecks]);

  const update = (next: string[]) => setCiState({ colors: next, active: true });
  const setAt = (i: number, v: string) => update(colors.map((c, j) => (j === i ? v : c)));
  const move = (i: number, d: -1 | 1) => {
    const next = [...colors];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    update(next);
  };
  const add = () => update([...colors, SUGGEST.find((s) => !colors.map((c) => c.toUpperCase()).includes(s)) ?? '#7B4BC4']);
  const remove = (i: number) => update(colors.filter((_, j) => j !== i));
  const reset = () => resetCi();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Chip tone={active ? 'brand' : 'mute'}>{active ? 'กำลังใช้สี CI' : 'ใช้สีตั้งต้นของระบบ'}</Chip>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-2 text-xs font-semibold text-ink-soft">
            ปรับโทนให้เข้ากัน
            <PillSwitch label="ปรับโทนให้เข้ากัน" index={tune ? 1 : 0} onChange={(i) => setCiState({ harmonize: i === 1, active: true })} options={['ปิด', 'เปิด']} />
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

          {chartChecks && (
            <div className="space-y-2 border-t border-ink/10 pt-3">
              <p className="text-xs font-semibold text-ink-soft">สีกราฟ 8 ช่อง (ช่อง 1–3 = สีหลัก/รอง/ตกแต่ง ช่อง 4–8 สร้างจากชุดสีนี้เอง ความสดระดับเดียวกัน)</p>
              {chartChecks.map(({ mode, hexes, check }) => (
                <div key={mode} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="w-12 text-[11px] text-ink-mute">{mode === 'light' ? 'โหมดสว่าง' : 'โหมดมืด'}</span>
                  <span className="flex gap-1">{hexes.map((h, i) => <span key={i} title={h} className="size-5 rounded-md border border-ink/10" style={{ background: h }} />)}</span>
                  <span className={cn('text-[11px] font-semibold', check.ok ? 'text-ok-700' : 'text-danger-700')}>
                    {check.ok ? '✓ ผ่านเกณฑ์ตาบอดสี' : '✗ ไม่ผ่านเกณฑ์'} · ΔE {check.cvd.toFixed(1)}/{check.normal.toFixed(1)}
                  </span>
                  {check.lowContrast.length > 0 && <span className="text-[11px] text-ink-mute">{check.lowContrast.length} สีคอนทราสต์ต่ำ — กราฟมี label/ตารางข้อมูลช่วยอ่านเสมอ</span>}
                </div>
              ))}
              {similar.length > 0 && (
                <p role="alert" className="rounded-lg bg-warn-50 px-3 py-2 text-[11px] font-semibold text-warn-700">
                  ⚠ {similar.map(([i, j]) => `${ROLES[i].name}กับ${ROLES[j].name}`).join(' · ')} ในกราฟแทบแยกกันไม่ออก (ΔE {Math.min(...similar.map((x) => x[2])).toFixed(0)} · ควร ≥ 15) —
                  ลองเปลี่ยนสีใดสีหนึ่งให้ต่างเฉดหรือต่างความสว่างมากขึ้น (เช่น สีอ่อนมากอย่าง Almond จะถูกดันให้เข้มจนกลายเป็นเฉดเดียวกับสีหลัก)
                </p>
              )}
            </div>
          )}
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
