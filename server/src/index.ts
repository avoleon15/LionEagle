import { notifySuggestion } from './notify'
import { createServer } from 'node:http'
import { existsSync } from 'node:fs'
import { dirname, join as pathJoin } from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import { Server } from 'socket.io'
import type { Ack, AnswerResult, ClientToServer, JoinResult, ServerToClient } from '../../shared/protocol'
import { adminRouter, adminToken } from './admin'
import * as db from './db'
import { GameError } from './game'
import { RateLimiter } from './ratelimit'
import * as rooms from './rooms'

const PORT = Number(process.env.PORT ?? 3001)
const here = dirname(fileURLToPath(import.meta.url))
const clientDist = pathJoin(here, '../../client/dist')

db.init()
const admin = adminToken()

const app = express()
// Only trust X-Forwarded-For when the server really sits behind a proxy (set TRUST_PROXY=1 there).
// Otherwise anybody could fake their address with that header and dodge the rate limits.
const trustProxy = process.env.TRUST_PROXY
if (trustProxy) app.set('trust proxy', /^\d+$/.test(trustProxy) ? Number(trustProxy) : trustProxy)
const http = createServer(app)
const io = new Server<ClientToServer, ServerToClient>(http)

app.use('/api/admin', adminRouter(admin.token))

// Player suggestions: at most 5 per hour per address, and they only go to the review inbox.
const suggestions = new RateLimiter(5, 3_600_000)
app.post('/api/suggest', express.json({ limit: '16kb' }), (req, res) => {
  if (!suggestions.allow(req.ip ?? '')) {
    res.status(429).json({ error: 'Has enviado muchas sugerencias. Intenta más tarde.' })
    return
  }
  try {
    db.addSuggestion(req.body ?? {})
    notifySuggestion(req.body ?? {})
    res.json({ ok: true })
  } catch (e) {
    if (e instanceof db.InputError) res.status(400).json({ error: e.message })
    else {
      console.error(e)
      res.status(500).json({ error: 'Error inesperado.' })
    }
  }
})

// Anything else under /api is a mistake: answer with JSON, not with the web page.
app.use('/api', (_req, res) => res.status(404).json({ error: 'No encontrado.' }))

// In production the server also serves the built client; /ABCD links fall back to index.html.
if (existsSync(clientDist)) {
  app.use(express.static(clientDist))
  app.get('*', (_req, res) => res.sendFile(pathJoin(clientDist, 'index.html')))
}

const broadcast = (room: { code: string }) => {
  const state = rooms.getRoom(room.code)
  if (state) io.to(room.code).emit('room:state', rooms.view(state))
}

rooms.onRoomChange(broadcast)

const errorText = (e: unknown) => {
  if (e instanceof rooms.RoomError || e instanceof GameError) return e.message
  console.error(e)
  return 'Error inesperado.'
}

/**
 * Clients are not trusted. A request may arrive without its callback (or with something that is not
 * a function); replying must never throw, or one bad client would take the whole server down.
 */
const replier = <T,>(ack: unknown) => (result: Ack<T>) => {
  if (typeof ack === 'function') (ack as (r: Ack<T>) => void)(result)
}

io.on('connection', (socket) => {
  socket.on('room:join', (payload, ack) => {
    const reply = replier<JoinResult>(ack)
    try {
      const p = rooms.sanitizeJoin(payload)
      // A socket holds one seat at a time: joining anything other than its own seat gives that seat up first
      // (otherwise one connection could keep a second "connected" seat alive forever).
      const current = rooms.findBySocket(socket.id)
      if (current && !(current.room.code === p.code && current.player.id === p.playerId)) {
        socket.leave(current.room.code)
        const left = rooms.leave(socket.id)
        if (left) broadcast(left)
      }
      const { room, player } = rooms.join(socket.id, p)
      socket.join(room.code)
      reply({ ok: true, data: { playerId: player.id, room: rooms.view(room) } })
      broadcast(room)
    } catch (e) {
      reply({ ok: false, error: errorText(e) })
    }
  })

  socket.on('room:leave', () => {
    try {
      const found = rooms.findBySocket(socket.id)
      if (found) socket.leave(found.room.code)
      const room = rooms.leave(socket.id)
      if (room) broadcast(room)
    } catch (e) {
      console.error(e)
    }
  })

  socket.on('game:start', (ack) => {
    const reply = replier<null>(ack)
    try {
      const room = rooms.start(socket.id)
      reply({ ok: true, data: null })
      broadcast(room)
    } catch (e) {
      reply({ ok: false, error: errorText(e) })
    }
  })

  socket.on('room:categories', (names, ack) => {
    const reply = replier<null>(ack)
    try {
      const room = rooms.setCategories(socket.id, Array.isArray(names) ? names.map(String) : [])
      reply({ ok: true, data: null })
      broadcast(room)
    } catch (e) {
      reply({ ok: false, error: errorText(e) })
    }
  })

  socket.on('game:answer', (text, ack) => {
    const reply = replier<AnswerResult>(ack)
    try {
      reply({ ok: true, data: rooms.answer(socket.id, text) })
    } catch (e) {
      reply({ ok: false, error: errorText(e) })
    }
  })

  socket.on('game:hint', (ack) => {
    const reply = replier<{ examples: string[] }>(ack)
    try {
      reply({ ok: true, data: rooms.hint(socket.id) })
    } catch (e) {
      reply({ ok: false, error: errorText(e) })
    }
  })

  socket.on('game:reset', (ack) => {
    const reply = replier<null>(ack)
    try {
      const room = rooms.reset(socket.id)
      reply({ ok: true, data: null })
      broadcast(room)
    } catch (e) {
      reply({ ok: false, error: errorText(e) })
    }
  })

  socket.on('disconnect', () => {
    try {
      const room = rooms.disconnect(socket.id, broadcast)
      if (room) broadcast(room)
    } catch (e) {
      console.error(e)
    }
  })
})

http.listen(PORT, () => {
  console.log(`León server on :${PORT}`)
  // The token is shown only where a person is looking (a terminal), never in hosting logs.
  if (admin.source === 'env') console.log('Admin: /admin (token en la variable ADMIN_TOKEN)')
  else if (process.stdout.isTTY || admin.source === 'generated') console.log(`Admin: /admin  (token: ${admin.token})`)
  else console.log('Admin: /admin (token en server/data/admin-token.txt)')
})
