const { test, expect } = require('@playwright/test');

test('QA環境で認証スキップが動作するかテスト', async ({ page }) => {
  // QA環境にアクセス
  await page.goto('https://qa-calorie-analyzer.vercel.app');
  
  // 認証画面ではなく、メインアプリが表示されることを確認
  await expect(page.locator('h1')).toContainText('カロリー・栄養バランス分析');
  
  // 認証スキップのデバッグ情報を確認
  const debugInfo = await page.locator('p').filter({ hasText: 'QA環境での動作確認中' }).textContent();
  console.log('デバッグ情報:', debugInfo);
  
  // Skip: true が含まれていることを確認
  expect(debugInfo).toContain('Skip: true');
  
  // ログインボタンが表示されていないことを確認（認証スキップされている場合）
  const loginButton = page.locator('button', { hasText: 'ログインする' });
  await expect(loginButton).not.toBeVisible();
  
  // 画像アップロード機能が利用可能であることを確認
  await expect(page.locator('input[type="file"]')).toBeVisible();
});

test('本番環境では認証が必要であることを確認', async ({ page }) => {
  // 本番環境にアクセス
  await page.goto('https://calorie-analyzer.vercel.app');
  
  // 認証画面が表示されることを確認
  await expect(page.locator('h1')).toContainText('カロリー・栄養バランス分析');
  
  // ログインボタンが表示されることを確認
  await expect(page.locator('button', { hasText: 'ログインする' })).toBeVisible();
  
  // 画像アップロード機能が表示されていないことを確認
  await expect(page.locator('input[type="file"]')).not.toBeVisible();
});