import { GitMerge, X } from 'lucide-react';
import type { User } from '@/entities/user';
import { Button } from '@/shared/ui';

const labelOf = (user: User) => user.name || user.phone || user.email || user.id;

type MergeControlsProps = {
  user: User;
  source: User | null;
  pending: boolean;
  onPick: (user: User | null) => void;
  onMerge: (target: User, source: User) => void;
};

export function MergeControls({ user, source, pending, onPick, onMerge }: MergeControlsProps) {
  if (!source) {
    return (
      <Button size="xs" variant="ghost" onClick={() => onPick(user)}>
        <GitMerge size={14} strokeWidth={1.75} aria-hidden />
        Birlashtirish
      </Button>
    );
  }

  if (source.id === user.id) {
    return (
      <Button size="xs" variant="secondary" onClick={() => onPick(null)}>
        <X size={14} strokeWidth={1.75} aria-hidden />
        Tanlovni bekor qilish
      </Button>
    );
  }

  const confirmMerge = () => {
    const question = `«${labelOf(source)}» hisobi «${labelOf(user)}» hisobiga qo‘shiladi: smetalar, to‘lovlar va kirish usullari ko‘chiriladi, eski hisob o‘chiriladi. Davom etasizmi?`;
    if (window.confirm(question)) onMerge(user, source);
  };

  return (
    <Button size="xs" disabled={pending} onClick={confirmMerge}>
      <GitMerge size={14} strokeWidth={1.75} aria-hidden />
      Shu hisobga qo‘shish
    </Button>
  );
}
