'use client';

import { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
import type { UserDto } from '@/services/auth-api';
import { AccountCard } from './components/account-card';
import { PasswordCard } from './components/password-card';
import { LockCard } from './components/lock-card';
import { VerificationCard } from './components/verification-card';
import { SessionsRolesCard } from './components/sessions-roles-card';

export function PersonSecurityContent() {
  const { t } = useTranslation('person-security');
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  // Shared with /person/edit and /person/access via PersonProvider.
  const { selectedPerson, setSelectedPerson } = usePersonContext();

  const personId = selectedPerson?.id ?? null;
  const currentUserPersonId = (session?.user as { personId?: string } | undefined)
    ?.personId ?? null;

  // Per-section access levels for the selected person — drives the read-only
  // banner and gating, exactly like the information/assets/access pages.
  const { data: myLevels } = useQuery<{
    information: number;
    assets: number;
    access: number;
    security: number;
  }>({
    queryKey: ['person-access-levels-security', personId],
    queryFn: async () => {
      if (!personId) return { information: 0, assets: 0, access: 0, security: 0 };
      const res = await fetch(`/api/person/access/my-levels/${personId}`);
      if (!res.ok) return { information: 0, assets: 0, access: 0, security: 0 };
      return res.json();
    },
    enabled: !!personId,
    staleTime: 60 * 1000,
  });

  // Banner shows for level === 1 (view-only). Level 0 = no access (cards
  // hidden entirely), level 2 = edit (no banner).
  const securityLevel = myLevels?.security ?? 0;
  const isReadOnly = !!personId && securityLevel === 1;
  const hasNoAccess = !!personId && securityLevel === 0 && currentUserPersonId !== personId;

  // Fetch the User row (auth side) tied to the selected Person. Returns null
  // when no user account is linked — used to render a friendly empty state.
  // Only enabled when the caller has at least view access (level >= 1).
  // Memoize the queryKey so its identity is stable — otherwise the array
  // literal recreates every render and downstream useCallback hooks that
  // depend on it (e.g. handleChanged) churn unnecessarily.
  const userQueryKey = useMemo(
    () => ['auth-user-by-person', personId] as const,
    [personId],
  );
  const { data: user, isLoading: userLoading } = useQuery<UserDto | null>({
    queryKey: userQueryKey,
    queryFn: async () => {
      if (!personId) return null;
      const res = await fetch(`/api/auth/user/by-person/${personId}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to load user');
      }
      const json = await res.json();
      return json as UserDto | null;
    },
    enabled: !!personId && !hasNoAccess,
  });

  const handleChanged = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: userQueryKey });
  }, [queryClient, userQueryKey]);

  const isOwner =
    !!currentUserPersonId && !!personId && currentUserPersonId === personId;

  return (
    <div className="space-y-5 lg:space-y-7.5">
      {/*
        Title Card OUTSIDE the descendant-tint wrapper so its color override
        wins. Default theme is light blue (matches /person/edit);
        on view-only the title flips to red and the banner appears below the
        description — same pattern as the access page.
      */}
      {/* Page title Card — neutral bg always; border flips to red on view-only / no-access. */}
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
                <ToolbarPageTitle text={t('pageTitle', { defaultValue: 'Account Security' })} />
                <ToolbarDescription>
                  {t('pageDescription', {
                    defaultValue:
                      'Manage password, account lock, email/phone verification and security settings',
                  })}
                </ToolbarDescription>
              </ToolbarHeading>
            </Toolbar>
            {(isReadOnly || hasNoAccess) && (
              <div className="mt-3 flex items-center gap-3">
                <RiInformationFill className="text-red-700 dark:text-red-400 size-5 shrink-0" />
                <span className="text-red-900 dark:text-red-200 font-medium">
                  {hasNoAccess
                    ? t('noAccessBanner', { defaultValue: "You don't have access to this person's security" })
                    : t('viewOnlyBanner', { defaultValue: 'You have view-only access' })}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Light blue glass tint on every section Card via descendant selector. */}
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
              {/* Person Selection Card — black border (light) / white (dark), matches company. */}
              <div className="[&_div.rounded-xl.bg-card.bg-card]:border-black! dark:[&_div.rounded-xl.bg-card.bg-card]:border-white!">
                <PersonSelectionCard
                  value={selectedPerson}
                  onValueChange={setSelectedPerson}
                  isEditMode={!!selectedPerson?.id}
                />
              </div>

              {!personId && (
                <Card>
                  <CardContent className="py-6">
                    <div className="flex items-center gap-3">
                      <RiInformationFill className="text-blue-600 dark:text-blue-400 size-5 shrink-0" />
                      <span className="text-foreground">
                        {t('noPersonSelected', {
                          defaultValue: 'Please select a person first',
                        })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {personId && !hasNoAccess && !userLoading && !user && (
                <Card>
                  <CardContent className="py-6">
                    <div className="flex items-center gap-3">
                      <RiInformationFill className="text-amber-600 dark:text-amber-400 size-5 shrink-0" />
                      <span className="text-foreground">
                        {t('noUserAccount', {
                          defaultValue: 'This person has no user account',
                        })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {personId && !hasNoAccess && user && (
                <>
                  <AccountCard
                    user={user}
                    isOwner={isOwner}
                    isReadOnly={isReadOnly}
                    onChanged={handleChanged}
                  />
                  <PasswordCard
                    user={user}
                    isOwner={isOwner}
                    isReadOnly={isReadOnly}
                    onChanged={handleChanged}
                  />
                  <LockCard
                    user={user}
                    isOwner={isOwner}
                    isReadOnly={isReadOnly}
                    onChanged={handleChanged}
                  />
                  <VerificationCard
                    user={user}
                    isOwner={isOwner}
                    isReadOnly={isReadOnly}
                    onChanged={handleChanged}
                  />
                  <SessionsRolesCard
                    user={user}
                    isOwner={isOwner}
                    isReadOnly={isReadOnly}
                    onChanged={handleChanged}
                  />
                </>
              )}
        </div>
      </div>
    </div>
  );
}
