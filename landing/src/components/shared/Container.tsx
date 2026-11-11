import clsx from 'clsx';
import type { ComponentProps } from 'react';

export function Container({ className, ...rest }: ComponentProps<'div'>) {
  return <div className={clsx('relative mx-auto max-w-[1200px] px-[clamp(20px,5vw,24px)]', className)} {...rest} />;
}
