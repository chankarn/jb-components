import { describe, it, expect } from 'vitest';
import { formatDuration, mediaKind, stepIndex, swipeDirection } from '@/lib/media';

describe('media', () => {
  it('mediaKind: type มาก่อน · นามสกุล (มี query ได้) · data:video · blob ไม่มี type = รูป', () => {
    expect(mediaKind('blob:http://x/abc', 'video/quicktime')).toBe('video');
    expect(mediaKind('https://x/clip.MP4?token=1')).toBe('video');
    expect(mediaKind('https://x/a.webm#t=2')).toBe('video');
    expect(mediaKind('https://x/photo.jpg')).toBe('image');
    expect(mediaKind('data:video/mp4;base64,AAA')).toBe('video');
    expect(mediaKind('blob:http://x/abc')).toBe('image');
    expect(mediaKind('https://x/a.mp4', 'image')).toBe('image');
  });
  it('formatDuration', () => {
    expect(formatDuration(5)).toBe('0:05');
    expect(formatDuration(75.4)).toBe('1:15');
    expect(formatDuration(3725)).toBe('1:02:05');
    expect(formatDuration(NaN)).toBe('');
    expect(formatDuration(undefined)).toBe('');
  });
  it('stepIndex วนรอบ', () => {
    expect(stepIndex(4, 1, 5)).toBe(0);
    expect(stepIndex(0, -1, 5)).toBe(4);
    expect(stepIndex(0, 1, 0)).toBe(0);
  });
  it('swipeDirection', () => {
    expect(swipeDirection(-300, 0, 1000)).toBe(1);
    expect(swipeDirection(300, 0, 1000)).toBe(-1);
    expect(swipeDirection(-40, -900, 1000)).toBe(1);
    expect(swipeDirection(-100, 0, 1000)).toBe(0);
  });
});
