import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import { env } from './utils/env.js';
import v1Router from './routes/v1/index.js';
import { errorHandler } from './middlewares/errorHandler.js';

import type { Socket } from 'node:net';

const app = express();

// セキュリティ・共通ミドルウェア
app.use(helmet());
app.use(
	cors({
		origin: env.ALLOW_ORIGIN,
		methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization'],
		credentials: true,
	}),
);
app.use(morgan('combined'));
app.use(compression());

// Stripe Webhook は raw body が必要なため先に設定
app.use('/api/v1/webhooks/stripe', express.raw({ type: 'application/json' }));

// その他のルートに JSON パーサーを適用
app.use(express.json());

// ヘルスチェック
app.get('/api/v1/health', (_req, res) => {
	res.status(200).json({ success: true, data: { status: 'ok' } });
});

// v1 ルーター
app.use('/api/v1', v1Router);

// 集約エラーハンドラー（必ず最後に設定）
app.use(errorHandler);

// Server start
const server = app.listen(env.API_PORT, () => {
	console.log(`API server is running on port ${env.API_PORT}`);
});

const SHUTDOWN_TIMEOUT = Number.isFinite(Number(env.SHUTDOWN_TIMEOUT))
	? Number(env.SHUTDOWN_TIMEOUT)
	: 10000;
let isShuttingdown = false;
// 進行中のSocketを管理
const connections: Set<Socket> = new Set();
server.on('connection', (socket: Socket) => {
	connections.add(socket);
	socket.on('close', () => connections.delete(socket));
});

// * Graceful Shutdown
const shutdown = (signal: string) => {
	if (isShuttingdown) return;
	isShuttingdown = true;
	console.log(`🔴 [${signal}] Starting Graceful shutdown...`);

	// -> 新規受付は停止(進行中の処理は完了まで待機)
	server.close((err) => {
		if (err) {
			console.error('Error closing server:', err);
			process.exitCode = 1;
		}
		console.log('🟢 HTTP server closed');
		process.exit();
	});

	// -> タイムアウト超過時は強制終了
	setTimeout(() => {
		console.log('⚠️ Forcing shutdown');
		for (const socket of connections) socket.destroy();
		process.exit(1);
	}, SHUTDOWN_TIMEOUT).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
