/**
 * ค่าคงที่ + สคริปต์ <head> ของสี CI — ไฟล์นี้ไม่พึ่ง React เพื่อให้ server component (root layout) import ได้
 * (ตัว store/hook อยู่ใน ci-store.ts ซึ่งใช้ได้เฉพาะฝั่ง client)
 */
export const STATE_KEY = 'jb-ci-colors';
export const CSS_KEY = 'jb-ci-css';
export const STYLE_ID = 'ci-theme';

/** ใส่ใน <head> ก่อน React โหลด: ทา CSS สี CI ที่คำนวณไว้แล้วทันที ไม่เห็นสีตั้งต้นกระพริบ · localStorage ใช้ไม่ได้ก็ข้าม */
export const CI_INIT_SCRIPT = `try{var c=localStorage.getItem('${CSS_KEY}');if(c){var s=document.createElement('style');s.id='${STYLE_ID}';s.textContent=c;document.head.appendChild(s)}}catch(e){}`;
