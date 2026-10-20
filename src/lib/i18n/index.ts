import { th, type DictKey } from './dict.th';
import { en } from './dict.en';

export type Lang = 'th' | 'en';
export const LANG_COOKIE = 'lang';
export const DEFAULT_LANG: Lang = 'th';
export type { DictKey };

export function isLang(v: unknown): v is Lang {
  return v === 'th' || v === 'en';
}

const dicts: Record<Lang, Record<DictKey, string>> = { th, en };

export type Translate = (key: DictKey, vars?: Record<string, string | number>) => string;

/** แปลข้อความ — ถ้าภาษานั้นไม่มีคีย์ ถอยกลับไปใช้ไทย (FR-L-16) แล้วค่อยถอยเป็นตัวคีย์เอง */
export function translate(lang: Lang, key: DictKey, vars?: Record<string, string | number>): string {
  const raw = dicts[lang]?.[key] || th[key] || key;
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (m, name: string) => (name in vars ? String(vars[name]) : m));
}

export function makeT(lang: Lang): Translate {
  return (key, vars) => translate(lang, key, vars);
}

export const dictionaries = dicts;
