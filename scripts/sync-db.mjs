#!/usr/bin/env node

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

function usage() {
  process.stdout.write(`Usage:
  node ./scripts/sync-db.mjs [--mode docker|url] [--database-url <url>]

Behavior:
  - Replays every SQL file in docker/db-init in lexical order.
  - Default mode is "url" when DATABASE_URL is set, otherwise "docker".
  - "docker" applies SQL through "docker compose exec -T db psql".
  - "url" applies SQL through local "psql" using DATABASE_URL.
`);
}

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

function hasCommand(command) {
  const check = spawnSync(command, ["--version"], { stdio: "ignore" });
  return !check.error;
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const sqlDir = path.join(rootDir, "docker", "db-init");

let mode = "";
let databaseUrl = process.env.DATABASE_URL ?? "";

for (let index = 2; index < process.argv.length; index += 1) {
  const arg = process.argv[index];
  if (arg === "--mode") {
    mode = process.argv[index + 1] ?? "";
    index += 1;
    continue;
  }
  if (arg === "--database-url") {
    databaseUrl = process.argv[index + 1] ?? "";
    index += 1;
    continue;
  }
  if (arg === "-h" || arg === "--help") {
    usage();
    process.exit(0);
  }
  fail(`Unknown argument: ${arg}`);
}

if (!mode) {
  mode = databaseUrl ? "url" : "docker";
}

if (mode !== "docker" && mode !== "url") {
  fail(`Unsupported mode: ${mode}`);
}

if (mode === "docker" && !hasCommand("docker")) {
  fail("Missing required command: docker");
}

if (mode === "url") {
  if (!databaseUrl) {
    fail("DATABASE_URL is required when --mode url is used.");
  }
  if (!hasCommand("psql")) {
    fail("Missing required command: psql");
  }
}

const sqlFiles = readdirSync(sqlDir)
  .filter((file) => file.endsWith(".sql"))
  .sort((left, right) => left.localeCompare(right))
  .map((file) => path.join(sqlDir, file));

if (!sqlFiles.length) {
  fail(`No SQL files found in ${sqlDir}`);
}

process.stdout.write(`Syncing database from ${sqlDir} using mode: ${mode}\n`);

for (const file of sqlFiles) {
  const sql = readFileSync(file, "utf8").replace(/^\uFEFF/, "");
  process.stdout.write(`-> applying ${path.basename(file)}\n`);

  const command =
    mode === "docker"
      ? "docker"
      : "psql";

  const args =
    mode === "docker"
      ? [
          "compose",
          "exec",
          "-T",
          "db",
          "psql",
          "-v",
          "ON_ERROR_STOP=1",
          "-U",
          process.env.POSTGRES_USER ?? "vitamind",
          "-d",
          process.env.POSTGRES_DB ?? "vitamind",
        ]
      : ["-v", "ON_ERROR_STOP=1", databaseUrl];

  const result = spawnSync(command, args, {
    cwd: rootDir,
    input: sql,
    stdio: ["pipe", "inherit", "inherit"],
  });

  if (result.error) {
    fail(`Failed while applying ${path.basename(file)}: ${result.error.message}`);
  }

  if (typeof result.status === "number" && result.status !== 0) {
    process.exit(result.status);
  }
}

process.stdout.write("Database sync completed.\n");
