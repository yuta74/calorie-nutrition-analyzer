# カロリー・栄養バランス分析アプリ

AI画像認識を使用した食品のカロリーと栄養分析アプリケーションです。

## 開発環境設定

このプロジェクトは開発環境と本番環境を分離した構成になっています。

### ブランチ構成

- `main` - 本番環境用
- `develop` - 開発環境用
- `feature/*` - 機能開発用

### 環境変数

環境別の設定ファイルを作成してください：

```bash
# .env.development (開発環境用)
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-development-secret-key-here
OPENAI_API_KEY=your-openai-api-key-here
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api

# .env.production (本番環境用)
NODE_ENV=production
NEXTAUTH_URL=https://your-production-domain.com
NEXTAUTH_SECRET=your-production-secret-key-here
OPENAI_API_KEY=your-openai-api-key-here
DATABASE_URL="file:./prod.db"
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_API_BASE_URL=https://your-production-domain.com/api
```

### 開発コマンド

```bash
# ローカル開発（ポート3000）
npm run dev:local

# 開発環境（ポート3001）
npm run dev:staging

# 開発環境ビルド
npm run build:dev

# 本番環境ビルド
npm run build:prod

# 開発環境起動
npm run start:dev

# 本番環境起動
npm run start:prod
```

### デプロイ

- `develop`ブランチにプッシュ → 開発環境にデプロイ
- `main`ブランチにプッシュ → 本番環境にデプロイ

## 技術スタック

- Next.js 14.2.30 (App Router)
- TypeScript
- Tailwind CSS
- OpenAI GPT-4 Vision API
- Prisma + SQLite
- NextAuth.js

## 主要機能

- 📸 カメラ撮影・ファイルアップロード
- 🤖 AI画像認識による食品識別
- 📊 詳細な栄養分析・可視化
- 📅 食事記録・カレンダー表示
- 🎯 目標設定・進捗管理
- 👤 ユーザープロフィール管理