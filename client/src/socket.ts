import { io, type Socket } from 'socket.io-client'
import type { ClientToServer, ServerToClient } from '../../shared/protocol'

export const socket: Socket<ServerToClient, ClientToServer> = io({ autoConnect: true })
