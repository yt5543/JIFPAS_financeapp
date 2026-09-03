# ミエルカ デプロイメントガイド

## ローカル開発

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:5173/` にアクセスしてください。

## 本番ビルド

```bash
npm run build
```

このコマンドで `dist/` フォルダに本番用のファイルが生成されます。

## Cloudflare Pages へのデプロイ

### 方法1: CLI 経由でのデプロイ（推奨）

```bash
npm run build
npx wrangler pages deploy dist
```

初回実行時は Cloudflare にログインするよう促されます。

### 方法2: GitHub 統合を使用したデプロイ

1. **Cloudflare ダッシュボード**にログイン
2. **Pages** → **Create a project** → **Connect to Git** を選択
3. このリポジトリ (`yt5543/jifpas_financeapp`) を選択
4. Build settings を以下のように設定:
   - **Framework preset**: None
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. **Save and Deploy** をクリック

以降、main ブランチへの push が自動的にデプロイされます。

## デプロイ後

デプロイ完了後、以下の URL でアプリケーションにアクセスできます：
- CLI デプロイ時: ターミナルに表示される URL
- GitHub 統合: Cloudflare Pages ダッシュボードに表示される URL

## トラブルシューティング

### ビルドが失敗する場合

```bash
# キャッシュをクリアして再ビルド
rm -rf node_modules dist
npm install
npm run build
```

### Cloudflare CLI 認証エラー

```bash
npx wrangler logout
npx wrangler login
```

その後、デプロイコマンドを再実行してください。
