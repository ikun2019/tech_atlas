import type { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase.js';
import { prisma } from '../lib/prisma.js';

export async function optionalAuthenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    next();
    return;
  }

  try {
    const {
      data: { user: supabaseUser },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !supabaseUser) {
      next();
      return;
    }

    const user = await prisma.user.findUnique({ where: { supabaseId: supabaseUser.id } });
    if (user) {
      req.user = user;
    }
  } catch {
    // トークンが無効な場合でもリクエストを通過させる
  }

  next();
}
