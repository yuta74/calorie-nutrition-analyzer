# CLAUDE.md

必ず日本語で回答してください。
This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Status

This is a new, empty repository with no established codebase or project structure yet.

## Working with This Repository

When starting work in this repository, you should:

1. **Determine project requirements** - Ask the user about their intended project type, programming language, and framework preferences before creating any files
2. **Establish project structure** - Once the technology stack is chosen, create appropriate configuration files and directory structure
3. **Follow language conventions** - Use standard project layouts and best practices for the chosen programming language/framework
4. **Create essential files** - Set up package management files, build configurations, and development scripts as appropriate for the chosen stack

## Project Structure

This is a Next.js application for food calorie and nutrition analysis using AI image recognition.

### Key Technologies
- Next.js 14.2.30 (App Router)
- TypeScript
- Tailwind CSS
- OpenAI GPT-4 Vision API
- React Camera/File Upload

### Development Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Environment Variables Required
- `OPENAI_API_KEY` - OpenAI API key for image analysis

### Key Features
- Camera photo capture and file upload
- AI-powered food recognition
- Detailed nutrition analysis and visualization
- Responsive UI with Japanese interface

## QA・検証フロー

### 環境構成
- **QA環境**: `qa-calorie-analyzer.vercel.app` (develop ブランチ)
- **本番環境**: `calorie-analyzer.vercel.app` (main ブランチ)

### 検証・デプロイ手順
1. **QA環境での検証**
   ```bash
   git checkout develop
   git merge main  # 必要に応じて最新変更をマージ
   git push origin develop  # QA環境に自動デプロイ
   ```
   
2. **QA環境で動作確認**
   - `qa-calorie-analyzer.vercel.app` でテスト
   - スマホ・タブレット・PCでの表示確認
   - 機能テスト実行

3. **本番環境へのデプロイ**
   ```bash
   git checkout main
   git merge develop  # または直接main に変更をプッシュ
   git push origin main  # 本番環境に自動デプロイ
   ```

### 重要な注意点
- **必ずQAで検証してから本番デプロイ**
- GitHub Actions が自動実行（数分でデプロイ完了）
- 各環境に固定URLが設定済み
