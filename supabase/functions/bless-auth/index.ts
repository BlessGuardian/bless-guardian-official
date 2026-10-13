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
    const { action, email, password, device_id } = await req.json();
    if (action !== "login" && action !== "register") return json({ error: "Ação inválida" }, 400);
    if (typeof email !== "string" || typeof password !== "string" || !email || !password || email.length > 255 || password.length > 200) {
      return json({ error: "Informe e-mail e senha válidos" }, 400);
    }

    const body: Record<string, unknown> = { email, password };
    if (action === "register" && typeof device_id === "string" && device_id) body.device_id = device_id;

    let res: Response;
    try {
      res = await fetch(`${API_BASE}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", accept: "application/json" },
        body: JSON.stringify(body),
      });
    } catch (e) {
      console.error("bless-auth unreachable:", e);
      return json({ error: "Servidor do BlessGuardian indisponível no momento" }, 200);
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const detail = typeof data?.detail === "string" ? data.detail : "Não foi possível concluir a operação";
      return json({ error: detail }, 200);
    }
    return json(data);
  } catch (error) {
    console.error("bless-auth failed:", error);
    return json({ error: "Erro inesperado" }, 500);
  }
});
