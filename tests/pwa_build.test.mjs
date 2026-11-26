import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'

const distDir = path.resolve(import.meta.dirname, '..', 'dist')

// 1. Validate manifest.json & icon files
const manifestPath = path.join(distDir, 'manifest.json')
assert.ok(fs.existsSync(manifestPath), 'dist/manifest.json must exist')
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
assert.equal(manifest.display, 'standalone')
assert.ok(manifest.icons.some((i) => i.sizes === '192x192' && i.purpose === 'any'), '192x192 any icon required')
assert.ok(manifest.icons.some((i) => i.sizes === '512x512' && i.purpose === 'any'), '512x512 any icon required')
assert.ok(manifest.icons.some((i) => i.sizes === '512x512' && i.purpose === 'maskable'), '512x512 maskable icon required')
for (const icon of manifest.icons) {
  const diskPath = path.join(distDir, icon.src.replace(/^\//, ''))
  assert.ok(fs.existsSync(diskPath), `Manifest icon missing on disk: ${icon.src}`)
}

// 2. Validate index.html PWA tags & offline.html
const html = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8')
assert.ok(html.includes('href="/manifest.json"'), 'index.html must link manifest.json')
assert.ok(html.includes('name="theme-color"'), 'index.html must include theme-color meta')
assert.ok(html.includes('apple-touch-icon.png'), 'index.html must link apple-touch-icon')
assert.ok(fs.existsSync(path.join(distDir, 'offline.html')), 'dist/offline.html must exist')

// 3. Validate dist/sw.js is stamped, syntactically valid, and every precache entry exists
const swCode = fs.readFileSync(path.join(distDir, 'sw.js'), 'utf8')
assert.ok(!swCode.includes("'dev-v1'"), 'dist/sw.js SW_VERSION must be stamped for production')

const listeners = {}
const sandbox = {
  self: {
    location: { origin: 'https://crm.iinventive.com' },
    addEventListener: (type, fn) => { listeners[type] = fn },
    skipWaiting: () => {},
    clients: { claim: async () => {}, matchAll: async () => [] },
    registration: { showNotification: async () => {} },
  },
  caches: { open: async () => ({ add: async () => {}, put: async () => {} }), keys: async () => [], match: async () => null },
  fetch: async () => new Response('ok'),
  Request: class { constructor(u) { this.url = u } },
  Response,
  URL,
}
vm.runInNewContext(swCode, sandbox)
for (const ev of ['install', 'activate', 'message', 'fetch', 'push', 'notificationclick']) {
  assert.equal(typeof listeners[ev], 'function', `Service worker must register '${ev}' listener`)
}

const precacheMatch = swCode.match(/const PRECACHE_ASSETS = (\[[\s\S]*?\]);/)
assert.ok(precacheMatch, 'PRECACHE_ASSETS array must exist in dist/sw.js')
const precacheAssets = JSON.parse(precacheMatch[1])
assert.ok(precacheAssets.includes('/offline.html'), 'PRECACHE_ASSETS must include /offline.html')
for (const asset of precacheAssets) {
  if (asset === '/') continue
  const assetDisk = path.join(distDir, asset.replace(/^\//, ''))
  assert.ok(fs.existsSync(assetDisk), `Precached asset missing in dist/: ${asset}`)
}

console.log(`PWA verification passed (${precacheAssets.length} precached assets, all SW handlers active).`)
