'use client';

import { FacebookMark, LineMark } from '@/components/BrandMarks';
import { ExpandButton } from '@/components/ExpandButton';
import { useT } from '@/lib/i18n/client';
import { cn } from '@/lib/utils';

/**
 * ปุ่มแชร์ LINE / Facebook (ย้ายมาจากหน้า /fortune ของ wunped)
 * - แชร์ลิงก์อย่างเดียว: ทั้งสองแพลตฟอร์มไม่ให้เติมข้อความให้แล้ว สิ่งที่โชว์ในโพสต์มาจาก Open Graph ของหน้านั้น
 * - `url` ไม่ใส่ = หน้าปัจจุบัน · สีพื้นเป็นสีแบรนด์ของ LINE/Facebook เอง ไม่ตามสี CI
 * - ปุ่มเป็นวงกลมไอคอนที่ยืดเป็นแคปซูลโชว์ข้อความเมื่อชี้ (จอสัมผัสโชว์เป็นแคปซูลตลอด)
 */
export function ShareButtons({ url, className }: { url?: string; className?: string }) {
  const t = useT();
  const target = () => encodeURIComponent(url ?? window.location.href);
  const open = (href: string) => window.open(href, '_blank', 'noopener,noreferrer,width=640,height=640');

  return (
    <div className={cn('flex flex-wrap items-center justify-center gap-2.5', className)}>
      <ExpandButton
        icon={<LineMark className="h-6 w-6" />}
        label={t('share.line')}
        className="bg-[#06C755] text-white"
        onClick={() => open(`https://social-plugins.line.me/lineit/share?url=${target()}`)}
      />
      <ExpandButton
        icon={<FacebookMark className="h-6 w-6" />}
        label={t('share.facebook')}
        expandedWidth={220}
        className="bg-[#1877F2] text-white"
        onClick={() => open(`https://www.facebook.com/sharer/sharer.php?u=${target()}`)}
      />
    </div>
  );
}
