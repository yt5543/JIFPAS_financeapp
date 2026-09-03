/**
 * 匿名イベントAPI（Cloudflare Pages Functions）。
 * 受け取るのは { ref, mode, event, ts } のみ。個人情報・金額は受け取らない。
 * D1 バインディング `DB` が未設定でも 204 を返す（UXを壊さない）。
 */
interface D1Like {
  prepare(query: string): { bind(...values: unknown[]): { run(): Promise<unknown> } }
}
interface Env {
  DB?: D1Like
}

const EVENTS = new Set(['open', 'complete', 'share', 'consult'])
const MODES = new Set(['prep', 'twogen', 'goal'])

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }): Promise<Response> => {
  let body: { ref?: unknown; mode?: unknown; event?: unknown } | null = null
  try {
    body = (await request.json()) as typeof body
  } catch {
    return new Response('bad request', { status: 400 })
  }
  const event = typeof body?.event === 'string' && EVENTS.has(body.event) ? body.event : null
  if (!event) return new Response('bad request', { status: 400 })
  const ref = String(body?.ref ?? '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 32)
  const mode = typeof body?.mode === 'string' && MODES.has(body.mode) ? body.mode : 'unknown'

  if (env.DB) {
    try {
      await env.DB.prepare('INSERT INTO events (ts, ref, mode, event) VALUES (?, ?, ?, ?)').bind(Date.now(), ref, mode, event).run()
    } catch {
      /* 記録失敗は握りつぶす */
    }
  }
  return new Response(null, { status: 204 })
}
