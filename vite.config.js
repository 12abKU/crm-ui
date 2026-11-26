import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

/**
 * Stamps dist/sw.js with a deterministic build version and exact core shell assets
 * from dist/index.html so PWA updates invalidate cleanly without external Vite-8 peer conflicts.
 */
function crmPwaPlugin() {
  return {
    name: 'crm-pwa-sw-stamper',
    apply: 'build',
    closeBundle() {
      const distDir = path.resolve(import.meta.dirname, 'dist')
      const swPath = path.join(distDir, 'sw.js')
      const htmlPath = path.join(distDir, 'index.html')
      if (!fs.existsSync(swPath) || !fs.existsSync(htmlPath)) return

      const html = fs.readFileSync(htmlPath, 'utf8')
      const precacheList = [
        '/offline.html',
        '/manifest.json',
        '/favicon.ico',
        '/icons/icon-96.png',
        '/icons/icon-192.png',
        '/icons/icon-512.png',
        '/icons/brand-icon.svg',
      ]

      const swSource = fs.readFileSync(swPath, 'utf8')
      const hash = crypto
        .createHash('sha256')
        .update(html)
        .update(swSource)
        .digest('hex')
        .slice(0, 10)

      const updated = swSource
        .replace(/const SW_VERSION = '[^']*';/, `const SW_VERSION = 'crm-${hash}';`)
        .replace(/const PRECACHE_ASSETS = \[[\s\S]*?\];/, `const PRECACHE_ASSETS = ${JSON.stringify(precacheList, null, 2)};`)

      fs.writeFileSync(swPath, updated, 'utf8')
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    crmPwaPlugin(),
  ],
})
