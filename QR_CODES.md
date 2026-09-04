# QR コード — ミベルカーアプリ紹介用

## 概要

このドキュメントは、現場スタッフが顧客に配布する QR コード付きカード（印刷物）の生成方法を説明します。

## URL フォーマット

```
https://jifpas-financeapp.pages.dev/#/?ref={owner}-{number}
```

| パラメータ | 説明 | 例 |
|----------|------|-----|
| `owner` | 紹介者の識別子（小文字英数・ハイフンのみ） | `nakano` |
| `number` | 連番（01-99 等） | `01` |

## 紹介者別の URL 一覧

### 便利屋（中野氏）

```
https://jifpas-financeapp.pages.dev/#/?ref=nakano-01
https://jifpas-financeapp.pages.dev/#/?ref=nakano-02
https://jifpas-financeapp.pages.dev/#/?ref=nakano-03
...
https://jifpas-financeapp.pages.dev/#/?ref=nakano-99
```

### 他の紹介者

追加予定

---

## QR コード生成手順

### 方法 1: オンライン QR コード生成サービス（推奨）

1. **QR Code Generator** (https://www.qr-code-generator.com/) にアクセス
2. URL を入力
   ```
   https://jifpas-financeapp.pages.dev/#/?ref=nakano-01
   ```
3. QR コード生成
4. 右下の **Download** → PNG（推奨）でダウンロード
5. 印刷時に以下をサイズ調整：
   - **推奨サイズ**: 2cm × 2cm 以上（読取率向上）
   - **カラー**: 黒地に白（反転避け）

### 方法 2: コマンドライン（npm パッケージ）

```bash
# qrcode パッケージをインストール
npm install -g qrcode

# QR コード生成
qrcode 'https://jifpas-financeapp.pages.dev/#/?ref=nakano-01' > nakano-01.png
```

### 方法 3: Python スクリプト

```python
import qrcode

urls = {
    'nakano-01': 'https://jifpas-financeapp.pages.dev/#/?ref=nakano-01',
    'nakano-02': 'https://jifpas-financeapp.pages.dev/#/?ref=nakano-02',
    # ...
}

for name, url in urls.items():
    qr = qrcode.QRCode(version=1, box_size=10, border=2)
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    img.save(f"{name}.png")
```

---

## カードデザインガイドライン

### 推奨レイアウト

```
┌─────────────────────┐
│  ミエルカ            │
│  資産と未来を、      │
│  見える化する。      │
└─────────────────────┘
        
    [QR コード]
    2cm × 2cm
        
┌─────────────────────┐
│ スマートフォンで     │
│ QR コードをスキャン  │
│ してください         │
│                     │
│ ref: nakano-01      │
└─────────────────────┘
```

### 印刷仕様

- **用紙**: 厚紙 200g/m² 以上推奨
- **サイズ**: 名刺サイズ（91 × 55mm）推奨、またはポストカード（100 × 100mm）
- **解像度**: 300 DPI 以上（印刷用）
- **QR コードサイズ**: 最小 2cm × 2cm

### テキスト配置

- **アプリ名**: 「ミエルカ」
- **タグライン**: 「資産と未来を、見える化する。」
- **説明文**: 「スマートフォンで QR コードをスキャン」
- **参照コード**: `ref:` で印刷（読取率確認用）

---

## 使用方法

### スタッフが顧客に渡す流れ

1. カード配布時の説明
   ```
   「このアプリで、今後の資産がいつまで持つのか試算できます。
   無料でお試しいただけます。」
   ```

2. QR コード読取
   - iOS: カメラアプリ → QR コード自動検出
   - Android: Google Lens または専用 QR 読取アプリ

3. アプリ起動
   - 参照コード（ref）が自動保存される
   - 初回起動時に年代別初期値を提案

### アプリ側の追跡

- 各スタッフの紹介者コードごとにイベントを集計
  ```
  ref = nakano-01
  events:
    - 2026-09-04: open (アプリ起動)
    - 2026-09-04: complete (資産寿命計算完了)
    - 2026-09-04: consult (相談申し込み)
  ```

---

## トラブルシューティング

### QR コードが読み込めない

**確認項目**:
- QR コードが歪んでいないか
- 印刷品質が十分か（黒がつぶれていないか）
- URL が正確に入力されているか（スペース、小文字・大文字）

**再生成**:
```
URL をコピペして再生成（手入力避け）
```

### アプリで参照コードが保存されない

**原因**: デモモード（?demo=1）で起動している

**対応**: 通常 URL で再度開く
```
https://jifpas-financeapp.pages.dev/#/?ref=nakano-01
```

---

## 参考

- [QR Code Generator](https://www.qr-code-generator.com/)
- [qrcode npm](https://www.npmjs.com/package/qrcode)
- [python-qrcode](https://github.com/lincolnloop/python-qrcode)
