import { Suspense } from 'react';
import { LoginForm } from './LoginForm';

export const metadata = { title: 'เข้าสู่ระบบ · Dairy Admin (ตัวอย่าง)' };

export default function Page() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
