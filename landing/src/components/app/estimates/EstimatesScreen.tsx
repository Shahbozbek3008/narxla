'use client';

import { LayoutGrid, Plus, Rows3 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useBreakpoints } from '@/hooks/useBreakpoints';
import { Link } from '@/i18n/navigation';
import { routes } from '@/lib/routes';
import { useEstimateList } from '@/lib/api/queries';
import { useHydrated } from '@/store/StoreHydrator';
import { useUi, type ListFilter, type ListView } from '@/store/ui';
import { PageHeader } from '../common/PageHeader';
import { SearchInput } from '../common/SearchInput';
import { EstimateCard } from './EstimateCard';
import { EstimatesEmpty, EstimatesError, EstimatesNotFound, EstimatesSkeleton } from './EstimatesStates';
import { EstimatesTable } from './EstimatesTable';
import { StatusFilter } from './StatusFilter';
import { useProjectRows } from './useProjectRows';

export function EstimatesScreen() {
  const t = useTranslations('app.list');
  const hydrated = useHydrated();
  const { data: projects = [], isPending, isError, refetch } = useEstimateList();
  const { view, filter, search, setView, setFilter, setSearch, clearFilters } = useUi();
  const { isPhone } = useBreakpoints();
  const rows = useProjectRows(projects);

  const query = search.trim().toLowerCase();
  const visible = rows.filter(
    (row) => (filter === 'all' || row.status === filter) && row.name.toLowerCase().includes(query),
  );
  const countOf = (value: ListFilter) =>
    value === 'all' ? rows.length : rows.filter((row) => row.status === value).length;

  const renderList = () => {
    if (isError) return <EstimatesError onRetry={() => void refetch()} />;
    if (!hydrated || isPending) return <EstimatesSkeleton />;
    if (rows.length === 0) return <EstimatesEmpty />;
    if (visible.length === 0) return <EstimatesNotFound onClear={clearFilters} />;
    if (view === 'table' && !isPhone) return <EstimatesTable rows={visible} />;
    return (
      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))] gap-4">
        {visible.map((row) => (
          <EstimateCard key={row.id} row={row} />
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      <PageHeader
        size="lg"
        title={t('title')}
        subtitle={
          <span className="text-[15px]">
            {rows.length ? t('subtitle', { count: rows.length, date: rows[0].date }) : t('subtitleEmpty')}
          </span>
        }
        actions={
          <>
            <ToggleGroup
              className="max-sm:hidden"
              type="single"
              aria-label={t('viewLabel')}
              value={view}
              onValueChange={(next) => next && setView(next as ListView)}
            >
              <ToggleGroupItem value="cards" aria-label={t('viewCards')} className="h-[30px] w-[34px]">
                <LayoutGrid size={15} strokeWidth={1.5} aria-hidden />
              </ToggleGroupItem>
              <ToggleGroupItem value="table" aria-label={t('viewTable')} className="h-[30px] w-[34px]">
                <Rows3 size={15} strokeWidth={1.5} aria-hidden />
              </ToggleGroupItem>
            </ToggleGroup>
            <Button asChild size="sm" className="h-[38px]">
              <Link href={routes.newEstimate}>
                <Plus size={15} strokeWidth={2} aria-hidden />
                {t('new')}
              </Link>
            </Button>
          </>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <SearchInput
          wrapperClassName="sm:flex-[1_1_240px] sm:max-w-[360px]"
          value={search}
          placeholder={t('search')}
          aria-label={t('search')}
          onChange={(event) => setSearch(event.target.value)}
        />
        <StatusFilter value={filter} countOf={countOf} onChange={setFilter} />
      </div>

      {renderList()}
    </div>
  );
}
