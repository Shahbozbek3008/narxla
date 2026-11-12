import { ChevronLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

type PageHeaderProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  back?: { href: string; label: string };
  eyebrow?: ReactNode;
  actions?: ReactNode;
  actionsClassName?: string;
  size?: 'md' | 'lg' | 'sm';
  align?: 'end' | 'center';
  className?: string;
};

const TITLE = {
  lg: 'text-[clamp(28px,3vw,36px)]',
  md: 'text-[clamp(26px,3vw,32px)]',
  sm: 'text-[clamp(24px,3vw,30px)]',
};

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="-my-2.5 -ml-1 inline-flex items-center gap-1 py-2.5 pl-1 text-[13px] text-fg-3 transition-colors duration-150 hover:text-fg"
    >
      <ChevronLeft size={14} strokeWidth={1.5} aria-hidden />
      {label}
    </Link>
  );
}

export function PageHeader({
  title,
  subtitle,
  back,
  eyebrow,
  actions,
  actionsClassName,
  size = 'md',
  align = 'end',
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap justify-between gap-4',
        align === 'end' ? 'items-end' : 'items-center',
        className,
      )}
    >
      <div className="min-w-0">
        {back && <BackLink {...back} />}
        {eyebrow}
        <h1
          className={cn(
            'font-display leading-[1.2] font-semibold tracking-[-0.03em]',
            TITLE[size],
            (back || eyebrow) && 'mt-1',
          )}
        >
          {title}
        </h1>
        {subtitle && <div className="mt-1 text-fg-2">{subtitle}</div>}
      </div>
      {actions && <div className={cn('flex items-center gap-2', actionsClassName)}>{actions}</div>}
    </div>
  );
}
