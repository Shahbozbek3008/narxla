'use client';

import { ChevronDown } from 'lucide-react';
import { Accordion as AccordionPrimitive } from 'radix-ui';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

const Accordion = AccordionPrimitive.Root;

function AccordionItem({ className, ...props }: ComponentProps<typeof AccordionPrimitive.Item>) {
  return <AccordionPrimitive.Item data-slot="accordion-item" className={cn('border-b border-line', className)} {...props} />;
}

function AccordionTrigger({ className, children, ...props }: ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header>
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          'group flex w-full items-center justify-between gap-4 py-5 text-left text-[17px]/[26px] font-medium text-fg-2 transition-colors duration-200 hover:text-fg focus-visible:rounded-md data-[state=open]:text-fg',
          className,
        )}
        {...props}
      >
        {children}
        <span className="grid size-7 shrink-0 place-items-center rounded-full border border-line-2 text-fg-3 transition-[background-color,border-color,color,rotate] duration-400 ease-[cubic-bezier(.16,1,.3,1)] group-hover:border-fg-3 group-hover:text-fg group-data-[state=open]:rotate-180 group-data-[state=open]:border-accent group-data-[state=open]:bg-accent-soft group-data-[state=open]:text-accent-text">
          <ChevronDown size={16} strokeWidth={1.75} aria-hidden />
        </span>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({ className, children, ...props }: ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="group/content overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      {...props}
    >
      <div className={cn('pr-11 pb-5 text-pretty text-fg-2 transition-[opacity,translate] duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-data-[state=closed]/content:-translate-y-1 group-data-[state=closed]/content:opacity-0', className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
