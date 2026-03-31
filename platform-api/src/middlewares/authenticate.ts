import type { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase.js';
import { prisma } from '../lib/prisma.js';

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
	const token = req.headers.authorization?.split(' ')[1];

	if (!token) {
		res.status(401).json({
			success: false,
			error: { code: 'UNAUTHORIZED', message: '認証が必要です', statusCode: 401 },
		});
		return;
	}

	const {
		data: { user: supabaseUser },
		error,
	} = await supabase.auth.getUser(token);

	if (error || !supabaseUser) {
		res.status(401).json({
			success: false,
			error: { code: 'INVALID_TOKEN', message: 'トークンが無効です', statusCode: 401 },
		});
		return;
	}

	const user = await prisma.user.findUnique({ where: { supabaseId: supabaseUser.id } });
	if (!user) {
		res.status(401).json({
			success: false,
			error: { code: 'USER_NOT_FOUND', message: 'ユーザーが見つかりません', statusCode: 401 },
		});
		return;
	}

	req.user = user;
	next();
}
