import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const API_BASE = Deno.env.get("BLESS_API_URL") ??
  "https://bl-226178fb7921413cab6e2f261d27f9c2.ecs.us-east-1.on.aws";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const res = await fetch(`${API_BASE}/logs`, {
      headers: { accept: "application/json" },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Bless API ${res.status}: ${text.slice(0, 200)}`);
    }

    const payload = await res.json();
    const rows = Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload)
        ? payload
        : [];

    return new Response(JSON.stringify({ rows }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("get-fraud-logs failed:", message);
    return new Response(JSON.stringify({ rows: [], error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
