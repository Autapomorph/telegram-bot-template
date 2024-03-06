import { ErrorHandler } from 'grammy';

import type { AppContext } from 'bot/context.js';
import { getUpdateInfo } from 'bot/helpers/logging.js';

export const errorHandler: ErrorHandler<AppContext> = error => {
  const { ctx } = error;

  ctx.logger.error({
    err: error.error,
    update: getUpdateInfo(ctx),
  });
};
