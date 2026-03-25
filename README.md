# Learning Platform

Notion コンテンツを活用したテキストベースのオンライン講座プラットフォームです。

---

## Notion 連携のアーキテクチャ

本プラットフォームでは、**プラットフォーム管理者**が Notion の OAuth アプリ（Public Integration）を 1 つ作成します。各講師はそのアプリを通じて **自分の Notion ワークスペース**を個別に OAuth 認証し、独立したアクセストークンを取得します。

```
プラットフォーム管理者
  └─ Notion Public Integration を 1 つ作成（OAuth Client ID / Secret を取得）
       └─ 環境変数に設定

各講師（複数可）
  ├─ 講師 A → 自分のワークスペースで OAuth 認証 → トークン A を DB に保存
  ├─ 講師 B → 自分のワークスペースで OAuth 認証 → トークン B を DB に保存
  └─ 講師 C → 自分のワークスペースで OAuth 認証 → トークン C を DB に保存
```

レッスン閲覧時は、そのレッスンを作成した講師のトークンで Notion API を呼び出します。

---

## セットアップ手順

### 【管理者向け】Notion Public Integration の作成

#### ステップ 1: Notion Public Integration を作成する

1. ブラウザで [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations) にアクセスします
2. 右上の **「+ New integration」** ボタンをクリックします
3. 以下の項目を入力します:
   - **Name**: 任意の名前（例: `Learning Platform`）
   - **Associated workspace**: 管理用のワークスペースを選択（講師のワークスペースとは無関係）
   - **Type**: **`Public`** を選択（OAuth を使うため Internal ではなく Public）
4. **「Submit」** をクリックして Integration を作成します

> **Internal と Public の違い**: Internal はトークンを手動でコピーする方式で、1 ワークスペースのみに対応します。Public は OAuth フローを使い、各講師が自分のワークスペースをプラットフォーム上のボタンクリックだけで連携できます。

---

#### ステップ 2: OAuth の設定をする

1. 作成した Integration のページを開きます
2. **「OAuth Domain & URIs」** セクションを開きます
3. **「Redirect URIs」** に以下を追加します:

   ```
   # 開発環境
   http://localhost/instructor/notion/callback

   # 本番環境（ドメインに合わせて変更）
   https://yourdomain.com/instructor/notion/callback
   ```

4. **「Save」** をクリックします

---

#### ステップ 3: OAuth クレデンシャルを取得する

1. Integration ページの **「OAuth Credentials」** セクションを確認します
2. 以下の値をコピーします:
   - **OAuth client ID**: `notion_client_id_...` の形式
   - **OAuth client secret**: 「Show」ボタンで表示して確認

---

#### ステップ 4: 環境変数を設定する

`platform-api/.env` に以下を設定します:

```bash
# Notion トークンの暗号化キー（openssl rand -hex 32 で生成）
NOTION_ENCRYPTION_KEY=ここに64文字のhex文字列を貼り付ける

# Notion OAuth（ステップ 3 でコピーした値）
NOTION_OAUTH_CLIENT_ID=notion_client_id_...
NOTION_OAUTH_CLIENT_SECRET=secret_...
NOTION_OAUTH_REDIRECT_URI=http://localhost/instructor/notion/callback
```

`NOTION_ENCRYPTION_KEY` の生成方法:

```bash
openssl rand -hex 32
```

> **注意**: `NOTION_ENCRYPTION_KEY` を変更すると、既存の暗号化トークンが復号できなくなります。一度設定したら変更しないでください。

---

### 【講師向け】Notion ワークスペースの連携

管理者がステップ 1〜4 を完了した後、各講師は以下の手順で**自分の Notion ワークスペース**を個別に連携します。

> **各講師は独立して連携できます。** 他の講師の設定は影響しません。

---

#### ステップ 5: 講師が Notion を連携する

1. プラットフォームに **講師アカウント** でログインします
2. ヘッダーの **「講師ダッシュボード」** をクリックします
3. **「設定」**（URL: `/instructor/settings`）を開きます
4. **「Notion で接続する」** ボタンをクリックします
5. Notion の認証ページが開くので、連携したい**自分の**ワークスペースを選択して **「Allow access」** をクリックします
6. プラットフォームに戻り「Notion と接続しました」と表示されれば完了です

> **接続は講師ごとに独立しています。** 講師 A が連携したワークスペースのトークンは講師 B には影響しません。

---

#### ステップ 6: Notion ページに Integration のアクセス権を付与する

連携後、レッスンとして使用する Notion ページにアクセス権を付与します。

1. Notion でレッスンコンテンツのページを開きます
2. ページ右上の **「...」（三点メニュー）** をクリックします
3. **「Connect to」** → 管理者が作成した Integration 名を選択します
4. **「Confirm」** をクリックします

> **まとめて設定する方法**: コースのルートページ（親ページ）に一度だけ Integration を接続すると、配下のすべてのレッスンページにも自動的にアクセス権が付与されます。

---

#### ステップ 7: レッスンに Notion ページ ID を設定する

1. **「講師ダッシュボード」** → 対象の講座を開きます
2. 各レッスンの編集画面で **「Notion ページ ID」** を入力します
3. Notion ページ ID の取得方法:
   - Notion でレッスンのページを開きます
   - ブラウザの URL を確認します
   - URL の末尾にある 32 文字の英数字がページ ID です

   ```
   例: https://www.notion.so/My-Lesson-Title-550e8400e29b41d4a716446655440000
                                          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                          この部分がページ ID（ハイフンなしで入力）
   ```

---

## トラブルシューティング

### 「Notion との認証に失敗しました」と表示される

- `NOTION_OAUTH_CLIENT_ID` / `NOTION_OAUTH_CLIENT_SECRET` が正しく設定されているか確認してください
- `NOTION_OAUTH_REDIRECT_URI` が Notion Integration の設定と一致しているか確認してください
- `docker compose logs -f api` でサーバーログを確認してください

### 「Notion 連携の開始に失敗しました」と表示される

- `NOTION_OAUTH_CLIENT_ID` と `NOTION_OAUTH_REDIRECT_URI` が設定されているか確認してください
- API サーバーが起動しているか確認してください

### レッスン閲覧時に「講師の Notion トークンが設定されていません」と表示される

- `/instructor/settings` でワークスペースが「接続済み」になっているか確認してください
- 一度切断してから再接続してください
- **別の講師が作成したレッスンの場合**: その講師自身が連携手続きを行う必要があります

### レッスンに内容が表示されない

- Notion ページに Integration が接続されているか確認してください（ステップ 6）
- Notion ページ ID が正しいか確認してください（ステップ 7）
- ページが Notion 上で空でないか確認してください

---

## 開発環境の起動

```bash
# 環境変数を設定
cp platform-api/.env.example platform-api/.env
# .env を編集して各値を設定（Notion OAuth の設定を忘れずに）

# Docker Compose で起動
docker compose -f infra/docker-compose.yml up -d

# ログ確認
docker compose -f infra/docker-compose.yml logs -f api
docker compose -f infra/docker-compose.yml logs -f web
```
