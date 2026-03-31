import { z } from 'zod';
import fs from 'node:fs';

export function readEnvOrFile(name: string): string {
	const file = process.env[`${name}_FILE`];
	const value = (file ? fs.readFileSync(file, 'utf-8') : (process.env[name] ?? '')).trim();
	if (!value) throw new Error(`Missing ${name} or ${name}_FILE`);
	return value;
}

const PlainEnvSchema = z.object({
	NODE_ENV: z.string().optional().default('development'),
	ALLOW_ORIGIN: z.string().min(1, 'ALLOW_ORIGIN is needed'),
	API_PORT: z.string(),
	REDIS_URL: z.string().min(1, 'REDIS_URL is needed'),
	APP_URL: z.string().min(1, 'APP_URL is needed'),
	RESEND_FROM_EMAIL: z.string().min(1, 'RESEND_FROM_EMAIL is needed'),
	SHUTDOWN_TIMEOUT: z.string().min(1, 'SHUTDOWN_TIMEOUT is needed'),
});

const parsed = PlainEnvSchema.safeParse(process.env);

if (!parsed.success) {
	throw new Error('Error while parsing env');
}

const raw = parsed.data;

export const env = Object.freeze({
	NODE_ENV: raw.NODE_ENV,
	ALLOW_ORIGIN: raw.ALLOW_ORIGIN,
	API_PORT: raw.API_PORT,
	REDIS_URL: raw.REDIS_URL,
	APP_URL: raw.APP_URL,
	RESEND_FROM_EMAIL: raw.RESEND_FROM_EMAIL,
	SHUTDOWN_TIMEOUT: raw.SHUTDOWN_TIMEOUT,
	DATABASE_URL: readEnvOrFile('DATABASE_URL'),
	SUPABASE_URL: readEnvOrFile('SUPABASE_URL'),
	SUPABASE_SERVICE_ROLE_KEY: readEnvOrFile('SUPABASE_SERVICE_ROLE_KEY'),
	STRIPE_SECRET_KEY: readEnvOrFile('STRIPE_SECRET_KEY'),
	STRIPE_WEBHOOK_SECRET: readEnvOrFile('STRIPE_WEBHOOK_SECRET'),
	STRIPE_PRICE_MONTHLY: readEnvOrFile('STRIPE_PRICE_MONTHLY'),
	STRIPE_PRICE_YEARLY: readEnvOrFile('STRIPE_PRICE_YEARLY'),
	NOTION_ENCRYPTION_KEY: readEnvOrFile('NOTION_ENCRYPTION_KEY'),
	NOTION_OAUTH_CLIENT_ID: readEnvOrFile('NOTION_OAUTH_CLIENT_ID'),
	NOTION_OAUTH_REDIRECT_URI: readEnvOrFile('NOTION_OAUTH_REDIRECT_URI'),
	NOTION_OAUTH_CLIENT_SECRET: readEnvOrFile('NOTION_OAUTH_CLIENT_SECRET'),
	RESEND_API_KEY: readEnvOrFile('RESEND_API_KEY'),
});
