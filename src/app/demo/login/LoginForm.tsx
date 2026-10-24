'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, Mail, Milk } from 'lucide-react';
import { Field, Input } from '@/components/ui';
import { Checkbox } from '@/components/Choice';
import { PasswordInput } from '@/components/admin/PasswordFields';
import { LoadingButton, type LoadingStatus } from '@/components/Loading';
import { LoginBackdrop } from '@/components/BlobArt';
import { ThemeToggle } from '@/components/ThemeProvider';
import { toast } from '@/components/feedback';
import { shake } from '@/lib/motion-fx';
import { DEMO_ACCOUNT, getSession, signIn } from '../_lib/store';

/** หน้าเข้าสู่ระบบของ flow ตัวอย่าง (บัญชีทดลอง — ไม่ได้ส่งข้อมูลไปที่ไหน) */
export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next')?.startsWith('/demo') ? params.get('next')! : '/demo';
  const card = React.useRef<HTMLDivElement>(null);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [remember, setRemember] = React.useState(true);
  const [errors, setErrors] = React.useState<{ email?: string; password?: string }>({});
  const [failure, setFailure] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<LoadingStatus>('idle');

  // เข้าสู่ระบบอยู่แล้ว → ไปหน้าหลักเลย
  React.useEffect(() => { if (getSession()) router.replace(next); }, [router, next]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (status === 'loading') return;
    const err: typeof errors = {};
    if (!email.trim()) err.email = 'กรุณากรอกอีเมล';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) err.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    if (!password) err.password = 'กรุณากรอกรหัสผ่าน';
    setErrors(err);
    setFailure(null);
    if (Object.keys(err).length) return;
    setStatus('loading');
    try {
      const s = await signIn(email, password, remember);
      setStatus('success');
      toast.success(`ยินดีต้อนรับ ${s.name}`);
      setTimeout(() => router.replace(next), 650);
    } catch (ex) {
      setStatus('error');
      setFailure(ex instanceof Error ? ex.message : 'เข้าสู่ระบบไม่สำเร็จ');
      shake(card.current);
      setTimeout(() => setStatus('idle'), 1400);
    }
  }

  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden px-4 py-10">
      <LoginBackdrop />
      <div className="absolute left-4 right-4 top-4 flex items-center justify-between sm:left-6 sm:right-6">
        <Link href="/" className="inline-flex items-center gap-1.5 rounded-pill bg-surface/80 px-3 py-1.5 text-xs font-semibold text-ink-soft shadow-card backdrop-blur transition hover:text-ink">
          <ArrowLeft size={14} /> กลับหน้า Gallery
        </Link>
        <ThemeToggle />
      </div>

      <motion.div
        ref={card}
        initial={{ opacity: 0, y: 24, scale: 0.97, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        className="relative w-full max-w-[26rem] rounded-[28px] bg-surface/95 p-7 shadow-[0_30px_80px_-24px_rgb(0_0_0/0.35),0_0_0_1px_rgb(var(--ink)/0.06)] backdrop-blur sm:p-9"
      >
        <div className="mb-7 flex flex-col items-center text-center">
          <span className="mb-4 grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-[0_12px_28px_-10px_rgb(var(--brand-600)/0.7)]">
            <Milk size={26} />
          </span>
          <h1 className="text-2xl font-bold tracking-tight">เข้าสู่ระบบ</h1>
          <p className="mt-1 text-sm text-ink-mute">Dairy Admin · ระบบจัดการสินค้า (ตัวอย่าง)</p>
        </div>

        <form noValidate onSubmit={submit} className="space-y-4">
          <Field label="อีเมล" error={errors.email}>
            <div className="relative">
              <Mail aria-hidden size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-mute" />
              <Input
                type="email" autoComplete="username" value={email} placeholder="name@company.com" className="pl-11"
                onChange={(e) => { setEmail(e.target.value); setErrors((x) => ({ ...x, email: undefined })); setFailure(null); }}
              />
            </div>
          </Field>
          <Field label="รหัสผ่าน" error={errors.password} as="div">
            <PasswordInput value={password} autoComplete="current-password" onChange={(v) => { setPassword(v); setErrors((x) => ({ ...x, password: undefined })); setFailure(null); }} />
          </Field>
          <div className="flex items-center justify-between gap-3">
            <Checkbox size="sm" label="จดจำการเข้าสู่ระบบ" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            <button type="button" onClick={() => toast.info('หน้าตัวอย่าง: ยังไม่มีขั้นตอนรีเซ็ตรหัสผ่าน')} className="text-xs font-semibold text-brand-link hover:underline">
              ลืมรหัสผ่าน?
            </button>
          </div>

          <AnimatePresence initial={false}>
            {failure && (
              <motion.p
                role="alert" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 overflow-hidden rounded-xl bg-danger-50 px-3 text-sm font-medium text-danger-700"
              >
                <AlertCircle size={16} className="my-2.5 shrink-0" /> <span className="py-2.5">{failure}</span>
              </motion.p>
            )}
          </AnimatePresence>

          <LoadingButton type="submit" status={status} loadingText="กำลังตรวจสอบ" successText="สำเร็จ" errorText="ไม่สำเร็จ" className="w-full">
            เข้าสู่ระบบ
          </LoadingButton>
        </form>

        <div className="mt-6 rounded-2xl border border-dashed border-ink/15 p-3.5 text-xs text-ink-mute">
          <p className="font-semibold text-ink-soft">บัญชีทดลอง (หน้าตัวอย่าง)</p>
          <p className="mt-1 font-mono">{DEMO_ACCOUNT.email} · {DEMO_ACCOUNT.password}</p>
          <button
            type="button" onClick={() => { setEmail(DEMO_ACCOUNT.email); setPassword(DEMO_ACCOUNT.password); setErrors({}); setFailure(null); }}
            className="mt-2 font-semibold text-brand-link hover:underline"
          >
            กรอกให้อัตโนมัติ
          </button>
        </div>
      </motion.div>
    </div>
  );
}
