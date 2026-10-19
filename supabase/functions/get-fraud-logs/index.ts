import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const API_BASE = Deno.env.get("BLESS_API_URL") ??
  "https://e5skpalp7g.execute-api.us-east-1.amazonaws.com";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

async function call(path: string, token?: string) {
  const headers: Record<string, string> = { accept: "application/json" };
  if (token) headers.authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { headers });
  const data = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, data };
}

type Cat = { categoria?: string; quantidade?: number };
const categories = (d: { stats?: Cat[] } | null) =>
  (Array.isArray(d?.stats) ? d!.stats! : []).map((c) => ({
    name: String(c.categoria ?? "Desconhecido"),
    value: Number(c.quantidade ?? 0),
  })).sort((a, b) => b.value - a.value);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const token = typeof body?.token === "string" && body.token.length < 4000 ? body.token : undefined;

    // Estatísticas gerais (sem token): apenas contagens por categoria.
    if (body?.aggregate === true) {
      const r = await call("/stats");
      if (!r.ok) return json({ byCategory: [], error: "Falha ao carregar estatísticas" });
      const byCategory = categories(r.data);
      return json({ byCategory, total: byCategory.reduce((s, c) => s + c.value, 0) });
    }

    if (!token) return json({ rows: [], error: "Faça login para ver seus dados" });

    const [logs, stats, score] = await Promise.all([
      call("/logs", token),
      call("/stats", token),
      call("/score", token),
    ]);

    if (logs.status === 401 || logs.status === 403) {
      return json({ rows: [], error: "Sessão expirada, faça login novamente", expired: true });
    }
    if (!logs.ok) return json({ rows: [], error: "Falha ao carregar dados" });

    const p = logs.data;
    const rows = Array.isArray(p?.data) ? p.data : Array.isArray(p?.logs) ? p.logs : Array.isArray(p) ? p : [];
    const s = score.ok ? score.data : null;
    const scoreValue = typeof s === "number" ? s : Number(s?.score ?? s?.vulnerability_score ?? NaN);

    return json({
      rows,
      byCategory: stats.ok ? categories(stats.data) : [],
      score: Number.isFinite(scoreValue) ? scoreValue : null,
    });
  } catch (error) {
    console.error("get-fraud-logs failed:", error);
    return json({ rows: [], error: "Servidor do BlessGuardian indisponível no momento" }, 500);
  }
});
