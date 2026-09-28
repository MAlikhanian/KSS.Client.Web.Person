'use client';

import { useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { RiCheckboxCircleFill, RiErrorWarningFill } from '@remixicon/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { useTranslation } from '@/hooks/useTranslation';
import { formatDateTime } from '../../components/format-utils';
import type { UserDto } from '@/services/auth-api';

interface VerificationCardProps {
  user: UserDto;
  isOwner: boolean;
  isReadOnly: boolean;
  onChanged: () => void;
}

export function VerificationCard({ user, isReadOnly, onChanged }: VerificationCardProps) {
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

  const markEmailMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/auth/user/mark-email-verified/${user.id}`, {
        method: 'POST',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to mark email verified');
      }
    },
    onSuccess: () => {
      showToast(
        t('emailMarkedVerified', { defaultValue: 'Email marked verified' }),
        'success',
      );
      onChanged();
    },
    onError: (err: Error) => showToast(err.message, 'error'),
  });

  const markPhoneMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/auth/user/mark-phone-verified/${user.id}`, {
        method: 'POST',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to mark phone verified');
      }
    },
    onSuccess: () => {
      showToast(
        t('phoneMarkedVerified', { defaultValue: 'Phone marked verified' }),
        'success',
      );
      onChanged();
    },
    onError: (err: Error) => showToast(err.message, 'error'),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('verificationCard', { defaultValue: 'Verification' })}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Email row */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 min-w-0">
              {user.isEmailVerified ? (
                <RiCheckboxCircleFill className="size-5 text-green-600 dark:text-green-400 shrink-0" />
              ) : (
                <RiErrorWarningFill className="size-5 text-muted-foreground shrink-0" />
              )}
              <div className="min-w-0">
                <div className="text-sm font-medium">
                  {user.isEmailVerified
                    ? t('emailVerified', { defaultValue: 'Email verified' })
                    : t('emailNotVerified', { defaultValue: 'Email not verified' })}
                </div>
                {user.isEmailVerified && user.emailVerifiedAt && (
                  <div className="text-xs text-muted-foreground">
                    {t('emailVerifiedAt', { defaultValue: 'Email verified at' })}
                    {': '}
                    {formatDateTime(user.emailVerifiedAt, locale)}
                  </div>
                )}
              </div>
            </div>
            {!isReadOnly && !user.isEmailVerified && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => markEmailMutation.mutate()}
                disabled={markEmailMutation.isPending}
              >
                {t('markEmailVerified', { defaultValue: 'Mark email verified (admin)' })}
              </Button>
            )}
          </div>

          {/* Phone row */}
          <div className="flex items-center justify-between gap-3 flex-wrap pt-3 border-t border-border/40">
            <div className="flex items-center gap-2 min-w-0">
              {user.isPhoneVerified ? (
                <RiCheckboxCircleFill className="size-5 text-green-600 dark:text-green-400 shrink-0" />
              ) : (
                <RiErrorWarningFill className="size-5 text-muted-foreground shrink-0" />
              )}
              <div className="min-w-0">
                <div className="text-sm font-medium">
                  {user.isPhoneVerified
                    ? t('phoneVerified', { defaultValue: 'Phone verified' })
                    : t('phoneNotVerified', { defaultValue: 'Phone not verified' })}
                </div>
                {user.isPhoneVerified && user.phoneVerifiedAt && (
                  <div className="text-xs text-muted-foreground">
                    {t('phoneVerifiedAt', { defaultValue: 'Phone verified at' })}
                    {': '}
                    {formatDateTime(user.phoneVerifiedAt, locale)}
                  </div>
                )}
              </div>
            </div>
            {!isReadOnly && !user.isPhoneVerified && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => markPhoneMutation.mutate()}
                disabled={markPhoneMutation.isPending}
              >
                {t('markPhoneVerified', { defaultValue: 'Mark phone verified (admin)' })}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
