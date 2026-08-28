// Sample (fake) data for the read-only person-edit guide (representative subset).
// Name + Personal Information feed the REAL components read-only; the contact /
// employment / education tables are static facsimiles fed display-ready strings.

import type { PersonTranslationEntry } from '../edit/components/person-name-grid';
import type { PersonFormData } from '../edit/components/person-form';

/** Shown in the static person-selection facsimile. */
export const SAMPLE_PERSON_NAME = 'محمد علیخانیان';

/** Section 1 — Name / family / father (feeds the real NameSection read-only). */
export const sampleTranslations: PersonTranslationEntry[] = [
  {
    languageId: 12, // Persian
    firstName: 'محمد',
    lastName: 'علیخانیان',
    fatherName: 'احمد',
    createdAt: '2026-01-15T08:30:00Z',
    updatedAt: '2026-02-20T11:45:00Z',
  },
  {
    languageId: 10, // English
    firstName: 'Mohammad',
    lastName: 'Alikhanian',
    fatherName: 'Ahmad',
    createdAt: '2026-01-15T08:30:00Z',
    updatedAt: '2026-01-15T08:30:00Z',
  },
];

/** Section 2 — Personal information (feeds the real PersonalInformationSection). */
export const samplePersonForm: PersonFormData = {
  id: '01890a5d-ac96-774b-bcce-b302099a8057',
  nationalId: '0079542136',
  sexId: 1,
  preferredLanguageId: 12,
  dateOfBirth: '1370-05-12',
  birthCountryId: 1,
  birthRegionId: 8,
  birthCityId: 117,
  birthCertificateNumber: '12345',
  birthCertificateSeriesNumber: '14',
  birthCertificateSeriesLetterId: 3,
  birthCertificateSerial: '654321',
  birthCertificateIssueCountryId: 1,
  birthCertificateIssueRegionId: 8,
  birthCertificateIssueCityId: 117,
  maritalStatusId: 1,
  religionId: 1,
  passportNumber: 'A12345678',
  militaryServiceStatusId: 2,
  militaryServiceLocationId: 4,
  insuranceTypeId: 1,
  insuranceNumber: '1100558877',
};

// ── Facsimile rows (display-ready: dates pre-formatted, names resolved) ──

export interface SampleContactRow {
  labelName: string;
  value: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export const sampleEmails: SampleContactRow[] = [
  { labelName: 'شخصی', value: 'mohammad@example.com', isPrimary: true, createdAt: '۱۴۰۳/۰۱/۱۵ ۱۰:۳۰', updatedAt: '۱۴۰۳/۰۲/۲۰ ۰۹:۱۵' },
  { labelName: 'کاری', value: 'm.alikhanian@company.ir', isPrimary: false, createdAt: '۱۴۰۳/۰۳/۰۱ ۱۴:۰۰', updatedAt: '—' },
];

export const samplePhones: SampleContactRow[] = [
  { labelName: 'موبایل', value: '+989121234567', isPrimary: true, createdAt: '۱۴۰۳/۰۱/۱۵ ۱۰:۳۰', updatedAt: '—' },
  { labelName: 'منزل', value: '+982188112233', isPrimary: false, createdAt: '۱۴۰۳/۰۳/۰۱ ۱۴:۰۰', updatedAt: '—' },
];

export interface SampleEmploymentRow {
  companyName: string;
  nationalId: string;
  field: string;
  unit: string;
  position: string;
  contractType: string;
  fromDate: string;
  toDate: string;
  current: boolean;
  createdAt: string;
  updatedAt: string;
}

export const sampleEmployments: SampleEmploymentRow[] = [
  {
    companyName: 'شرکت فناوری سبا',
    nationalId: '۱۰۳۲۰۵۴۶۰۰۱',
    field: 'فناوری اطلاعات',
    unit: 'واحد توسعهٔ نرم‌افزار',
    position: 'مهندس نرم‌افزار ارشد',
    contractType: 'تمام‌وقت',
    fromDate: '۱۳۹۹/۰۱/۱۵',
    toDate: '۱۴۰۱/۰۶/۳۱',
    current: false,
    createdAt: '۱۳۹۹/۰۱/۲۰ ۱۰:۳۰',
    updatedAt: '۱۴۰۱/۰۷/۰۱ ۰۹:۱۵',
  },
  {
    companyName: 'هلدینگ سرمایه‌گذاری پارس',
    nationalId: '۱۰۱۰۱۳۳۵۵۷۷',
    field: 'مالی و سرمایه‌گذاری',
    unit: 'واحد تحلیل بازار',
    position: 'مدیر سبد',
    contractType: 'تمام‌وقت',
    fromDate: '۱۴۰۱/۰۷/۰۱',
    toDate: '',
    current: true,
    createdAt: '۱۴۰۱/۰۷/۰۲ ۱۴:۰۰',
    updatedAt: '۱۴۰۳/۰۳/۱۰ ۱۱:۴۵',
  },
];

export interface SampleEducationRow {
  level: string;
  field: string;
  institution: string;
  startDate: string;
  endDate: string;
  gpa: string;
  completed: boolean;
  createdAt: string;
}

export const sampleEducations: SampleEducationRow[] = [
  {
    level: 'کارشناسی',
    field: 'مهندسی کامپیوتر',
    institution: 'دانشگاه تهران',
    startDate: '۱۳۹۵/۰۷/۰۱',
    endDate: '۱۳۹۹/۰۴/۳۱',
    gpa: '۱۷٫۵',
    completed: true,
    createdAt: '۱۴۰۲/۰۳/۱۵ ۱۰:۳۰',
  },
  {
    level: 'کارشناسی ارشد',
    field: 'هوش مصنوعی',
    institution: 'دانشگاه صنعتی شریف',
    startDate: '۱۳۹۹/۰۷/۰۱',
    endDate: '—',
    gpa: '۱۸٫۲',
    completed: false,
    createdAt: '۱۴۰۳/۰۱/۲۰ ۰۹:۱۵',
  },
];
