import * as userRepository from '../repositories/user.repository.js';
import type { User } from '@prisma/client';

export async function syncUser(
  supabaseId: string,
  email: string,
  name: string,
  avatarUrl?: string,
): Promise<User> {
  const existing = await userRepository.findBySupabaseId(supabaseId);
  if (existing) {
    return userRepository.update(existing.id, { email, name, avatarUrl: avatarUrl ?? null });
  }
  return userRepository.create({ supabaseId, email, name, ...(avatarUrl ? { avatarUrl } : {}) });
}

export async function getMe(
  userId: string,
): Promise<User & { instructorToken: { workspaceName: string } | null }> {
  const user = await userRepository.findByIdWithProfile(userId);
  if (!user) {
    const err = Object.assign(new Error('ユーザーが見つかりません'), {
      code: 'USER_NOT_FOUND',
      statusCode: 404,
    });
    throw err;
  }
  return user;
}

export async function updateMe(
  userId: string,
  data: Partial<{ name: string; avatarUrl: string | null }>,
): Promise<User> {
  const user = await userRepository.findById(userId);
  if (!user) {
    const err = Object.assign(new Error('ユーザーが見つかりません'), {
      code: 'USER_NOT_FOUND',
      statusCode: 404,
    });
    throw err;
  }
  return userRepository.update(userId, data);
}
