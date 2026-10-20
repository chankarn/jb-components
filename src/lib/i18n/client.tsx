'use client';

import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { makeT, type Lang, type Translate } from './index';
import { formatDate, formatDateTime } from './format';

type Ctx = { lang: Lang; t: Translate };
const I18nContext = createContext<Ctx>({ lang: 'th', t: makeT('th') });

/** ครอบที่ root layout — ส่งภาษาที่ server อ่านจาก cookie ลงมาให้ client component */
export function I18nProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  const value = useMemo(() => ({ lang, t: makeT(lang) }), [lang]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useT() {
  return useContext(I18nContext).t;
}

export function useLang() {
  const { lang } = useContext(I18nContext);
  const fmtDate = useCallback((v: Parameters<typeof formatDate>[0]) => formatDate(v, lang), [lang]);
  const fmtDateTime = useCallback((v: Parameters<typeof formatDateTime>[0]) => formatDateTime(v, lang), [lang]);
  return { lang, formatDate: fmtDate, formatDateTime: fmtDateTime };
}
