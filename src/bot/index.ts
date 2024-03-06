import { Bot as TelegramBot, BotConfig, StorageAdapter } from 'grammy';
import { hydrateContext, hydrateApi } from '@grammyjs/hydrate';
import { hydrateReply, parseMode } from '@grammyjs/parse-mode';
import { hydrateFiles } from '@grammyjs/files';
import { conversations } from '@grammyjs/conversations';
import { autoChatAction } from '@grammyjs/auto-chat-action';
import { autoRetry } from '@grammyjs/auto-retry';

import { type AppContext, type AppApi, createContextConstructor } from 'bot/context.js';
import { SessionData } from 'bot/types/session.js';
import {
  adminFeature,
  languageFeature,
  unhandledFeature,
  welcomeFeature,
} from 'bot/features/index.js';
import { errorHandler } from 'bot/handlers/index.js';
import { i18n, isMultipleLocales } from 'bot/i18n.js';
import { updateLogger, ratelimiter, session } from 'bot/middlewares/index.js';
import { config } from 'config.js';
import { logger } from 'logger.js';

interface Options {
  sessionStorage?: StorageAdapter<SessionData>;
  config?: Omit<BotConfig<AppContext>, 'ContextConstructor'>;
}

export type Bot = ReturnType<typeof createBot>;

export function createBot(token: string, options: Options = {}) {
  const bot = new TelegramBot<AppContext, AppApi>(token, {
    ...options.config,
    ContextConstructor: createContextConstructor({ logger }),
  });
  const protectedBot = bot.errorBoundary(errorHandler);

  // Middlewares
  bot.api.config.use(autoRetry());
  bot.api.config.use(parseMode('HTML'));
  bot.api.config.use(hydrateApi());
  bot.api.config.use(hydrateFiles(bot.token));

  if (config.isDev) {
    protectedBot.use(updateLogger());
  }

  protectedBot.use(session(options.sessionStorage));
  protectedBot.use(i18n);
  protectedBot.use(ratelimiter());
  protectedBot.use(hydrateReply);
  protectedBot.use(hydrateContext());
  protectedBot.use(conversations());
  protectedBot.use(autoChatAction(bot.api));

  // Handlers
  protectedBot.use(welcomeFeature);
  protectedBot.use(adminFeature);

  if (isMultipleLocales) {
    protectedBot.use(languageFeature);
  }

  // Must be the last handler
  protectedBot.use(unhandledFeature);

  return bot;
}
