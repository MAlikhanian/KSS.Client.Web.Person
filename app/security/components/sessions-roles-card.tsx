'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { RiCheckboxCircleFill, RiErrorWarningFill } from '@remixicon/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { useTranslation } from '@/hooks/useTranslation';
import { formatDateTime } from '../../components/format-utils';
import type { UserDto, Role } from '@/services/auth-api';

interface SessionsRolesCardProps {
  user: UserDto;
  isOwner: boolean;
  isReadOnly: boolean;
  onChanged: () => void;
}

export function SessionsRolesCard({
  user,
  isOwner,
  isReadOnly,
  onChanged,
}: SessionsRolesCardProps) {
  const { t, i18n } = useTranslation('person-security');
  const locale = i18n.language === 'fa' ? 'fa-IR' : 'en-US';
  const uiLangId = i18n.language === 'fa' ? 12 : 10;
  const queryClient = useQueryClient();

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

  // Roles assigned to the user (codes only — backend returns string[] of role codes).
  const rolesQueryKey = ['auth-user-roles', user.id] as const;
  const { data: assignedRoleCodes = [] } = useQuery<string[]>({
    queryKey: rolesQueryKey,
    queryFn: async () => {
      const res = await fetch(`/api/auth/user/${user.id}/roles`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to load roles');
      }
      return res.json();
    },
  });

  // Available roles for the edit dialog. Endpoint returns the full role set
  // (id + code + translations) — used to map codes ⇄ ids and present the multi-select.
  const allRolesQueryKey = ['auth-roles-all'] as const;
  const { data: allRoles = [] } = useQuery<Role[]>({
    queryKey: allRolesQueryKey,
    queryFn: async () => {
      const res = await fetch('/api/auth/role/all');
      if (!res.ok) return [];
      const json = await res.json().catch(() => []);
      if (!Array.isArray(json)) return [];
      return json as Role[];
    },
    retry: false,
  });

  const roleLocalById = useCallback(
    (id: string): { name: string; description: string } => {
      const r = allRoles.find((x) => x.id === id);
      if (!r) return { name: '—', description: '' };
      const tr = r.translations?.find((tt) => tt.languageId === uiLangId);
      return {
        name: tr?.name || r.code,
        description: tr?.description ?? '',
      };
    },
    [allRoles, uiLangId],
  );

  // Resolve assigned role-codes into the localized display label.
  const assignedRoleLabels = useMemo(() => {
    return assignedRoleCodes.map((code) => {
      const role = allRoles.find((r) => r.code === code);
      if (!role) return { key: code, label: code };
      return { key: role.id, label: roleLocalById(role.id).name || role.code };
    });
  }, [assignedRoleCodes, allRoles, roleLocalById]);

  const assignedRoleIds = useMemo(() => {
    if (allRoles.length === 0) return [];
    return allRoles
      .filter((r) => assignedRoleCodes.includes(r.code))
      .map((r) => r.id);
  }, [allRoles, assignedRoleCodes]);

  // ── Revoke sessions ──────────────────────────────────────────────────────
  const revokeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/auth/user/revoke-sessions/${user.id}`, {
        method: 'POST',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to revoke sessions');
      }
    },
    onSuccess: () => {
      showToast(
        t('sessionsRevoked', { defaultValue: 'All sessions revoked' }),
        'success',
      );
      onChanged();
    },
    onError: (err: Error) => showToast(err.message, 'error'),
  });

  // ── Edit roles dialog ────────────────────────────────────────────────────
  const [rolesDialogOpen, setRolesDialogOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Sync the dialog selection from server state ONLY when the dialog opens.
  // Depending on `assignedRoleIds` would loop forever — useQuery's default `[]`
  // is a new reference each render, which would re-fire the effect indefinitely.
  useEffect(() => {
    if (rolesDialogOpen) setSelectedIds(assignedRoleIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rolesDialogOpen]);

  const toggleRole = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const assignMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/auth/user/${user.id}/roles`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleIds: selectedIds }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to update roles');
      }
    },
    onSuccess: () => {
      showToast(
        t('rolesUpdated', { defaultValue: 'Roles updated' }),
        'success',
      );
      setRolesDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: rolesQueryKey });
    },
    onError: (err: Error) => showToast(err.message, 'error'),
  });

  // Refresh-token expiry: treat past timestamps as "no active session".
  const sessionExpiresLabel = useMemo(() => {
    if (!user.refreshTokenExpires) {
      return t('noActiveSession', { defaultValue: 'No active session' });
    }
    const expires = new Date(user.refreshTokenExpires);
    if (isNaN(expires.getTime()) || expires.getTime() <= Date.now()) {
      return t('noActiveSession', { defaultValue: 'No active session' });
    }
    return formatDateTime(user.refreshTokenExpires, locale);
  }, [user.refreshTokenExpires, locale, t]);

  const canRevoke = isOwner || !isReadOnly;
  const canEditRoles = !isReadOnly && allRoles.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {t('sessionsRolesCard', { defaultValue: 'Sessions & Roles' })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {/* Sessions */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <div className="text-sm text-muted-foreground">
                {t('refreshTokenExpires', { defaultValue: 'Session expires' })}
              </div>
              <div className="text-sm font-medium">{sessionExpiresLabel}</div>
            </div>
            {canRevoke && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => revokeMutation.mutate()}
                disabled={revokeMutation.isPending}
              >
                {t('revokeSessions', { defaultValue: 'Sign out everywhere' })}
              </Button>
            )}
          </div>

          {/* Roles */}
          <div className="pt-4 border-t border-border/40">
            <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
              <div className="text-sm font-medium">
                {t('roles', { defaultValue: 'Roles' })}
              </div>
              {canEditRoles && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRolesDialogOpen(true)}
                >
                  {t('editRoles', { defaultValue: 'Edit roles' })}
                </Button>
              )}
            </div>
            {assignedRoleLabels.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                {t('noRoles', { defaultValue: 'No roles assigned' })}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {assignedRoleLabels.map((entry) => (
                  <Badge key={entry.key} variant="secondary">
                    {entry.label}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <Dialog open={rolesDialogOpen} onOpenChange={setRolesDialogOpen}>
        <DialogContent className="border-white! dark:border-white!">
          <DialogHeader>
            <DialogTitle>
              {t('editRoles', { defaultValue: 'Edit roles' })}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2 max-h-72 overflow-y-auto">
            {allRoles.map((role) => {
              const checked = selectedIds.includes(role.id);
              const label = roleLocalById(role.id).name || role.code;
              return (
                <Label
                  key={role.id}
                  className="flex items-center gap-2 cursor-pointer text-sm"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggleRole(role.id)}
                  />
                  <span>{label}</span>
                </Label>
              );
            })}
            {allRoles.length === 0 && (
              <div className="text-sm text-muted-foreground">
                {t('noRoles', { defaultValue: 'No roles assigned' })}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRolesDialogOpen(false)}>
              {t('cancel', { defaultValue: 'Cancel' })}
            </Button>
            <Button
              onClick={() => assignMutation.mutate()}
              disabled={assignMutation.isPending}
            >
              {t('save', { defaultValue: 'Save' })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
