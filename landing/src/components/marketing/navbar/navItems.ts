import { Calculator, CircleHelp, LayoutGrid, Tag, type LucideIcon } from 'lucide-react';
import { ANCHORS } from '@/lib/anchors';

type NavItem = {
  key: 'features' | 'calculators' | 'pricing' | 'faq';
  anchor: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { key: 'features', anchor: ANCHORS.features, icon: LayoutGrid },
  { key: 'calculators', anchor: ANCHORS.calculators, icon: Calculator },
  { key: 'pricing', anchor: ANCHORS.pricing, icon: Tag },
  { key: 'faq', anchor: ANCHORS.faq, icon: CircleHelp },
];
