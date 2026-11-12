'use client';

import type { ComponentType } from 'react';
import type { SettingsTab } from '@/lib/routes';
import { AppearanceTab } from './tabs/AppearanceTab';
import { BillingTab } from './tabs/BillingTab';
import { NotificationsTab } from './tabs/NotificationsTab';
import { PreferencesTab } from './tabs/PreferencesTab';
import { ProfileTab } from './tabs/ProfileTab';
import { SecurityTab } from './tabs/SecurityTab';

const PANELS: Record<SettingsTab, ComponentType> = {
  profile: ProfileTab,
  preferences: PreferencesTab,
  notifications: NotificationsTab,
  appearance: AppearanceTab,
  billing: BillingTab,
  security: SecurityTab,
};

export function SettingsTabPanel({ tab }: { tab: SettingsTab }) {
  const Panel = PANELS[tab];
  return (
    <div key={tab} className="flex animate-step-in flex-col gap-6">
      <Panel />
    </div>
  );
}
