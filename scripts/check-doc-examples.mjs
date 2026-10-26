#!/usr/bin/env node
/**
 * ตรวจว่าตัวอย่างโค้ดในคู่มือ (docs/guide/**.md) compile ผ่านกับคอมโพเนนต์จริง
 * - ทุกบล็อก ```tsx ต้องเป็นไฟล์สมบูรณ์ (มี import เอง) — ถูกเขียนลง .doc-check/ แล้วรัน tsc
 * - บล็อกที่ตั้งใจให้เป็นแค่ท่อนสั้นๆ ให้ใช้ ```tsx-snippet (ไม่ตรวจ)
 * รัน: npm run docs:check
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const GUIDE = path.join(ROOT, 'docs', 'guide');
const OUT = path.join(ROOT, '.doc-check');

const mdFiles = [];
(function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (f.endsWith('.md')) mdFiles.push(p);
  }
})(GUIDE);
mdFiles.push(path.join(ROOT, 'AGENTS.md'));

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
const map = {};
let n = 0;
for (const md of mdFiles) {
  if (!fs.existsSync(md)) continue;
  const text = fs.readFileSync(md, 'utf8');
  const re = /```tsx\n([\s\S]*?)```/g;
  let m;
  while ((m = re.exec(text))) {
    const line = text.slice(0, m.index).split('\n').length;
    // บรรทัดแรกเป็น `// src/...` = ตัวอย่างนี้คือไฟล์นั้น (ตัวอย่างอื่น import ถึงได้ด้วย @/...)
    const declared = m[1].match(/^\/\/ (src\/\S+\.(?:tsx?|ts))/);
    const name = declared ? declared[1] : `ex${String(++n).padStart(3, '0')}.tsx`;
    if (declared) n++;
    fs.mkdirSync(path.dirname(path.join(OUT, name)), { recursive: true });
    fs.writeFileSync(path.join(OUT, name), m[1]);
    map[name] = `${path.relative(ROOT, md)}:${line}`;
  }
}
fs.writeFileSync(path.join(ROOT, 'tsconfig.doc-check.json'), JSON.stringify({
  extends: './tsconfig.json',
  compilerOptions: { incremental: false, noUnusedLocals: false, paths: { '@/*': ['./.doc-check/src/*', './src/*'] } },
  include: ['next-env.d.ts', '.doc-check/**/*.tsx', '.doc-check/**/*.ts'],
}, null, 2));

let ok = true;
try {
  execSync('npx tsc -p tsconfig.doc-check.json --noEmit', { cwd: ROOT, stdio: 'pipe' });
} catch (e) {
  ok = false;
  const out = String(e.stdout || '') + String(e.stderr || '');
  console.error(out.replace(/\.doc-check\/(\S+?\.tsx?)(?=\()/g, (_, f) => `${map[f] ?? f} (${f})`));
}
fs.rmSync(OUT, { recursive: true, force: true });
fs.rmSync(path.join(ROOT, 'tsconfig.doc-check.json'), { force: true });
console.log(ok ? `ตัวอย่างโค้ด ${n} บล็อก compile ผ่านทั้งหมด` : 'มีตัวอย่างที่ compile ไม่ผ่าน (ดูด้านบน)');
process.exit(ok ? 0 : 1);
