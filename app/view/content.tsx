'use client';

import { useState } from 'react';
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
import { PersonForm, Sidebar } from '../edit/components';

// Read-only view of a person. Reuses the edit page's form forced into its
// read-only mode (isReadOnly) — the form already hides the Update button and
// freezes every sub-grid's add/edit/delete affordances. This is an intentional
// view (like /company/view), so there is no access-level query and no red
// view-only banner — the title card keeps a neutral border.
export function PersonViewContent() {
  const { t } = useTranslation('person-form');
  // Shared with /person/edit, /person/access and /person/security via
  // PersonProvider (persists in localStorage key `person-current-selection`).
  const { selectedPersonId } = usePersonContext();
  const [activePersonId, setActivePersonId] = useState<string | undefined>(
    selectedPersonId || undefined,
  );

  return (
    <div className="space-y-5 lg:space-y-7.5">
      {/* Page title Card — neutral; this is an intentional read-only view (not an
          access restriction), so no red view-only banner. */}
      <div className="[&_div.rounded-xl.bg-card.bg-card]:border-black! dark:[&_div.rounded-xl.bg-card.bg-card]:border-white!">
        <Card className="bg-blue-50! dark:bg-blue-950/25! shadow-lg shadow-black/5">
          <CardContent className="py-5">
            <Toolbar>
              <ToolbarHeading>
                <ToolbarPageTitle
                  text={t('toolbar.viewTitle', { defaultValue: 'View Person' })}
                />
                <ToolbarDescription>
                  {t('toolbar.viewDescription', {
                    defaultValue: 'View person information',
                  })}
                </ToolbarDescription>
              </ToolbarHeading>
              <ToolbarActions>
                <GuideLinkButton href="/view-guide" />
              </ToolbarActions>
            </Toolbar>
          </CardContent>
        </Card>
      </div>

      {/*
        Blue glass tint applied to every section Card via descendant selector.
        Title Card is intentionally above this wrapper so it can keep its own
        neutral border without competing with the blue rule.
      */}
      <div
        className={
          '[&_div.rounded-xl.bg-card]:bg-blue-50! ' +
          '[&_div.rounded-xl.bg-card]:border-blue-100! ' +
          'dark:[&_div.rounded-xl.bg-card]:bg-blue-950/25! ' +
          'dark:[&_div.rounded-xl.bg-card]:border-blue-900! ' +
          '[&_div.rounded-xl.bg-card]:shadow-lg ' +
          '[&_div.rounded-xl.bg-card]:shadow-black/5 ' +
          // Light-theme row hover (matches edit/company).
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
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-5 lg:gap-7.5">
          <div className="col-span-3">
            <div className="grid gap-5 lg:gap-7.5">
              <PersonForm
                onPersonChange={setActivePersonId}
                isReadOnly={true}
                hasNoAccess={false}
              />
            </div>
          </div>
          <div className="col-span-1">
            <div className="grid gap-5 lg:gap-7.5">
              <Sidebar personId={activePersonId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
