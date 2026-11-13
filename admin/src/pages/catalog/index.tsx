import { Package } from 'lucide-react';
import { useParams } from 'react-router';
import { MaterialBrowser } from '@/widgets/material-browser';
import { MaterialWorkspace } from '@/widgets/material-workspace';
import { PageHeader } from '@/shared/ui';

export function CatalogPage() {
  const { code } = useParams();

  return (
    <>
      <PageHeader title="Katalog" lead="Material turlari, ularning brend-mahsulotlari va do‘kon havolalari." />
      <div className="grid items-start gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <MaterialBrowser />
        {code ? (
          <MaterialWorkspace key={code} code={code} />
        ) : (
          <div className="card flex flex-col items-center gap-3 px-6 py-20 text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-surface-2 text-fg-3">
              <Package size={22} strokeWidth={1.5} aria-hidden />
            </span>
            <p className="text-sm text-fg-2">Chapdan material tanlang.</p>
          </div>
        )}
      </div>
    </>
  );
}
