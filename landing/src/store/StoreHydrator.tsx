'use client';

import { useEffect } from 'react';
import { create } from 'zustand';
import { useAdmin } from './admin';
import { useCalc } from './calc';
import { useDraft } from './draft';
import { useEstimates } from './estimates';
import { useSession } from './session';
import { useSettings } from './settings';
import { useUi } from './ui';

const PERSISTED_STORES = [useSession, useDraft, useEstimates, useUi, useCalc, useSettings, useAdmin];

export const useHydrated = create<boolean>()(() => false);

export function StoreHydrator() {
  useEffect(() => {
    Promise.all(PERSISTED_STORES.map((store) => store.persist.rehydrate())).finally(() => useHydrated.setState(true, true));
  }, []);

  return null;
}
