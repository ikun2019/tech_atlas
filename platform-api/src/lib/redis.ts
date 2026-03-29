import { env } from '../utils/env.js';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const mod = await import('ioredis');
const Redis = (mod as any).default ?? mod;

export const redis = new Redis(env.REDIS_URL, {
	// Redis が未接続の場合、コマンドをキューに積まず即座に reject する
	// （デフォルトでは無限にキューして待ち続けるため、リクエストがハングする）
	enableOfflineQueue: false,
	maxRetriesPerRequest: 0,
	connectTimeout: 5000,
});

redis.on('error', (err: Error) => {
	console.error('[Redis] Connection error:', err);
});
