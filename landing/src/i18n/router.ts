'use client';

import { useRouter as useProgressRouter } from '@bprogress/next/app';
import { useIntlRouter } from './navigation';

export const useRouter = () => useProgressRouter({ customRouter: useIntlRouter });
