'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { EmailChangeModal } from '@/components/EmailChangeModal';

interface ProfileCardProps {
  user: User;
  username: string;
  setUsername: (value: string) => void;
  avatarUrl: string;
  setAvatarUrl: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  createdAt: string | null;
  isSaving: boolean;
  onSaveProfile: (username: string, email: string, avatarUrl: string) => void;
  onSignOut: () => void;
  onUpdateEmail?: (newEmail: string) => Promise<void>;
}

export function ProfileCard({
  user,
  username,
  setUsername,
  avatarUrl,
  setAvatarUrl,
  email,
  setEmail,
  createdAt,
  isSaving,
  onSaveProfile,
  onSignOut,
  onUpdateEmail,
}: ProfileCardProps) {
  const [usernameInput, setUsernameInput] = useState(username);
  const [emailInput, setEmailInput] = useState(email);
  const [avatarUrlInput, setAvatarUrlInput] = useState(avatarUrl);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  // Update local state when props change (e.g., after successful save)
  useEffect(() => {
    setUsernameInput(username);
    setEmailInput(email);
    setAvatarUrlInput(avatarUrl);
  }, [username, email, avatarUrl]);

  const handleSave = async () => {
    // Update local UI state
    setUsername(usernameInput);
    setAvatarUrl(avatarUrlInput);
    setEmail(emailInput);

    // Save profile data
    onSaveProfile(usernameInput, emailInput, avatarUrlInput);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-2xl">My Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="text-lg font-medium mb-4">Account Information</h3>
              <p className="text-muted-foreground mb-4">{email}</p>
            </div>
            <div>
              <p className="text-lg font-medium mb-4">
                {username
                  ? 'Your profile information'
                  : 'Please add your username'}
              </p>
              <p className="text-muted-foreground mb-4">
                {username || 'Please add your username'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  value={email}
                  disabled
                  className="bg-muted flex-1"
                />
                <Button
                  type="button"
                  onClick={() => setIsEmailModalOpen(true)}
                  variant="outline"
                >
                  Change Email
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Email changes require verification
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatarUrl">Avatar URL</Label>
              <Input
                id="avatarUrl"
                value={avatarUrlInput}
                onChange={(e) => setAvatarUrlInput(e.target.value)}
                placeholder="https://example.com/your-avatar.jpg"
              />
            </div>
          </div>

          <Button onClick={handleSave} disabled={isSaving} className="mb-4">
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>

          <div className="text-sm text-muted-foreground space-y-1">
            {createdAt && (
              <span className="block">
                Account created: {new Date(createdAt).toLocaleDateString()}
              </span>
            )}
            <span className="block">Profile ID: {user?.id}</span>
          </div>
        </div>
        <Button
          onClick={onSignOut}
          className="hover:bg-accent hover:text-accent-foreground"
        >
          Sign Out
        </Button>
      </CardContent>

      {onUpdateEmail && (
        <EmailChangeModal
          user={user}
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          onUpdateEmail={onUpdateEmail}
          setEmail={setEmail}
        />
      )}
    </Card>
  );
}
