import { limit } from '@grammyjs/ratelimiter';

import type { AppContext } from 'bot/context.js';

export function ratelimiter() {
  return limit({
    timeFrame: 1000,
    limit: 3,
    alwaysReply: false,
    keyGenerator: (ctx: AppContext) => {
      return ctx.from?.id.toString();
    },
    onLimitExceeded: async ctx => {
      return ctx.reply(ctx.t('ratelimit.hit'));
    },
  });
}
