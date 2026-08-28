'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { RiCheckboxCircleFill, RiErrorWarningFill, RiInformationFill } from '@remixicon/react';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import {
  Toolbar,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from '@/partials/common/toolbar';
import { useTranslation } from '@/hooks/useTranslation';
import { translateApiError } from '@/lib/format-utils';
import { usePersonContext } from '../contexts/person-context';
import { BasicInformationSection, type CreatePersonFormData } from './components/basic-information-section';

// Persian language id (KSS_Common_Prod.dbo.Language). The single name entered on
// this page is stored as the Persian (fa) translation, matching the edit form's
// create branch which posts to /api/person → AddWithTranslation.
const PERSIAN_LANGUAGE_ID = 12;

interface SexTranslation {
  sexId: number;
  languageId: number;
  name: string;
}

interface ReferenceData {
  sexTranslations: SexTranslation[];
}

const initialFormData: CreatePersonFormData = {
  nationalId: '',
  firstName: '',
  lastName: '',
  fatherName: '',
  dateOfBirth: '',
  sexId: 0,
};

export function CreatePersonContent() {
  const { t } = useTranslation('person-form');
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setSelectedPerson } = usePersonContext();
  const [formData, setFormData] = useState<CreatePersonFormData>(initialFormData);

  // Reference data — only the sex options are needed for the create form.
  // Mirrors how the edit page loads reference data.
  const { data: referenceData } = useQuery<ReferenceData>({
    queryKey: ['person-reference-data'],
    queryFn: async () => {
      const response = await fetch('/api/person/reference');
      if (!response.ok) throw new Error('Failed to load reference data');
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const handleInputChange = (
    field: keyof CreatePersonFormData,
    value: string | number,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const mutation = useMutation({
    mutationFn: async (data: CreatePersonFormData) => {
      // Reuse the EXACT create call the edit form uses: BFF POST /api/person →
      // createPersonWithTranslation → backend POST /Api/Person/AddWithTranslation.
      // Person fields + a translations array (Persian name only).
      const response = await fetch('/api/person', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sexId: data.sexId,
          preferredLanguageId: PERSIAN_LANGUAGE_ID,
          nationalId: data.nationalId || undefined,
          dateOfBirth: data.dateOfBirth || undefined,
          translations: [
            {
              languageId: PERSIAN_LANGUAGE_ID,
              firstName: data.firstName,
              lastName: data.lastName,
              fatherName: data.fatherName || undefined,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create person');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.custom(
        () => (
          <Alert variant="mono" icon="success">
            <AlertIcon>
              <RiCheckboxCircleFill />
            </AlertIcon>
            <AlertTitle>
              {t('form.messages.personCreated', { defaultValue: 'Person created' })}
            </AlertTitle>
          </Alert>
        ),
        { position: 'top-center' },
      );

      queryClient.invalidateQueries({ queryKey: ['persons'] });

      // Drop into the edit page with the new person selected so the rest of the
      // profile (contact, employment, …) can be completed.
      if (data?.id) {
        setSelectedPerson({
          id: data.id,
          nationalId: formData.nationalId,
          translations: [
            {
              languageId: PERSIAN_LANGUAGE_ID,
              firstName: formData.firstName,
              lastName: formData.lastName,
            },
          ],
        });
        router.push('/edit');
      }
    },
    onError: (error: Error) => {
      toast.custom(
        () => (
          <Alert variant="mono" icon="destructive">
            <AlertIcon>
              <RiErrorWarningFill />
            </AlertIcon>
            <AlertTitle>{translateApiError(error.message, t)}</AlertTitle>
          </Alert>
        ),
        { position: 'top-center' },
      );
    },
  });

  const isSubmitting = mutation.status === 'pending';

  const isValid =
    /^[0-9]{10}$/.test(formData.nationalId) &&
    formData.firstName.trim() !== '' &&
    formData.lastName.trim() !== '' &&
    formData.fatherName.trim() !== '' &&
    formData.dateOfBirth.trim() !== '' &&
    formData.sexId > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="space-y-5 lg:space-y-7.5">
      {/*
        Title Card lives OUTSIDE the descendant-tint wrapper below so its color
        override actually wins (descendant selectors beat Card-level classes on
        specificity even with `!`).
      */}
      <div className="[&_div.rounded-xl.bg-card.bg-card]:border-black! dark:[&_div.rounded-xl.bg-card.bg-card]:border-white!">
        <Card className="bg-blue-50! dark:bg-blue-950/25! shadow-lg shadow-black/5">
          <CardContent className="py-5">
            <Toolbar>
              <ToolbarHeading>
                <ToolbarPageTitle
                  text={t('toolbar.createTitle', { defaultValue: 'Create Person' })}
                />
                <ToolbarDescription>
                  {t('toolbar.createDescription', {
                    defaultValue: 'Register a new person',
                  })}
                </ToolbarDescription>
              </ToolbarHeading>
            </Toolbar>
          </CardContent>
        </Card>
      </div>

      {/* Blue glass tint on every section Card — identical to /person/edit. */}
      <div
        className={
          '[&_div.rounded-xl.bg-card]:bg-blue-50! ' +
          '[&_div.rounded-xl.bg-card]:border-blue-100! ' +
          'dark:[&_div.rounded-xl.bg-card]:bg-blue-950/25! ' +
          'dark:[&_div.rounded-xl.bg-card]:border-blue-900! ' +
          '[&_div.rounded-xl.bg-card]:shadow-lg ' +
          '[&_div.rounded-xl.bg-card]:shadow-black/5 ' +
          '[&_tr:has(td):hover]:bg-blue-100! ' +
          'dark:[&_tr:has(td):hover]:bg-muted/50! ' +
          '[&_.text-muted-foreground]:text-card-foreground! ' +
          '[&_[data-slot="table-head"]]:text-muted-foreground! ' +
          '[&_.text-sm.text-muted-foreground.text-center]:text-muted-foreground! ' +
          '[&_[data-slot="card-description"]]:text-muted-foreground!'
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="grid gap-5 lg:gap-7.5">
            <BasicInformationSection
              formData={formData}
              onInputChange={handleInputChange}
              sexTranslations={referenceData?.sexTranslations}
              disabled={isSubmitting}
            />

            {/* Operations box — mirrors the edit page's operations card. */}
            <div className="[&_div.rounded-xl.bg-card.bg-card]:border-black! dark:[&_div.rounded-xl.bg-card.bg-card]:border-white!">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {t('form.sections.operations', { defaultValue: 'Operations' })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 flex items-start gap-2">
                    <RiInformationFill className="text-blue-600 dark:text-blue-400 size-5 shrink-0 mt-0.5" />
                    <span className="text-sm text-card-foreground">
                      {t('form.messages.createInfo', {
                        defaultValue:
                          'After registering the person, you will be redirected to the edit page to complete the remaining information.',
                      })}
                    </span>
                  </div>
                  <div className="flex justify-end space-x-4 space-x-reverse">
                    <Button type="submit" disabled={isSubmitting || !isValid}>
                      <Save className="h-4 w-4" />
                      {isSubmitting
                        ? t('form.actions.processing', {
                            defaultValue: 'Processing...',
                          })
                        : t('form.actions.create', { defaultValue: 'Create Person' })}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
