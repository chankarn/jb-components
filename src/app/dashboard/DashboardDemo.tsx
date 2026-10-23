'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, RefreshCw, Trophy, Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui';
import { Tabs } from '@/components/Tabs';
import { ThemeToggle } from '@/components/ThemeProvider';
import {
  BarsChart, CalendarHeatmap, calendarTable, ChartCard, ChartLegend, DonutChart, Heatmap, KpiCard, RankList, TrendChart, seriesTable, formatCompact, type Series,
} from '@/components/charts';
import { CiPanel } from '../CiPanel';
import { calendarStats, type DayValue } from '@/lib/calendar-heatmap';
import { addDays, formatYmd, parseYmd, toYmd } from '@/lib/calendar';
import { useLang } from '@/lib/i18n/client';
import { useCiState } from '@/lib/ci-store';

/** ข้อมูลจำลองแบบกำหนดค่าแน่นอน (ไม่ใช้ Math.random — server กับ client ต้องได้ค่าเดียวกัน) */
const wave = (i: number, seed: number) => Math.sin(i * 0.55 + seed) * 0.5 + Math.sin(i * 0.17 + seed * 2.3) * 0.5;
const TH_MONTH = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const dayLabel = (back: number) => {
  const d = new Date(Date.UTC(2026, 9, 21)); // 21 ต.ค. 2026 (ตายตัว)
  d.setUTCDate(d.getUTCDate() - back);
  return `${d.getUTCDate()} ${TH_MONTH[d.getUTCMonth()]}`;
};
const DAYS = Array.from({ length: 90 }, (_, k) => {
  const i = 89 - k;
  return {
    day: dayLabel(i),
    learners: Math.round(420 + 120 * wave(k, 1) + k * 2.2),
    completed: Math.round(210 + 70 * wave(k, 4) + k * 1.1),
    sessions: Math.round(900 + 260 * wave(k, 7) + k * 4),
  };
});

const SERIES: Series[] = [
  { key: 'learners', label: 'ผู้เรียนที่ใช้งาน' },
  { key: 'completed', label: 'เรียนจบ' },
];
const CHANNELS: Series[] = [
  { key: 'web', label: 'เว็บ' },
  { key: 'app', label: 'แอป' },
  { key: 'line', label: 'LINE' },
];
const WEEKS = Array.from({ length: 8 }, (_, i) => ({
  week: `สัปดาห์ ${i + 1}`,
  web: Math.round(620 + 140 * wave(i, 2)),
  app: Math.round(480 + 120 * wave(i, 5)),
  line: Math.round(260 + 90 * wave(i, 9)),
}));
const DEPTS = [
  { dept: 'ผลิต', value: 1860 }, { dept: 'คลังสินค้า', value: 1420 }, { dept: 'ควบคุมคุณภาพ', value: 1180 },
  { dept: 'ขนส่ง', value: 940 }, { dept: 'บัญชี', value: 610 }, { dept: 'บุคคล', value: 420 },
];
const COURSES = [
  { label: 'GMP พื้นฐาน', value: 1284, hint: '92% จบ' }, { label: 'HACCP สำหรับหัวหน้างาน', value: 1043, hint: '88% จบ' },
  { label: 'ความปลอดภัยในโรงงาน', value: 962, hint: '95% จบ' }, { label: 'การจัดการสารเคมี', value: 731, hint: '81% จบ' },
  { label: 'อาชีวอนามัยเบื้องต้น', value: 598, hint: '79% จบ' },
];
const SOURCES = [
  { label: 'ผลิต', value: 1860 }, { label: 'คลังสินค้า', value: 1420 }, { label: 'ควบคุมคุณภาพ', value: 1180 }, { label: 'ขนส่ง', value: 940 },
  { label: 'บัญชี', value: 610 }, { label: 'บุคคล', value: 420 }, { label: 'ซ่อมบำรุง', value: 300 }, { label: 'ความปลอดภัย', value: 190 },
];
const WEEKDAYS = ['จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.', 'อา.'];
const HOURS = Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, '0')}`);
const HEAT = WEEKDAYS.map((_, r) =>
  HOURS.map((_, h) => {
    const work = r < 5 ? 1 : 0.25;
    const peak = Math.exp(-((h - 10) ** 2) / 10) + 0.7 * Math.exp(-((h - 14) ** 2) / 8) + 0.3 * Math.exp(-((h - 20) ** 2) / 6);
    return Math.max(0, Math.round(work * peak * 90 + 6 * (wave(h + r * 3, r) + 1)));
  }),
);

/** กิจกรรมรายวัน 1 ปี (ปลาย 21 ต.ค. 2026) แบบกำหนดค่าแน่นอน: วันธรรมดาเยอะกว่า มีช่วงหยุดยาวและช่วงต่อเนื่อง */
const ACTIVITY: DayValue[] = Array.from({ length: 365 }, (_, i) => {
  const date = toYmd(addDays({ y: 2025, m: 10, d: 22 }, i));
  const dow = new Date(Date.UTC(2025, 9, 22 + i)).getUTCDay();
  const off = (i > 60 && i < 71) || (i > 188 && i < 193) || i === 364; // ช่วงหยุด + วันสุดท้าย (วันนี้ยังไม่ทันทำ) ว่าง → streak ปัจจุบันนับถอยจากเมื่อวาน ไม่ขาด
  const base = dow === 0 || dow === 6 ? 2 : 9;
  const v = off ? 0 : Math.max(0, Math.round(base * (0.55 + 0.45 * wave(i, 6)) + (i % 37 === 0 ? 14 : 0) + (i > 250 && i < 290 ? 4 : 0)));
  return { date, value: i % 11 === 4 && dow !== 0 && dow !== 6 && !off ? 0 : v };
});

export function DashboardDemo() {
  const [range, setRange] = useState<'7' | '30' | '90'>('30');
  const [loading, setLoading] = useState(false);
  const [admin, setAdmin] = useState(false);
  const ci = useCiState().active;
  const { lang } = useLang();
  const stats = useMemo(() => calendarStats(ACTIVITY), []);
  const fmtDay = (d: string | null) => (d ? formatYmd(parseYmd(d)!, lang) : '');

  const rows = useMemo(() => DAYS.slice(-Number(range)), [range]);
  const sum = (k: 'learners' | 'completed' | 'sessions') => rows.reduce((s, r) => s + r[k], 0);
  const half = Math.floor(rows.length / 2);
  const delta = (k: 'learners' | 'completed' | 'sessions') => {
    const a = rows.slice(0, half).reduce((s, r) => s + r[k], 0);
    const b = rows.slice(half).reduce((s, r) => s + r[k], 0);
    return Math.round(((b - a) / a) * 1000) / 10;
  };
  const refresh = () => { setLoading(true); window.setTimeout(() => setLoading(false), 1200); };

  return (
    <div {...(admin ? { 'data-surface': 'admin' } : {})} className="mx-auto max-w-6xl space-y-5 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex size-9 items-center justify-center rounded-full bg-ink/[.06] text-ink-soft transition hover:bg-ink/10" aria-label="กลับหน้า Gallery"><ArrowLeft size={16} /></Link>
          <h1 className="text-2xl font-semibold">Dashboard ตัวอย่าง</h1>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-ink-soft">
            <input type="checkbox" checked={admin} disabled={ci} onChange={(e) => setAdmin(e.target.checked)} /> admin surface{ci && ' (ปิดอยู่ระหว่างใช้สี CI)'}
          </label>
          <ThemeToggle />
        </div>
      </header>

      <details className="group rounded-card bg-surface shadow-card">
        <summary className="cursor-pointer list-none px-5 py-3.5 text-sm font-semibold text-ink-soft marker:hidden">สี CI — ลองเปลี่ยนสีแล้วดูกราฟทั้งหน้าเปลี่ยนตาม</summary>
        <div className="border-t border-ink/10 p-5"><CiPanel /></div>
      </details>

      {/* ตัวกรองอยู่แถวเดียวเหนือเนื้อหาที่มันควบคุม และควบคุมทุกการ์ดข้างล่างพร้อมกัน */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs aria-label="ช่วงเวลา" value={range} onChange={setRange} items={[{ key: '7', label: '7 วัน' }, { key: '30', label: '30 วัน' }, { key: '90', label: '90 วัน' }]} />
        <Button size="sm" variant="outline" onClick={refresh} disabled={loading}><RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> รีเฟรช</Button>
      </div>

      <section aria-label="ตัวเลขสรุป" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={<Users size={16} />} label="ผู้เรียนที่ใช้งาน" value={formatCompact(Math.round(sum('learners') / rows.length))} hint="เฉลี่ยต่อวัน" delta={delta('learners')} deltaLabel="เทียบช่วงก่อน" trend={rows.map((r) => r.learners)} />
        <KpiCard icon={<Trophy size={16} />} label="เรียนจบ" value={formatCompact(sum('completed'))} unit="คน" delta={delta('completed')} deltaLabel="เทียบช่วงก่อน" trend={rows.map((r) => r.completed)} />
        <KpiCard icon={<BookOpen size={16} />} label="คอร์สที่เปิดสอน" value="48" delta={4.3} deltaLabel="เทียบเดือนก่อน" hint="เพิ่ม 2 คอร์ส" />
        <KpiCard icon={<Clock size={16} />} label="เวลาเรียนเฉลี่ย" value="38" unit="นาที" delta={-6.1} goodWhen="up" deltaLabel="เทียบช่วงก่อน" trend={rows.map((r, i) => 38 + 6 * wave(i, 3))} />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <ChartCard
          className="lg:col-span-2" title="ผู้เรียนรายวัน" description={`${rows[0].day} – ${rows[rows.length - 1].day}`} loading={loading}
          table={seriesTable(rows, 'day', SERIES, { xLabel: 'วันที่' })}
        >
          <TrendChart data={rows} xKey="day" series={SERIES} variant="area" target={{ value: 600, label: 'เป้าหมาย 600' }} />
        </ChartCard>

        <ChartCard title="สัดส่วนผู้เรียนตามแผนก" description="รวมทุกช่วง · ชิ้นที่เล็กรวมเป็น อื่นๆ" loading={loading}
          table={{ columns: ['แผนก', 'ผู้เรียน'], rows: SOURCES.map((s) => [s.label, String(s.value)]) }}>
          <DonutChart data={SOURCES} centerLabel="ผู้เรียนทั้งหมด" className="py-2" size={190} />
        </ChartCard>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="การเข้าใช้งานตามช่องทาง" description="รายสัปดาห์ · ซ้อนกัน" loading={loading} legend={<ChartLegend series={CHANNELS} />}
          table={seriesTable(WEEKS, 'week', CHANNELS, { xLabel: 'สัปดาห์' })}
        >
          <BarsChart data={WEEKS} xKey="week" series={CHANNELS} stacked showLegend={false} xFormat={(w) => w.replace('สัปดาห์ ', 'ส.')} />
        </ChartCard>

        <ChartCard
          title="ผู้เรียนตามแผนก" description="เน้นแผนกที่มากที่สุด · ที่เหลือเป็นสีเทา" loading={loading}
          table={{ columns: ['แผนก', 'ผู้เรียน'], rows: DEPTS.map((d) => [d.dept, String(d.value)]) }}
        >
          <BarsChart data={DEPTS} xKey="dept" series={[{ key: 'value', label: 'ผู้เรียน' }]} orientation="bar" highlight="ผลิต" labels categoryWidth={104} />
        </ChartCard>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <ChartCard title="คอร์สยอดนิยม" description="5 อันดับแรก" loading={loading}>
          <RankList items={COURSES} />
        </ChartCard>
        <ChartCard className="lg:col-span-2" title="ช่วงเวลาที่ใช้งาน" description="วันในสัปดาห์ × ชั่วโมง · จำนวนเซสชัน" loading={loading}>
          <Heatmap data={HEAT} rowLabels={WEEKDAYS} colLabels={HOURS} colTickEvery={3} valueLabel="เซสชัน" />
        </ChartCard>
      </section>

      <section aria-label="กิจกรรมรายวันทั้งปี" className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="กิจกรรมทั้งปี" value={formatCompact(stats.total)} unit="ครั้ง" hint={`${fmtDay(ACTIVITY[0].date)} – ${fmtDay(ACTIVITY[ACTIVITY.length - 1].date)}`} />
          <KpiCard label="วันที่ขยันที่สุด" value={stats.busiest?.value ?? 0} unit="ครั้ง" hint={fmtDay(stats.busiest?.date ?? null)} />
          <KpiCard label="เรียนต่อเนื่องยาวสุด" value={stats.longest.length} unit="วัน" hint={`${fmtDay(stats.longest.start)} – ${fmtDay(stats.longest.end)}`} />
          <KpiCard label="เรียนต่อเนื่องตอนนี้" value={stats.current.length} unit="วัน" hint={stats.current.length ? `${fmtDay(stats.current.start)} – ${fmtDay(stats.current.end)}` : undefined} />
        </div>
        <ChartCard
          title="กิจกรรมการเรียนรายวัน" description="ตลอด 12 เดือนที่ผ่านมา · ใช้ลูกศรเลื่อนวัน/สัปดาห์ได้" loading={loading}
          table={calendarTable(ACTIVITY, { lang, dateLabel: 'วันที่', valueLabel: 'ครั้ง' })}
        >
          <CalendarHeatmap days={ACTIVITY} valueLabel="ครั้ง" label="กิจกรรมการเรียนรายวัน" />
        </ChartCard>
      </section>

      <ChartCard title="คอลัมน์เดี่ยวแบบมีตัวเลขที่ปลายแท่ง" description="ซีรีส์เดียว · เน้นสัปดาห์ที่ 6" loading={loading} empty={false}>
        <BarsChart data={WEEKS} xKey="week" series={[{ key: 'web', label: 'เว็บ' }]} highlight="สัปดาห์ 6" labels height={220} xFormat={(w) => w.replace('สัปดาห์ ', 'ส.')} />
      </ChartCard>
    </div>
  );
}
