import { describe, it, expect } from 'vitest';
import { ariaShortcut, detectMac, formatShortcut, isModEvent, shortcutKeys } from '@/lib/platform';

describe('platform: detectMac', () => {
  it('userAgentData ก่อน platform · iPad/iPhone นับเป็น Apple · Windows/Linux ไม่ใช่', () => {
    expect(detectMac({ userAgentData: { platform: 'macOS' }, platform: 'Win32' })).toBe(true);
    expect(detectMac({ platform: 'MacIntel' })).toBe(true);
    expect(detectMac({ userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)' })).toBe(true);
    expect(detectMac({ userAgentData: { platform: 'Windows' } })).toBe(false);
    expect(detectMac({ platform: 'Linux x86_64' })).toBe(false);
    expect(detectMac(undefined)).toBe(false);
  });
});

describe('platform: isModEvent', () => {
  const ev = (o: Partial<{ metaKey: boolean; ctrlKey: boolean; altKey: boolean }>) => ({ metaKey: false, ctrlKey: false, altKey: false, ...o });
  it('Mac: ⌘ เท่านั้น (Ctrl ไม่นับ)', () => {
    expect(isModEvent(ev({ metaKey: true }), true)).toBe(true);
    expect(isModEvent(ev({ ctrlKey: true }), true)).toBe(false);
  });
  it('Windows: Ctrl เท่านั้น (ปุ่ม Windows ไม่นับ)', () => {
    expect(isModEvent(ev({ ctrlKey: true }), false)).toBe(true);
    expect(isModEvent(ev({ metaKey: true }), false)).toBe(false);
  });
  it('กด Alt ร่วม (AltGr) ไม่นับ', () => {
    expect(isModEvent(ev({ ctrlKey: true, altKey: true }), false)).toBe(false);
    expect(isModEvent(ev({ metaKey: true, altKey: true }), true)).toBe(false);
  });
});

describe('platform: formatShortcut', () => {
  it('Mac ใช้สัญลักษณ์ติดกัน · Windows ใช้ชื่อปุ่มคั่นด้วย +', () => {
    expect(formatShortcut('mod+K', true)).toBe('⌘K');
    expect(formatShortcut('mod+K', false)).toBe('Ctrl+K');
    expect(formatShortcut('mod+shift+p', true)).toBe('⌘⇧P');
    expect(formatShortcut('mod+shift+p', false)).toBe('Ctrl+Shift+P');
    expect(formatShortcut('mod+,', false)).toBe('Ctrl+,');
  });
  it('ปุ่มพิเศษ · รูปแบบเก่า ⌘X', () => {
    expect(formatShortcut('del', true)).toBe('⌫');
    expect(formatShortcut('del', false)).toBe('Backspace');
    expect(formatShortcut('esc', false)).toBe('Esc');
    expect(formatShortcut('⌘S', false)).toBe('Ctrl+S');
    expect(shortcutKeys('mod+enter', true)).toEqual(['⌘', '↵']);
  });
  it('ariaShortcut', () => {
    expect(ariaShortcut('mod+K', true)).toBe('Meta+K');
    expect(ariaShortcut('mod+shift+k', false)).toBe('Control+Shift+K');
  });
});
