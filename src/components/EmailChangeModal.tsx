'use client'
import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import { profileService } from '@/services/profile/profileService';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface EmailChangeModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
 // onUpdateEmail: (newEmail: string) => Promise<void>;
  setEmail: (email: string) => void;
}

export function EmailChangeModal({
  user,
  isOpen,
  onClose,
  //onUpdateEmail,
  setEmail,
}: EmailChangeModalProps) {
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // First verify the current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: currentPassword,
      });

      if (signInError) {
        setError('Current password is incorrect');
        return;
      }

      // Then update the email
      const { error: updateError } = await supabase.auth.updateUser({
        email: newEmail,
      });

      if (updateError) {
        if (updateError.message.toLowerCase().includes('email')) {
          setError('Invalid email format or email already in use');
        } else {
          setError(updateError.message);
        }
        return;
      }

      // Then update the email in public.profiles
      const profileUpdateResult = await profileService.updateProfile(user.id, {
        email: newEmail,
      });

      if (!profileUpdateResult) {
        console.error('Failed to update email in profiles table');
        setError(
          'Email updated in auth but failed to sync with profile. Please try refreshing the page.'
        );
        return;
      }

      // Update the email in the UI
      setEmail(newEmail);

      toast.success(
        'Email update initiated. Please check your new email for verification.'
      );
      onClose();
      // Reset form
      setNewEmail('');
      setCurrentPassword('');
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Failed to update email'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Change Email Address
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Enter your new email address and current password. You'll need to
            verify the new email before the change takes effect.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentEmail" className="text-foreground">
              Current Email
            </Label>
            <Input
              id="currentEmail"
              value={user.email || ''}
              disabled
              className="bg-muted text-muted-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newEmail" className="text-foreground">
              New Email
            </Label>
            <Input
              id="newEmail"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Enter new email address"
              required
              className="bg-background text-foreground placeholder:text-muted-foreground border-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentPassword" className="text-foreground">
              Current Password
            </Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                required
                className="bg-background text-foreground placeholder:text-muted-foreground border-input pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={togglePasswordVisibility}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                )}
                <span className="sr-only">
                  {showPassword ? 'Hide password' : 'Show password'}
                </span>
              </Button>
            </div>
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
              {error}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-background text-foreground border-input hover:bg-accent hover:text-accent-foreground"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSubmitting ? 'Updating...' : 'Update Email'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
