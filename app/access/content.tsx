'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { RiInformationFill } from '@remixicon/react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Toolbar,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from '@/partials/common/toolbar';
import { useTranslation } from '@/hooks/useTranslation';
import { PersonSelectionCard } from '../components/person-selection-card';
import { usePersonContext } from '../contexts/person-context';
import { AccessManagementSection } from './components/access-management-section';
import { RoleAccessManagementSection } from './components/role-access-management-section';

export function PersonAccessContent() {
  const { t } = useTranslation('person-access');
  const { data: session } = useSession();
  // Shared with /person/edit and /person/security via PersonProvider
  // (persists in localStorage key `person-current-selection`).
  const { selectedPerson, setSelectedPerson } = usePersonContext();
  const [isReadOnly, setIsReadOnly] = useState(false);
  const currentUserPersonId = (session?.user as { personId?: string } | undefined)
    ?.personId ?? null;

  // Reuse the same access-section level the AccessManagementSection consults so
  // both sections are gated by the caller's Edit on the Access section.
  const { data: myLevels } = useQuery<{ access: number }>({
    queryKey: ['person-access-my-levels', selectedPerson?.id],
    queryFn: async () => {
      if (!selectedPerson?.id) return { access: 0 };
      const res = await fetch(`/api/person/access/my-levels/${selectedPerson.id}`);
      if (!res.ok) return { access: 0 };
      return res.json();
    },
    enabled: !!selectedPerson?.id,
  });
  const accessLevel = myLevels?.access ?? 0;
  const canEditRoleAccess = accessLevel >= 2;

  // Level 0 + non-owner = no access on the Access section. Show the red
  // banner (matches /person/security) and hide the section cards so the
  // grants fetch never fires (which would otherwise toast a 400).
  const hasNoAccess =
    !!selectedPerson?.id && accessLevel === 0 && currentUserPersonId !== selectedPerson.id;

  return (
    <div className="space-y-5 lg:space-y-7.5">
      {/*
        Title Card lives OUTSIDE the descendant-tint wrapper below so its
        color override actually wins (descendant selectors beat Card-level
        classes on specificity even with `!`). Default theme is light blue;
        on view-only the title flips to red and the access-denied message
        appears below the description.
      */}
      {/* Page title Card — neutral bg always; border flips to red on view-only. */}
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
                <ToolbarPageTitle text={t('personAccessPageTitle', { defaultValue: 'Person Access Management' })} />
                <ToolbarDescription>
                  {t('accessManagementDescription', {
                    defaultValue: 'Grant other persons view or edit access to a selected profile',
                  })}
                </ToolbarDescription>
              </ToolbarHeading>
            </Toolbar>
            {(isReadOnly || hasNoAccess) && (
              <div className="mt-3 flex items-center gap-3">
                <RiInformationFill className="text-red-700 dark:text-red-400 size-5 shrink-0" />
                <span className="text-red-900 dark:text-red-200 font-medium">
                  {hasNoAccess
                    ? t('accessNoAccessBanner', {
                        defaultValue: "You don't have access to this section",
                      })
                    : t('accessViewOnlyBanner', {
                        defaultValue: 'You have view-only access to access management',
                      })}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/*
        Light blue glass tint on every section Card via descendant selector.
        Title Card is intentionally above this wrapper so it can host the
        access-denied message without the descendant rule competing.
      */}
      <div
        className={
          // Light theme
          '[&_div.rounded-xl.bg-card]:bg-blue-50! ' +
          '[&_div.rounded-xl.bg-card]:border-blue-100! ' +
          // Dark theme
          'dark:[&_div.rounded-xl.bg-card]:bg-blue-950/25! ' +
          'dark:[&_div.rounded-xl.bg-card]:border-blue-900! ' +
          // Both themes
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
              {/* Person Selection Card — black border (light) / white (dark), matches company. */}
              <div className="[&_div.rounded-xl.bg-card.bg-card]:border-black! dark:[&_div.rounded-xl.bg-card.bg-card]:border-white!">
                <PersonSelectionCard
                  value={selectedPerson}
                  onValueChange={setSelectedPerson}
                  isEditMode={!!selectedPerson?.id}
                />
              </div>

              {/* Section 1 — sky border to match badge */}
              {selectedPerson?.id && !hasNoAccess && (
                <div className="[&_div.rounded-xl.bg-card.bg-card]:border-sky-500! dark:[&_div.rounded-xl.bg-card.bg-card]:border-sky-500!">
                  <AccessManagementSection
                    personId={selectedPerson.id}
                    onReadOnlyChange={setIsReadOnly}
                  />
                </div>
              )}

              {/* Section 2 — indigo border to match badge */}
              {selectedPerson?.id && !hasNoAccess && (
                <div className="[&_div.rounded-xl.bg-card.bg-card]:border-indigo-500! dark:[&_div.rounded-xl.bg-card.bg-card]:border-indigo-500!">
                  <RoleAccessManagementSection
                    personId={selectedPerson.id}
                    canEdit={canEditRoleAccess}
                  />
                </div>
              )}
        </div>
      </div>
    </div>
  );
}
