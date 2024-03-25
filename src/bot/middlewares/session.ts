import { session as sessionMiddleware, StorageAdapter } from 'grammy';

import type { SessionData } from 'bot/types/session.js';

const getDefaultSession = (): SessionData => ({});

export function session(storage?: StorageAdapter<SessionData>) {
  return sessionMiddleware({
    initial: getDefaultSession,
    storage,
    getSessionKey: ctx => {
      return ctx.from?.id.toString();
    },
  });
}
