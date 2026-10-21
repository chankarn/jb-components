import type { Config } from 'tailwindcss';

/**
 * สีทั้งหมดอ้างตัวแปร CSS (ดู src/app/globals.css) เพื่อให้ฝั่งหลังบ้านสลับ `brand` เป็นโทน Cerulean
 * ได้ด้วยการตั้ง data-surface="admin" ที่เดียว ทุกคอมโพเนนต์ที่ใช้ร่วมกันเปลี่ยนตามเอง
 *
 * กติกาการใช้ `brand`
 *   500 = สีสด (#FF0000) ใช้กับไอคอน เส้น แถบความคืบหน้า พื้นที่ตกแต่ง  — ขาวบนสีนี้ได้ 4.0:1 ไม่พอสำหรับตัวหนังสือเล็ก
 *   600 = สีที่มีตัวหนังสือขาวทับ (ปุ่ม แถบหัว แท็บที่เลือก)
 *   link = ตัวหนังสือ/ลิงก์สีแบรนด์ (ใช้ text-brand-link ไม่ใช่ text-brand-600 เพราะ dark mode ต้องสว่างขึ้น)
 *   surface = พื้นการ์ด/ช่องกรอก (แทน bg-white)
 */
const channel = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;
const scale = (prefix: string, steps: number[]) =>
  Object.fromEntries(steps.map((n) => [n, channel(`${prefix}-${n}`)]));

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // หลังบ้านเปลี่ยนเป็น drawer ที่ < 900px (FR-A-01 ข้อ 7)
      screens: { adm: '900px' },
      // ต้นทางใช้ `/8` (bg-ink/8, border-ink/8 …) แต่สเกลเริ่มต้นของ Tailwind ไม่มี 8 คลาสเหล่านั้นเลยไม่ถูกสร้าง — เพิ่มไว้ที่นี่
      opacity: { 8: '0.08' },
      colors: {
        brand: { ...scale('brand', [50, 100, 200, 300, 400, 500, 600, 700]), link: channel('brand-link') },
        // สถานะ ใช้ซ้ำทั้งหน้าบ้านและหลังบ้าน ไม่ขึ้นกับสีแบรนด์ (หลังบ้านแบรนด์เป็นฟ้า แต่ error ต้องยังเป็นแดง)
        ok: scale('ok', [50, 500, 600, 700]),
        warn: scale('warn', [50, 500, 600, 700]),
        danger: scale('danger', [50, 100, 500, 600, 700]),
        ink: {
          DEFAULT: channel('ink'),
          soft: channel('ink-soft'),
          mute: channel('ink-mute'),
        },
        // สีตกแต่ง (สีรอง/สีที่สามของ CI) ใช้กับภาพประกอบและลวดลาย ไม่ใช้กับข้อความ
        accent: { DEFAULT: channel('accent-500'), 2: channel('accent2-500') },
        paper: channel('paper'),
        surface: channel('surface'),
        state: {
          done: channel('ok-500'),
          progress: channel('warn-500'),
          overdue: channel('danger-600'),
          idle: channel('ink-mute'),
        },
      },
      fontFamily: {
        sans: ['Anuphan', '"Noto Sans Thai"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Kanit', 'Anuphan', '"Noto Sans Thai"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '18px',
        pill: '999px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(37,31,71,.06), 0 8px 24px -16px rgba(37,31,71,.24)',
        lift: '0 2px 6px rgba(37,31,71,.08), 0 16px 32px -20px rgba(37,31,71,.35)',
      },
      keyframes: {
        pop: { '0%': { transform: 'scale(.96)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
      },
      animation: { pop: 'pop .16s ease-out' },
    },
  },
  plugins: [],
} satisfies Config;
