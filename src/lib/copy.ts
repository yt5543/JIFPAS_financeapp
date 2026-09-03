import type { LifespanResult } from './calc'

/** 画面文言を一か所に集める。60代以上向けは「利回り」を使わず生活の言葉で書く */
export const copy = {
  start: {
    title: 'うちの家の資産、見えていますか。',
    lead: '3問・3分・売り物なし。登録もいりません。',
    self: '自分のこと',
    parent: '家族（親）のこと',
    ageQuestion: 'いま何歳ですか',
  },
  prep: {
    q1: (forParent: boolean) => (forParent ? 'ご本人（親御さん）はいま何歳ですか' : 'いま何歳ですか'),
    q2: '毎月の年金など、入ってくるお金は',
    q3: '毎月、出ていくお金は',
    q4: '預金はだいたい',
    q5: '家（土地と建物）はだいたい',
    q5note: 'わからなければ「わからない」で大丈夫です。あとで「家を活用したら」を見るときに使います。',
    hint: '正確でなくて大丈夫です。あとから直せます。',
    exact: '正確に入れる（万円）',
  },
  result: {
    heroOk: (age: number) => ({ before: '今のペースだと', num: `${age}`, unit: '歳', after: 'で預金が尽きます' }),
    heroNever: { before: 'この条件では', num: '105', unit: '歳以上', after: 'まで預金は尽きません' },
    heroDeficit: (gapMan: number) => ({ before: '今のままだと', num: `${gapMan}`, unit: '万円', after: '毎月足りません' }),
    facilityToggle: (from: number, extraMan: number) => `${from}歳から施設に入る（月＋${extraMan}万円）`,
    homeToggle: '家を活用する（売却・貸出の概算）',
    nothing: '何もしない',
    oneChange: '一つだけ変える',
    futureSelf: (from: number) => `${from}歳のあなたは、施設の費用をどこから払いますか。`,
    futureSelfParent: (from: number) => `${from}歳のお母さん・お父さんは、施設の費用をどこから払いますか。`,
    talk: '家をどうするかを、ご家族と一度話しておくと安心です。',
    share: '家族に送る',
    consult: '相談したい',
    detail: 'くわしく登録する（口座・保険・不動産）',
    disclaimer: '入力にもとづく試算です。将来を保証するものではなく、金融商品の販売・勧誘は行いません。',
  },
  consult: {
    title: '数字の読み方を、説明します。',
    body: [
      '何かを売ることはありません。商品のご案内もしません。',
      '80歳以上の方は、ご家族と一緒にお願いしています。',
      '案内人には、診断の完了に応じて少額の案内料をお支払いしています。',
      '外部に渡すのは、案内人の番号・年齢・「何歳まで」の数字だけです。金額は渡しません。',
    ],
    go: '説明の予約へ進む',
    back: '戻る',
  },
} as const

export function heroFor(r: LifespanResult, forParent: boolean) {
  if (r.status === 'ok') return copy.result.heroOk(r.age)
  if (r.status === 'never') return copy.result.heroNever
  const gap = Math.ceil(r.monthlyGap / 10_000)
  void forParent
  return copy.result.heroDeficit(gap)
}
