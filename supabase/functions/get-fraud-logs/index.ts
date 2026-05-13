import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { Client } from "https://deno.land/x/postgres@v0.19.3/mod.ts";

const normalizePem = (value?: string) => {
  if (!value) return undefined;
  const body = value
    .replace(/-----BEGIN CERTIFICATE-----/g, "")
    .replace(/-----END CERTIFICATE-----/g, "")
    .replace(/\s+/g, "");

  const lines = body.match(/.{1,64}/g)?.join("\n") ?? body;
  return `-----BEGIN CERTIFICATE-----\n${lines}\n-----END CERTIFICATE-----`;
};

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

  const caCert = normalizePem(Deno.env.get("AIVEN_CA_CERT"));

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
      caCertificates: caCert ? [caCert] : [],
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
