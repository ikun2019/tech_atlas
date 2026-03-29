import crypto from 'crypto';
import { env, readEnvOrFile } from '../utils/env.js';
import { encryptToken } from '../lib/crypto.js';
import * as instructorTokenRepository from '../repositories/instructor-token.repository.js';

const NOTION_OAUTH_BASE = 'https://api.notion.com/v1/oauth';
const STATE_TTL_MS = 10 * 60 * 1000; // 10 分

interface OAuthState {
	instructorId: string;
	nonce: string;
	ts: number;
	sig: string;
}

function loadNotionEncryptionKey(): Buffer {
	const keyHex = env.NOTION_ENCRYPTION_KEY;
	if (!/^[0-9a-fA-F]+$/.test(keyHex)) throw new Error('NOTION_ENCRYPTION_KEY must be hex');
	if (keyHex.length !== 64)
		throw new Error('NOTION_ENCRYPTION_KEY must be 64 hex chars (32 bytes)');
	return Buffer.from(keyHex, 'hex');
}

function generateState(instructorId: string): string {
	const nonce = crypto.randomBytes(16).toString('hex');
	const ts = Date.now();
	const key = loadNotionEncryptionKey();
	const sig = crypto
		.createHmac('sha256', key)
		.update(`${instructorId}:${nonce}:${ts}`)
		.digest('hex');
	return Buffer.from(JSON.stringify({ instructorId, nonce, ts, sig })).toString('base64url');
}

function verifyState(stateParam: string): string {
	let state: OAuthState;
	try {
		state = JSON.parse(Buffer.from(stateParam, 'base64url').toString('utf8')) as OAuthState;
	} catch {
		throw Object.assign(new Error('OAuth state が不正です'), {
			code: 'INVALID_OAUTH_STATE',
			statusCode: 400,
		});
	}

	if (Date.now() - state.ts > STATE_TTL_MS) {
		throw Object.assign(
			new Error('OAuth state の有効期限が切れています。再度 Notion 連携を開始してください'),
			{
				code: 'OAUTH_STATE_EXPIRED',
				statusCode: 400,
			},
		);
	}
	const key = loadNotionEncryptionKey();
	const expectedSig = crypto
		.createHmac('sha256', key)
		.update(`${state.instructorId}:${state.nonce}:${state.ts}`)
		.digest('hex');

	const sigBuf = Buffer.from(state.sig, 'hex');
	const expectedSigBuf = Buffer.from(expectedSig, 'hex');
	if (sigBuf.length !== expectedSigBuf.length || !crypto.timingSafeEqual(sigBuf, expectedSigBuf)) {
		throw Object.assign(new Error('OAuth state の署名が不正です'), {
			code: 'INVALID_OAUTH_STATE',
			statusCode: 400,
		});
	}

	return state.instructorId;
}

export function getOAuthUrl(instructorId: string): string {
	const clientId = readEnvOrFile('NOTION_OAUTH_CLIENT_ID');
	const redirectUrl = readEnvOrFile('NOTION_OAUTH_REDIRECT_URI');

	if (!clientId || !redirectUrl) {
		throw Object.assign(
			new Error(
				'Notion OAuth の環境変数（NOTION_OAUTH_CLIENT_ID / NOTION_OAUTH_REDIRECT_URI）が設定されていません',
			),
			{ code: 'NOTION_OAUTH_NOT_CONFIGURED', statusCode: 500 },
		);
	}

	const state = generateState(instructorId);
	const params = new URLSearchParams({
		client_id: clientId,
		response_type: 'code',
		owner: 'user',
		redirect_uri: redirectUrl,
		state,
	});

	return `${NOTION_OAUTH_BASE}/authorize?${params.toString()}`;
}

export async function exchangeOAuthCode(
	code: string,
	state: string,
	authenticatedInstructorId: string,
): Promise<void> {
	const instructorId = verifyState(state);

	if (instructorId !== authenticatedInstructorId) {
		throw Object.assign(new Error('OAuth state のユーザーが一致しません'), {
			code: 'OAUTH_STATE_USER_MISMATCH',
			statusCode: 400,
		});
	}

	const clientId = readEnvOrFile('NOTION_OAUTH_CLIENT_ID');
	const clientSecret = readEnvOrFile('NOTION_OAUTH_CLIENT_SECRET');
	const redirectUrl = readEnvOrFile('NOTION_OAUTH_REDIRECT_URI');

	const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

	const res = await fetch(`${NOTION_OAUTH_BASE}/token`, {
		method: 'POST',
		headers: {
			Authorization: `Basic ${credentials}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			grant_type: 'authorization_code',
			code,
			redirect_uri: redirectUrl,
		}),
		signal: AbortSignal.timeout(15000),
	});

	if (!res.ok) {
		const body = await res.text().catch(() => '');
		console.error('[Notion] OAuth token exchange failed:', res.status, body);
		throw Object.assign(new Error('Notion との認証に失敗しました'), {
			code: 'NOTION_OAUTH_EXCHANGE_FAILED',
			statusCode: 502,
		});
	}

	const data = (await res.json()) as { access_token: string; workspace_name?: string };
	const encrypted = encryptToken(data.access_token);
	await instructorTokenRepository.upsert(
		instructorId,
		encrypted,
		data.workspace_name ?? 'My Workspace',
	);
}

export async function disconnectNotion(instructorId: string): Promise<void> {
	await instructorTokenRepository.deleteByInstructorId(instructorId);
}
