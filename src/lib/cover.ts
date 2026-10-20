/** พาเลตปกคอร์ส 7 สี (มุม 135°) — ตาม docs/program/DESIGN_SYSTEM.md · ใช้เมื่อคอร์สไม่มีรูปปก */
export const COVER_PALETTE: [string, string][] = [
  ['#E8302F', '#FF6B5E'],
  ['#006989', '#3FA3C2'],
  ['#00B295', '#3CCDB4'],
  ['#F5A623', '#FFC453'],
  ['#7B4BC4', '#A47BE6'],
  ['#0E8C8C', '#3CC2C2'],
  ['#D63C76', '#F27AA4'],
];

export function coverGradient(index: number) {
  const [a, b] = COVER_PALETTE[((index % 7) + 7) % 7];
  return `linear-gradient(135deg, ${a}, ${b})`;
}

/** ตัวย่อบนปกจากรหัสคอร์ส: "GMP-101" → "GMP" */
export function coverInitials(code: string) {
  return (code.split(/[-_ .]/)[0] || code).slice(0, 4).toUpperCase();
}
