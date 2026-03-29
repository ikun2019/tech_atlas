import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
	// ── カテゴリ ──────────────────────────────────────────────
	const categories = [
		{ name: 'Web開発', slug: 'web-development' },
		{ name: 'データベース', slug: 'database' },
		{ name: 'インフラ', slug: 'infrastructure' },
		{ name: 'プログラミング基礎', slug: 'programming-basics' },
		{ name: 'データサイエンス', slug: 'data-science' },
		{ name: 'デザイン', slug: 'design' },
	];

	for (const category of categories) {
		await prisma.category.upsert({
			where: { slug: category.slug },
			update: {},
			create: category,
		});
	}
	console.log('✅ Categories seeded');

	// ── ADMIN ユーザー ─────────────────────────────────────────
	// supabaseId は実際の Supabase Auth ユーザー ID に差し替えること
	const admin = await prisma.user.upsert({
		where: { email: '0215.miyatto@gmail.com' },
		update: {},
		create: {
			supabaseId: '97ea2ddf-4183-49df-b019-d75344f703e2',
			email: '0215.miyatto@gmail.com',
			name: '管理者',
			role: 'ADMIN',
		},
	});
	console.log('✅ Admin user seeded');

	// ── サンプル講師 ───────────────────────────────────────────
	const instructor = await prisma.user.upsert({
		where: { email: 'instructor@example.com' },
		update: {},
		create: {
			supabaseId: 'seed-instructor-0000-0000-0000-000000000001',
			email: 'instructor@example.com',
			name: 'サンプル講師',
			role: 'INSTRUCTOR',
		},
	});
	console.log('✅ Instructor user seeded');

	// ── サンプル学習者 ─────────────────────────────────────────
	await prisma.user.upsert({
		where: { email: 'user@example.com' },
		update: {},
		create: {
			supabaseId: 'seed-user-000000-0000-0000-0000-000000000002',
			email: 'user@example.com',
			name: 'サンプル学習者',
			role: 'USER',
		},
	});
	console.log('✅ Sample user seeded');

	// ── サンプル講座 ───────────────────────────────────────────
	const webDevCategory = await prisma.category.findUnique({
		where: { slug: 'web-development' },
	});
	if (!webDevCategory) throw new Error('Category not found');

	const course = await prisma.course.upsert({
		where: { id: 'seed-course-00000000-0000-0000-0000-000000000001' },
		update: {},
		create: {
			id: 'seed-course-00000000-0000-0000-0000-000000000001',
			title: 'Next.js + TypeScript 入門',
			description: 'Next.js と TypeScript を使ったモダン Web 開発の基礎を学ぶ講座です。',
			categoryId: webDevCategory.id,
			instructorId: instructor.id,
			isPublished: true,
		},
	});
	console.log('✅ Sample course seeded');

	// ── サンプルチャプター ─────────────────────────────────────
	const chapter1 = await prisma.chapter.upsert({
		where: { id: 'seed-chapter-0000-0000-0000-000000000001' },
		update: {},
		create: {
			id: 'seed-chapter-0000-0000-0000-000000000001',
			courseId: course.id,
			title: '第1章: 環境構築',
			order: 1,
		},
	});

	const chapter2 = await prisma.chapter.upsert({
		where: { id: 'seed-chapter-0000-0000-0000-000000000002' },
		update: {},
		create: {
			id: 'seed-chapter-0000-0000-0000-000000000002',
			courseId: course.id,
			title: '第2章: 基本コンポーネント',
			order: 2,
		},
	});
	console.log('✅ Sample chapters seeded');

	// ── サンプルレッスン ───────────────────────────────────────
	// notionPageId は実際の Notion ページ ID に差し替えること
	await prisma.lesson.upsert({
		where: { id: 'seed-lesson-00000000-0000-0000-0000-000000000001' },
		update: {},
		create: {
			id: 'seed-lesson-00000000-0000-0000-0000-000000000001',
			chapterId: chapter1.id,
			title: 'Node.js のインストール',
			notionPageId: 'seed-notion-page-id-001',
			order: 1,
			isFree: true,
		},
	});

	await prisma.lesson.upsert({
		where: { id: 'seed-lesson-00000000-0000-0000-0000-000000000002' },
		update: {},
		create: {
			id: 'seed-lesson-00000000-0000-0000-0000-000000000002',
			chapterId: chapter1.id,
			title: 'プロジェクト作成',
			notionPageId: 'seed-notion-page-id-002',
			order: 2,
			isFree: true,
		},
	});

	await prisma.lesson.upsert({
		where: { id: 'seed-lesson-00000000-0000-0000-0000-000000000003' },
		update: {},
		create: {
			id: 'seed-lesson-00000000-0000-0000-0000-000000000003',
			chapterId: chapter2.id,
			title: 'Server Components とは',
			notionPageId: 'seed-notion-page-id-003',
			order: 1,
			isFree: false,
		},
	});
	console.log('✅ Sample lessons seeded');

	console.log('\n🌱 Seed completed successfully');
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
