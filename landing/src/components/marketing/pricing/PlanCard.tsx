import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import type { PlanKind } from '@/lib/plans';
import { routes } from '@/lib/routes';
import { cn } from '@/lib/utils';

type PlanCardProps = {
  id: PlanKind;
  featured: boolean;
};

export function PlanCard({ id, featured }: PlanCardProps) {
  const t = useTranslations(`pricing.plans.${id}`);
  const tPricing = useTranslations('pricing');
  const features = t.raw('features') as string[];

  return (
    <article
      className={cn(
        'flex h-full flex-col rounded-3xl border bg-surface p-8',
        featured
          ? 'border-accent shadow-[0_0_0_4px_var(--accent-soft),var(--shadow-lift),0_24px_80px_-24px_var(--glow)]'
          : 'sheen border-line shadow-(--shadow-card)',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-display text-lg font-semibold">{t('name')}</h3>
        {featured && (
          <Badge tone="solid" shape="chip">
            {tPricing('popular')}
          </Badge>
        )}
      </div>
      <p className="mt-1 text-sm/5 text-fg-2">{t('desc')}</p>

      <div className="mt-6 flex items-baseline gap-1.5 tabular-nums">
        <span className="font-display text-[44px]/[52px] font-semibold tracking-[-0.03em]">{t('price')}</span>
        <span className="text-sm text-fg-2">{t('unit')}</span>
      </div>
      <p className="h-5 text-[13px]/5 text-fg-3 tabular-nums">{t('note')}</p>

      <Button asChild variant={featured ? 'primary' : 'secondary'} size="lg" block
        className={cn('mt-6', featured && 'shadow-[inset_0_1px_0_rgba(255,255,255,.28),0_1px_2px_rgba(0,0,0,.2)]')}
      >
        <Link href={routes.newEstimatePlan(id)}>{t('cta')}</Link>
      </Button>

      <ul className={cn('mt-6 flex flex-col gap-3 border-t border-line pt-6 text-sm/5', featured ? 'text-fg' : 'text-fg-2')}>
        {features.map((feature) => (
          <li key={feature} className="flex gap-2.5">
            <Check
              className={cn('mt-0.5 shrink-0', featured ? 'text-accent-text' : 'text-fg-3')}
              size={16}
              strokeWidth={1.75}
              aria-hidden
            />
            {feature}
          </li>
        ))}
      </ul>
    </article>
  );
}
