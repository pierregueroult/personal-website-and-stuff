'use client';

import io, { Socket } from 'socket.io-client';

import { env } from '@/lib/env/client';

const socket: Socket = io(env.NEXT_PUBLIC_API_URL, {
  transports: ['websocket'],
  autoConnect: false,
});

export { socket };
