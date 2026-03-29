# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## プロジェクト概要

Next.js（FE）+ Express（BE）+ Traefik（ロードバランサー）構成による
テキストベースのオンライン講座プラットフォーム（商用 SaaS）。
講師が Notion でコンテンツを管理し、学習者がブラウザで受講する。
Stripe サブスクリプションによる月額/年額課金モデル。

---

## 技術スタック

### アプリケーション

| 層 | 技術 | 備考 |
|---|---|---|
| フロントエンド | Next.js 15（App Router）+ TypeScript strict | SSR/SSG/ISR を用途に応じて使い分け |
| スタイリング | Tailwind CSS + shadcn/ui | |
| バックエンド | Express.js + TypeScript strict | REST API サーバー |
| 共通型・スキーマ | Zod | FE/BE それぞれで定義・型は手動で合わせる |
| 認証 | Supabase Auth | OAuth（Google 等）対応 |
| DB | Supabase（PostgreSQL） | |
| ORM | Prisma | |
| キャッシュ | Redis（セルフホスト、Docker Compose 内） | ioredis でアクセス |
| CMS | Notion API（@notionhq/client + notion-to-md） | 講師ごとに個別ワークスペース |
| 決済 | Stripe（Checkout + Webhooks） | 月額/年額サブスクリプション |
| メール | Resend | トランザクションメール |
| ストレージ | Cloudflare R2（S3 互換） | サムネイル・添付ファイル |
| 監視 | Sentry | エラートラッキング |

### インフラ

| 項目 | 技術 | 備考 |
|---|---|---|
| ロードバランサー | Traefik v3 | Let's Encrypt 自動 SSL |
| 開発環境 | Docker Compose | |
| 本番環境 | Docker Swarm（VPS） | |
| CI/CD | GitHub Actions | |

### ユーザーロール（3層）

| ロール | 権限 |
|---|---|
| `USER`（学習者） | コンテンツ閲覧・進捗管理・サブスク管理 |
| `INSTRUCTOR`（講師） | 自分の講座作成・Notion トークン管理 |
| `ADMIN`（管理者） | 全体管理・ユーザー管理・講座審査・KPI 確認 |

---

## リポジトリ構成

Turborepo・pnpm は使用しない。`web` と `api` は**それぞれ独立したリポジトリ**として管理する。

```
【リポジトリ 1】 platform-web/        # Next.js 15（App Router）
├── app/
│   ├── (public)/                     # 未認証でもアクセス可能なページ
│   ├── (auth)/                       # 認証ページ（login / register）
│   ├── (dashboard)/                  # ログイン済みユーザー向け
│   ├── instructor/                   # 講師ダッシュボード
│   └── admin/                        # 管理者画面
├── components/
│   ├── ui/                           # shadcn/ui ベースの基本コンポーネント
│   ├── features/                     # 機能別コンポーネント
│   └── layouts/                      # レイアウトコンポーネント
├── lib/
│   ├── supabase/                     # Supabase クライアント初期化
│   ├── api/                          # Express API クライアント関数
│   └── utils/
├── hooks/                            # カスタムフック
├── types/                            # TypeScript 型定義（API レスポンス型等）
├── .github/workflows/
│   ├── ci.yml                        # PR 時: lint / typecheck / test
│   └── deploy.yml                    # main push 時: build → deploy
├── Dockerfile
├── package.json
└── .env.example


【リポジトリ 2】 platform-api/        # Express REST API
├── src/
│   ├── controllers/                  # HTTP 入出力のみ（ビジネスロジック禁止）
│   ├── services/                     # ビジネスロジック（DB 直接アクセス禁止）
│   ├── repositories/                 # Prisma 操作のみ
│   ├── middlewares/                  # authenticate / authorize / validate 等
│   ├── routes/                       # ルーティング定義（v1/）
│   ├── lib/
│   │   ├── supabase.ts               # Supabase Admin クライアント
│   │   ├── redis.ts                  # ioredis クライアント
│   │   ├── notion.ts                 # Notion クライアントファクトリー
│   │   ├── stripe.ts                 # Stripe クライアント
│   │   └── crypto.ts                 # AES-256-GCM 暗号化ユーティリティ
│   └── types/                        # TypeScript 型定義
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── .github/workflows/
│   ├── ci.yml                        # PR 時: lint / typecheck / test
│   └── deploy.yml                    # main push 時: build → push → deploy
├── Dockerfile
├── package.json
└── .env.example


【リポジトリ 3】 platform-infra/      # インフラ設定（api リポジトリに含めても可）
├── docker-compose.yml                # ローカル開発用
├── docker-compose.prod.yml           # 本番（Docker Swarm stack）
└── traefik/
    ├── traefik.yml                   # Traefik 静的設定
    └── dynamic/                      # 動的設定（ミドルウェア等）
```

> **型定義の共有について:**
> API のリクエスト/レスポンス型は `platform-api/src/types/` で定義し、
> 必要な型は `platform-web/types/api.ts` に手動でコピーして同期する。
> または API 側で `tsc --declaration` で型定義ファイルを生成し npm パッケージとして配布することも可能。

---

## 開発環境（Docker Compose）

### サービス構成

```yaml
# infra/docker-compose.yml
services:
  traefik:          # ポート 80 を外部公開。ダッシュボードは traefik.localhost
  web:              # Next.js  — 内部ポート 3000、Traefik ラベルでルーティング
  api:              # Express  — 内部ポート 4000、Traefik ラベルでルーティング
  redis:            # Redis 7  — 内部ポート 6379（外部非公開）
```

> **DB は Supabase を使用するため docker-compose に含めない。**
> ローカル開発時は Supabase ダッシュボードまたは Supabase CLI のローカル環境を使用する。

### Traefik ローカルルーティング

```
http://localhost/          → web（Next.js）
http://localhost/api/v1/   → api（Express）
http://traefik.localhost/  → Traefik ダッシュボード（開発のみ）
```

### 起動コマンド

```bash
# 初回セットアップ
cp .env.example .env
# .env を編集して Supabase / Stripe / Notion 等の値を設定

# 起動
docker compose -f infra/docker-compose.yml up -d

# ログ確認
docker compose -f infra/docker-compose.yml logs -f api
docker compose -f infra/docker-compose.yml logs -f web

# 再ビルド（依存関係変更時）
docker compose -f infra/docker-compose.yml up -d --build

# 停止
docker compose -f infra/docker-compose.yml down

# DB マイグレーション（スキーマ変更時）
docker compose -f infra/docker-compose.yml exec api npm run db:migrate

# Prisma Studio（DB GUI）
docker compose -f infra/docker-compose.yml exec api npm run db:studio
```

---

## 本番環境（VPS + Docker Swarm + Traefik）

### インフラ構成

```
VPS（Docker Swarm Manager）
└── Stack: learning-platform
    ├── traefik  ← 80/443 外部公開、Let's Encrypt 自動 SSL
    ├── web      (Next.js)   × 2 replicas
    ├── api      (Express)   × 2 replicas
    └── redis    (Redis 7)   × 1 replica  ← named volume で永続化
```

> **Supabase はクラウドマネージドのため Swarm stack には含めない。**

### Traefik 設定（`infra/traefik/traefik.yml`）

```yaml
entryPoints:
  web:
    address: ":80"
    http:
      redirections:
        entryPoint:
          to: websecure     # HTTP → HTTPS 強制リダイレクト
          scheme: https
  websecure:
    address: ":443"

certificatesResolvers:
  letsencrypt:
    acme:
      email: admin@example.com      # 必ず実在するアドレスを設定
      storage: /letsencrypt/acme.json
      httpChallenge:
        entryPoint: web

api:
  dashboard: true
  # 本番では必ず BasicAuth または IP 制限ミドルウェアを適用すること
```

### Swarm デプロイ手順

```bash
# ── 初回のみ ───────────────────────────────────────────────────

docker swarm init

# Docker Secret 登録（.env ファイルを本番コンテナに渡さない）
printf "your-notion-encryption-key" | docker secret create notion_encryption_key -
printf "your-stripe-secret-key"     | docker secret create stripe_secret_key -
printf "your-stripe-webhook-secret" | docker secret create stripe_webhook_secret -
printf "your-resend-api-key"        | docker secret create resend_api_key -
printf "your-sentry-dsn"            | docker secret create sentry_dsn -

# acme.json 作成とパーミッション設定（600 でないと Traefik が起動しない）
touch /opt/traefik/acme.json && chmod 600 /opt/traefik/acme.json

# ── 毎デプロイ ─────────────────────────────────────────────────

# イメージビルド & プッシュ
docker build -t your-registry/platform-web:latest ./platform-web
docker build -t your-registry/platform-api:latest ./platform-api
docker push your-registry/platform-web:latest
docker push your-registry/platform-api:latest

# DB マイグレーション（デプロイ前に必ず実行）
docker run --rm \
  -e DATABASE_URL="${DATABASE_URL}" \
  your-registry/platform-api:latest \
  npx prisma migrate deploy

# Stack デプロイ / 更新
docker stack deploy \
  --with-registry-auth \
  -c infra/docker-compose.prod.yml \
  learning-platform

# 状態確認
docker stack ps learning-platform --no-trunc
docker service ls

# ── サービス個別更新 ───────────────────────────────────────────

docker service update \
  --image your-registry/platform-web:latest \
  --update-order start-first \
  learning-platform_web

docker service update \
  --image your-registry/platform-api:latest \
  --update-order start-first \
  learning-platform_api

# ── ロールバック ───────────────────────────────────────────────

docker service rollback learning-platform_web
docker service rollback learning-platform_api
```

### GitHub Actions CI/CD フロー

```
PR オープン / push（feature/*）
  → ci.yml: lint → typecheck → test（Vitest + Playwright）

push（main）
  → deploy.yml:
      1. CI（lint / typecheck / test）
      2. Docker イメージビルド & レジストリプッシュ
      3. SSH で VPS に接続
      4. prisma migrate deploy
      5. docker service update（web / api）
```

---

## 環境変数（`.env.example`）

```bash
# ── アプリ ───────────────────────────────────────────────────
NODE_ENV=development
APP_URL=http://localhost
NEXT_PUBLIC_APP_URL=http://localhost

# ── Supabase ─────────────────────────────────────────────────
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...       # BE のみ使用（フロントに渡さない）

NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Prisma 接続（Supabase 接続プーリング対応）
DATABASE_URL=postgresql://...          # プーリング URL（通常のクエリ用）
DIRECT_URL=postgresql://...            # ダイレクト URL（マイグレーション用）

# ── Redis ────────────────────────────────────────────────────
REDIS_URL=redis://redis:6379           # Docker Compose 内部名

# ── Notion ───────────────────────────────────────────────────
# 講師ごとのトークンは DB の instructor_tokens テーブルに暗号化して保存
NOTION_ENCRYPTION_KEY=                 # 32 バイト hex（openssl rand -hex 32 で生成）

# ── Stripe ───────────────────────────────────────────────────
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_YEARLY=price_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# ── Resend（メール）──────────────────────────────────────────
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@example.com

# ── Cloudflare R2 ────────────────────────────────────────────
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=https://pub-xxx.r2.dev

# ── Sentry ───────────────────────────────────────────────────
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=
```

> 本番環境では機密値（SECRET 系）は `docker secret` で管理し、`.env` ファイルをコンテナにマウントしない。

---

## API エンドポイント設計（ベース URL: `/api/v1`）

#### 認証

```
POST  /api/v1/auth/sync     # Supabase 初回ログイン後に Platform DB へ User 同期
GET   /api/v1/auth/me       # 自分のプロフィール取得   [要認証]
PATCH /api/v1/auth/me       # プロフィール更新          [要認証]
```

> ログイン・登録・OAuth はすべて **Supabase Auth SDK（FE 側）** で処理。
> Express API は Supabase 発行の JWT を検証するのみ。

#### 講座・レッスン

```
GET    /api/v1/courses                             # 講座一覧（ページング・カテゴリ・検索）
GET    /api/v1/courses/:courseId                   # 講座詳細
GET    /api/v1/courses/:courseId/chapters          # チャプター一覧（レッスン含む）
GET    /api/v1/lessons/:lessonId                   # レッスン詳細（Notion コンテンツ含む）
POST   /api/v1/lessons/:lessonId/complete          # 受講完了マーク        [要認証]
DELETE /api/v1/lessons/:lessonId/complete          # 完了取り消し          [要認証]
POST   /api/v1/lessons/:lessonId/cache/purge       # Notion キャッシュ削除 [要 INSTRUCTOR/ADMIN]
```

#### 進捗

```
GET  /api/v1/progress                              # 自分の全進捗          [要認証]
GET  /api/v1/progress/courses/:courseId            # 講座別の進捗率        [要認証]
```

#### 決済（Stripe）

```
POST /api/v1/subscriptions/checkout                # Checkout セッション作成 [要認証]
POST /api/v1/subscriptions/portal                  # Customer Portal URL    [要認証]
GET  /api/v1/subscriptions/status                  # サブスク状態確認       [要認証]
POST /api/v1/webhooks/stripe                       # Stripe Webhook（署名検証必須・認証不要）
```

#### 講師

```
GET    /api/v1/instructor/courses                              # 自分の講座一覧  [要 INSTRUCTOR]
POST   /api/v1/instructor/courses                              # 講座作成        [要 INSTRUCTOR]
PUT    /api/v1/instructor/courses/:courseId                    # 講座更新        [要 INSTRUCTOR]
DELETE /api/v1/instructor/courses/:courseId                    # 講座削除（論理）[要 INSTRUCTOR]
POST   /api/v1/instructor/courses/:courseId/chapters           # チャプター追加  [要 INSTRUCTOR]
PUT    /api/v1/instructor/chapters/:chapterId                  # チャプター更新  [要 INSTRUCTOR]
POST   /api/v1/instructor/chapters/:chapterId/lessons          # レッスン追加    [要 INSTRUCTOR]
PUT    /api/v1/instructor/lessons/:lessonId                    # レッスン更新    [要 INSTRUCTOR]
POST   /api/v1/instructor/notion/connect                       # Notion トークン登録 [要 INSTRUCTOR]
DELETE /api/v1/instructor/notion/token                         # Notion トークン削除 [要 INSTRUCTOR]
```

#### 管理者

```
GET  /api/v1/admin/users                           # ユーザー一覧           [要 ADMIN]
PUT  /api/v1/admin/users/:userId/role              # ロール変更             [要 ADMIN]
GET  /api/v1/admin/courses                         # 全講座一覧（審査含む） [要 ADMIN]
PUT  /api/v1/admin/courses/:courseId/publish       # 公開/非公開切替        [要 ADMIN]
GET  /api/v1/admin/stats                           # KPI ダッシュボード      [要 ADMIN]
```

---

## DB スキーマ（Prisma）

```prisma
// platform-api/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")   // Supabase の接続プーリング対応
}

model User {
  id               String    @id @default(cuid())
  supabaseId       String    @unique   // Supabase Auth の sub クレーム
  email            String    @unique
  name             String
  avatarUrl        String?
  role             Role      @default(USER)
  stripeCustomerId String?   @unique
  deletedAt        DateTime?
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  subscription      Subscription?
  progresses        Progress[]
  reviews           Review[]
  comments          Comment[]
  bookmarks         Bookmark[]
  certificates      Certificate[]
  instructorToken   InstructorToken?
  instructorCourses Course[]          @relation("InstructorCourses")
}

enum Role {
  USER
  INSTRUCTOR
  ADMIN
}

model InstructorToken {
  id             String   @id @default(cuid())
  instructorId   String   @unique
  encryptedToken String   // AES-256-GCM で暗号化（平文保存禁止）
  workspaceName  String
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  instructor User @relation(fields: [instructorId], references: [id])
}

model Category {
  id      String   @id @default(cuid())
  name    String
  slug    String   @unique
  courses Course[]
}

model Course {
  id           String    @id @default(cuid())
  title        String
  description  String
  thumbnailUrl String?
  categoryId   String
  instructorId String
  isPublished  Boolean   @default(false)
  deletedAt    DateTime?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  category     Category      @relation(fields: [categoryId], references: [id])
  instructor   User          @relation("InstructorCourses", fields: [instructorId], references: [id])
  chapters     Chapter[]
  reviews      Review[]
  bookmarks    Bookmark[]
  certificates Certificate[]
}

model Chapter {
  id        String   @id @default(cuid())
  courseId  String
  title     String
  order     Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  course  Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  lessons Lesson[]
}

model Lesson {
  id           String    @id @default(cuid())
  chapterId    String
  title        String
  notionPageId String
  order        Int
  isFree       Boolean   @default(false)
  deletedAt    DateTime?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  chapter    Chapter    @relation(fields: [chapterId], references: [id], onDelete: Cascade)
  progresses Progress[]
  comments   Comment[]
}

model Progress {
  id          String   @id @default(cuid())
  userId      String
  lessonId    String
  completedAt DateTime @default(now())

  user   User   @relation(fields: [userId], references: [id])
  lesson Lesson @relation(fields: [lessonId], references: [id])

  @@unique([userId, lessonId])
  @@index([userId])
}

model Subscription {
  id                   String             @id @default(cuid())
  userId               String             @unique
  stripeSubscriptionId String             @unique
  stripePriceId        String
  status               SubscriptionStatus
  plan                 Plan
  currentPeriodEnd     DateTime
  cancelAtPeriodEnd    Boolean            @default(false)
  createdAt            DateTime           @default(now())
  updatedAt            DateTime           @updatedAt

  user User @relation(fields: [userId], references: [id])
}

enum SubscriptionStatus {
  ACTIVE
  CANCELED
  PAST_DUE
  INCOMPLETE
  TRIALING
}

enum Plan {
  MONTHLY
  YEARLY
}

model Review {
  id        String   @id @default(cuid())
  userId    String
  courseId  String
  rating    Int      // 1〜5
  body      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user   User   @relation(fields: [userId], references: [id])
  course Course @relation(fields: [courseId], references: [id])

  @@unique([userId, courseId])
}

model Comment {
  id        String   @id @default(cuid())
  userId    String
  lessonId  String
  body      String
  parentId  String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user    User      @relation(fields: [userId], references: [id])
  lesson  Lesson    @relation(fields: [lessonId], references: [id])
  parent  Comment?  @relation("CommentReplies", fields: [parentId], references: [id])
  replies Comment[] @relation("CommentReplies")
}

model Bookmark {
  id        String   @id @default(cuid())
  userId    String
  courseId  String
  createdAt DateTime @default(now())

  user   User   @relation(fields: [userId], references: [id])
  course Course @relation(fields: [courseId], references: [id])

  @@unique([userId, courseId])
}

model Certificate {
  id        String   @id @default(cuid())
  userId    String
  courseId  String
  uuid      String   @unique @default(uuid())
  issuedAt  DateTime @default(now())

  user   User   @relation(fields: [userId], references: [id])
  course Course @relation(fields: [courseId], references: [id])

  @@unique([userId, courseId])
}
```

---

## 認証フロー

```
1. FE: Supabase クライアント SDK でログイン（OAuth / メール）
2. FE: Supabase が JWT（access_token）を返す
3. FE: API リクエスト時に Authorization: Bearer <token> ヘッダーを付与
4. BE: supabase.auth.getUser(token) で JWT を検証・ユーザー情報を取得
5. BE: supabaseId で Platform DB の User を検索
      └─ 存在しない場合（初回）: POST /api/v1/auth/sync で User レコードを作成
6. BE: req.user にセットして次のミドルウェアへ
```

### 認証ミドルウェア（`platform-api/src/middlewares/authenticate.ts`）

```typescript
import { createClient } from '@supabase/supabase-js'
import type { Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', statusCode: 401 } })

  const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(token)
  if (error || !supabaseUser) return res.status(401).json({ success: false, error: { code: 'INVALID_TOKEN', statusCode: 401 } })

  const user = await prisma.user.findUnique({ where: { supabaseId: supabaseUser.id } })
  if (!user) return res.status(401).json({ success: false, error: { code: 'USER_NOT_FOUND', statusCode: 401 } })

  req.user = user
  next()
}

export function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', statusCode: 403 } })
    }
    next()
  }
}
```

### ロール権限マトリクス

| リソース | guest | USER（サブスクなし） | USER（サブスクあり） | INSTRUCTOR | ADMIN |
|---|---|---|---|---|---|
| 講座一覧・詳細 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 無料レッスン閲覧 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 有料レッスン閲覧 | ❌ | ❌ | ✅ | ✅ | ✅ |
| 進捗管理 | ❌ | ✅ | ✅ | ✅ | ✅ |
| 講座作成・編集 | ❌ | ❌ | ❌ | 自分のみ | ✅ |
| Notion トークン管理 | ❌ | ❌ | ❌ | 自分のみ | ✅ |
| キャッシュパージ | ❌ | ❌ | ❌ | 自分の講座のみ | ✅ |
| ユーザー管理 | ❌ | ❌ | ❌ | ❌ | ✅ |
| 講座公開審査 | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## Notion コンテンツ取得フロー

```
GET /api/v1/lessons/:lessonId
  │
  ├─① Redis キャッシュ確認（key: lesson:{lessonId}）
  │     HIT  → 即返す（Notion API 呼び出しなし）
  │     MISS ↓
  │
  ├─② DB から Lesson（notionPageId, chapterId）取得
  │     └─ Course → instructorId を辿る
  │
  ├─③ instructor_tokens テーブルから encryptedToken 取得
  │
  ├─④ AES-256-GCM で復号 → Notion Integration Token
  │
  ├─⑤ @notionhq/client でページブロック取得
  │     （レート制限: 3 req/sec、MISS 時は指数バックオフでリトライ）
  │
  ├─⑥ notion-to-md で Markdown/HTML に変換
  │
  ├─⑦ Redis に保存（TTL: 3600 秒、key: lesson:{lessonId}）
  │
  └─⑧ レスポンス返却
```

### Notion トークン暗号化（`platform-api/src/lib/crypto.ts`）

```typescript
import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'

export function encryptToken(plain: string): string {
  const key = Buffer.from(process.env.NOTION_ENCRYPTION_KEY!, 'hex') // 32 バイト
  const iv  = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `${iv.toString('hex')}:${tag.toString('hex')}:${enc.toString('hex')}`
}

export function decryptToken(stored: string): string {
  const [ivHex, tagHex, encHex] = stored.split(':')
  const key = Buffer.from(process.env.NOTION_ENCRYPTION_KEY!, 'hex')
  const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, 'hex'))
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'))
  return decipher.update(Buffer.from(encHex, 'hex')).toString('utf8') + decipher.final('utf8')
}
```

---

## Redis キャッシュ設計

| キー | 用途 | TTL |
|---|---|---|
| `lesson:{lessonId}` | Notion コンテンツキャッシュ | 3600 秒 |
| `course:{courseId}` | 講座詳細キャッシュ | 1800 秒 |
| `courses:list:{hash}` | 講座一覧（クエリパラメータのハッシュ） | 300 秒 |
| `ratelimit:{ip}:{endpoint}` | レートリミットカウンター | 60 秒 |
| `sub:{userId}` | サブスク状態キャッシュ（Stripe 呼び出し削減） | 300 秒 |

独自キーを追加する場合はこの表に追記すること。

**キャッシュパージ:** `POST /api/v1/lessons/:lessonId/cache/purge` → `redis.del('lesson:{lessonId}')`

---

## Stripe サブスクリプションフロー

```
1. POST /api/v1/subscriptions/checkout
   → Stripe Checkout セッション作成（月額 or 年額 Price ID）
   → セッション URL を返す

2. FE がユーザーを Stripe Checkout ページにリダイレクト

3. 決済完了 → Stripe が POST /api/v1/webhooks/stripe に Webhook 送信
   → stripe.webhooks.constructEvent() で署名検証（必須・省略禁止）
   → checkout.session.completed を処理
   → DB の Subscription レコードを作成/更新
   → Resend でメール送信

4. サブスク状態変更も Webhook で処理
   → customer.subscription.updated / deleted
   → DB の Subscription.status を更新
```

---

## コーディング規約

### 共通

- TypeScript `strict: true` 必須
- `any` 型禁止（`// eslint-disable-next-line @typescript-eslint/no-explicit-any` + 理由コメント必須）
- 環境変数を追加したら**必ず** `.env.example` にも追記する

### エラーレスポンス統一フォーマット

```typescript
// 成功
{ "success": true, "data": { ... } }

// 失敗
{
  "success": false,
  "error": {
    "code": "LESSON_NOT_FOUND",   // 大文字スネークケース
    "message": "レッスンが見つかりません",
    "statusCode": 404
  }
}
```

### Next.js（`platform-web`）

- `app/` 以下は **Server Components デフォルト**
- データフェッチは Server Components で行い、インタラクションのみ `'use client'` に切り出す
- `'use client'` は末端の葉コンポーネントのみに付与する（ツリーの上位に置かない）
- `fetch` は Next.js の拡張 fetch（`cache` / `revalidate` オプション）を活用する
- **Server Components から API を呼ぶ際は Docker 内部 URL を使う:**
  `http://api:4000/api/v1/...`（`localhost` は不可）

### Express（`platform-api`）

**3 層構成を厳守する:**
- `controllers/` — `req` / `res` の処理のみ。ビジネスロジック記述禁止
- `services/` — ビジネスロジック。Prisma / Redis の直接インポート禁止
- `repositories/` — Prisma 操作のみ。ビジネスロジック記述禁止

非同期ハンドラーは必ず `asyncHandler` ラッパーで包む。
エラーは必ず `next(error)` で集約エラーハンドラーへ委譲する。

```typescript
// ルーター定義例
router.get('/lessons/:lessonId', optionalAuthenticate, getLessonHandler)
router.post('/lessons/:lessonId/complete', authenticate, completeLessonHandler)
router.post('/lessons/:lessonId/cache/purge', authenticate, authorize('INSTRUCTOR', 'ADMIN'), purgeCacheHandler)
```

---

## よく使うコマンド

### platform-web

```bash
npm install
npm run dev
npm run build
npm run typecheck
npm run lint
npm run format
npm test
npm run test:e2e          # Playwright E2E
```

### platform-api

```bash
npm install
npm run dev
npm run build
npm run db:migrate        # prisma migrate dev（開発）
npm run db:migrate:deploy # prisma migrate deploy（本番）
npm run db:seed
npm run db:studio         # Prisma Studio（port 5555）
npm run db:generate       # Prisma Client 再生成
npm test
npm run test:watch
npm run typecheck
npm run lint
npm run format
```

### Docker Compose（開発環境）

```bash
docker compose -f infra/docker-compose.yml up -d
docker compose -f infra/docker-compose.yml down
docker compose -f infra/docker-compose.yml up -d --build
docker compose -f infra/docker-compose.yml logs -f api
docker compose -f infra/docker-compose.yml logs -f web
docker compose -f infra/docker-compose.yml exec api npm run db:migrate
```

---

## ローカルサービス URL 一覧

| サービス | URL |
|---|---|
| フロントエンド | http://localhost/ |
| バックエンド API | http://localhost/api/v1/ |
| Traefik ダッシュボード | http://traefik.localhost/（開発のみ） |
| Redis | localhost:6379 |
| Prisma Studio | http://localhost:5555 |
| Supabase | https://xxxx.supabase.co（クラウドマネージド） |

---

## 注意・ハマりやすいポイント

1. **Notion トークンは AES-256-GCM で暗号化して DB に保存する。平文保存は絶対禁止。**
2. **Supabase JWT 検証は `supabase.auth.getUser(token)` を使う。**
   ローカルで `jwt.verify()` する実装は Supabase のキーローテーション非対応になるため禁止。
3. **Stripe Webhook は `stripe.webhooks.constructEvent()` で署名検証する。省略禁止。**
   本文は `express.raw()` で受け取ること（`express.json()` では署名検証が失敗する）。
4. **Docker Swarm 本番ではシークレットを `docker secret` で管理する。**
   `.env` ファイルをコンテナにマウントしない。
5. **Traefik の `acme.json` は必ず `chmod 600` にする。**
   600 でないと Traefik が起動しない。
6. **Prisma Migrate は開発で `migrate dev`、本番で `migrate deploy`。**
   本番で `migrate dev` を実行すると既存データが消える可能性がある。
7. **Supabase の接続プーリング対応のため `DATABASE_URL` と `DIRECT_URL` の両方を設定する。**
   `DATABASE_URL` はプーリング URL、`DIRECT_URL` はダイレクト URL（マイグレーション用）。
8. **CORS 設定はローカルで `http://localhost`、本番では実際のドメインのみ許可する。**
   ワイルドカード（`*`）は本番禁止。
9. **Traefik ダッシュボードは本番で必ずアクセス制限（BasicAuth または IP 制限）を設ける。**
10. **Redis キャッシュのキー命名は上記設計に従う。**
    独自キーを追加する場合はこのファイルのキャッシュ設計テーブルに追記すること。
