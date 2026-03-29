import { prisma } from '../lib/prisma.js';
import type { User } from '@prisma/client';

export async function findBySupabaseId(supabaseId: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { supabaseId } });
}

export async function findById(id: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } });
}

export async function findByIdWithProfile(
  id: string,
): Promise<(User & { instructorToken: { workspaceName: string } | null }) | null> {
  return prisma.user.findUnique({
    where: { id },
    include: { instructorToken: { select: { workspaceName: true } } },
  }) as Promise<(User & { instructorToken: { workspaceName: string } | null }) | null>;
}

export async function create(data: {
  supabaseId: string;
  email: string;
  name: string;
  avatarUrl?: string;
}): Promise<User> {
  return prisma.user.create({ data });
}

export async function update(
  id: string,
  data: Partial<{ email: string; name: string; avatarUrl: string | null }>,
): Promise<User> {
  return prisma.user.update({ where: { id }, data });
}
