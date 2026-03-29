import { Resend } from 'resend';
import { env } from '../utils/env.js';

export const resend = new Resend(env.RESEND_API_KEY);

export async function sendWelcomeMail(to: string, name: string): Promise<void> {
	await resend.emails.send({
		from: env.RESEND_FROM_EMAIL ?? 'noreply@example.com',
		to,
		subject: 'サブスクリプションへようこそ',
		html: `<p>${name} 様、サブスクリプションのご登録ありがとうございます。</p>`,
	});
}

export async function sendPaymentFailedMail(to: string, name: string): Promise<void> {
	await resend.emails.send({
		from: env.RESEND_FROM_EMAIL ?? 'noreply@example.com',
		to,
		subject: '支払い失敗のお知らせ',
		html: `<p>${name} 様、お支払いが失敗しました。お支払い情報をご確認ください。</p>`,
	});
}
