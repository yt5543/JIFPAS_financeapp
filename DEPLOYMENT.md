# デプロイ手順 — ミベルカーアプリ v2.1

本文書は、feat/v2-prep-mode ブランチから本番環境（Cloudflare Pages）にデプロイするための手順を説明します。

## 前提条件

- Cloudflare アカウント（JIFPAS ミベルカーアプリプロジェクト）
- Cloudflare API Token （`cloudflare_api_token` スコープ）
- GitHub 連携設定済み（リポジトリ `yt5543/JIFPAS_financeapp`）
- Node.js 18+

## ステップ 1: Cloudflare API Token の設定

```bash
export CLOUDFLARE_API_TOKEN="your-api-token-here"
export CLOUDFLARE_ACCOUNT_ID="your-account-id"
```

Token は以下から作成：
- https://dash.cloudflare.com/profile/api-tokens
- 権限: Account > D1 > Edit, Account > Cloudflare Pages > Edit

## ステップ 2: D1 データベースの作成

```bash
cd /path/to/JIFPAS_financeapp
npx wrangler d1 create mieruka-events
```

出力から `database_id` をコピーします：

```
✓ Successfully created D1 database mieruka-events
  database_id: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

## ステップ 3: wrangler.toml の更新

`wrangler.toml` の D1 セクションを編集：

```toml
[[d1_databases]]
binding = "DB"
database_name = "mieruka-events"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
migrations_dir = "migrations"
```

## ステップ 4: マイグレーションの適用

```bash
npx wrangler d1 migrations apply mieruka-events --remote
```

出力：
```
✓ Successfully applied D1 migration 0001_events.sql
```

## ステップ 5: Google Form の作成

以下の項目を含む Google Form を作成します：

- **出欠**: `ref` パラメータ
- **年齢**: `age` パラメータ
- **資産寿命**: `lifespan` パラメータ
- **モード**: `mode` パラメータ（prep / twogen / goal）
- **お客様について**（テキスト）
- **その他ご質問・ご相談**（テキスト）

Form ID を取得します（URL: `https://docs.google.com/forms/d/e/{FORM_ID}/viewform?...`）

## ステップ 6: 環境変数の設定

Cloudflare Pages プロジェクト設定から、以下を追加：

### Environment Variables

```
VITE_CONSULT_FORM_URL=https://docs.google.com/forms/d/e/{FORM_ID}/viewform
```

### Optional: Form Field Mapping

```
VITE_CONSULT_FIELDS={"ref":"entry_xxxxxxxx","age":"entry_xxxxxxxx","lifespan":"entry_xxxxxxxx","mode":"entry_xxxxxxxx"}
```

**Entry ID の確認方法：**

1. Form をプレビュー表示
2. ブラウザ開発者ツール → Network → 最初の Form リクエスト
3. Response から `entry_XXXXXX` を確認

## ステップ 7: ブランチのマージ

```bash
git checkout feat/v2-prep-mode
git pull origin feat/v2-prep-mode

# main ブランチへマージ
git checkout main
git pull origin main
git merge feat/v2-prep-mode
git push origin main
```

GitHub との連携により、Cloudflare Pages が自動でビルド・デプロイします。

## ステップ 8: デプロイ確認

**本番 URL**: https://jifpas-financeapp.pages.dev/

以下をテスト：

- [ ] アプリが起動する
- [ ] ?ref=test-01 でリファラルコードが保存される
- [ ] 準備モード（年齢60以上）へ進める
- [ ] 資産寿命が計算される
- [ ] イベント追跡が動作（DevTools → Application → Network で /api/event への POST を確認）
- [ ] 相談ボタン → Google Form に遷移（URL パラメータが含まれている）
- [ ] 共有ボタン → PNG 生成・ダウンロード
- [ ] ?demo=1 でデモモードが動作（入力が保存されない）

## ステップ 9: 実機テスト

以下のデバイス・ブラウザでテスト：

- **iOS**: Safari
  - Web Share API 対応確認
  - PNG ダウンロード確認
  
- **Android**: Chrome
  - Web Share API 対応確認
  - PNG ダウンロード確認

- **LINE in-app browser**
  - 相談フォーム遷移確認
  - デモモード動作確認

## トラブルシューティング

### D1 マイグレーションエラー

```
Error: Could not find D1 database
```

**原因**: database_id が wrangler.toml に正しく設定されていない

**対応**:
```bash
npx wrangler d1 info mieruka-events
```

で `database_id` を確認し、wrangler.toml に設定

### Google Form 連携エラー

```
相談ボタンをクリックしても Form に遷移しない
```

**原因**: VITE_CONSULT_FORM_URL が未設定

**対応**:
1. Cloudflare Pages プロジェクト → Settings → Environment Variables を確認
2. VITE_CONSULT_FORM_URL が正しく設定されているか確認
3. キャッシュをクリア（Ctrl+Shift+R）してリロード

### イベント記録されない

```
DevTools Network で /api/event への POST が見つからない
```

**原因**: Functions が有効になっていない、または D1 バインディングが未設定

**対応**:
1. Cloudflare Pages プロジェクト → Settings → Functions を確認
2. Functions → D1 Bindings で `DB` バインディングが追加されているか確認
3. `functions/api/event.ts` が存在するか確認

## 参考資料

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [D1 (SQLite) Docs](https://developers.cloudflare.com/d1/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [実装計画](./IMPLEMENTATION_PLAN.md)
