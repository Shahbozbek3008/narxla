'use client';

import { useState } from 'react';
import { useAuth, useUpdateProfile } from '@/lib/api/queries';
import type { Profile, ProfileFields } from '@/lib/api/types';
import { useNotify } from '../common/useNotify';

function pick<K extends keyof ProfileFields>(profile: Profile, keys: readonly K[]) {
  const result = {} as Pick<ProfileFields, K>;
  for (const key of keys) result[key] = profile[key];
  return result;
}

export function useProfileForm<K extends keyof ProfileFields>(keys: readonly K[]) {
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();
  const notify = useNotify();
  const [edits, setEdits] = useState<Partial<Pick<ProfileFields, K>>>({});

  const saved = user ? pick(user, keys) : null;
  const values = saved ? { ...saved, ...edits } : null;
  const changes = saved ? keys.filter((key) => key in edits && edits[key] !== saved[key]) : [];
  const dirty = changes.length > 0;

  const set = <F extends K>(key: F, value: ProfileFields[F]) => setEdits((current) => ({ ...current, [key]: value }));

  const reset = () => setEdits({});

  const save = () => {
    if (!values || !dirty) return;
    const patch = Object.fromEntries(changes.map((key) => [key, values[key]])) as Partial<ProfileFields>;
    updateProfile.mutate(patch, {
      onSuccess: () => {
        setEdits({});
        notify('settingsSaved');
      },
      onError: () => notify('actionFailed', 'info'),
    });
  };

  return { user, values, set, dirty, reset, save, saving: updateProfile.isPending };
}
