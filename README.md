# カロリー・栄養バランス分析アプリ

AI画像認識を使用した食品のカロリーと栄養分析アプリケーションです。

## 環境構成

このプロジェクトは3つの環境で構成されています：

### 🏠 ローカル環境
- **用途**: 個人の開発マシンでの開発作業
- **URL**: `http://localhost:3000`
- **設定**: `.env.local`

### 🔧 QA環境（Vercel Preview）
- **用途**: チーム内テスト・品質保証
- **URL**: `https://qa-calorie-analyzer.vercel.app`
- **ブランチ**: `develop`
- **設定**: `.env.development` (Vercel Environment Variables)

### 🚀 本番環境（Vercel Production）
- **用途**: 一般ユーザー向けサービス
- **URL**: `https://calorie-analyzer.vercel.app`
- **ブランチ**: `main`
- **設定**: `.env.production` (Vercel Environment Variables)

## 環境変数設定

### ローカル開発用
```bash
# .env.local.exampleをコピーして.env.localを作成
cp .env.local.example .env.local
# 必要な値を設定してください
```

### Vercel環境変数
Vercelダッシュボードで以下の環境変数を設定：
- `OPENAI_API_KEY`
- `NEXTAUTH_SECRET`
- `DATABASE_URL`

## 開発コマンド

```bash
# ローカル開発
npm run dev:local

# Vercel開発環境（ローカル）
npm run vercel:dev

# ビルド
npm run build          # 通常ビルド
npm run build:qa       # QA環境用ビルド
npm run build:prod     # 本番環境用ビルド

# Vercelデプロイ
npm run vercel:deploy      # プレビューデプロイ
npm run vercel:deploy:prod # 本番デプロイ
```

## デプロイフロー

### 🔄 自動デプロイ
- `develop`ブランチにプッシュ → **QA環境**に自動デプロイ
- `main`ブランチにプッシュ → **本番環境**に自動デプロイ
- PR作成 → **プレビュー環境**に自動デプロイ

### 🔗 環境URL
- **QA**: https://qa-calorie-analyzer.vercel.app
- **本番**: https://calorie-analyzer.vercel.app
- **プレビュー**: 各PRごとに自動生成

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