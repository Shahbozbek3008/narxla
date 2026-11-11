'use client';

import { Plus, ScanSearch } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import type { AdminMaterial, AdminStore, PreviewResult } from '@/lib/admin/types';
import { fmt, num } from '@/lib/format';
import { cn } from '@/lib/utils';
import { fieldLabel, plainCard } from '../app/common/styles';
import { useAdminAction } from './useAdmin';

type ListingFormProps = {
  material: AdminMaterial;
  stores: AdminStore[];
  onCreated: () => void;
};

const hostOf = (value: string) => {
  try {
    return new URL(value).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
};

export function ListingForm({ material, stores, onCreated }: ListingFormProps) {
  const t = useTranslations('admin.form');
  const { run, pending } = useAdminAction();
  const [url, setUrl] = useState('');
  const [storeCode, setStoreCode] = useState(stores[0]?.code ?? '');
  const [packSize, setPackSize] = useState('1');
  const [title, setTitle] = useState('');
  const [preview, setPreview] = useState<PreviewResult | null>(null);

  const changeUrl = (value: string) => {
    setUrl(value);
    setPreview(null);
    const host = hostOf(value);
    const match = stores.find((store) => hostOf(store.baseUrl) === host);
    if (match) setStoreCode(match.code);
  };

  const inspect = async () => {
    const result = await run('preview', (api) => api.preview(storeCode, url.trim()));
    if (!result) return;
    setPreview(result);
    if (result.outcome === 'OK' && result.title && !title) setTitle(result.title.slice(0, 200));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const created = await run(
      'create',
      (api) =>
        api.createListing({
          materialCode: material.code,
          storeCode,
          url: url.trim(),
          packSize: num(packSize) || 1,
          title: title.trim() || undefined,
        }),
      t('created'),
    );
    if (!created) return;
    setUrl('');
    setTitle('');
    setPackSize('1');
    setPreview(null);
    onCreated();
  };

  const valid = hostOf(url.trim()) !== null && storeCode !== '';

  return (
    <form onSubmit={submit} className={cn(plainCard, 'flex flex-col gap-4 p-5')}>
      <div>
        <h3 className="text-[15px] font-semibold">{t('title')}</h3>
        <p className="text-[13px] text-fg-3">{t('lead')}</p>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className={fieldLabel}>{t('url')}</span>
        <Input
          type="url"
          inputMode="url"
          placeholder="https://"
          value={url}
          onChange={(event) => changeUrl(event.target.value)}
          className="text-sm"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_140px]">
        <label className="flex flex-col gap-1.5">
          <span className={fieldLabel}>{t('store')}</span>
          <NativeSelect value={storeCode} onChange={(event) => setStoreCode(event.target.value)} className="max-w-none">
            {stores.map((store) => (
              <option key={store.code} value={store.code}>
                {store.name}
              </option>
            ))}
          </NativeSelect>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={fieldLabel}>{t('packSize', { unit: material.unit })}</span>
          <Input inputMode="decimal" value={packSize} onChange={(event) => setPackSize(event.target.value)} className="text-sm" />
        </label>
      </div>
      <p className="-mt-2 text-xs text-fg-3">{t('packHint', { unit: material.unit })}</p>

      <label className="flex flex-col gap-1.5">
        <span className={fieldLabel}>{t('name')}</span>
        <Input value={title} maxLength={200} onChange={(event) => setTitle(event.target.value)} className="text-sm" />
      </label>

      {preview && (
        <p
          role="status"
          className={cn(
            'rounded-xl px-3.5 py-2.5 text-sm',
            preview.outcome === 'OK' ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger',
          )}
        >
          {preview.outcome === 'OK'
            ? t('previewOk', { price: fmt(preview.price), unitPrice: fmt(preview.price / (num(packSize) || 1)), strategy: preview.strategy })
            : t('previewFailed', { error: preview.error })}
        </p>
      )}

      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="secondary" disabled={!valid || pending !== null} onClick={inspect}>
          <ScanSearch size={16} strokeWidth={1.75} aria-hidden />
          {t('preview')}
        </Button>
        <Button type="submit" disabled={!valid || pending !== null}>
          <Plus size={16} strokeWidth={2} aria-hidden />
          {t('submit')}
        </Button>
      </div>
    </form>
  );
}
