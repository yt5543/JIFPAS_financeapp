export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-8">
      <div className="max-w-2xl mx-auto prose prose-sm">
        <h1 className="text-3xl font-bold mb-8">プライバシーポリシー</h1>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. 個人情報の取り扱い</h2>
          <p>本アプリケーション（ミベルカーアプリ）は、以下の方針に基づき個人情報を取り扱います。</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. 収集する情報</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>端末側で処理される情報：</strong>年齢、毎月の年金額、毎月の支出、預金額等の資産情報は、ユーザーの端末上でのみ処理され、当社のサーバーに送信されません（デモモード時を除く）
            </li>
            <li>
              <strong>匿名イベント：</strong>アプリの利用状況（開始、完了、共有、相談など）を匿名で記録します。このデータには個人名や金額は含まれません
            </li>
            <li>
              <strong>参照コード：</strong>紹介元を示す参照コード（例：nakano-01）は、イベント追跡のために記録される場合があります
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. データの保存と利用</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>ローカル保存：</strong>入力した資産情報はユーザーの端末内に保存され、外部に送信されません
            </li>
            <li>
              <strong>匿名統計：</strong>匿名化されたイベントデータは、サービス改善のため集計・分析されます
            </li>
            <li>
              <strong>デモモード：</strong>デモモード（?demo=1）で入力されたデータは、セッション終了時に自動的に削除されます
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. 相談申し込み時の情報</h2>
          <p>
            「相談したい」ボタンから Google Form へ移動する際、以下の情報が送信される場合があります：
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>年齢（計算結果から導出）</li>
            <li>資産寿命の結果（年齢）</li>
            <li>参照コード</li>
          </ul>
          <p className="mt-4">
            Google Form への入力は Google のプライバシーポリシーに準じます。詳細は{' '}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
              Google のプライバシーポリシー
            </a>
            をご覧ください。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Cookie とストレージ</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>localStorage：</strong>参照コードと入力した情報を保存するため使用します
            </li>
            <li>
              <strong>sessionStorage：</strong>セッション内での動作管理に使用され、ブラウザを閉じると削除されます
            </li>
            <li>
              <strong>Cookie：</strong>本アプリケーションは Cookie を使用しません
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. 第三者への情報提供</h2>
          <p>
            個人を特定できる情報は第三者に提供されません。匿名化されたイベント統計データは、サービス改善の目的でのみ使用されます。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. セキュリティ</h2>
          <p>
            本アプリケーションは HTTPS により暗号化された通信を使用します。ユーザーの端末に保存されたデータについては、各デバイスのセキュリティ設定に従います。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. ポリシーの変更</h2>
          <p>
            本ポリシーは予告なく変更される場合があります。変更がある場合は、本ページで通知します。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. お問い合わせ</h2>
          <p>
            プライバシーに関するご質問やご懸念については、アプリケーション内の「相談したい」ボタンからお問い合わせください。
          </p>
        </section>

        <footer className="border-t pt-8 mt-8 text-sm text-gray-600">
          <p>更新日：2026年9月4日</p>
        </footer>
      </div>
    </div>
  )
}
