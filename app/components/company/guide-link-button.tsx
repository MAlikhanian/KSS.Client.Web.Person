'use client';

import Link from 'next/link';
import { CircleHelp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';

/**
 * The orange «راهنمای تصویری» entry button shown on each real company page's
 * title bar, linking to that page's read-only visual guide. One component so
 * the help-button styling lives in a single place.
 */
export function GuideLinkButton({ href }: { href: string }) {
  const { t } = useTranslation('company-information-guide');
  return (
    <Button asChild className="bg-orange-500! text-white! hover:bg-orange-600!">
      <Link href={href}>
        <CircleHelp className="h-4 w-4" />
        {t('entry.button', { defaultValue: 'Visual guide' })}
      </Link>
    </Button>
  );
}
