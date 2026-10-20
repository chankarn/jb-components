'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { Moon, Sun } from 'lucide-react';
import { PillSwitch } from '@/components/PillSwitch';
import { useT } from '@/lib/i18n/client';

export type ThemeChoice = 'light' | 'dark';
const STORAGE_KEY = 'theme';

/** ทำงานก่อน React โหลด เพื่อไม่ให้หน้ากระพริบสีผิดโทน — localStorage อาจใช้ไม่ได้ (โหมดส่วนตัว) จึงครอบ try/catch */
export const THEME_INIT_SCRIPT = `try{var t=localStorage.getItem('${STORAGE_KEY}');document.documentElement.setAttribute('data-theme',t==='dark'?'dark':'light')}catch(e){}`;

function read(): ThemeChoice {
  try {
    const t = localStorage.getItem(STORAGE_KEY);
    return t === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function apply(choice: ThemeChoice) {
  const root = document.documentElement;
  root.setAttribute('data-theme', choice);
  try {
    localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    /* ใช้ได้โดยไม่จำค่า */
  }
}

const Ctx = createContext<{ choice: ThemeChoice; setChoice: (c: ThemeChoice) => void }>({ choice: 'light', setChoice: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [choice, setChoiceState] = useState<ThemeChoice>('light');
  useEffect(() => setChoiceState(read()), []);
  const setChoice = useCallback((c: ThemeChoice) => {
    // เปิดอนิเมชันสีชั่วคราวเฉพาะตอนกดสลับ ให้ทั้งหน้าไล่สีไปพร้อมกับปุ่มที่เลื่อน (ไม่เปิดตลอดเพื่อไม่ให้ hover ช้า)
    const root = document.documentElement;
    root.classList.add('theme-fade');
    window.setTimeout(() => root.classList.remove('theme-fade'), 400);
    setChoiceState(c);
    apply(c);
  }, []);
  return <Ctx.Provider value={{ choice, setChoice }}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);

/** สวิตช์สว่าง/มืด — ค่าเริ่มต้นคือสว่าง ไม่ตามระบบเครื่อง */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const { choice, setChoice } = useTheme();
  const t = useT();
  return (
    <PillSwitch
      className={className}
      label={`${t('theme.switch')}: ${t(`theme.${choice}`)}`}
      index={choice === 'dark' ? 1 : 0}
      onChange={(i) => setChoice(i === 1 ? 'dark' : 'light')}
      options={[<Sun key="l" size={14} />, <Moon key="d" size={14} />]}
    />
  );
}
