import { DemoShell } from './DemoShell';

export const metadata = { title: 'Dairy Admin (ตัวอย่าง) · jb-components' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DemoShell>{children}</DemoShell>;
}
