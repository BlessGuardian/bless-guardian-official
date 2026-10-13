import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const API_BASE = Deno.env.get("BLESS_API_URL") ??
  "https://bl-226178fb7921413cab6e2f261d27f9c2.ecs.us-east-1.on.aws";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    let userId: string | undefined;
    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      if (typeof body?.user_id === "string" && /^[0-9a-fA-F-]{36}$/.test(body.user_id)) userId = body.user_id;
    }
    if (!userId) return json({ rows: [], error: "Faça login para ver seus dados" });

    const url = new URL(`${API_BASE}/logs`);
    url.searchParams.set("user_id", userId);

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
    return json({ rows });
  } catch (error) {
    console.error("get-fraud-logs failed:", error);
    return json({ rows: [], error: "Falha ao carregar dados" }, 500);
  }
});
