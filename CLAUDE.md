# 概要:プロジェクトの目的、主要機能

オンライン学習プラットフォーム。コース・レッスン管理、受講進捗トラッキング、決済（Stripe）、講師ポータルを提供する。

# 技術スタック:言語、フレームワーク、ライブラリ

| レイヤー | 技術 |
|---|---|
| API | Node.js + Express 5 + TypeScript (ESM) |
| ORM | Prisma 6 (PostgreSQL) |
| バリデーション | Zod |
| テスト | Vitest + Supertest |
| フロントエンド | Next.js 16 (App Router) + React 19 + TypeScript |
| スタイル | Tailwind CSS v4 + shadcn/ui |
| 状態管理 | Zustand |
| フォーム | React Hook Form + Zod |
| 認証 | Supabase Auth |
| インフラ | Docker + Traefik |

# ディレクトリ構造:主要フォルダの役割

```
platform-api/src/
  controllers/   # リクエスト受付・レスポンス整形（ビジネスロジックなし）
  services/      # ビジネスロジック
  repositories/  # DB アクセス（Prisma 呼び出し）
  routes/        # ルーティング定義
  middlewares/   # 認証・エラーハンドリング等
  types/         # 共通型定義
  utils/         # 純粋なユーティリティ関数

platform-web/
  app/           # Next.js App Router (pages & layouts)
  components/
    features/    # ドメイン別コンポーネント
    ui/          # shadcn/ui ベースの汎用コンポーネント
    layout/      # ヘッダー・サイドバー等レイアウト
  hooks/         # カスタム React フック
  stores/        # Zustand ストア
  lib/           # API クライアント・ユーティリティ
  types/         # 共通型定義
```

# コーディング規約:命名規則、フォーマット

## 共通（TypeScript）

- **strict モード必須**。`any` は禁止。不明な型は `unknown` を使い narrowing する。
- `import type` を使って型のみのインポートを明示する（`verbatimModuleSyntax` 有効）。
- 関数はなるべく純粋関数にする。副作用は明示的に分離する。
- マジックナンバー・マジック文字列は定数に切り出す。
- エラーは握り潰さない。`catch` ブロックでは必ずログ出力か再スローをする。

## 命名規則

| 対象 | 規則 | 例 |
|---|---|---|
| 変数・関数 | camelCase | `getUserById`, `isLoading` |
| クラス・型・インターフェース | PascalCase | `UserService`, `CourseDto` |
| 定数（モジュールスコープ） | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| ファイル名（API） | kebab-case または `<domain>.<layer>.ts` | `auth.service.ts`, `asyncHandler.ts` |
| ファイル名（Web コンポーネント） | PascalCase `.tsx` | `CourseCard.tsx` |
| Prisma モデル | PascalCase（単数形） | `User`, `Course` |
| DB カラム（Prisma） | camelCase | `avatarUrl`, `createdAt` |

## platform-api 固有

- **レイヤー責務を守る**: Controller はバリデーション＋サービス呼び出しのみ。DB アクセスは必ず Repository 経由。
- バリデーションスキーマは Zod で Controller 内に定義し、`Schema.parse()` で入力を検証する。
- 全ての Controller ハンドラーは `asyncHandler` でラップする（エラーを Express エラーハンドラーへ委譲）。
- レスポンス形式は `{ success: true, data: ... }` / `{ success: false, error: ... }` に統一する。
- ESM (`import ... from '...js'`) を使用。相対インポートには `.js` 拡張子を必ず付ける。

## platform-web 固有

- **Server Components をデフォルト**とし、インタラクティブな部分のみ `"use client"` を付ける。
- データ取得は Server Component または Server Action (`app/actions/`) で行う。クライアントからの直接 API 呼び出しは最小限にする。
- コンポーネントは 1 ファイル 1 コンポーネントを基本とする。
- `cn()` (clsx + tailwind-merge) を使ってクラス名を結合する。
- フォームは React Hook Form + Zod resolver を使う。`useState` で自前管理しない。
- グローバル状態は Zustand に置く。props drilling が 2 階層を超えたら Zustand を検討する。

## フォーマット

- Prettier（デフォルト設定）を使用。コミット前に `prettier --write` を実行する。
- インデント: スペース 2 つ（Prettier に委ねる）。
- 1 行の最大文字数: 100 文字（Prettier に委ねる）。

# 開発ワークフロー:コミット規約、テスト方式

## コミット規約（Conventional Commits）

```
<type>(<scope>): <要約（日本語可）>
```

| type | 用途 |
|---|---|
| `feat` | 新機能 |
| `fix` | バグ修正 |
| `refactor` | 動作を変えないリファクタリング |
| `test` | テスト追加・修正 |
| `chore` | ビルド・設定変更 |
| `docs` | ドキュメント |

例: `feat(course): コース一覧にページネーションを追加`

## テスト方針

- **platform-api**: Vitest + Supertest でルート単位の統合テストを書く。DB は実 DB（テスト用）を使用し、モックは原則使わない。
- テストファイルは対象ファイルと同階層に `*.test.ts` として配置する。
- 新規エンドポイントには必ずテストを追加する。
- `npm run typecheck` と `npm run lint` を CI で必ず通す。
