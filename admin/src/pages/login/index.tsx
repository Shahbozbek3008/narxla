import { ShieldCheck } from 'lucide-react';
import { SignInForm } from '@/features/sign-in';

export function LoginPage() {
  return (
    <main className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="card w-full max-w-sm p-6">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <span className="grid size-12 place-items-center rounded-2xl bg-accent text-accent-ink">
            <ShieldCheck size={22} strokeWidth={1.75} aria-hidden />
          </span>
          <div>
            <h1 className="text-xl font-semibold">Narxla Admin</h1>
            <p className="text-sm text-fg-2">Davom etish uchun admin kalitini kiriting.</p>
          </div>
        </div>
        <SignInForm />
      </div>
    </main>
  );
}
