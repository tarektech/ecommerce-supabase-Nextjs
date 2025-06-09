import { getProfile } from './getProfile';
import { createProfile } from './createProfile';
import { ProfileType } from '@/types';

export async function getOrCreateProfile(
  userId: string,
  email?: string
): Promise<ProfileType | null> {
  let profile = await getProfile(userId);

  if (!profile) {
    profile = await createProfile(userId, {
      email: email || '',
      username: '',
    });
  }

  return profile;
}
