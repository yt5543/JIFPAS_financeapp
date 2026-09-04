# リリースノート — ミベルカーアプリ v2.1

**リリース日**: 2026-09-04  
**ブランチ**: `feat/v2-prep-mode` → `main`  
**バージョン**: 2.1.0

## 概要

P0 実装完了。本番環境（Cloudflare Pages）へのデプロイが可能な状態です。

### 新機能

#### 準備モード（資産寿命機能）

年齢 60 歳以上のユーザーが利用可能な新モード：

1. **3 ステップ入力フォーム**
   - Q1: 毎月の年金（入力値または年代別推奨値）
   - Q2: 毎月の生活費（入力値または年代別推奨値）
   - Q3: 貯金額の桁（500 万～5000 万）
   - Optional: 持家価値の桁（1000 万～1 億）

2. **資産寿命計算**
   - 年１回シミュレーション: `A ← A·(1+r) − (E−I) − facility − yearly`
   - 85 歳以降: 施設費 10 万円/月 を計上
   - 持家活用: 70% 相当を老後資産に加算（オプション）
   - 複数シナリオ表示: 「何もしない」vs 「一つだけ変える」

3. **相談・共有機能**
   - **相談したい**: Google Form へ誘導（ref/age/lifespan/mode パラメータ付）
   - **家族に送る**: 結果カード PNG 生成・Web Share or ダウンロード

4. **匿名追跡**
   - イベント（open/complete/share/consult）を Cloudflare D1 に記録
   - 個人情報・金額は一切記録しない
   - 紹介者ごとの利用実績を集計可能

#### デモモード

`?demo=1` パラメータで固定データを使用：
- 入力値が localStorage に保存されない
- イベント追跡が無効
- 説明用スライド・営業用プレゼン安全

#### プライバシーポリシー

新ページ `/privacy` を追加。JIFPAS 金融方針に準拠：
- 端末側処理のみ（個人データ送信なし）
- Google Form はフォーム側責任
- localStorage: ref と入力情報のみ
- sessionStorage: セッション内制御

---

## デプロイ前チェックリスト

### コード・ビルド

- [x] TypeScript 型チェック合格
- [x] npm run build 成功（dist/ に出力）
- [x] 全テスト合格（25 テストケース）
- [x] E2E フロー確認
  - [x] 年代別初期値表示
  - [x] 3 ステップ入力
  - [x] 資産寿命計算
  - [x] facility/home toggle
  - [x] 相談フォーム遷移
  - [x] PNG 生成・共有
  - [x] ?demo=1 デモ動作

### Cloudflare 環境準備

- [ ] **D1 データベース作成**
  ```bash
  npx wrangler d1 create mieruka-events
  ```
  → database_id を wrangler.toml に設定

- [ ] **マイグレーション適用**
  ```bash
  npx wrangler d1 migrations apply mieruka-events --remote
  ```
  → events テーブル確認

- [ ] **Google Form 作成**
  - [ ] Form ID 取得
  - [ ] Entry ID 確認（ref/age/lifespan/mode）
  - [ ] 実装動作確認

- [ ] **環境変数設定**（Cloudflare Pages → Settings）
  - [ ] `VITE_CONSULT_FORM_URL` 設定
  - [ ] `VITE_CONSULT_FIELDS` (optional) 設定

### GitHub マージ

- [ ] feat/v2-prep-mode → main へマージ
- [ ] GitHub Actions で自動ビルド・デプロイ開始
- [ ] 本番 URL で起動確認

### 実機テスト

- [ ] iOS Safari: Web Share, PNG DL
- [ ] Android Chrome: Web Share, PNG DL
- [ ] LINE in-app: フォーム遷移, デモ動作
- [ ] 参照コード保存・イベント記録確認

### 運用準備

- [ ] QR コード生成・印刷（nakano-01 ～）
- [ ] 営業用デモ URL (?demo=1 付き) を営業に配布
- [ ] イベント集計方法をスタッフに説明
- [ ] 問題報告フォーム・相談対応体制確認

---

## アーキテクチャ概要

### フロントエンド

```
React 18 + Vite + TypeScript
├── Store: Zustand (persist middleware 搭載)
├── Charts: Recharts（LineChart で年別推移）
├── Image: html-to-image（PNG 生成、skipFonts で高速化）
├── Styling: Tailwind CSS
└── Fonts: BIZ UDPGothic (Google Fonts)
```

### バックエンド

```
Cloudflare Pages Functions
├── /api/event: POST のみ、D1 に記録
├── D1: SQLite (events テーブル)
└── 外部: Google Form へのリダイレクト
```

### データモデル

**Prep** (入力値)
```ts
interface Prep {
  forWhom: 'me' | 'parent'
  age: number
  pensionMonthly: number
  expenseMonthly: number
  cashBand: '500' | '1000' | '2000' | '3000' | '5000'
  homeValueBand?: '1000' | '2000' | '3000' | '5000' | '1e4'
  facilityOn: boolean
  useHomeOn: boolean
  rate: number // investment return
}
```

**LifespanResult** (計算結果)
```ts
interface LifespanResult {
  status: 'ok' | 'never' | 'deficit'
  age?: number // status='ok': 資産尽きる年齢
  series: Array<{ year: number; age: number; assets: number }>
}
```

---

## パフォーマンス

| 項目 | 値 |
|-----|-----|
| 初期読込 | ~2s（5G）, ~5s（3G） |
| 資産寿命計算 | <10ms |
| PNG 生成 | ~160ms（skipFonts:true） |
| ビルドサイズ | 680.81 kB (202.31 kB gzip) |

---

## 既知制限

### P0（本リリース）

1. **年代別初期値が暫定**
   - 80+: 年金 10 万/支出 16 万
   - 70+: 年金 11 万/支出 18 万
   - 60+: 年金 14 万/支出 22 万
   - → REVIEW.md §4 にて法務確認・実績データ更新予定

2. **Google Form がマスト**
   - 相談申し込みに Google Form 必須
   - フォーム URL・Entry ID 設定が必要

3. **デモモード固定値**
   - 78 歳親, 年金 11 万, 支出 18 万, 預金 1600 万固定
   - 実際の現場データは反映していない

### P1（次フェーズ）

- [ ] 負債機能（ローン、クレジット）
- [ ] 2 世代シミュレーション（子どもの扶養支援）
- [ ] リスク辞書（用語説明、リンク）

### P2（その次）

- [ ] エージェントダッシュボード（Cloudflare Access 保護）
- [ ] .ics カレンダーエクスポート

---

## 参考資料

### ドキュメント

- [実装計画](./IMPLEMENTATION_PLAN.md)
- [SPEC v2.1](./SPEC.md)
- [デプロイ手順](./DEPLOYMENT.md)
- [QR コード配布ガイド](./QR_CODES.md)

### リポジトリ

- GitHub: https://github.com/yt5543/JIFPAS_financeapp
- Demo URL: https://jifpas-financeapp.pages.dev/

### 関連プロジェクト

- 中野氏（便利屋）MTG 議事録: `25_JIFPAS/01_Drafts/2026-09_中野氏MTG_議事録.md`
- JIFPAS ドライブ: https://drive.google.com/drive/folders/1Gs1YZ7PuPOhNGiBXcDoeoN-m55DE8-ov

---

## サポート

### よくあるトラブル

**Q: D1 に接続できない**  
A: wrangler.toml の database_id が正しく設定されているか確認

**Q: Google Form に遷移しない**  
A: Cloudflare Pages 環境変数に VITE_CONSULT_FORM_URL が設定されているか確認

**Q: イベントが記録されない**  
A: DevTools → Network → /api/event への POST を確認。Functions が有効か確認

---

## 署名

**リリース日**: 2026-09-04  
**リリース者**: Claude Code (Haiku 4.5)  
**確認者**: {要山本署名}

---

**次ステップ**: DEPLOYMENT.md に従い、Cloudflare 環境を構築後、main へマージ・本番デプロイ
