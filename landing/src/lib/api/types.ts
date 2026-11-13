import type { EstimateInput, Quality } from '../calc-engine';
import type { PlanKind } from '../plans';

export const RESERVES = [5, 10, 15] as const;
export type Reserve = (typeof RESERVES)[number];

export type ProfileFields = {
  name: string;
  region: string;
  district: string;
  reserve: Reserve;
  quality: Quality;
  notifyPrice: boolean;
  notifyTelegram: boolean;
  notifyNews: boolean;
};

export type SignInMethod = 'phone' | 'telegram' | 'google';

export type Profile = ProfileFields & {
  id: string;
  phone: string | null;
  telegramLinked: boolean;
  googleLinked: boolean;
  email: string | null;
  plan: { kind: PlanKind; expiresAt: string | null };
  usage: { estimates: number; limit: number | null };
  createdAt: string;
};

export type EstimateStatus = 'ready' | 'draft' | 'sent';

export type EstimateRecord = {
  id: string;
  name: string;
  input: EstimateInput;
  status: EstimateStatus;
  shareToken: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SharedEstimate = Pick<EstimateRecord, 'id' | 'name' | 'input' | 'createdAt'>;

export type Payment = {
  id: string;
  plan: Exclude<PlanKind, 'free'>;
  amount: number;
  provider: 'manual';
  periodEnd: string | null;
  paidAt: string;
};

export type OtpRequested = { phone: string; expiresIn: number; resendIn: number };

export type TelegramAuthData = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
};
