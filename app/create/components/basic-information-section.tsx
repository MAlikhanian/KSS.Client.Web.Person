'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePickerComponent } from '@/components/ui/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslation } from '@/hooks/useTranslation';
import { toEnglishDigits } from '@/app/components/format-utils';

// Persian language id (KSS_Common_Prod.dbo.Language) — names entered here are
// stored as the Persian (fa) translation, matching the edit form.
const PERSIAN_LANGUAGE_ID = 12;

export interface CreatePersonFormData {
  nationalId: string;
  firstName: string;
  lastName: string;
  fatherName: string;
  dateOfBirth: string;
  sexId: number;
}

type CreatePersonField = keyof CreatePersonFormData;

interface SexTranslation {
  sexId: number;
  languageId: number;
  name: string;
}

interface BasicInformationSectionProps {
  formData: CreatePersonFormData;
  onInputChange: (field: CreatePersonField, value: string | number) => void;
  sexTranslations?: SexTranslation[];
  disabled?: boolean;
}

// Minimal "basic information" section for the create-person page. Captures only
// the fields needed to seed a person row (national code, Persian name, father
// name, birth date, sex) — the remaining sections are completed on the edit
// page. Built from shared UI primitives only.
export function BasicInformationSection({
  formData,
  onInputChange,
  sexTranslations,
  disabled = false,
}: BasicInformationSectionProps) {
  const { t } = useTranslation('person-form');

  const sexOptions =
    sexTranslations?.filter((s) => s.languageId === PERSIAN_LANGUAGE_ID) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {t('form.sections.personalInfo', { defaultValue: 'Personal Information' })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* National Code */}
          <div className="space-y-2">
            <Label htmlFor="nationalId">
              {t('nationalCode')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="nationalId"
              type="text"
              inputMode="numeric"
              maxLength={10}
              value={formData.nationalId}
              onChange={(e) =>
                onInputChange('nationalId', toEnglishDigits(e.target.value).replace(/[^0-9]/g, '').slice(0, 10))
              }
              placeholder={t('nationalCode')}
              disabled={disabled}
            />
          </div>

          {/* First Name (fa) */}
          <div className="space-y-2">
            <Label htmlFor="firstName">
              {t('firstName', { defaultValue: 'First Name' })}{' '}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="firstName"
              type="text"
              dir="rtl"
              value={formData.firstName}
              onChange={(e) => onInputChange('firstName', e.target.value)}
              placeholder={t('firstName', { defaultValue: 'First Name' })}
              disabled={disabled}
            />
          </div>

          {/* Last Name (fa) */}
          <div className="space-y-2">
            <Label htmlFor="lastName">
              {t('lastName', { defaultValue: 'Last Name' })}{' '}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="lastName"
              type="text"
              dir="rtl"
              value={formData.lastName}
              onChange={(e) => onInputChange('lastName', e.target.value)}
              placeholder={t('lastName', { defaultValue: 'Last Name' })}
              disabled={disabled}
            />
          </div>

          {/* Father Name */}
          <div className="space-y-2">
            <Label htmlFor="fatherName">
              {t('fatherName', { defaultValue: 'Father Name' })}{' '}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fatherName"
              type="text"
              dir="rtl"
              value={formData.fatherName}
              onChange={(e) => onInputChange('fatherName', e.target.value)}
              placeholder={t('fatherName', { defaultValue: 'Father Name' })}
              disabled={disabled}
            />
          </div>

          {/* Birth Date */}
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">
              {t('birthDate')} <span className="text-destructive">*</span>
            </Label>
            <DatePickerComponent
              value={formData.dateOfBirth}
              onChange={(value) => onInputChange('dateOfBirth', value)}
              placeholder={t('birthDate')}
              forcePersian={true}
              disabled={disabled}
            />
          </div>

          {/* Sex */}
          <div className="space-y-2">
            <Label htmlFor="sexId">
              {t('sex')} <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.sexId ? String(formData.sexId) : ''}
              onValueChange={(value) => onInputChange('sexId', Number(value))}
              disabled={disabled}
            >
              <SelectTrigger id="sexId">
                <SelectValue placeholder={t('common:select', { defaultValue: 'Select' })} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0" className="text-muted-foreground">
                  {t('common:select', { defaultValue: 'Select' })}
                </SelectItem>
                {sexOptions.map((s) => (
                  <SelectItem key={s.sexId} value={String(s.sexId)}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
