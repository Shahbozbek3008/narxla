'use client';

import { usePathname, useRouter } from '@/i18n/navigation';
import type { EstimateInput } from '@/lib/calc-engine';
import { sendPriceReport } from '@/lib/prices/api';
import { routes, withNext } from '@/lib/routes';
import { useDraft } from '@/store/draft';
import { useEstimates, type Project } from '@/store/estimates';
import { useSession } from '@/store/session';
import { useNotify } from '../common/useNotify';

const EDIT_STEP = 1;

type ActionsInput = {
  id: string;
  input: EstimateInput;
  name: string;
  project: Project | null;
};

export function useEstimateActions({ id, input, name, project }: ActionsInput) {
  const router = useRouter();
  const pathname = usePathname();
  const signedIn = useSession((state) => state.signedIn);
  const addProject = useEstimates((state) => state.add);
  const loadDraft = useDraft((state) => state.load);
  const notify = useNotify();

  const requireSignIn = () => {
    if (signedIn) return false;
    notify('signInRequired', 'info');
    router.push(withNext(routes.login, pathname));
    return true;
  };

  return {
    saved: project !== null,
    edit: () => {
      loadDraft(input, EDIT_STEP);
      router.push(routes.newEstimateStep(EDIT_STEP + 1));
    },
    save: () => {
      if (project) return notify('alreadySaved', 'info');
      if (requireSignIn()) return;
      const newId = addProject({ name, input });
      notify('saved');
      router.replace(routes.estimate(newId));
    },
    share: async () => {
      const url = `${window.location.host}${pathname}`;
      await navigator.clipboard?.writeText(`${window.location.protocol}//${url}`).catch(() => undefined);
      notify('shared', 'success', { url });
    },
    openPdf: () => {
      if (requireSignIn()) return;
      router.push(routes.estimatePdf(id));
    },
    report: async () => {
      try {
        await sendPriceReport({ estimateId: id });
        notify('reported', 'info');
      } catch {
        notify('reportFailed', 'info');
      }
    },
  };
}
