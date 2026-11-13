import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, ScanSearch } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { listingKeys } from '@/entities/listing';
import type { Material } from '@/entities/material';
import { productKeys, type Product } from '@/entities/product';
import type { Store } from '@/entities/store';
import { http } from '@/shared/api';
import { cn, decimal, fmt, hostOf, notifySuccess, parseNumber } from '@/shared/lib';
import { Button, Field, Input, Select } from '@/shared/ui';

type PreviewResult = { outcome: 'OK'; price: number; title: string | null; strategy: string } | { outcome: 'FAILED' | 'BLOCKED'; error: string };

type CreateListingFormProps = {
  material: Material;
  stores: Store[];
  products: Product[];
};

export function CreateListingForm({ material, stores, products }: CreateListingFormProps) {
  const queryClient = useQueryClient();
  const [url, setUrl] = useState('');
  const [storeCode, setStoreCode] = useState(stores[0]?.code ?? '');
  const [productId, setProductId] = useState('');
  const [packSize, setPackSize] = useState('1');
  const [title, setTitle] = useState('');
  const [preview, setPreview] = useState<PreviewResult | null>(null);

  const reset = () => {
    setUrl('');
    setTitle('');
    setPackSize('1');
    setProductId('');
    setPreview(null);
  };

  const inspect = useMutation({
    mutationFn: () => http.post<PreviewResult>('/admin/scraper/preview', { storeCode, url: url.trim() }),
    onSuccess: (result) => {
      setPreview(result);
      if (result.outcome === 'OK' && result.title && !title) setTitle(result.title.slice(0, 200));
    },
  });

  const create = useMutation({
    mutationFn: () =>
      http.post('/admin/listings', {
        materialCode: material.code,
        storeCode,
        url: url.trim(),
        packSize: parseNumber(packSize) || 1,
        title: title.trim() || undefined,
        productId: productId || null,
      }),
    onSuccess: () => {
      notifySuccess('Havola qo‘shildi');
      reset();
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: listingKeys.byMaterial(material.code) }),
        queryClient.invalidateQueries({ queryKey: productKeys.byMaterial(material.code) }),
      ]);
    },
  });

  const changeUrl = (value: string) => {
    setUrl(value);
    setPreview(null);
    const host = hostOf(value);
    const match = stores.find((store) => hostOf(store.baseUrl) === host);
    if (match) setStoreCode(match.code);
  };

  const pickProduct = (id: string) => {
    setProductId(id);
    const product = products.find((item) => item.id === id);
    if (product) setPackSize(decimal(product.packSize));
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    create.mutate();
  };

  const valid = hostOf(url.trim()) !== null && storeCode !== '';
  const busy = inspect.isPending || create.isPending;
  const pack = parseNumber(packSize) || 1;

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Field label="Do‘kon sahifasi havolasi" hint="Do‘kon havola domenidan avtomatik aniqlanadi">
        <Input type="url" inputMode="url" placeholder="https://" value={url} onChange={(event) => changeUrl(event.target.value)} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Mahsulot">
          <Select value={productId} onChange={(event) => pickProduct(event.target.value)}>
            <option value="">Brendsiz</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.brand} · {product.name}
              </option>
            ))}
          </Select>
        </Field>
        <div className="grid grid-cols-[minmax(0,1fr)_120px] gap-3">
          <Field label="Do‘kon">
            <Select value={storeCode} onChange={(event) => setStoreCode(event.target.value)}>
              {stores.map((store) => (
                <option key={store.code} value={store.code}>
                  {store.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={`Qadoq, ${material.unit}`}>
            <Input inputMode="decimal" value={packSize} onChange={(event) => setPackSize(event.target.value)} />
          </Field>
        </div>
      </div>
      <Field label="Sarlavha" hint="Ko‘rib chiqishda sahifadan avtomatik olinadi">
        <Input value={title} maxLength={200} onChange={(event) => setTitle(event.target.value)} />
      </Field>

      {preview && (
        <p
          role="status"
          className={cn('rounded-xl px-3.5 py-2.5 text-sm', preview.outcome === 'OK' ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger')}
        >
          {preview.outcome === 'OK'
            ? `Narx topildi: ${fmt(preview.price)} so‘m · birlik narxi ${fmt(preview.price / pack)} so‘m / ${material.unit} · ${preview.strategy}`
            : `Narx topilmadi: ${preview.error}`}
        </p>
      )}

      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="secondary" disabled={!valid || busy} onClick={() => inspect.mutate()}>
          <ScanSearch size={16} strokeWidth={1.75} aria-hidden />
          Ko‘rib chiqish
        </Button>
        <Button type="submit" disabled={!valid || busy}>
          <Plus size={16} strokeWidth={2} aria-hidden />
          Havola qo‘shish
        </Button>
      </div>
    </form>
  );
}
