import { useTranslations } from 'next-intl';
import { Badge, type BadgeTone } from '@/components/ui/badge';
import { FeatureCard, FeatureIntro } from './FeatureCard';

type Project = { name: string; status: string; range: string; meta: string };

const STATUS_TONES: BadgeTone[] = ['success', 'neutral', 'accent'];

export function ProjectsCard() {
  const t = useTranslations('features.projects');
  const projects = t.raw('items') as Project[];

  return (
    <FeatureCard layout="grid" className="grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] items-stretch gap-4">
      <div className="flex flex-col justify-center">
        <FeatureIntro title={t('title')} text={t('text')} />
      </div>
      {projects.map((project, index) => (
        <div
          key={project.name}
          className="flex flex-col gap-3 rounded-xl border border-line bg-surface-2 p-4 tabular-nums"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium">{project.name}</span>
            <Badge tone={STATUS_TONES[index]}>{project.status}</Badge>
          </div>
          <div className="font-display text-lg font-semibold tracking-[-0.01em]">{project.range}</div>
          <div className="text-xs text-fg-3">{project.meta}</div>
        </div>
      ))}
    </FeatureCard>
  );
}
