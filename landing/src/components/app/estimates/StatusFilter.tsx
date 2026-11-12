'use client';

import { useTranslations } from 'next-intl';
import type { ListFilter } from '@/store/ui';
import { FilterTabs } from '../common/FilterTabs';

const FILTERS: ListFilter[] = ['all', 'ready', 'draft', 'sent'];

type StatusFilterProps = {
  value: ListFilter;
  countOf: (filter: ListFilter) => number;
  onChange: (filter: ListFilter) => void;
};

export function StatusFilter({ value, countOf, onChange }: StatusFilterProps) {
  const t = useTranslations('app.list');

  return (
    <FilterTabs
      id="estimates-status-filter"
      label={t('filtersLabel')}
      value={value}
      onChange={onChange}
      options={FILTERS.map((filter) => ({ value: filter, label: t(`filters.${filter}`), count: countOf(filter) }))}
    />
  );
}
