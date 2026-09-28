'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { RiInformationFill } from '@remixicon/react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from '@/partials/common/toolbar';
import { useTranslation } from '@/hooks/useTranslation';
import { GuideLinkButton } from '@/app/components/company/guide-link-button';
import { usePersonContext } from '../contexts/person-context';
import { PersonForm } from './components';

export function PersonContent() {
  const { t } = useTranslation('person-form');
  const { data: session } = useSession();
  // Shared with /person/access and /person/security via PersonProvider
  // (persists in localStorage key `person-current-selection`).
  const { selectedPersonId } = usePersonContext();
  const [activePersonId, setActivePersonId] = useState<string | undefined>(
    selectedPersonId || undefined,
  );
  const currentUserPersonId = (session?.user as { personId?: string } | undefined)
    ?.personId ?? null;

  // Caller's per-section access levels for the currently loaded person. The
  // information section drives the page's read-only / no-access states.
  // Matches the top-down flow used by /company/information.
  const { data: myLevels } = useQuery<{ information: number; assets: number; access: number }>({
    queryKey: ['person-information-my-levels', activePersonId],
    queryFn: async () => {
      if (!activePersonId) return { information: 0, assets: 0, access: 0 };
      const res = await fetch(`/api/person/access/my-levels/${activePersonId}`);
      if (!res.ok) return { information: 0, assets: 0, access: 0 };
      return res.json();
    },
    enabled: !!activePersonId,
    staleTime: 60 * 1000,
  });

  const informationLevel = myLevels?.information ?? 0;
  const [isReadOnly, setIsReadOnly] = useState(false);
  useEffect(() => {
    setIsReadOnly(!!activePersonId && informationLevel === 1);
  }, [activePersonId, informationLevel]);

  // Level 0 + non-owner = no access. Hide the form, flip title red, show
  // a distinct banner. Matches /person/security's no-access flow.
  const hasNoAccess =
    !!activePersonId && informationLevel === 0 && currentUserPersonId !== activePersonId;

  return (
    <div className="space-y-5 lg:space-y-7.5">
      {/*
        Title Card lives OUTSIDE the descendant-tint wrapper below so its
        color override actually wins. Inside that wrapper, the descendant
        selector beats Card-level classes on specificity even with `!`,
        which is why the previous attempt didn't visibly turn red.
      */}
      {/* Page title Card — neutral bg always; border flips to red on view-only.
          Doubled .bg-card.bg-card on the wrapper beats the Card's own border
          on specificity, so the red wins. */}
      <div
        className={
          isReadOnly || hasNoAccess
            ? '[&_div.rounded-xl.bg-card.bg-card]:border-red-500! dark:[&_div.rounded-xl.bg-card.bg-card]:border-red-500!'
            : '[&_div.rounded-xl.bg-card.bg-card]:border-black! dark:[&_div.rounded-xl.bg-card.bg-card]:border-white!'
        }
      >
        <Card className="bg-blue-50! dark:bg-blue-950/25! shadow-lg shadow-black/5">
          <CardContent className="py-5">
            <Toolbar>
              <ToolbarHeading>
                <ToolbarPageTitle
                  text={t('toolbar.title', { defaultValue: 'Person Information' })}
                />
                <ToolbarDescription>
                  {t('toolbar.description', { defaultValue: 'Person Information Management' })}
                </ToolbarDescription>
              </ToolbarHeading>
              <ToolbarActions>
                <GuideLinkButton href="/edit-guide" />
              </ToolbarActions>
            </Toolbar>
            {(isReadOnly || hasNoAccess) && (
              <div className="mt-3 flex items-center gap-3">
                <RiInformationFill className="text-red-700 dark:text-red-400 size-5 shrink-0" />
                <span className="text-red-900 dark:text-red-200 font-medium">
                  {hasNoAccess
                    ? t('informationNoAccessBanner', {
                        defaultValue: "You don't have access to this section",
                      })
                    : t('informationViewOnlyBanner', {
                        defaultValue: 'You have view-only access to this profile',
                      })}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/*
        Blue glass tint applied to every section Card via descendant selector.
        Title Card is intentionally above this wrapper so it can flip to red
        without competing with the blue rule.
      */}
      <div
        className={
          '[&_div.rounded-xl.bg-card]:bg-blue-50! ' +
          '[&_div.rounded-xl.bg-card]:border-blue-100! ' +
          'dark:[&_div.rounded-xl.bg-card]:bg-blue-950/25! ' +
          'dark:[&_div.rounded-xl.bg-card]:border-blue-900! ' +
          '[&_div.rounded-xl.bg-card]:shadow-lg ' +
          '[&_div.rounded-xl.bg-card]:shadow-black/5 ' +
          // Light-theme row hover (matches company).
          '[&_tr:has(td):hover]:bg-blue-100! ' +
          'dark:[&_tr:has(td):hover]:bg-muted/50! ' +
          // Force all subdued text to use card-foreground (readable in both themes).
          '[&_.text-muted-foreground]:text-card-foreground! ' +
          // Restore original muted color on column headers (both themes).
          '[&_[data-slot="table-head"]]:text-muted-foreground! ' +
          // Restore original muted color on empty-state messages (both themes).
          '[&_.text-sm.text-muted-foreground.text-center]:text-muted-foreground! ' +
          // Restore original muted color on CardDescription (both themes).
          '[&_[data-slot="card-description"]]:text-muted-foreground!'
        }
      >
        <div className="grid gap-5 lg:gap-7.5">
          <PersonForm
            onPersonChange={setActivePersonId}
            isReadOnly={isReadOnly}
            hasNoAccess={hasNoAccess}
          />
        </div>
      </div>
    </div>
  );
}
