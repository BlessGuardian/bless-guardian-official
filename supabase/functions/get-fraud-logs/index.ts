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

  // Parse URL to build a config that doesn't enforce CA validation
  // (Aiven uses its own CA which the Deno runtime doesn't trust by default).
  const u = new URL(dbUrl);
  const client = new Client({
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.replace(/^\//, "") || "defaultdb",
    hostname: u.hostname,
    port: Number(u.port || 5432),
    tls: {
      enabled: true,
      enforce: true,
      caCertificates: Deno.env.get("AIVEN_CA_CERT") ? [Deno.env.get("AIVEN_CA_CERT")!] : [],
    },
  });

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
