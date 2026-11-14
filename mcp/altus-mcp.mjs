#!/usr/bin/env node
// Altus connector for Claude (MCP), READ ONLY: it lets Claude read the recent games, the question report, the calibration panel and
// the general statistics of an Altus server through the admin API. It cannot change anything (only GET requests are made).
//
// It needs two environment variables:
//   ALTUS_URL          the address of the game, e.g. https://your-game.up.railway.app (default http://localhost:3001)
//   ALTUS_ADMIN_TOKEN  the admin token (the ADMIN_TOKEN variable of the server). Never write it in a file of the repository.
//
// It speaks MCP over stdin/stdout (one JSON-RPC message per line) with no dependencies, so it only needs Node 18 or newer.
// See mcp/LEEME.md for how to add it to Claude.

import { createInterface } from 'node:readline'

const BASE = (process.env.ALTUS_URL || 'http://localhost:3001').replace(/\/+$/, '')
const TOKEN = process.env.ALTUS_ADMIN_TOKEN || ''

async function api(path) {
  if (!TOKEN) throw new Error('Falta la variable ALTUS_ADMIN_TOKEN con el token de admin.')
  const res = await fetch(`${BASE}/api/admin${path}`, { headers: { 'x-admin-token': TOKEN } })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error || `El servidor respondió ${res.status}.`)
  return body
}

const has = (text, needle) => String(text).toLowerCase().includes(String(needle).toLowerCase())

const TOOLS = [
  {
    name: 'partidas_recientes',
    description:
      'Las últimas partidas de Altus (hasta 100): cada ronda con la pregunta y lo que respondió cada jugador con sus puntos, más un resumen por pregunta (cuántas veces salió, cuántos Rey León de 100 puntos, cuántos sin respuesta, promedio de puntos). Con solo_resumen=true devuelve solo el resumen por pregunta, que es mucho más corto.',
    inputSchema: { type: 'object', properties: { solo_resumen: { type: 'boolean', description: 'Solo el resumen por pregunta, sin el detalle de cada partida.' } } },
    run: async (a) => {
      const data = await api('/games/export')
      return a.solo_resumen ? { generatedAt: data.generatedAt, note: data.note, partidas: data.games.length, questions: data.questions } : data
    },
  },
  {
    name: 'reporte_preguntas',
    description:
      'Todas las preguntas con sus respuestas correctas (nivel y cuántas veces se escribieron) y las respuestas incorrectas que escribieron los jugadores. Es largo: usa buscar para filtrar por texto de la pregunta o por categoría.',
    inputSchema: { type: 'object', properties: { buscar: { type: 'string', description: 'Texto a buscar en la pregunta o la categoría.' } } },
    run: async (a) => {
      const data = await api('/report')
      if (!a.buscar) return data
      return { ...data, questions: data.questions.filter((q) => has(q.prompt, a.buscar) || has(q.category, a.buscar)) }
    },
  },
  {
    name: 'calibracion',
    description:
      'El panel de calibración: respuestas de 100 puntos que salen demasiado, niveles que sugieren las respuestas escritas, preguntas que casi nadie responde y preguntas demasiado fáciles.',
    inputSchema: { type: 'object', properties: {} },
    run: () => api('/calibration'),
  },
  {
    name: 'estadisticas_generales',
    description: 'Cifras generales del juego: partidas, jugadores, partidas por día y por hora, regiones y duración promedio.',
    inputSchema: { type: 'object', properties: {} },
    run: () => api('/metrics'),
  },
  {
    name: 'buscar_preguntas',
    description: 'Busca preguntas por texto, categoría o estado (published, draft, archived) y devuelve su id, categoría, estado y cuántas respuestas tiene.',
    inputSchema: {
      type: 'object',
      properties: {
        texto: { type: 'string' },
        categoria: { type: 'string' },
        estado: { type: 'string', enum: ['published', 'draft', 'archived'] },
      },
    },
    run: (a) => {
      const q = new URLSearchParams()
      if (a.texto) q.set('q', a.texto)
      if (a.categoria) q.set('category', a.categoria)
      if (a.estado) q.set('status', a.estado)
      return api(`/questions?${q}`)
    },
  },
  {
    name: 'ver_pregunta',
    description: 'Una pregunta completa (respuestas, alias y niveles) con sus estadísticas: cuántas veces salió, lo que escribieron y el nivel que sugieren los datos.',
    inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
    run: async (a) => {
      const id = encodeURIComponent(String(a.id))
      const [question, stats] = await Promise.all([api(`/questions/${id}`), api(`/stats/${id}`).catch(() => null)])
      return { ...question, stats }
    },
  },
]

function send(msg) {
  process.stdout.write(JSON.stringify(msg) + '\n')
}

async function handle(msg) {
  const { id, method, params } = msg
  if (id === undefined) return // a notification (for example notifications/initialized): nothing to answer
  try {
    if (method === 'initialize') {
      return send({
        jsonrpc: '2.0', id,
        result: { protocolVersion: params?.protocolVersion || '2025-06-18', capabilities: { tools: {} }, serverInfo: { name: 'altus', version: '1.0.0' } },
      })
    }
    if (method === 'ping') return send({ jsonrpc: '2.0', id, result: {} })
    if (method === 'tools/list') {
      return send({ jsonrpc: '2.0', id, result: { tools: TOOLS.map(({ name, description, inputSchema }) => ({ name, description, inputSchema, annotations: { readOnlyHint: true } })) } })
    }
    if (method === 'tools/call') {
      const tool = TOOLS.find((t) => t.name === params?.name)
      if (!tool) return send({ jsonrpc: '2.0', id, error: { code: -32602, message: `No existe la herramienta ${params?.name}.` } })
      try {
        const data = await tool.run(params?.arguments || {})
        return send({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: JSON.stringify(data, null, 1) }] } })
      } catch (e) {
        return send({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: `Error: ${e.message}` }], isError: true } })
      }
    }
    send({ jsonrpc: '2.0', id, error: { code: -32601, message: `Método no soportado: ${method}` } })
  } catch (e) {
    send({ jsonrpc: '2.0', id, error: { code: -32603, message: e.message } })
  }
}

createInterface({ input: process.stdin }).on('line', (line) => {
  if (!line.trim()) return
  let msg
  try {
    msg = JSON.parse(line)
  } catch {
    return send({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'JSON inválido.' } })
  }
  void handle(msg)
})
