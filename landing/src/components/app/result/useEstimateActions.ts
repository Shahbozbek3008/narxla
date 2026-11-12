'use client';

import { useLocale } from 'next-intl';
import { getPathname, usePathname, useRouter } from '@/i18n/navigation';
import { isApiError } from '@/lib/api/client';
import { useAuth, useCreateEstimate, useShareEstimate } from '@/lib/api/queries';
import type { EstimateRecord } from '@/lib/api/types';
import type { EstimateInput } from '@/lib/calc-engine';
import { sendPriceReport } from '@/lib/prices/api';
import { routes, withNext } from '@/lib/routes';
import { useDraft } from '@/store/draft';
import { useNotify } from '../common/useNotify';

const EDIT_STEP = 1;

type ActionsInput = {
  id: string;
  input: EstimateInput;
  name: string;
  project: EstimateRecord | null;
};

const copy = (text: string) => navigator.clipboard?.writeText(text).catch(() => undefined);

export function useEstimateActions({ id, input, name, project }: ActionsInput) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const { status } = useAuth();
  const createEstimate = useCreateEstimate();
  const shareEstimate = useShareEstimate();
  const loadDraft = useDraft((state) => state.load);
  const notify = useNotify();

  const requireSignIn = () => {
    if (status === 'authenticated') return false;
    notify('signInRequired', 'info');
    router.push(withNext(routes.login, pathname));
    return true;
  };

  const shareUrl = (token: string) => `${window.location.origin}${getPathname({ href: routes.shared(token), locale })}`;

  return {
    saved: project !== null,
    saving: createEstimate.isPending,
    edit: () => {
      loadDraft(input, EDIT_STEP, project?.id ?? null);
      router.push(routes.newEstimateStep(EDIT_STEP + 1));
    },
    save: () => {
      if (project) return notify('alreadySaved', 'info');
      if (requireSignIn() || createEstimate.isPending) return;
      createEstimate.mutate(
        { name, input },
        {
          onSuccess: (record) => {
            notify('saved');
            router.replace(routes.estimate(record.id));
          },
          onError: (error) => notify(isApiError(error, 'PLAN_LIMIT') ? 'limitReached' : 'actionFailed', 'info'),
        },
      );
    },
    share: async () => {
      if (!project) {
        const url = `${window.location.origin}${getPathname({ href: pathname, locale })}`;
        await copy(url);
        return notify('shared', 'success', { url: url.replace(/^https?:\/\//, '') });
      }
      shareEstimate.mutate(project.id, {
        onSuccess: async ({ shareToken }) => {
          if (!shareToken) return notify('actionFailed', 'info');
          const url = shareUrl(shareToken);
          await copy(url);
          notify('shared', 'success', { url: url.replace(/^https?:\/\//, '') });
        },
        onError: () => notify('actionFailed', 'info'),
      });
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
