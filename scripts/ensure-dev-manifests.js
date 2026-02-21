#!/usr/bin/env node
/**
 * Creates Next.js dev manifest files so /en, /en/login etc. don't 500 with ENOENT.
 * Run this AFTER "npm run dev" shows "Ready" (in another terminal).
 * Usage: node scripts/ensure-dev-manifests.js
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const devDir = path.join(root, ".next", "dev");

const routesManifest = {
  version: 3,
  caseSensitive: false,
  basePath: "",
  rewrites: { beforeFiles: [], afterFiles: [], fallback: [] },
  redirects: [],
  headers: [],
  i18n: undefined,
  skipProxyUrlNormalize: false,
};

const prerenderManifest = {
  version: 4,
  routes: {},
  dynamicRoutes: {},
  notFoundRoutes: [],
  preview: {},
};

if (!fs.existsSync(devDir)) {
  fs.mkdirSync(devDir, { recursive: true });
}

const routesPath = path.join(devDir, "routes-manifest.json");
const prerenderPath = path.join(devDir, "prerender-manifest.json");

fs.writeFileSync(routesPath, JSON.stringify(routesManifest, null, 2));
fs.writeFileSync(prerenderPath, JSON.stringify(prerenderManifest, null, 2));

console.log("Created .next/dev/routes-manifest.json and prerender-manifest.json");
console.log("Refresh your browser (e.g. http://127.0.0.1:3000/en or /en/login)");
