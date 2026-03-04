#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

function loadEnvFile(filename) {
  const filePath = path.resolve(process.cwd(), filename);
  if (!fs.existsSync(filePath)) return;

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    if (!line || line.trimStart().startsWith("#")) continue;
    const separator = line.indexOf("=");
    if (separator <= 0) continue;

    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const baseUrl = process.env.INTERNAL_API_BASE_URL ?? "http://127.0.0.1:3333";
const secret = process.env.INTERNAL_API_SECRET;

if (!secret) {
  console.error("INTERNAL_API_SECRET is required.");
  process.exit(1);
}

const endpoint = new URL("/api/internal/clerk-sync", baseUrl).toString();

try {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "x-internal-secret": secret,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    console.error(JSON.stringify(data ?? { error: "Clerk sync failed" }, null, 2));
    process.exit(1);
  }

  console.log(JSON.stringify(data, null, 2));
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
