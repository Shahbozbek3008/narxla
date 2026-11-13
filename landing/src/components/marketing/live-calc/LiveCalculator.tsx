'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { CATEGORY_COLOR } from '@/components/app/result/categories';
import { useEngineText } from '@/components/app/common/useEngineText';
import { AnimatedValue } from '@/components/shared/AnimatedValue';
import { Reveal } from '@/components/shared/Reveal';
import { Button } from '@/components/ui/button';
import { Segmented } from '@/components/ui/segmented';
import { useRouter } from '@/i18n/router';
import { estimate, QUALITIES, ROOMS, WET_ROOMS, WORK_IDS, type Quality, type RoomId } from '@/lib/calc-engine';
import { dec, fmt, mln, num } from '@/lib/format';
import { EASE_OUT } from '@/lib/motion';
import { routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { DEFAULT_DRAFT, draftToInput, useDraft } from '@/store/draft';
import { usePriceBook, usePrices } from '@/store/prices';
import { FloorPreview } from './FloorPreview';
import { RangeField } from './RangeField';

const ROOM_IDS: RoomId[] = ['yotoq', 'mehmon', 'oshxona', 'hammom'];
const LENGTH = { min: 1.5, max: 8, step: 0.1 };
const WIDTH = { min: 1.2, max: 6, step: 0.1 };
const TOP_LINES = 4;
const WORKS_STEP = 2;

const presetOf = (room: RoomId) => {
  const preset = ROOMS.find((item) => item.id === room) ?? ROOMS[0];
  return { L: num(preset.L), W: num(preset.W) };
};

const roundSum = (value: number) => fmt(Math.round(value));

export function LiveCalculator() {
  const t = useTranslations('liveCalc');
  const tApp = useTranslations('app');
  const { lineName, lineQty } = useEngineText();
  const router = useRouter();
  const book = usePriceBook();
  const [room, setRoom] = useState<RoomId>(DEFAULT_DRAFT.room);
  const [size, setSize] = useState(() => presetOf(DEFAULT_DRAFT.room));
  const [quality, setQuality] = useState<Quality>(DEFAULT_DRAFT.quality);

  useEffect(() => {
    void usePrices.getState().load();
  }, []);

  const input = useMemo(
    () => ({
      ...draftToInput(DEFAULT_DRAFT),
      room,
      L: size.L,
      W: size.W,
      quality,
      works: { ...DEFAULT_DRAFT.works, santex: WET_ROOMS.includes(room) },
    }),
    [room, size, quality],
  );
  const result = useMemo(() => estimate(input, book), [input, book]);
  const lines = useMemo(() => [...result.mats].sort((a, b) => b.total - a.total).slice(0, TOP_LINES), [result]);
  const shares = WORK_IDS.flatMap((id) => {
    const amount = result.byCat[id] ?? 0;
    return amount > 0 ? [{ id, share: (amount / result.total) * 100 }] : [];
  });
  const formatMln = (value: number) => tApp('mln', { value: mln(value) });

  const pickRoom = (next: RoomId) => {
    setRoom(next);
    setSize(presetOf(next));
  };

  const continueInWizard = () => {
    useDraft.getState().load(input, WORKS_STEP);
    router.push(routes.newEstimateStep(WORKS_STEP + 1));
  };

  return (
    <div className="mt-[clamp(32px,4vw,48px)] grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      <Reveal className="spotlight sheen flex flex-col gap-7 rounded-3xl border border-line bg-surface p-[clamp(20px,3vw,32px)] shadow-(--shadow-card)">
        <div className="flex flex-col gap-3">
          <span className="text-sm/5 font-medium text-fg-2">{t('room')}</span>
          <div className="grid grid-cols-2 gap-2">
            {ROOM_IDS.map((id) => (
              <button
                key={id}
                type="button"
                aria-pressed={room === id}
                onClick={() => pickRoom(id)}
                className={cn(
                  'relative h-11 rounded-xl border px-3 text-left text-sm font-medium transition-colors duration-200',
                  room === id ? 'border-accent text-accent-text' : 'border-line text-fg-2 hover:border-line-2 hover:text-fg',
                )}
              >
                {room === id && (
                  <motion.span
                    layoutId="live-room"
                    className="absolute inset-0 rounded-[11px] bg-accent-soft"
                    transition={{ duration: 0.45, ease: EASE_OUT }}
                  />
                )}
                <span className="relative">{tApp(`rooms.${id}.name`)}</span>
              </button>
            ))}
          </div>
        </div>
        <RangeField
          label={t('length')}
          unit={t('meters')}
          {...LENGTH}
          value={size.L}
          onChange={(L) => setSize((current) => ({ ...current, L }))}
        />
        <RangeField
          label={t('width')}
          unit={t('meters')}
          {...WIDTH}
          value={size.W}
          onChange={(W) => setSize((current) => ({ ...current, W }))}
        />
        <div className="flex flex-col gap-3">
          <span className="text-sm/5 font-medium text-fg-2">{t('quality')}</span>
          <Segmented
            label={t('quality')}
            value={quality}
            onChange={setQuality}
            stretch
            options={QUALITIES.map((id) => ({ value: id, label: tApp(`qualities.${id}.name`) }))}
          />
        </div>
        <div className="mt-auto max-lg:hidden">
          <FloorPreview
            room={room}
            length={size.L}
            width={size.W}
            maxLength={LENGTH.max}
            maxWidth={WIDTH.max}
            unit={t('meters')}
          />
        </div>
      </Reveal>

      <Reveal
        delay={120}
        className="relative flex flex-col overflow-hidden rounded-3xl border border-line-2 bg-surface p-[clamp(20px,3vw,32px)] shadow-(--shadow-lift)"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 -right-30 size-90 bg-[radial-gradient(circle,var(--glow),transparent_65%)]"
        />
        <div className="relative flex flex-wrap items-center justify-between gap-2 text-sm/5 text-fg-2">
          <span>{t('budget')}</span>
          <span className="rounded-full border border-line px-2.5 py-0.5 text-xs/5 text-fg-3 tabular-nums">
            {tApp(`rooms.${room}.name`)} · {t('area', { value: dec(result.area) })}
          </span>
        </div>
        <div className="relative mt-3 font-display text-[clamp(34px,5vw,52px)] leading-none font-semibold tracking-[-0.035em] whitespace-nowrap text-accent-text tabular-nums">
          <AnimatedValue value={result.low} format={mln} />–<AnimatedValue value={result.high} format={mln} />
          <span className="ml-2 text-[0.42em] font-medium tracking-normal text-fg-2">{t('currency')}</span>
        </div>

        <div className="relative mt-6 flex h-2 gap-0.5 overflow-hidden rounded-full" aria-hidden>
          {shares.map(({ id, share }) => (
            <motion.span
              key={id}
              className="h-full"
              style={{ background: CATEGORY_COLOR[id] }}
              initial={false}
              animate={{ width: `${share}%` }}
              transition={{ duration: 0.6, ease: EASE_OUT }}
            />
          ))}
        </div>

        <div className="relative mt-5 grid grid-cols-3 gap-2">
          {[
            { label: t('materials'), value: result.matTotal },
            { label: t('labour'), value: result.labTotal },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl border border-line bg-surface-2 px-2.5 py-2.5 sm:px-3">
              <div className="truncate text-xs/4 text-fg-3">{label}</div>
              <AnimatedValue value={value} format={formatMln} className="mt-1 block font-display text-[15px]/6 font-semibold whitespace-nowrap tabular-nums sm:text-base/6" />
            </div>
          ))}
          <div className="rounded-xl border border-line bg-surface-2 px-2.5 py-2.5 sm:px-3">
            <div className="truncate text-xs/4 text-fg-3">{t('duration')}</div>
            <div className="mt-1 font-display text-[15px]/6 font-semibold whitespace-nowrap tabular-nums sm:text-base/6">{t('days', { min: result.dMin, max: result.dMax })}</div>
          </div>
        </div>

        <div className="relative mt-5 flex-1">
          <div className="text-xs/4 font-medium tracking-[0.04em] text-fg-3 uppercase">{t('top')}</div>
          <ul className="mt-2 text-sm/5">
            <AnimatePresence initial={false} mode="popLayout">
              {lines.map((line) => (
                <motion.li
                  key={`${line.cat}-${line.code}`}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: EASE_OUT }}
                  className="flex items-center justify-between gap-3 border-b border-line py-2.5 tabular-nums last:border-b-0"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="size-1.5 shrink-0 rounded-[2px]" style={{ background: CATEGORY_COLOR[line.cat] }} />
                    <span className="truncate">{lineName(line)}</span>
                    <span className="hidden shrink-0 text-xs text-fg-3 sm:inline">{lineQty(line)}</span>
                  </span>
                  <AnimatedValue value={line.total} format={roundSum} className="shrink-0 font-medium" />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>

        <div className="relative mt-6 flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px]/5 text-fg-3">{t('note')}</p>
          <Button size="lg" className="group shine shrink-0" onClick={continueInWizard}>
            {t('cta')}
            <ArrowRight size={16} strokeWidth={1.75} className="transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
          </Button>
        </div>
      </Reveal>
    </div>
  );
}
