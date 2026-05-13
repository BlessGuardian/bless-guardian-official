import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Client } = pg;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

loadEnvFile(path.join(root, ".env"));
loadEnvFile(path.join(root, ".env.local"), true);

const isPreview = process.argv.includes("--preview") || process.env.NODE_ENV === "production";
const port = Number(process.env.PORT ?? 8080);
const host = process.env.HOST ?? "::";

let vite;
if (!isPreview) {
  const { createServer } = await import("vite");
  vite = await createServer({
    root,
    appType: "spa",
    server: {
      middlewareMode: true,
      hmr: {
        overlay: false,
      },
    },
  });
}

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);

  if (requestUrl.pathname === "/api/fraud-logs") {
    if (req.method !== "GET") {
      sendJson(res, 405, { error: "Method not allowed" });
      return;
    }

    try {
      const rows = await fetchFraudLogs();
      sendJson(res, 200, { rows });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("Aiven query failed:", error);
      sendJson(res, 500, { error: message });
    }
    return;
  }

  if (vite) {
    vite.middlewares(req, res, () => {
      sendJson(res, 404, { error: "Not found" });
    });
    return;
  }

  serveStatic(req, res, requestUrl.pathname);
});

server.listen(port, host, () => {
  console.log(`Server running at http://localhost:${port}`);
});

async function fetchFraudLogs() {
  const connectionString = process.env.AIVEN_DATABASE_URL;
  if (!connectionString) {
    throw new Error("AIVEN_DATABASE_URL is not configured");
  }

  const caCert = readCaCert();
  const client = new Client(createClientConfig(connectionString, caCert));

  await client.connect();

  try {
    const schema = process.env.AIVEN_DB_SCHEMA ?? "public";
    const table = process.env.AIVEN_FRAUD_LOGS_TABLE ?? "fraud_logs";
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

function loadEnvFile(filePath, override = false) {
  if (!fs.existsSync(filePath)) return;

  const file = fs.readFileSync(filePath, "utf8");
  for (const line of file.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (override || process.env[key] === undefined) {
      process.env[key] = value.replace(/\\n/g, "\n");
    }
  }
}

function readCaCert() {
  const certPath = process.env.AIVEN_CA_CERT_FILE?.trim();
  if (certPath) {
    return normalizePem(fs.readFileSync(path.resolve(root, certPath), "utf8"));
  }

  const cert = process.env.AIVEN_CA_CERT?.trim();
  if (!cert) return undefined;

  const hasBeginMarker = cert.includes("-----BEGIN CERTIFICATE-----");
  const hasEndMarker = cert.includes("-----END CERTIFICATE-----");
  if (hasBeginMarker !== hasEndMarker) {
    throw new Error("AIVEN_CA_CERT appears incomplete. Use the full certificate, only the base64 body, escaped \\n on one line, or set AIVEN_CA_CERT_FILE.");
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
  if (!value) return undefined;
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

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(payload));
}

function serveStatic(req, res, pathname) {
  const distPath = path.join(root, "dist");
  const requestedPath = path.resolve(distPath, `.${decodeURIComponent(pathname)}`);
  const relativePath = path.relative(distPath, requestedPath);
  const isInsideDist = relativePath && !relativePath.startsWith("..") && !path.isAbsolute(relativePath);
  const safePath = isInsideDist ? requestedPath : path.join(distPath, "index.html");
  const filePath = fs.existsSync(safePath) && fs.statSync(safePath).isFile()
    ? safePath
    : path.join(distPath, "index.html");

  fs.createReadStream(filePath)
    .on("error", () => {
      res.writeHead(404);
      res.end("Not found");
    })
    .on("open", () => {
      res.writeHead(200, { "Content-Type": getContentType(filePath) });
    })
    .pipe(res);
}

function getContentType(filePath) {
  const extension = path.extname(filePath);
  return {
    ".css": "text/css",
    ".html": "text/html",
    ".js": "text/javascript",
    ".json": "application/json",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
  }[extension] ?? "application/octet-stream";
}
