import { prisma } from '../lib/prisma.js';
import type { InstructorToken } from '@prisma/client';

export async function findByInstructorId(instructorId: string): Promise<InstructorToken | null> {
  return prisma.instructorToken.findUnique({ where: { instructorId } });
}

export async function upsert(
  instructorId: string,
  encryptedToken: string,
  workspaceName: string,
): Promise<InstructorToken> {
  return prisma.instructorToken.upsert({
    where: { instructorId },
    update: { encryptedToken, workspaceName },
    create: { instructorId, encryptedToken, workspaceName },
  });
}

export async function deleteByInstructorId(instructorId: string): Promise<void> {
  await prisma.instructorToken.delete({ where: { instructorId } });
}
