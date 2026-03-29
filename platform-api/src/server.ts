import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import { env } from './utils/env.js';
import v1Router from './routes/v1/index.js';
import { errorHandler } from './middlewares/errorHandler.js';

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

console.log('API_PORT', env.API_PORT);
app.listen(env.API_PORT, () => {
	console.log(`API server is running on port ${env.API_PORT}`);
});
