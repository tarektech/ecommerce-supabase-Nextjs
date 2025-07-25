"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect, ChangeEvent, useRef } from "react";
import { User } from "@supabase/supabase-js";
import { EmailChangeModal } from "@/components/EmailChangeModal";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { toast } from "sonner";
import { profileService } from "@/services/profile/profileService";

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
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update local state when props change (e.g., after successful save)
  useEffect(() => {
    setUsernameInput(username);
    setEmailInput(email);
    setAvatarUrlInput(avatarUrl);
    // Clear preview when avatar URL changes from external source
    if (avatarUrl !== avatarUrlInput) {
      setPreviewUrl(null);
    }
  }, [username, email, avatarUrl, avatarUrlInput]);

  const handleSave = async () => {
    // Update local UI state
    setUsername(usernameInput);
    setAvatarUrl(avatarUrlInput);
    setEmail(emailInput);

    // Save profile data
    onSaveProfile(usernameInput, emailInput, avatarUrlInput);
  };

  const handleAvatarClick = () => {
    // Programmatically click the hidden file input
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      toast.error(
        `File size exceeds 2MB limit (${(file.size / (1024 * 1024)).toFixed(
          2,
        )}MB)`,
      );
      return;
    }

    // Check file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid image file (JPEG, PNG, GIF, or WEBP)");
      return;
    }

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Start upload
    handleAvatarUpload(file);
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      setUploading(true);

      // Use profile service to upload avatar and pass current avatar URL to delete previous avatars
      const publicUrl = await profileService.uploadAvatar(
        user.id,
        file,
        avatarUrl,
      );

      if (publicUrl) {
        // Update both local state and parent component state
        setAvatarUrlInput(publicUrl);
        setAvatarUrl(publicUrl); // Update parent component state immediately
        // Clear preview since we now have the uploaded URL
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
        }
        toast.success("Avatar uploaded successfully");
      } else {
        throw new Error("Failed to upload avatar. Please try again later.");
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      // Clear preview on error
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }

      // Provide a user-friendly error message
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to upload avatar. Please try again later.");
      }
    } finally {
      setUploading(false);
    }
  };

  // Clean up preview URL on component unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Get initials for avatar fallback
  const getInitials = () => {
    if (username) {
      return username.substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  // Determine which image to show: preview, uploaded avatar, or fallback
  const displayImageUrl = previewUrl || avatarUrlInput || undefined;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
          <div
            className="group relative cursor-pointer"
            onClick={handleAvatarClick}
          >
            <Avatar className="h-24 w-24">
              <AvatarImage
                src={displayImageUrl}
                className="h-24 w-24 rounded-full object-cover"
              />
              <AvatarFallback className="h-24 w-24 text-xl">
                {getInitials()}
              </AvatarFallback>
            </Avatar>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
            />

            {/* Overlay with upload icon/text */}
            <div className="bg-opacity-50 absolute inset-0 flex items-center justify-center rounded-full bg-black opacity-0 transition-opacity group-hover:opacity-100">
              <span className="text-xs text-white">
                {uploading ? "Uploading..." : "Change Photo"}
              </span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <h3 className="mb-4 text-lg font-medium">Account Information</h3>
              <p className="text-muted-foreground mb-4">{email}</p>
            </div>
            <div>
              <p className="mb-4 text-lg font-medium">
                {username
                  ? "Your profile information"
                  : "Please add your username"}
              </p>
              <p className="text-muted-foreground mb-4">
                {username || "Please add your username"}
              </p>
            </div>
          </div>

          <div className="mb-4 grid grid-cols-1 gap-4">
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
                  className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                >
                  Change Email
                </Button>
              </div>
              <p className="text-muted-foreground text-xs">
                Email changes require verification
              </p>
            </div>

            {/* <div className="space-y-2">
              <Label htmlFor="avatarUrl">Avatar URL</Label>
              <Input
                id="avatarUrl"
                value={avatarUrlInput}
                onChange={(e) => setAvatarUrlInput(e.target.value)}
                placeholder="https://example.com/your-avatar.jpg"
              />
            </div> */}
          </div>

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-primary text-primary-foreground hover:bg-primary/90 mb-4 cursor-pointer"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>

          <div className="text-muted-foreground space-y-1 text-sm">
            {createdAt && (
              <span className="block">
                Account created:{" "}
                {new Date(createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                })}
              </span>
            )}
            <span className="block">Profile ID: {user?.id}</span>
          </div>
        </div>
        <Button
          onClick={onSignOut}
          className="hover:bg-accent hover:text-accent-foreground bg-primary text-primary-foreground cursor-pointer"
        >
          Sign Out
        </Button>
      </CardContent>

      {onUpdateEmail && (
        <EmailChangeModal
          user={user}
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          // onUpdateEmail={onUpdateEmail}
          setEmail={setEmail}
        />
      )}
    </Card>
  );
}
