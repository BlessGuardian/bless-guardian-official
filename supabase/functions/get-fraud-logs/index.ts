import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const API_BASE = Deno.env.get("BLESS_API_URL") ??
  "https://e5skpalp7g.execute-api.us-east-1.amazonaws.com";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    let userId: string | undefined;
    let aggregate = false;
    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      if (typeof body?.user_id === "string" && /^[0-9a-fA-F-]{36}$/.test(body.user_id)) userId = body.user_id;
      if (body?.aggregate === true) aggregate = true;
    }
    if (!aggregate && !userId) return json({ rows: [], error: "Faça login para ver seus dados" });

    const url = new URL(`${API_BASE}/logs`);
    if (userId) url.searchParams.set("user_id", userId);

    let res: Response;
    try {
      res = await fetch(url, { headers: { accept: "application/json" } });
    } catch (e) {
      console.error("get-fraud-logs unreachable:", e);
      return json({ rows: [], error: "Servidor do BlessGuardian indisponível no momento" });
    }

    if (!res.ok) {
      const text = await res.text();
      console.error(`Bless API ${res.status}: ${text.slice(0, 200)}`);
      return json({ rows: [], error: "Falha ao carregar dados" });
    }

    const payload = await res.json();
    const rows = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];

    // Modo agregado: retorna apenas estatísticas gerais, sem conteúdo,
    // explicações ou qualquer dado identificável de usuários.
    if (aggregate) {
      const byApp = new Map<string, number>();
      const byRisk = { alto: 0, medio: 0, baixo: 0 };
      const byMonth = new Map<string, { month: string; tentativas: number; bloqueadas: number; time: number }>();
      let frauds = 0;

      for (const log of rows) {
        const source = typeof log?.source === "string" && log.source ? log.source : "Outros";
        byApp.set(source, (byApp.get(source) ?? 0) + 1);

        const score = Number(log?.risk_score ?? 0);
        if (score >= 0.75) byRisk.alto += 1;
        else if (score >= 0.4) byRisk.medio += 1;
        else byRisk.baixo += 1;

        const isFraud = log?.is_fraud ?? true;
        if (isFraud) frauds += 1;

        if (log?.detected_at) {
          const date = new Date(log.detected_at);
          if (!Number.isNaN(date.getTime())) {
            const key = `${date.getFullYear()}-${date.getMonth()}`;
            const entry = byMonth.get(key) ?? {
              month: date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
              tentativas: 0,
              bloqueadas: 0,
              time: date.getTime(),
            };
            entry.tentativas += 1;
            if (isFraud) entry.bloqueadas += 1;
            byMonth.set(key, entry);
          }
        }
      }

      const monthly = Array.from(byMonth.values())
        .sort((a, b) => a.time - b.time)
        .slice(-6)
        .map(({ month, tentativas, bloqueadas }) => ({ month, tentativas, bloqueadas }));

      return json({
        stats: {
          totalAnalisadas: rows.length,
          golpesBloqueados: frauds,
          appsMonitorados: byApp.size,
          usuariosProtegidos: new Set(rows.map((l: { user_id?: string }) => l?.user_id).filter(Boolean)).size,
        },
        byApp: Array.from(byApp.entries())
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 6),
        byRisk: [
          { name: "Alto", value: byRisk.alto },
          { name: "Médio", value: byRisk.medio },
          { name: "Baixo", value: byRisk.baixo },
        ],
        monthly,
      });
    }

    return json({ rows });
  } catch (error) {
    console.error("get-fraud-logs failed:", error);
    return json({ rows: [], error: "Falha ao carregar dados" }, 500);
  }
});
