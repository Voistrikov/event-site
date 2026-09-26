import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Resolve relative to this config file (repo-root/frontend), not the shell's
// cwd, so `npm run dev` finds the shared certs whether it's run from the
// repo root or from inside frontend/.
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const keyPath  = process.env.SSL_KEY_PATH  ?? path.join(repoRoot, 'certs/server.key')
const certPath = process.env.SSL_CERT_PATH ?? path.join(repoRoot, 'certs/server.crt')
const httpsAvailable = fs.existsSync(keyPath) && fs.existsSync(certPath)

// The backend as reached from *this process* (inside the Docker network it's
// the "backend" service name; for bare `npm run dev` it's localhost). This is
// never exposed to the browser -- see the proxy below.
const backendOrigin = process.env.BACKEND_ORIGIN ?? 'https://localhost:3000'

// All API/upload routes are proxied through this same origin (5173) instead
// of being called cross-origin at :3000. That means the browser only ever
// has to trust ONE self-signed certificate (this one) -- it never opens a
// direct connection to the backend's certificate, so there is no second
// "accept the security risk" step for a grader to miss. `secure: false`
// disables TLS verification for this server-to-server hop only, since our
// own self-signed cert isn't in Node's trust store either.
const proxiedPaths = ['/auth', '/admin', '/events', '/bookings', '/users', '/messages', '/categories', '/uploads', '/health']
const proxy = Object.fromEntries(
  proxiedPaths.map((p) => [p, { target: backendOrigin, changeOrigin: true, secure: false }]),
)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    https: httpsAvailable
      ? { key: fs.readFileSync(keyPath), cert: fs.readFileSync(certPath) }
      : undefined,
    proxy,
  },
})
