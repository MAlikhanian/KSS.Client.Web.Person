'use client';

import { useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { RiCheckboxCircleFill, RiErrorWarningFill } from '@remixicon/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { useTranslation } from '@/hooks/useTranslation';
import { formatDateTime } from '../../components/format-utils';
import type { UserDto } from '@/services/auth-api';

interface AccountCardProps {
  user: UserDto;
  isOwner: boolean;
  isReadOnly: boolean;
  onChanged: () => void;
}

export function AccountCard({ user, isReadOnly, onChanged }: AccountCardProps) {
  const { t, i18n } = useTranslation('person-security');
  const locale = i18n.language === 'fa' ? 'fa-IR' : 'en-US';

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

  const setActiveMutation = useMutation({
    mutationFn: async (isActive: boolean) => {
      const res = await fetch(`/api/auth/user/set-active/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to update');
      }
      return isActive;
    },
    onSuccess: (isActive) => {
      showToast(
        isActive
          ? t('userActivated', { defaultValue: 'Account activated' })
          : t('userDeactivated', { defaultValue: 'Account deactivated' }),
        'success',
      );
      onChanged();
    },
    onError: (err: Error) => showToast(err.message, 'error'),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('accountCard', { defaultValue: 'Account' })}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">
              {t('username', { defaultValue: 'Username' })}
            </span>
            <span className="font-medium">{user.username || '-'}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">
              {t('email', { defaultValue: 'Email' })}
            </span>
            <span className="font-medium break-all">{user.email || '-'}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">
              {t('phone', { defaultValue: 'Phone' })}
            </span>
            <span className="font-medium">{user.phone || '-'}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">
              {t('lastLoginAt', { defaultValue: 'Last Login' })}
            </span>
            <span className="font-medium">
              {user.lastLoginAt
                ? formatDateTime(user.lastLoginAt, locale)
                : t('neverLoggedIn', { defaultValue: 'Never logged in' })}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 md:col-span-2 pt-2 border-t border-border/40">
            <span className="text-muted-foreground">
              {t('isActive', { defaultValue: 'Active' })}
            </span>
            {isReadOnly ? (
              <span className="font-medium">
                {user.isActive
                  ? t('activate', { defaultValue: 'Activated' })
                  : t('deactivate', { defaultValue: 'Deactivated' })}
              </span>
            ) : (
              <Switch
                checked={user.isActive}
                disabled={setActiveMutation.isPending}
                onCheckedChange={(checked) => setActiveMutation.mutate(!!checked)}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
