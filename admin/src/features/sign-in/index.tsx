import { KeyRound } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useSession } from '@/entities/session';
import { ApiError } from '@/shared/api';
import { Button, Field, Input } from '@/shared/ui';

export function SignInForm() {
  const signIn = useSession((state) => state.signIn);
  const [key, setKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      await signIn(key.trim());
    } catch (failure) {
      setError(failure instanceof ApiError && failure.unauthorized ? 'Kalit noto‘g‘ri.' : 'Serverga ulanib bo‘lmadi.');
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Field label="Admin kaliti" hint="backend/.env dagi ADMIN_API_KEY qiymati">
        <Input type="password" autoComplete="current-password" autoFocus value={key} onChange={(event) => setKey(event.target.value)} />
      </Field>
      {error && (
        <p role="alert" className="rounded-xl bg-danger-soft px-3.5 py-2.5 text-sm text-danger">
          {error}
        </p>
      )}
      <Button type="submit" size="md" block disabled={pending || key.trim().length < 8}>
        <KeyRound size={16} strokeWidth={1.75} aria-hidden />
        {pending ? 'Tekshirilmoqda…' : 'Kirish'}
      </Button>
    </form>
  );
}
