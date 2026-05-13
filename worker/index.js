import pg from "pg";

const { Client } = pg;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/fraud-logs") {
      if (request.method !== "GET") {
        return json({ error: "Method not allowed" }, 405);
      }

      try {
        const rows = await fetchFraudLogs(env);
        return json({ rows });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("Aiven query failed:", error);
        return json({ error: message }, 500);
      }
    }

    if (url.pathname.startsWith("/api/")) {
      return json({ error: "Not found" }, 404);
    }

    return env.ASSETS.fetch(request);
  },
};

async function fetchFraudLogs(env) {
  const connectionString = env.AIVEN_DATABASE_URL;
  if (!connectionString) {
    throw new Error("AIVEN_DATABASE_URL is not configured");
  }

  const caCert = readCaCert(env.AIVEN_CA_CERT);
  const client = new Client(createClientConfig(connectionString, caCert));

  await client.connect();

  try {
    const schema = env.AIVEN_DB_SCHEMA ?? "public";
    const table = env.AIVEN_FRAUD_LOGS_TABLE ?? "fraud_logs";
    const desiredColumns = ["id", "content", "detected_at", "explanation", "source", "risk_score", "is_fraud"];

    const columnResult = await client.query(
      `SELECT column_name
       FROM information_schema.columns
       WHERE table_schema = $1
         AND table_name = $2
         AND column_name = ANY($3::text[])`,
      [schema, table, desiredColumns],
    );

    const availableColumns = new Set(columnResult.rows.map((row) => row.column_name));
    const requiredColumns = ["id", "content", "detected_at", "explanation"];
    const missingColumns = requiredColumns.filter((column) => !availableColumns.has(column));

    if (missingColumns.length > 0) {
      throw new Error(`Missing required columns in ${schema}.${table}: ${missingColumns.join(", ")}`);
    }

    const selectedColumns = desiredColumns.filter((column) => availableColumns.has(column));
    const orderBy = availableColumns.has("detected_at")
      ? `${quoteIdentifier("detected_at")} DESC`
      : `${quoteIdentifier("id")} DESC`;
    const query = `SELECT ${selectedColumns.map(quoteIdentifier).join(", ")}
                   FROM ${quoteIdentifier(schema)}.${quoteIdentifier(table)}
                   ORDER BY ${orderBy}
                   LIMIT 500`;

    const result = await client.query(query);
    return result.rows;
  } finally {
    await client.end();
  }
}

function readCaCert(value) {
  const cert = value?.trim();
  if (!cert) return undefined;

  const hasBeginMarker = cert.includes("-----BEGIN CERTIFICATE-----");
  const hasEndMarker = cert.includes("-----END CERTIFICATE-----");
  if (hasBeginMarker !== hasEndMarker) {
    throw new Error("AIVEN_CA_CERT appears incomplete.");
  }

  return normalizePem(cert);
}

function createClientConfig(connectionString, caCert) {
  const url = new URL(connectionString);

  return {
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    host: url.hostname,
    port: Number(url.port || 5432),
    database: url.pathname.replace(/^\//, "") || "defaultdb",
    ssl: caCert
      ? { ca: caCert, rejectUnauthorized: true }
      : { rejectUnauthorized: false },
  };
}

function normalizePem(value) {
  const body = value
    .replace(/-----BEGIN CERTIFICATE-----/g, "")
    .replace(/-----END CERTIFICATE-----/g, "")
    .replace(/\s+/g, "");

  const lines = body.match(/.{1,64}/g)?.join("\n") ?? body;
  return `-----BEGIN CERTIFICATE-----\n${lines}\n-----END CERTIFICATE-----`;
}

function quoteIdentifier(value) {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(value)) {
    throw new Error(`Invalid SQL identifier: ${value}`);
  }

  return `"${value}"`;
}

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}
