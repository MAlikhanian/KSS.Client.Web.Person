'use client';

import Link from 'next/link';
import { ChevronRight, Plus, Star, StarOff } from 'lucide-react';
import { RiErrorWarningFill } from '@remixicon/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from '@/partials/common/toolbar';
import { useTranslation } from '@/hooks/useTranslation';
import { SectionHelp, GUIDE_TINT } from '@/app/components/company/guide-ui';
import { NameSection } from '../edit/components/name-section';
import { PersonalInformationSection } from '../edit/components/personal-information-section';
import {
  SAMPLE_PERSON_NAME,
  sampleTranslations,
  samplePersonForm,
  sampleEmails,
  samplePhones,
  sampleEmployments,
  sampleEducations,
  type SampleContactRow,
} from './sample-data';

const NS = 'person-edit-guide';
const fa = (n: number) => n.toLocaleString('fa-IR');

/** A read-only facsimile of a contact table (emails / phones share this shape). */
function ContactFacsimile({
  num,
  badgeBg,
  title,
  valueHeader,
  addLabel,
  rows,
  tc,
}: {
  num: string;
  badgeBg: string;
  title: string;
  valueHeader: string;
  addLabel: string;
  rows: SampleContactRow[];
  tc: (key: string, opts?: Record<string, unknown>) => string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className={`w-8 h-8 ${badgeBg} rounded-lg flex items-center justify-center text-white text-sm font-bold`}>
            {num}
          </span>
          {title}
          <Badge variant="outline">{rows.length}</Badge>
        </CardTitle>
        <Button type="button" variant="outline" size="sm" disabled>
          <Plus className="h-4 w-4 ml-1" />
          {addLabel}
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>{tc('common:type', { defaultValue: 'نوع' })}</TableHead>
              <TableHead>{valueHeader}</TableHead>
              <TableHead className="w-16 text-center">{tc('common:primary', { defaultValue: 'اصلی' })}</TableHead>
              <TableHead>{tc('common:createdAt', { defaultValue: 'تاریخ ثبت' })}</TableHead>
              <TableHead>{tc('common:updatedAt', { defaultValue: 'آخرین تغییر' })}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r, i) => (
              <TableRow key={i}>
                <TableCell>{fa(i + 1)}</TableCell>
                <TableCell>{r.labelName}</TableCell>
                <TableCell className="font-mono text-sm" dir="ltr">{r.value}</TableCell>
                <TableCell className="text-center">
                  {r.isPrimary ? (
                    <Star className="h-4 w-4 text-yellow-500 mx-auto fill-yellow-500" />
                  ) : (
                    <StarOff className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                  )}
                </TableCell>
                <TableCell className="text-sm" style={{ unicodeBidi: 'plaintext' }}>{r.createdAt}</TableCell>
                <TableCell className="text-sm" style={{ unicodeBidi: 'plaintext' }}>{r.updatedAt}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export function PersonEditGuideContent() {
  const { t } = useTranslation(NS);
  const { t: tContact } = useTranslation('person-contact');
  const { t: tEmp } = useTranslation('person-employment');
  const { t: tEdu } = useTranslation('person-education');
  const { t: tForm } = useTranslation('person-form');
  const noop = () => {};

  const quickStepsRaw = t('quickStart.steps', { returnObjects: true }) as unknown;
  const quickSteps = Array.isArray(quickStepsRaw) ? (quickStepsRaw as string[]) : [];
  const faqRaw = t('faq.items', { returnObjects: true }) as unknown;
  const faq = Array.isArray(faqRaw) ? (faqRaw as { q: string; a: string }[]) : [];

  return (
    <div className="space-y-5 lg:space-y-7.5">
      {/* Title card */}
      <Card className="bg-violet-50! dark:bg-violet-950/25! shadow-lg shadow-black/5">
        <CardContent className="py-5">
          <Toolbar>
            <ToolbarHeading>
              <ToolbarPageTitle text={t('title')} />
              <ToolbarDescription>{t('subtitle')}</ToolbarDescription>
            </ToolbarHeading>
            <ToolbarActions>
              <Button asChild>
                <Link href="/edit">
                  <ChevronRight className="h-4 w-4" />
                  {t('entry.backToPage')}
                </Link>
              </Button>
            </ToolbarActions>
          </Toolbar>
        </CardContent>
      </Card>

      {/* Training banner */}
      <div className="rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 px-4 py-3 flex items-start gap-3 shadow-sm">
        <RiErrorWarningFill className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <span className="text-sm font-medium text-amber-900 dark:text-amber-200 leading-7">
          {t('demoBanner')}
        </span>
      </div>

      <div className={GUIDE_TINT}>
        <div className="space-y-5 lg:space-y-7.5">
          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle>{t('quickStart.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground leading-7">{t('quickStart.intro')}</p>
              <ol className="list-decimal pr-5 space-y-1 text-sm leading-7">
                {quickSteps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
              <p className="text-sm text-amber-800 dark:text-amber-300 leading-7 pt-1">{t('subsetNote')}</p>
            </CardContent>
          </Card>

          {/* Selection (static read-only representation) */}
          <SectionHelp ns={NS} skey="selection" color="neutral" num="●" />
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                {t('sections.selection.title')}
                <Badge variant="secondary">{t('labels.demoData')}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-w-md">
                <Label>{t('labels.personField')}</Label>
                <Input value={SAMPLE_PERSON_NAME} dir="rtl" disabled readOnly />
                <div className="pt-1">
                  <Badge variant="primary">
                    {t('labels.editMode')} {SAMPLE_PERSON_NAME}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 1) Name — real control read-only */}
          <SectionHelp ns={NS} skey="name" color="sky" num="۱" />
          <NameSection
            translations={sampleTranslations}
            onTranslationsChange={noop}
            isReadOnly
            lockEnglishIfPresent
          />

          {/* 2) Personal information — real control, wrapped in a disabled fieldset */}
          <SectionHelp ns={NS} skey="personalInfo" color="indigo" num="۲" />
          <fieldset disabled className="contents">
            <PersonalInformationSection
              formData={samplePersonForm}
              onInputChange={noop}
              nationalIdLocked
            />
          </fieldset>

          {/* 4) Emails — facsimile */}
          <SectionHelp ns={NS} skey="emails" color="violet" num="۴" />
          <ContactFacsimile
            num="۴"
            badgeBg="bg-purple-500"
            title={tContact('emailsTitle', { defaultValue: 'ایمیل‌ها' })}
            valueHeader={tContact('emailAddress', { defaultValue: 'آدرس ایمیل' })}
            addLabel={tContact('common:add', { defaultValue: 'افزودن' })}
            rows={sampleEmails}
            tc={tContact}
          />

          {/* 5) Phones — facsimile */}
          <SectionHelp ns={NS} skey="phones" color="teal" num="۵" />
          <ContactFacsimile
            num="۵"
            badgeBg="bg-teal-500"
            title={tContact('phonesTitle', { defaultValue: 'شماره‌های تماس' })}
            valueHeader={tContact('phoneNumber', { defaultValue: 'شماره تلفن' })}
            addLabel={tContact('common:add', { defaultValue: 'افزودن' })}
            rows={samplePhones}
            tc={tContact}
          />

          {/* 7) Work experience — facsimile */}
          <SectionHelp ns={NS} skey="employment" color="slate" num="۷" />
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                  ۷
                </span>
                {tEmp('sectionTitle', { defaultValue: 'سابقهٔ شغلی' })}
                <Badge variant="outline">{sampleEmployments.length}</Badge>
              </CardTitle>
              <Button type="button" variant="outline" size="sm" disabled>
                <Plus className="h-4 w-4 ml-1" />
                {tEmp('common:add', { defaultValue: 'افزودن' })}
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>{tEmp('company', { defaultValue: 'شرکت' })}</TableHead>
                    <TableHead>{tEmp('activityField', { defaultValue: 'حوزهٔ فعالیت' })}</TableHead>
                    <TableHead>{tEmp('position', { defaultValue: 'سمت' })}</TableHead>
                    <TableHead>{tEmp('contractType', { defaultValue: 'نوع قرارداد' })}</TableHead>
                    <TableHead>{tEmp('common:startDate', { defaultValue: 'از تاریخ' })}</TableHead>
                    <TableHead>{tEmp('common:endDate', { defaultValue: 'تا تاریخ' })}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleEmployments.map((r, i) => (
                    <TableRow key={i} className={r.current ? 'bg-muted/30' : undefined}>
                      <TableCell>{fa(i + 1)}</TableCell>
                      <TableCell className="font-medium">{r.companyName}</TableCell>
                      <TableCell>{r.field}</TableCell>
                      <TableCell>{r.position}</TableCell>
                      <TableCell>{r.contractType}</TableCell>
                      <TableCell className="text-sm" style={{ unicodeBidi: 'plaintext' }}>{r.fromDate}</TableCell>
                      <TableCell className="text-sm">
                        {r.current ? (
                          <Badge variant="success" className="text-xs font-sans">
                            {tEmp('common:current', { defaultValue: 'جاری' })}
                          </Badge>
                        ) : (
                          <span style={{ unicodeBidi: 'plaintext' }}>{r.toDate}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* 8) Education — facsimile */}
          <SectionHelp ns={NS} skey="education" color="cyan" num="۸" />
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                  ۸
                </span>
                {tEdu('sectionTitle', { defaultValue: 'تحصیلات' })}
                <Badge variant="outline">{sampleEducations.length}</Badge>
              </CardTitle>
              <Button type="button" variant="outline" size="sm" disabled>
                <Plus className="h-4 w-4 ml-1" />
                {tEdu('common:add', { defaultValue: 'افزودن' })}
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>{tEdu('educationLevel', { defaultValue: 'مقطع' })}</TableHead>
                    <TableHead>{tEdu('fieldOfStudy', { defaultValue: 'رشته' })}</TableHead>
                    <TableHead>{tEdu('institution', { defaultValue: 'مؤسسه' })}</TableHead>
                    <TableHead>{tEdu('startDate', { defaultValue: 'تاریخ شروع' })}</TableHead>
                    <TableHead>{tEdu('endDate', { defaultValue: 'تاریخ پایان' })}</TableHead>
                    <TableHead>{tEdu('gpa', { defaultValue: 'معدل' })}</TableHead>
                    <TableHead>{tEdu('isCompleted', { defaultValue: 'تکمیل‌شده' })}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleEducations.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell>{fa(i + 1)}</TableCell>
                      <TableCell className="font-medium">{r.level}</TableCell>
                      <TableCell>{r.field}</TableCell>
                      <TableCell>{r.institution}</TableCell>
                      <TableCell className="text-sm" style={{ unicodeBidi: 'plaintext' }}>{r.startDate}</TableCell>
                      <TableCell className="text-sm" style={{ unicodeBidi: 'plaintext' }}>{r.endDate}</TableCell>
                      <TableCell>{r.gpa}</TableCell>
                      <TableCell>
                        {r.completed ? (
                          <Badge variant="success" className="text-xs font-sans">
                            {tEdu('isCompleted', { defaultValue: 'تکمیل‌شده' })}
                          </Badge>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Operations (static, disabled) */}
          <SectionHelp ns={NS} skey="operations" color="emerald" num="✓" />
          <Card>
            <CardHeader>
              <CardTitle>{tForm('form.sections.operations', { defaultValue: 'عملیات' })}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end">
                <Button type="button" disabled>
                  {tForm('form.actions.update', { defaultValue: 'به‌روزرسانی شخص' })}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card>
            <CardHeader>
              <CardTitle>{t('faq.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {faq.map((item, i) => (
                <details key={i} className="rounded-lg border border-border/60 bg-background/40 p-3">
                  <summary className="cursor-pointer font-medium text-sm">{item.q}</summary>
                  <p className="text-sm text-muted-foreground leading-7 mt-2">{item.a}</p>
                </details>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
