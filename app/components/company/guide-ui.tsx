'use client';

import { RiInformationFill } from '@remixicon/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/useTranslation';

/**
 * Shared building blocks for the company "visual guide" pages (read-only,
 * sample-data walkthroughs). Each guide reuses the same violet tint + section
 * help cards so they look and behave consistently.
 */

// Violet "glass" tint on every section Card → marks the page as training mode.
export const GUIDE_TINT =
  'space-y-5 lg:space-y-7.5 ' +
  '[&_div.rounded-xl.bg-card]:bg-violet-50! ' +
  '[&_div.rounded-xl.bg-card]:border-violet-100! ' +
  'dark:[&_div.rounded-xl.bg-card]:bg-violet-950/25! ' +
  'dark:[&_div.rounded-xl.bg-card]:border-violet-900! ' +
  '[&_div.rounded-xl.bg-card]:shadow-lg ' +
  '[&_div.rounded-xl.bg-card]:shadow-black/5';

// Static accent classes (kept literal so Tailwind's JIT preserves them); the
// colors mirror the real pages' section badges so the guide maps 1:1.
const ACCENT: Record<string, string> = {
  neutral: 'border-r-slate-600',
  sky: 'border-r-sky-500',
  indigo: 'border-r-indigo-500',
  teal: 'border-r-teal-500',
  cyan: 'border-r-cyan-600',
  slate: 'border-r-slate-500',
  emerald: 'border-r-emerald-500',
  violet: 'border-r-violet-500',
};
const NUM_BG: Record<string, string> = {
  neutral: 'bg-slate-600',
  sky: 'bg-sky-500',
  indigo: 'bg-indigo-500',
  teal: 'bg-teal-500',
  cyan: 'bg-cyan-600',
  slate: 'bg-slate-500',
  emerald: 'bg-emerald-500',
  violet: 'bg-violet-500',
};

/** A help block (intro + steps + tips) rendered above each real control. */
export function SectionHelp({
  ns,
  skey,
  color,
  num,
}: {
  ns: string;
  skey: string;
  color: string;
  num: string;
}) {
  const { t } = useTranslation(ns);
  const stepsRaw = t(`sections.${skey}.steps`, { returnObjects: true }) as unknown;
  const tipsRaw = t(`sections.${skey}.tips`, { returnObjects: true }) as unknown;
  const steps = Array.isArray(stepsRaw) ? (stepsRaw as string[]) : [];
  const tips = Array.isArray(tipsRaw) ? (tipsRaw as string[]) : [];

  return (
    <Card className={`border-r-4 ${ACCENT[color] ?? ACCENT.violet}`}>
      <CardContent className="py-5 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold ${NUM_BG[color] ?? NUM_BG.violet}`}
          >
            {num}
          </span>
          <h3 className="text-base font-semibold">{t(`sections.${skey}.title`)}</h3>
          <Badge variant="secondary" className="gap-1">
            <RiInformationFill className="h-3 w-3" />
            {t('labels.guide')}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground leading-7">{t(`sections.${skey}.intro`)}</p>
        {steps.length > 0 && (
          <div className="space-y-1">
            <p className="text-sm font-medium">{t('labels.howTo')}</p>
            <ol className="list-decimal pr-5 space-y-1 text-sm text-muted-foreground leading-7">
              {steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </div>
        )}
        {tips.length > 0 && (
          <div className="rounded-lg bg-muted/40 border border-border/60 p-3 space-y-1">
            <p className="text-sm font-medium">{t('labels.tips')}</p>
            <ul className="list-disc pr-5 space-y-1 text-sm text-muted-foreground leading-7">
              {tips.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}
        <p className="text-xs text-muted-foreground/80 pt-1">{t('labels.realControlNote')}</p>
      </CardContent>
    </Card>
  );
}
