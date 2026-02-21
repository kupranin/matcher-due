#!/usr/bin/env node
/**
 * Ensures Next.js dev manifest files exist in .next/dev to prevent
 * "ENOENT: prerender-manifest.json / routes-manifest.json" Internal Server Error
 * when the dev bundler hits EMFILE (too many open files) before writing them.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
// With isolatedDevBuild: false, manifests live in .next; else .next/dev
const NEXT_DIR = path.join(ROOT, ".next");
const DEV_DIR = path.join(NEXT_DIR, "dev");

const ROUTES_MANIFEST = {
  version: 3,
  caseSensitive: false,
  basePath: "",
  rewrites: { beforeFiles: [], afterFiles: [], fallback: [] },
  redirects: [],
  headers: [],
  i18n: undefined,
  skipProxyUrlNormalize: false,
};

const PRERENDER_MANIFEST = {
  version: 4,
  routes: {},
  dynamicRoutes: {},
  notFoundRoutes: [],
  preview: {},
};

function ensureManifests() {
  const dir = fs.existsSync(DEV_DIR) ? DEV_DIR : NEXT_DIR;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const routesPath = path.join(dir, "routes-manifest.json");
  const prerenderPath = path.join(dir, "prerender-manifest.json");

  if (!fs.existsSync(routesPath)) {
    fs.writeFileSync(routesPath, JSON.stringify(ROUTES_MANIFEST, null, 2));
    console.log("Created", routesPath);
  }
  if (!fs.existsSync(prerenderPath)) {
    fs.writeFileSync(prerenderPath, JSON.stringify(PRERENDER_MANIFEST, null, 2));
    console.log("Created", prerenderPath);
  }
}

ensureManifests();
