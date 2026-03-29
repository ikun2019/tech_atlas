// * Notionのアクセストークンを暗号化・複合するためのユーティリティ
import crypto from 'crypto';
import { env } from '../utils/env.js';

const ALGORITHM = 'aes-256-gcm';

function loadKey(): Buffer {
	const keyHex = env.NOTION_ENCRYPTION_KEY;
	if (!/^[0-9a-fA-F]+$/.test(keyHex)) throw new Error('NOTION_ENCRYPTION_KEY must be hex');
	if (keyHex.length !== 64)
		throw new Error('NOTION_ENCRYPTION_KEY must be 64 hex chars (32 bytes)');
	return Buffer.from(keyHex, 'hex');
}

// * プレーンテキストのトークンを暗号化しiv:tag形式の文字列として返す関数
export function encryptToken(plain: string): string {
	const key = loadKey();
	const iv = crypto.randomBytes(16);
	const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
	const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
	const tag = cipher.getAuthTag();
	return `${iv.toString('hex')}:${tag.toString('hex')}:${enc.toString('hex')}`;
}
// * 文字列を元のトークンに複合する関数
export function decryptToken(stored: string): string {
	const [ivHex, tagHex, encHex] = stored.split(':');
	const key = loadKey();
	const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(ivHex!, 'hex'));
	decipher.setAuthTag(Buffer.from(tagHex!, 'hex'));
	return decipher.update(Buffer.from(encHex!, 'hex')).toString('utf8') + decipher.final('utf8');
}
