'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { RiCheckboxCircleFill, RiErrorWarningFill } from '@remixicon/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { useTranslation } from '@/hooks/useTranslation';
import { PersonSearch, type PersonSearchResult } from '@/components/common/person-search';
import { formatDateTime } from '../../components/format-utils';

const LEVEL_NONE = 0;
const LEVEL_VIEW = 1;
const LEVEL_EDIT = 2;
const FA_LANGUAGE_ID = 12;
const EN_LANGUAGE_ID = 10;

interface AccessGrantSummary {
  personId: string;
  grantedToPersonId: string;
  informationLevel: number;
  assetsLevel: number;
  accessLevel: number;
  securityLevel: number;
  createdAt: string;
  updatedAt: string | null;
}

interface PersonName {
  id: string;
  firstName: string;
  lastName: string;
  nationalId: string;
}

interface AccessManagementSectionProps {
  personId?: string;
  onReadOnlyChange?: (isReadOnly: boolean) => void;
}

type LevelKey = 'information' | 'assets' | 'access' | 'security';

export function AccessManagementSection({ personId, onReadOnlyChange }: AccessManagementSectionProps) {
  const { t, i18n } = useTranslation('person-access');
  const queryClient = useQueryClient();
  const uiLangId = i18n.language === 'fa' ? FA_LANGUAGE_ID : EN_LANGUAGE_ID;
  const locale = i18n.language === 'fa' ? 'fa-IR' : 'en-US';

  // Caller's own access on this profile — used to lock down the page when
  // the caller is not the owner (or has only view on the access section).
  const { data: myLevels } = useQuery<{ information: number; assets: number; access: number; security: number }>({
    queryKey: ['person-access-my-levels', personId],
    queryFn: async () => {
      if (!personId) return { information: 0, assets: 0, access: 0, security: 0 };
      const res = await fetch(`/api/person/access/my-levels/${personId}`);
      if (!res.ok) return { information: 0, assets: 0, access: 0, security: 0 };
      return res.json();
    },
    enabled: !!personId,
  });
  const accessGrantsLevel = myLevels?.access ?? 0;
  const canEdit = accessGrantsLevel >= LEVEL_EDIT;

  // Banner only for view-only state (level === 1). For no-access (level === 0)
  // the user shouldn't see the banner at all — the section just renders empty.
  useEffect(() => {
    onReadOnlyChange?.(!!personId && accessGrantsLevel === LEVEL_VIEW);
  }, [personId, accessGrantsLevel, onReadOnlyChange]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPersonId, setEditingPersonId] = useState<string | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<PersonSearchResult | null>(null);
  const [levels, setLevels] = useState<Record<LevelKey, number>>({
    information: LEVEL_NONE,
    assets: LEVEL_NONE,
    access: LEVEL_NONE,
    security: LEVEL_NONE,
  });

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    toast.custom(
      () => (
        <Alert variant="mono" icon={type === 'success' ? 'success' : 'destructive'}>
          <AlertIcon>
            {type === 'success' ? <RiCheckboxCircleFill /> : <RiErrorWarningFill />}
          </AlertIcon>
          <AlertTitle>{message}</AlertTitle>
        </Alert>
      ),
      { position: 'top-center' },
    );
  }, []);

  // Pull existing grants for this owner.
  const { data: grants = [] } = useQuery<AccessGrantSummary[]>({
    queryKey: ['person-access', personId],
    queryFn: async () => {
      if (!personId) return [];
      const res = await fetch(`/api/person/access?personId=${personId}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to load access grants');
      }
      return res.json();
    },
    enabled: !!personId,
  });

  // Resolve display names for ONLY the grantees in this list, by id — no need to
  // pull the whole person directory (which is capped and can miss people).
  const granteeIds = useMemo(
    () => Array.from(new Set(grants.map((g) => g.grantedToPersonId))),
    [grants],
  );

  const { data: granteeNames = [] } = useQuery<PersonName[]>({
    queryKey: ['person-access-names', personId, granteeIds.join(',')],
    queryFn: async () => {
      if (granteeIds.length === 0) return [];
      const res = await fetch('/api/person/names', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: granteeIds, languageId: uiLangId }),
      });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!personId && granteeIds.length > 0,
  });

  const peopleById = useMemo(() => {
    const map = new Map<string, PersonName>();
    for (const p of granteeNames) map.set(p.id, p);
    return map;
  }, [granteeNames]);

  const getPersonDisplay = useCallback((id: string): string => {
    const p = peopleById.get(id);
    if (!p) return id;
    const name = `${p.firstName} ${p.lastName}`.trim();
    return name ? `${name}${p.nationalId ? ` (${p.nationalId})` : ''}` : p.nationalId || id;
  }, [peopleById]);

  // Reset dialog state when it closes so the next open starts fresh.
  useEffect(() => {
    if (!dialogOpen) {
      setEditingPersonId(null);
      setSelectedPerson(null);
      setLevels({ information: LEVEL_NONE, assets: LEVEL_NONE, access: LEVEL_NONE, security: LEVEL_NONE });
    }
  }, [dialogOpen]);

  const handleOpenAdd = useCallback(() => {
    setEditingPersonId(null);
    setSelectedPerson(null);
    setLevels({ information: LEVEL_NONE, assets: LEVEL_NONE, access: LEVEL_NONE, security: LEVEL_NONE });
    setDialogOpen(true);
  }, []);

  const handleOpenEdit = useCallback((g: AccessGrantSummary) => {
    // Editing an existing grant: the grantee is fixed (shown read-only via
    // getPersonDisplay), so we only need the id + current levels.
    setEditingPersonId(g.grantedToPersonId);
    setSelectedPerson(null);
    setLevels({
      information: g.informationLevel,
      assets: g.assetsLevel,
      access: g.accessLevel,
      security: g.securityLevel,
    });
    setDialogOpen(true);
  }, []);

  const grantMutation = useMutation({
    mutationFn: async () => {
      if (!personId) throw new Error('personId missing');
      const granteeId = editingPersonId || selectedPerson?.id;
      if (!granteeId) throw new Error('Pick a person');
      const res = await fetch('/api/person/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personId,
          grantedToPersonId: granteeId,
          informationLevel: levels.information,
          assetsLevel: levels.assets,
          accessLevel: levels.access,
          securityLevel: levels.security,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to grant access');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['person-access', personId] });
      setDialogOpen(false);
      showToast(t('accessGranted'), 'success');
    },
    onError: (err: Error) => {
      showToast(err.message, 'error');
    },
  });

  const revokeMutation = useMutation({
    mutationFn: async (grantedToPersonId: string) => {
      if (!personId) throw new Error('personId missing');
      const res = await fetch(
        `/api/person/access/by-pair/${personId}/${grantedToPersonId}`,
        { method: 'DELETE' },
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to revoke access');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['person-access', personId] });
      showToast(t('accessRevoked'), 'success');
    },
    onError: (err: Error) => {
      showToast(err.message, 'error');
    },
  });

  if (!personId) return null;

  // Render helpers ─────────────────────────────────────────────────────────
  const renderLevelBadge = (level: number) => {
    if (level === LEVEL_EDIT) return <Badge variant="primary">{t('levelEdit')}</Badge>;
    if (level === LEVEL_VIEW) return <Badge variant="secondary">{t('levelView')}</Badge>;
    return <Badge variant="outline">{t('levelNone')}</Badge>;
  };

  const renderLevelSelect = (key: LevelKey, label: string) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select
        value={String(levels[key])}
        onValueChange={(v) => setLevels((prev) => ({ ...prev, [key]: Number(v) }))}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={String(LEVEL_NONE)}>{t('levelNone')}</SelectItem>
          <SelectItem value={String(LEVEL_VIEW)}>{t('levelView')}</SelectItem>
          <SelectItem value={String(LEVEL_EDIT)}>{t('levelEdit')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">1</span>
          {t('accessManagement')}
          <Badge variant="outline">{grants.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <fieldset disabled={!canEdit} className="space-y-4 contents">
          <div className="space-y-4">
            {canEdit && (
              <div className="flex justify-end">
                <Button type="button" variant="outline" size="sm" onClick={handleOpenAdd}>
                  <Plus className="h-4 w-4 ml-1" />
                  {t('add')}
                </Button>
              </div>
            )}

            {grants.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t('noAccessGrantsYet')}
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>{t('person-search:label', { defaultValue: 'Person' })}</TableHead>
                    <TableHead>{t('sectionInformation')}</TableHead>
                    <TableHead>{t('sectionAssets')}</TableHead>
                    <TableHead>{t('sectionAccess')}</TableHead>
                    <TableHead>{t('sectionSecurity')}</TableHead>
                    <TableHead>{t('common:createdAt', { defaultValue: 'Created At' })}</TableHead>
                    <TableHead>{t('common:updatedAt', { defaultValue: 'Last Modified' })}</TableHead>
                    <TableHead className="w-20">{t('common:actions', { defaultValue: 'Actions' })}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grants.map((g, idx) => (
                    <TableRow key={g.grantedToPersonId}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{getPersonDisplay(g.grantedToPersonId)}</TableCell>
                      <TableCell>{renderLevelBadge(g.informationLevel)}</TableCell>
                      <TableCell>{renderLevelBadge(g.assetsLevel)}</TableCell>
                      <TableCell>{renderLevelBadge(g.accessLevel)}</TableCell>
                      <TableCell>{renderLevelBadge(g.securityLevel)}</TableCell>
                      <TableCell style={{ unicodeBidi: 'plaintext' }}>{formatDateTime(g.createdAt, locale)}</TableCell>
                      <TableCell style={{ unicodeBidi: 'plaintext' }}>{formatDateTime(g.updatedAt, locale)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {canEdit && (
                            <>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleOpenEdit(g)}
                                aria-label={t('editGrant')}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => revokeMutation.mutate(g.grantedToPersonId)}
                                disabled={revokeMutation.status === 'pending'}
                                aria-label={t('removeAccess')}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </fieldset>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg border-white! dark:border-white!">
            <DialogHeader>
              <DialogTitle>
                {editingPersonId ? t('editGrant') : t('addAccess')}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* When editing an existing grant, the grantee is fixed —
                  show their name read-only instead of re-rendering the search. */}
              {editingPersonId ? (
                <div className="space-y-2">
                  <Label>{t('person-search:label', { defaultValue: 'Person' })}</Label>
                  <div className="rounded-md border bg-muted/50 px-3 py-2 text-sm">
                    {getPersonDisplay(editingPersonId)}
                  </div>
                </div>
              ) : (
                <PersonSearch
                  onSelect={(p) => setSelectedPerson(p)}
                  value={selectedPerson}
                  label={t('person-search:label', { defaultValue: 'Person' })}
                  apiUrl="/api/person/directory"
                />
              )}
              {renderLevelSelect('information', t('sectionInformation'))}
              {renderLevelSelect('assets', t('sectionAssets'))}
              {renderLevelSelect('access', t('sectionAccess'))}
              {renderLevelSelect('security', t('sectionSecurity'))}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                {t('common:cancel', { defaultValue: 'Cancel' })}
              </Button>
              <Button
                type="button"
                onClick={() => grantMutation.mutate()}
                disabled={
                  (!editingPersonId && !selectedPerson) || grantMutation.status === 'pending'
                }
              >
                {t('common:save', { defaultValue: 'Save' })}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
