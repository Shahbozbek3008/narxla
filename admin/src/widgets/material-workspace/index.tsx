import { ExternalLink } from 'lucide-react';
import { useListings, type Listing } from '@/entities/listing';
import { CATEGORY_LABEL, useMaterials, type Material } from '@/entities/material';
import { StatusBadge } from '@/entities/observation';
import { useProducts, type Product } from '@/entities/product';
import { useStores } from '@/entities/store';
import { CreateListingForm } from '@/features/create-listing';
import { LinkProductSelect, ListingActions } from '@/features/manage-listing';
import { AddProduct, ProductRow } from '@/features/manage-product';
import { cn, dateTime, fmt, money } from '@/shared/lib';
import { Badge, EmptyState, QueryState, SkeletonList } from '@/shared/ui';

function MaterialHeader({ material }: { material: Material }) {
  return (
    <div className="card flex flex-wrap items-center justify-between gap-4 px-5 py-4">
      <div className="min-w-0">
        <h1 className="text-xl/7 font-semibold tracking-[-0.01em]">{material.name}</h1>
        <p className="font-mono text-xs text-fg-3">
          {material.code} · {material.unit} · {CATEGORY_LABEL[material.category]}
        </p>
      </div>
      <div className="text-right">
        <span className="block text-xs text-fg-3">Bazaviy narx</span>
        <span className="text-lg font-semibold tabular-nums">{money(material.referencePrice)}</span>
      </div>
    </div>
  );
}

function ProductsPanel({ material, products, loading, error }: { material: Material; products: Product[]; loading: boolean; error: Error | null }) {
  return (
    <section className="card flex flex-col">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold">
            Mahsulotlar <span className="text-fg-3 tabular-nums">· {products.length}</span>
          </h2>
          <p className="max-w-[560px] text-[13px] text-fg-3">Shu material turidagi brendlar. Do‘kon havolasini mahsulotga bog‘lang — narx avtomatik yig‘iladi.</p>
        </div>
        <AddProduct materialCode={material.code} unit={material.unit} />
      </header>
      <QueryState loading={loading} error={error} rows={2}>
        {products.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-fg-2">Hali mahsulot yo‘q. Birinchi brendni qo‘shing.</p>
        ) : (
          <ul>
            {products.map((product) => (
              <ProductRow key={product.id} product={product} materialCode={material.code} unit={material.unit} />
            ))}
          </ul>
        )}
      </QueryState>
    </section>
  );
}

function ListingCard({ listing, products }: { listing: Listing; products: Product[] }) {
  const [latest] = listing.observations;
  return (
    <article className={cn('card flex flex-col gap-3 p-4', !listing.active && 'opacity-60')}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="flex items-center gap-2 text-sm/5 font-semibold">
            {listing.store.name}
            {!listing.active && <Badge tone="outline">O‘chirilgan</Badge>}
          </span>
          {listing.title && <span className="truncate text-[13px] text-fg-2">{listing.title}</span>}
          <a href={listing.url} target="_blank" rel="noreferrer" className="flex min-w-0 items-center gap-1 text-xs text-accent-text hover:underline">
            <span className="truncate">{listing.url}</span>
            <ExternalLink size={12} strokeWidth={1.5} className="shrink-0" aria-hidden />
          </a>
          <LinkProductSelect listing={listing} products={products} />
        </div>
        <div className="flex flex-col items-end gap-1 text-right tabular-nums">
          {latest ? (
            <>
              <span className="text-lg font-semibold">{fmt(latest.unitPrice)}</span>
              <StatusBadge status={latest.status} />
            </>
          ) : (
            <span className="text-xs text-fg-3">Narx hali olinmagan</span>
          )}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
        <span className="text-xs text-fg-3 tabular-nums">
          Qadoq: {listing.packSize} · oxirgi tekshiruv: {dateTime(listing.lastCheckedAt)}
          {listing.lastError && <span className="text-danger"> · {listing.lastError}</span>}
        </span>
        <ListingActions listing={listing} />
      </div>
    </article>
  );
}

export function MaterialWorkspace({ code }: { code: string }) {
  const materials = useMaterials();
  const stores = useStores();
  const products = useProducts(code);
  const listings = useListings(code);
  const material = materials.data?.find((item) => item.code === code);

  if (materials.isPending || stores.isPending) return <SkeletonList rows={3} />;
  if (!material) return <EmptyState>Material topilmadi.</EmptyState>;

  const productList = products.data ?? [];

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <MaterialHeader material={material} />
      <ProductsPanel material={material} products={productList} loading={products.isPending} error={products.error} />

      <section className="card flex flex-col gap-4 p-5">
        <div>
          <h2 className="text-[15px] font-semibold">Do‘kon havolasi qo‘shish</h2>
          <p className="text-[13px] text-fg-3">Kamida 3 ta do‘kon havolasi bo‘lsa, narx «tekshirilgan» hisoblanadi.</p>
        </div>
        <CreateListingForm material={material} stores={stores.data ?? []} products={productList} />
      </section>

      <QueryState loading={listings.isPending} error={listings.error}>
        {listings.data?.length === 0 ? (
          <EmptyState>Bu material uchun hali havola yo‘q.</EmptyState>
        ) : (
          <div className="flex flex-col gap-2.5">
            {listings.data?.map((listing) => (
              <ListingCard key={listing.id} listing={listing} products={productList} />
            ))}
          </div>
        )}
      </QueryState>
    </div>
  );
}
