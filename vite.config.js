import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const apiRoutes = new Set([
  'deliveries',
  'drivers',
  'fuel',
  'income',
  'maintenance',
  'trucks',
])

async function readBody(req) {
  if (!['POST', 'PUT', 'PATCH'].includes(req.method)) {
    return {}
  }

  const chunks = []
  for await (const chunk of req) {
    chunks.push(chunk)
  }

  const rawBody = Buffer.concat(chunks).toString('utf8')
  return rawBody ? JSON.parse(rawBody) : {}
}

function apiMiddleware() {
  return {
    name: 'local-api-handlers',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api', async (req, res, next) => {
        const requestUrl = new URL(req.url, 'http://localhost')
        const match = requestUrl.pathname.match(/^\/([^/]+)\/?$/)
        const route = match?.[1]

        if (!route || !apiRoutes.has(route)) {
          next()
          return
        }

        try {
          const apiModulePath = resolve(process.cwd(), 'api', `${route}.js`)
          const module = await import(pathToFileURL(apiModulePath).href)
          req.query = Object.fromEntries(requestUrl.searchParams)
          req.body = await readBody(req)

          const response = {
            status(code) {
              res.statusCode = code
              return response
            },
            json(data) {
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify(data))
              return response
            },
          }

          await module.default(req, response)
        } catch (error) {
          console.error(`API ${req.method} ${requestUrl.pathname} failed:`, error)
          if (!res.headersSent) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({
              success: false,
              message: 'Server error',
            }))
          }
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  Object.assign(process.env, env)

  return {
    plugins: [react(), apiMiddleware()],
  }
})
