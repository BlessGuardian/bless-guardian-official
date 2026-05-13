import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { Client } from "https://deno.land/x/postgres@v0.19.3/mod.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const dbUrl = Deno.env.get("AIVEN_DATABASE_URL");
  if (!dbUrl) {
    return new Response(
      JSON.stringify({ error: "AIVEN_DATABASE_URL is not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const client = new Client(dbUrl);

  try {
    await client.connect();

    const result = await client.queryObject<Record<string, unknown>>(
      `SELECT * FROM fraud_logs ORDER BY 1 DESC LIMIT 500`,
    );

    return new Response(
      JSON.stringify({ rows: result.rows }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("DB query failed:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } finally {
    try { await client.end(); } catch (_) { /* ignore */ }
  }
});
