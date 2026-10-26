#!/usr/bin/env node
/**
 * สร้างเอกสาร API ของคอมโพเนนต์/ฟังก์ชันจากโค้ดจริงด้วย TypeScript compiler → docs/api/*.md
 * ดึง: คำอธิบาย (JSDoc) ของแต่ละ export · props ทุกตัวพร้อมชนิด ค่าตั้งต้น และคำอธิบาย · type ที่ export
 * รัน: npm run docs:api (รันใหม่ทุกครั้งที่แก้ props — เอกสารจะตรงกับโค้ดเสมอ)
 */
import ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, 'docs', 'api');

// ไฟล์ที่ทำเอกสาร (เรียงตามหมวด) — เพิ่มไฟล์ใหม่ที่นี่
const GROUPS = [
  ['พื้นฐานและฟอร์ม', ['ui.tsx', 'FieldMessage.tsx', 'Choice.tsx', 'SegmentedControl.tsx', 'Slider.tsx', 'NumberInput.tsx', 'Select.tsx', 'Combobox.tsx', 'TagInput.tsx', 'DatePicker.tsx', 'DateRangePicker.tsx', 'OtpInput.tsx', 'FileDrop.tsx', 'admin/ImagePicker.tsx', 'admin/PasswordFields.tsx']],
  ['หน้าต่างลอยและการแจ้งเตือน', ['Overlay.tsx', 'Popover.tsx', 'Tooltip.tsx', 'DropdownMenu.tsx', 'CommandPalette.tsx', 'HelpTip.tsx', 'feedback.tsx', 'Toaster.tsx']],
  ['การนำทางและโครงหน้า', ['AppShell.tsx', 'Tabs.tsx', 'Breadcrumb.tsx', 'Stepper.tsx', 'Accordion.tsx', 'PillSwitch.tsx', 'ThemeProvider.tsx', 'Kbd.tsx']],
  ['แสดงข้อมูลและหลังบ้าน', ['admin/kit.tsx', 'admin/RowMenu.tsx', 'Table.tsx', 'StatusBadge.tsx', 'Avatar.tsx', 'EmptyState.tsx', 'ProgressRing.tsx', 'AnimatedNumber.tsx', 'Loading.tsx', 'ExpandButton.tsx', 'ShareButtons.tsx']],
  ['สื่อและการเคลื่อนไหว', ['MediaLightbox.tsx', 'Carousel.tsx', 'Marquee.tsx', 'BlobArt.tsx']],
  ['กราฟและแดชบอร์ด', ['charts/ChartCard.tsx', 'charts/TrendChart.tsx', 'charts/BarsChart.tsx', 'charts/DonutChart.tsx', 'charts/Heatmap.tsx', 'charts/CalendarHeatmap.tsx', 'charts/KpiCard.tsx', 'charts/Sparkline.tsx', 'charts/RankList.tsx', 'charts/theme.tsx']],
  ['บล็อกหน้าบ้าน (landing/marketing)', ['blocks/Reveal.tsx', 'blocks/SiteNav.tsx', 'blocks/Hero.tsx', 'blocks/Sections.tsx', 'blocks/Closing.tsx']],
  ['ฟังก์ชันช่วย (lib)', ['../lib/utils.ts', '../lib/motion-fx.ts', '../lib/platform.ts', '../lib/toast-store.ts', '../lib/ci-theme.ts', '../lib/ci-store.ts', '../lib/chart-palette.ts', '../lib/chart-math.ts', '../lib/calendar.ts', '../lib/media.ts', '../lib/tags.ts', '../lib/file-drop.ts', '../lib/placement.ts']],
];

const configPath = path.join(ROOT, 'tsconfig.json');
const cfg = ts.parseJsonConfigFileContent(ts.readConfigFile(configPath, ts.sys.readFile).config, ts.sys, ROOT);
const files = GROUPS.flatMap(([, fs]) => fs).map((f) => path.join(ROOT, 'src', 'components', f));
const program = ts.createProgram(files, { ...cfg.options, noEmit: true });
const checker = program.getTypeChecker();
const fmt = ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope | ts.TypeFormatFlags.WriteArrowStyleSignature;

const isOurs = (decl) => decl && !decl.getSourceFile().fileName.includes('node_modules');
const doc = (sym) => ts.displayPartsToString(sym.getDocumentationComment(checker)).trim();
const esc = (s) => s.replace(/\|/g, '\\|').replace(/\n+/g, ' ').replace(/\s{2,}/g, ' ');
const LIT = ts.TypeFlags.StringLiteral | ts.TypeFlags.NumberLiteral | ts.TypeFlags.BooleanLiteral | ts.TypeFlags.Undefined | ts.TypeFlags.Null;
const shortType = (t) => {
  // union ของค่าคงที่ (เช่น type Variant = 'field' | 'pill') → แสดงค่าจริง ไม่ใช่ชื่อ alias ที่ผู้อ่านไม่รู้จัก
  if (t.isUnion() && t.types.every((x) => x.flags & LIT)) {
    const vals = t.types.filter((x) => !(x.flags & ts.TypeFlags.Undefined)).map((x) => checker.typeToString(x));
    const set = new Set(vals);
    const out = set.has('true') && set.has('false') ? ['boolean', ...vals.filter((v) => v !== 'true' && v !== 'false')] : vals;
    return out.join(' | ');
  }
  let s = checker.typeToString(t, undefined, fmt);
  s = s.replace(/import\("[^"]+"\)\./g, '').replace(/ \| undefined$/, '').replace(/^undefined \| /, '');
  return s.length > 140 ? `${s.slice(0, 137)}…` : s;
};

/** ค่าตั้งต้นจาก destructuring `{ a = 1 }` ในพารามิเตอร์แรก */
function defaultsOf(decl) {
  const out = {};
  const fn = ts.isVariableDeclaration(decl) ? unwrapFn(decl.initializer) : decl;
  const p = fn?.parameters?.[0];
  if (p && ts.isObjectBindingPattern(p.name)) {
    for (const el of p.name.elements) {
      if (el.initializer) out[(el.propertyName ?? el.name).getText()] = el.initializer.getText();
    }
  }
  return out;
}
function unwrapFn(n) {
  if (!n) return undefined;
  if (ts.isArrowFunction(n) || ts.isFunctionExpression(n)) return n;
  if (ts.isCallExpression(n)) return n.arguments.map(unwrapFn).find(Boolean); // forwardRef(function X(...))
  if (ts.isAsExpression(n) || ts.isParenthesizedExpression(n)) return unwrapFn(n.expression);
  return undefined;
}

function propsTable(type, defaults) {
  const members = type.isUnion() ? type.types : [type];
  const blocks = [];
  members.forEach((m, i) => {
    const props = checker.getPropertiesOfType(m);
    const own = props.filter((p) => (p.declarations ?? []).some(isOurs));
    const inherited = props.length - own.length;
    if (!own.length && !inherited) return;
    // ป้ายของแต่ละแบบ: prop ตัวที่ใช้แยกแบบ (multiple / range / type) พร้อมค่า
    const disc = own.find((p) => ['multiple', 'range', 'type', 'layout', 'variant'].includes(p.name) && p.declarations?.[0] && (checker.getTypeOfSymbolAtLocation(p, p.declarations[0]).flags & ts.TypeFlags.BooleanLiteral || checker.getTypeOfSymbolAtLocation(p, p.declarations[0]).isLiteral?.()));
    const discLabel = disc ? ` — เมื่อ \`${disc.name}: ${checker.typeToString(checker.getTypeOfSymbolAtLocation(disc, disc.declarations[0])).replace(/ \| undefined/, '')}\`${disc.flags & ts.SymbolFlags.Optional ? ' (หรือไม่ใส่)' : ''}` : '';
    let s = members.length > 1 ? `\n**แบบที่ ${i + 1}**${discLabel}\n\n` : '\n';
    if (own.length) {
      s += '| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |\n|---|---|---|---|\n';
      for (const p of own) {
        const decl = p.declarations?.[0];
        const opt = (p.flags & ts.SymbolFlags.Optional) !== 0;
        const t = decl ? checker.getTypeOfSymbolAtLocation(p, decl) : checker.getTypeOfSymbol(p);
        s += `| \`${p.name}\`${opt ? '' : ' **(จำเป็น)**'} | \`${esc(shortType(t))}\` | ${defaults[p.name] ? `\`${esc(defaults[p.name])}\`` : ''} | ${esc(doc(p))} |\n`;
      }
    }
    if (inherited > 0) s += `\n${own.length ? 'และ' : ''}รับ props มาตรฐานของ element HTML ด้านในได้ทั้งหมด (\`className\`, \`onClick\`, \`disabled\`, \`aria-*\` ฯลฯ)\n`;
    blocks.push(s);
  });
  return blocks.join('');
}

function renderFile(rel) {
  const abs = path.join(ROOT, 'src', 'components', rel);
  const sf = program.getSourceFile(abs);
  if (!sf) return `> ไม่พบไฟล์ ${rel}\n`;
  const mod = checker.getSymbolAtLocation(sf);
  if (!mod) return '';
  const importPath = '@/' + path.relative(path.join(ROOT, 'src'), abs).replace(/\.(tsx|ts)$/, '');
  let md = `## \`${importPath}\`\n\n`;
  const exps = checker.getExportsOfModule(mod).filter((s) => s.name !== 'default');
  const names = exps.map((e) => e.name);
  md += `\`\`\`ts\nimport { ${names.join(', ')} } from '${importPath}';\n\`\`\`\n\n`;
  for (const e of exps) {
    const sym = e.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(e) : e;
    const decl = sym.declarations?.[0];
    if (!decl) continue;
    const reexport = decl.getSourceFile() !== sf;
    const d = doc(sym);
    if (sym.flags & ts.SymbolFlags.TypeAlias || sym.flags & ts.SymbolFlags.Interface) {
      if (reexport) continue;
      const text = decl.getText().replace(/^export\s+/, '');
      md += `### type \`${e.name}\`\n\n${d ? d + '\n\n' : ''}\`\`\`ts\n${text.length > 1200 ? text.slice(0, 1200) + '\n// …' : text}\n\`\`\`\n\n`;
      continue;
    }
    const t = checker.getTypeOfSymbolAtLocation(sym, decl);
    const sigs = t.getCallSignatures();
    if (!sigs.length) {
      md += `### \`${e.name}\`\n\n${d ? d + '\n\n' : ''}ชนิด: \`${esc(shortType(t))}\`\n\n`;
      continue;
    }
    const isComponent = /^[A-Z]/.test(e.name);
    md += `### ${isComponent ? '' : 'ฟังก์ชัน '}\`${e.name}\`${reexport ? ` (มาจาก ${path.basename(decl.getSourceFile().fileName)})` : ''}\n\n${d ? d + '\n\n' : ''}`;
    const sig = sigs[0];
    const first = sig.getParameters()[0];
    if (isComponent && first) {
      // ข้อบังคับของชนิดข้อมูล เช่น DataTable<T extends { id: number }> — ไม่บอกตรงนี้แล้ว AI จะส่งแถวที่ไม่มี id
      const tps = (sig.getTypeParameters() ?? []).filter((tp) => tp.getConstraint());
      if (tps.length) md += `> ชนิดข้อมูล: ${tps.map((tp) => `\`${tp.symbol.name} extends ${esc(checker.typeToString(tp.getConstraint()))}\``).join(' · ')}\n\n`;
      const pt = checker.getTypeOfSymbolAtLocation(first, decl);
      md += propsTable(pt, defaultsOf(decl)) + '\n';
    } else {
      md += `\`\`\`ts\n${e.name}${checker.signatureToString(sig, undefined, fmt).replace(/import\("[^"]+"\)\./g, '')}\n\`\`\`\n\n`;
    }
  }
  return md;
}

fs.mkdirSync(OUT, { recursive: true });
const index = ['# เอกสาร API (สร้างอัตโนมัติจากโค้ด)', '', '> ห้ามแก้ไฟล์ในโฟลเดอร์นี้ด้วยมือ — รัน `npm run docs:api` ใหม่หลังแก้คอมโพเนนต์', '> คำอธิบายมาจาก JSDoc ในโค้ด · props/ชนิด/ค่าตั้งต้นมาจาก TypeScript โดยตรง', ''];
GROUPS.forEach(([title, list], gi) => {
  const slug = `${String(gi + 1).padStart(2, '0')}-${['forms', 'overlays', 'navigation', 'data', 'media', 'charts', 'blocks', 'lib'][gi]}.md`;
  const body = [`# ${title}`, '', `> สร้างอัตโนมัติด้วย \`npm run docs:api\` — ห้ามแก้ด้วยมือ`, '', ...list.map(renderFile)].join('\n');
  fs.writeFileSync(path.join(OUT, slug), body);
  index.push(`- [${title}](./${slug}) — ${list.map((f) => path.basename(f).replace(/\.(tsx|ts)$/, '')).join(', ')}`);
});
fs.writeFileSync(path.join(OUT, 'README.md'), index.join('\n') + '\n');
console.log(`เขียน ${GROUPS.length} ไฟล์ใน docs/api`);
