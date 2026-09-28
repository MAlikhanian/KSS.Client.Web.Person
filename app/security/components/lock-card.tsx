'use client';

import { useCallback, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { RiCheckboxCircleFill, RiErrorWarningFill } from '@remixicon/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import type { UserDto } from '@/services/auth-api';

interface LockCardProps {
  user: UserDto;
  isOwner: boolean;
  isReadOnly: boolean;
  onChanged: () => void;
}

export function LockCard({ user, isReadOnly, onChanged }: LockCardProps) {
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

  const [lockDialogOpen, setLockDialogOpen] = useState(false);
  const [lockMinutes, setLockMinutes] = useState(30);

  const lockMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/auth/user/lock/${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lockMinutes }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to lock user');
      }
    },
    onSuccess: () => {
      showToast(
        t('userLocked', { defaultValue: 'Account locked' }),
        'success',
      );
      setLockDialogOpen(false);
      onChanged();
    },
    onError: (err: Error) => showToast(err.message, 'error'),
  });

  const unlockMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/auth/user/unlock/${user.id}`, {
        method: 'POST',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to unlock user');
      }
    },
    onSuccess: () => {
      showToast(
        t('userUnlocked', { defaultValue: 'Account unlocked' }),
        'success',
      );
      onChanged();
    },
    onError: (err: Error) => showToast(err.message, 'error'),
  });

  const isLocked = !!user.lockedUntil;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('lockCard', { defaultValue: 'Account Lock' })}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm mb-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">
              {t('lockedUntil', { defaultValue: 'Locked until' })}
            </span>
            <span className="font-medium">
              {isLocked
                ? formatDateTime(user.lockedUntil, locale)
                : t('notLocked', { defaultValue: 'Not locked' })}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">
              {t('failedLoginAttempts', { defaultValue: 'Failed login attempts' })}
            </span>
            <span className="font-medium">{user.failedLoginAttempts ?? 0}</span>
          </div>
        </div>

        {!isReadOnly && (
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => setLockDialogOpen(true)}
              disabled={lockMutation.isPending}
            >
              {t('lockUser', { defaultValue: 'Lock account' })}
            </Button>
            {isLocked && (
              <Button
                variant="outline"
                onClick={() => unlockMutation.mutate()}
                disabled={unlockMutation.isPending}
              >
                {t('unlockUser', { defaultValue: 'Unlock account' })}
              </Button>
            )}
          </div>
        )}
      </CardContent>

      <Dialog open={lockDialogOpen} onOpenChange={setLockDialogOpen}>
        <DialogContent className="border-white! dark:border-white!">
          <DialogHeader>
            <DialogTitle>
              {t('lockUser', { defaultValue: 'Lock account' })}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="lock-minutes">
                {t('lockDurationMinutes', { defaultValue: 'Lock duration (minutes)' })}
              </Label>
              <Input
                id="lock-minutes"
                type="number"
                min={1}
                value={lockMinutes}
                onChange={(e) => setLockMinutes(Number(e.target.value) || 0)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLockDialogOpen(false)}>
              {t('cancel', { defaultValue: 'Cancel' })}
            </Button>
            <Button
              onClick={() => lockMutation.mutate()}
              disabled={lockMutation.isPending || lockMinutes <= 0}
            >
              {t('confirm', { defaultValue: 'Confirm' })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
