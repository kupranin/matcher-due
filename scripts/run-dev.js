#!/usr/bin/env node
/**
 * Starts Next.js dev server with a higher file descriptor limit on Unix
 * to avoid EMFILE and missing .next/dev manifest files (Internal Server Error).
 */
const { spawn } = require("child_process");
const path = require("path");

const isWindows = process.platform === "win32";
// Use Turbopack (default) — fewer file watchers, avoids EMFILE / 500
const nextArgs = ["dev", "--hostname", "127.0.0.1"];

if (isWindows) {
  const child = spawn("npx", ["next", ...nextArgs], {
    stdio: "inherit",
    shell: true,
    cwd: path.join(__dirname, ".."),
  });
  child.on("exit", (code) => process.exit(code ?? 0));
} else {
  const child = spawn(
    "sh",
    ["-c", "ulimit -n 10240 2>/dev/null; exec npx next " + nextArgs.join(" ")],
    {
      stdio: "inherit",
      cwd: path.join(__dirname, ".."),
    }
  );
  child.on("exit", (code) => process.exit(code ?? 0));
}
