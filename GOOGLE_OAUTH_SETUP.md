# Google OAuth設定手順

本番環境でGoogle認証を有効にするための設定手順です。

## 1. Google Cloud Consoleでのプロジェクト作成

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成するか、既存のプロジェクトを選択

## 2. APIの有効化

1. 「APIとサービス」→「ライブラリ」に移動
2. 「Google+ API」を検索して有効化（非推奨の場合は不要）

## 3. OAuth同意画面の設定

1. 「APIとサービス」→「OAuth同意画面」に移動
2. 「外部」を選択（個人使用の場合）
3. 以下の情報を入力：
   ```
   アプリ名: カロリー・栄養バランス分析
   ユーザーサポートメール: your-email@example.com
   承認済みドメイン: calorie-analyzer.vercel.app
   開発者の連絡先情報: your-email@example.com
   ```

## 4. OAuth 2.0クライアントIDの作成

1. 「APIとサービス」→「認証情報」に移動
2. 「認証情報を作成」→「OAuth 2.0 クライアント ID」を選択
3. 以下の設定を入力：
   ```
   アプリケーションの種類: ウェブアプリケーション
   名前: カロリー分析アプリ

   承認済みのJavaScript生成元:
   - https://calorie-analyzer.vercel.app

   承認済みのリダイレクトURI:
   - https://calorie-analyzer.vercel.app/api/auth/callback/google
   ```

## 5. Vercelの環境変数設定

1. [Vercel Dashboard](https://vercel.com/dashboard) にアクセス
2. プロジェクトを選択
3. 「Settings」→「Environment Variables」に移動
4. 以下の環境変数を追加：

### 本番環境 (Production)
```
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
NEXTAUTH_SECRET=your_random_32_character_secret_here
NEXTAUTH_URL=https://calorie-analyzer.vercel.app
```

### プレビュー環境 (Preview) - 任意
```
SKIP_AUTH=true
```

## 6. シークレット生成

NEXTAUTH_SECRETには以下のコマンドで生成できます：
```bash
openssl rand -base64 32
```

## トラブルシューティング

### "Try signing in with a different account" エラー
- OAuth同意画面の設定が不完全
- リダイレクトURIが正しく設定されていない
- ドメインが承認済みドメインに含まれていない

### "This app isn't verified" 警告
- 個人使用では正常な動作（「詳細設定」→「安全でないページに移動」で続行可能）
- Google認証を受ける場合は追加の手続きが必要

## 参考リンク

- [NextAuth.js Google Provider](https://next-auth.js.org/providers/google)
- [Google OAuth 2.0 設定](https://developers.google.com/identity/protocols/oauth2)