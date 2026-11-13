import { Search } from 'lucide-react';
import { useDeferredValue, useState } from 'react';
import { PLAN_LABEL, useUsers, type User } from '@/entities/user';
import { GrantPlanActions } from '@/features/grant-plan';
import { MergeControls, useMergeUsers } from '@/features/merge-users';
import { cn, date } from '@/shared/lib';
import { Badge, EmptyState, Input, PageHeader, QueryState } from '@/shared/ui';

function contactOf(user: User) {
  return [user.phone, user.email, user.telegramLinked ? 'Telegram' : null].filter(Boolean).join(' · ') || '—';
}

export function UsersPage() {
  const [term, setTerm] = useState('');
  const [source, setSource] = useState<User | null>(null);
  const deferred = useDeferredValue(term.trim());
  const users = useUsers(deferred);
  const merge = useMergeUsers(() => setSource(null));

  return (
    <>
      <PageHeader title="Foydalanuvchilar" lead="To‘lov tizimi ulanmaguncha tariflar shu yerdan qo‘lda beriladi. Bir odamning ikki hisobini birlashtirish ham shu yerda." />
      <label className="relative max-w-md">
        <Search size={15} strokeWidth={1.75} className="absolute top-1/2 left-3 -translate-y-1/2 text-fg-3" aria-hidden />
        <Input value={term} placeholder="Telefon, ism yoki ID" aria-label="Qidirish" onChange={(event) => setTerm(event.target.value)} className="pl-9" />
      </label>
      {source && (
        <p className="rounded-xl bg-accent-soft px-4 py-2.5 text-sm text-accent-text">
          «{source.name || contactOf(source)}» tanlandi. Endi uni qaysi hisobga qo‘shishni tanlang.
        </p>
      )}
      <QueryState loading={users.isPending} error={users.error}>
        {users.data?.length === 0 ? (
          <EmptyState>Foydalanuvchi topilmadi.</EmptyState>
        ) : (
          <div className="card divide-y divide-line">
            {users.data?.map((user) => (
              <div key={user.id} className={cn('flex flex-wrap items-center justify-between gap-3 px-5 py-3.5', source?.id === user.id && 'bg-accent-soft/50')}>
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 text-sm/5 font-semibold">
                    {user.name || contactOf(user)}
                    <Badge tone={user.plan.kind === 'free' ? 'neutral' : 'accent'}>{PLAN_LABEL[user.plan.kind]}</Badge>
                  </p>
                  <p className="text-xs text-fg-3 tabular-nums">
                    {contactOf(user)} · {user.usage.estimates} smeta · {date(user.createdAt)}
                    {user.plan.expiresAt && ` · ${date(user.plan.expiresAt)} gacha`}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <MergeControls
                    user={user}
                    source={source}
                    pending={merge.isPending}
                    onPick={setSource}
                    onMerge={(target, picked) => merge.mutate({ target, source: picked })}
                  />
                  {!source && <GrantPlanActions userId={user.id} />}
                </div>
              </div>
            ))}
          </div>
        )}
      </QueryState>
    </>
  );
}
