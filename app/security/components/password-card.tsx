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
import type { UserDto } from '@/services/auth-api';

interface PasswordCardProps {
  user: UserDto;
  isOwner: boolean;
  isReadOnly: boolean;
  onChanged: () => void;
}

const MIN_PASSWORD_LENGTH = 8;

export function PasswordCard({ user, isOwner, isReadOnly, onChanged }: PasswordCardProps) {
  const { t } = useTranslation('person-security');

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

  // ── Self-service change-my-password dialog ──────────────────────────────
  const [selfDialogOpen, setSelfDialogOpen] = useState(false);
  const [selfCurrent, setSelfCurrent] = useState('');
  const [selfNew, setSelfNew] = useState('');
  const [selfConfirm, setSelfConfirm] = useState('');

  const resetSelf = useCallback(() => {
    setSelfCurrent('');
    setSelfNew('');
    setSelfConfirm('');
  }, []);

  const changeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/auth/user/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: selfCurrent,
          newPassword: selfNew,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to change password');
      }
    },
    onSuccess: () => {
      showToast(
        t('passwordChanged', { defaultValue: 'Password changed successfully' }),
        'success',
      );
      setSelfDialogOpen(false);
      resetSelf();
      onChanged();
    },
    onError: (err: Error) => showToast(err.message, 'error'),
  });

  // ── Admin reset-password dialog ─────────────────────────────────────────
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [adminNew, setAdminNew] = useState('');
  const [adminConfirm, setAdminConfirm] = useState('');

  const resetAdmin = useCallback(() => {
    setAdminNew('');
    setAdminConfirm('');
  }, []);

  const adminResetMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/auth/user/admin-reset-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          newPassword: adminNew,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to reset password');
      }
    },
    onSuccess: () => {
      showToast(
        t('passwordReset', { defaultValue: 'Password reset successfully' }),
        'success',
      );
      setAdminDialogOpen(false);
      resetAdmin();
      onChanged();
    },
    onError: (err: Error) => showToast(err.message, 'error'),
  });

  const validateSelf = (): string | null => {
    if (!selfCurrent || !selfNew || !selfConfirm) return null; // disabled state covers it
    if (selfNew.length < MIN_PASSWORD_LENGTH) {
      return t('passwordTooShort', {
        defaultValue: 'Password must be at least 8 characters',
      });
    }
    if (selfNew !== selfConfirm) {
      return t('passwordMismatch', {
        defaultValue: 'Password confirmation does not match',
      });
    }
    return null;
  };

  const validateAdmin = (): string | null => {
    if (!adminNew || !adminConfirm) return null;
    if (adminNew.length < MIN_PASSWORD_LENGTH) {
      return t('passwordTooShort', {
        defaultValue: 'Password must be at least 8 characters',
      });
    }
    if (adminNew !== adminConfirm) {
      return t('passwordMismatch', {
        defaultValue: 'Password confirmation does not match',
      });
    }
    return null;
  };

  const submitSelf = () => {
    const err = validateSelf();
    if (err) {
      showToast(err, 'error');
      return;
    }
    changeMutation.mutate();
  };

  const submitAdmin = () => {
    const err = validateAdmin();
    if (err) {
      showToast(err, 'error');
      return;
    }
    adminResetMutation.mutate();
  };

  const showSelf = isOwner;
  const showAdmin = !isOwner && !isReadOnly;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('passwordCard', { defaultValue: 'Password' })}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-3">
          {showSelf && (
            <Button variant="outline" onClick={() => setSelfDialogOpen(true)}>
              {t('changeMyPassword', { defaultValue: 'Change my password' })}
            </Button>
          )}
          {showAdmin && (
            <Button variant="outline" onClick={() => setAdminDialogOpen(true)}>
              {t('adminResetPassword', { defaultValue: 'Reset password (admin)' })}
            </Button>
          )}
          {!showSelf && !showAdmin && (
            <span className="text-sm text-muted-foreground">
              {t('viewOnlyBanner', { defaultValue: 'You have view-only access' })}
            </span>
          )}
        </div>
      </CardContent>

      {/* Change my password */}
      <Dialog
        open={selfDialogOpen}
        onOpenChange={(open) => {
          setSelfDialogOpen(open);
          if (!open) resetSelf();
        }}
      >
        <DialogContent className="border-white! dark:border-white!">
          <DialogHeader>
            <DialogTitle>
              {t('changeMyPassword', { defaultValue: 'Change my password' })}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="self-current">
                {t('currentPassword', { defaultValue: 'Current password' })}
              </Label>
              <Input
                id="self-current"
                type="password"
                value={selfCurrent}
                onChange={(e) => setSelfCurrent(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="self-new">
                {t('newPassword', { defaultValue: 'New password' })}
              </Label>
              <Input
                id="self-new"
                type="password"
                value={selfNew}
                onChange={(e) => setSelfNew(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="self-confirm">
                {t('confirmPassword', { defaultValue: 'Confirm new password' })}
              </Label>
              <Input
                id="self-confirm"
                type="password"
                value={selfConfirm}
                onChange={(e) => setSelfConfirm(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelfDialogOpen(false);
                resetSelf();
              }}
            >
              {t('cancel', { defaultValue: 'Cancel' })}
            </Button>
            <Button
              onClick={submitSelf}
              disabled={
                changeMutation.isPending ||
                !selfCurrent ||
                !selfNew ||
                !selfConfirm
              }
            >
              {t('save', { defaultValue: 'Save' })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admin reset password */}
      <Dialog
        open={adminDialogOpen}
        onOpenChange={(open) => {
          setAdminDialogOpen(open);
          if (!open) resetAdmin();
        }}
      >
        <DialogContent className="border-white! dark:border-white!">
          <DialogHeader>
            <DialogTitle>
              {t('adminResetPassword', { defaultValue: 'Reset password (admin)' })}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="admin-new">
                {t('newPassword', { defaultValue: 'New password' })}
              </Label>
              <Input
                id="admin-new"
                type="password"
                value={adminNew}
                onChange={(e) => setAdminNew(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-confirm">
                {t('confirmPassword', { defaultValue: 'Confirm new password' })}
              </Label>
              <Input
                id="admin-confirm"
                type="password"
                value={adminConfirm}
                onChange={(e) => setAdminConfirm(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAdminDialogOpen(false);
                resetAdmin();
              }}
            >
              {t('cancel', { defaultValue: 'Cancel' })}
            </Button>
            <Button
              onClick={submitAdmin}
              disabled={
                adminResetMutation.isPending || !adminNew || !adminConfirm
              }
            >
              {t('save', { defaultValue: 'Save' })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
