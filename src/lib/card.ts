import { toPng } from 'html-to-image'

/** DOM を PNG（dataURL）にする。Webフォントの読込を待ってから描画する */
export async function renderCardPng(el: HTMLElement): Promise<string> {
  if (typeof document !== 'undefined' && 'fonts' in document) {
    try {
      await (document as Document & { fonts: FontFaceSet }).fonts.ready
    } catch {
      /* ignore */
    }
  }
  // skipFonts: 外部フォントCSSの取得を待たない（LINE内ブラウザや低速回線で十数秒かかるのを防ぐ）。カードはシステムフォントで描く
  return toPng(el, { pixelRatio: 3, cacheBust: true, backgroundColor: '#ffffff', skipFonts: true })
}
