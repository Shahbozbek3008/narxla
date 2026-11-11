import { stepTitle } from '../common/styles';

export function StepHeading({ title, lead }: { title: string; lead: string }) {
  return (
    <>
      <h2 className={stepTitle}>{title}</h2>
      <p className="mt-1 text-fg-2">{lead}</p>
    </>
  );
}
