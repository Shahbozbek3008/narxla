import { Search } from 'lucide-react';
import { useState } from 'react';
import { NavLink } from 'react-router';
import { CATEGORY_LABEL, useMaterials, type MaterialCategory } from '@/entities/material';
import { routes } from '@/shared/config';
import { cn } from '@/shared/lib';
import { Input, QueryState, Select } from '@/shared/ui';

export function MaterialBrowser() {
  const materials = useMaterials();
  const [term, setTerm] = useState('');
  const [category, setCategory] = useState<MaterialCategory | ''>('');

  const normalized = term.trim().toLowerCase();
  const visible = (materials.data ?? []).filter(
    (material) =>
      (!category || material.category === category) && (!normalized || `${material.code} ${material.name}`.toLowerCase().includes(normalized)),
  );

  return (
    <div className="card flex flex-col overflow-hidden lg:sticky lg:top-6 lg:max-h-[calc(100dvh-48px)]">
      <div className="flex flex-col gap-2 border-b border-line p-3">
        <label className="relative">
          <Search size={15} strokeWidth={1.75} className="absolute top-1/2 left-3 -translate-y-1/2 text-fg-3" aria-hidden />
          <Input value={term} placeholder="Material qidirish" aria-label="Material qidirish" onChange={(event) => setTerm(event.target.value)} className="pl-9" />
        </label>
        <Select value={category} aria-label="Kategoriya" onChange={(event) => setCategory(event.target.value as MaterialCategory | '')}>
          <option value="">Barcha kategoriyalar</option>
          {(Object.keys(CATEGORY_LABEL) as MaterialCategory[]).map((value) => (
            <option key={value} value={value}>
              {CATEGORY_LABEL[value]}
            </option>
          ))}
        </Select>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <QueryState loading={materials.isPending} error={materials.error} rows={6}>
          <ul>
            {visible.map((material) => (
              <li key={material.code}>
                <NavLink
                  to={routes.material(material.code)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 border-b border-line px-3.5 py-2.5 transition-colors duration-150 hover:bg-surface-2',
                      isActive && 'bg-accent-soft hover:bg-accent-soft',
                    )
                  }
                >
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm/5 font-medium">{material.name}</span>
                    <span className="truncate font-mono text-[11px] text-fg-3">{material.code}</span>
                  </span>
                  <span className="shrink-0 text-right text-[11px] text-fg-3 tabular-nums">
                    {CATEGORY_LABEL[material.category]}
                    <br />
                    {material._count.listings} havola
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
        </QueryState>
      </div>
    </div>
  );
}
