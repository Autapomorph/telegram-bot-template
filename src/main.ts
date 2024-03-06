#!/usr/bin/env tsx

import { onShutdown } from 'node-graceful-shutdown';

import { createBot } from 'bot/index.js';
import { createServer } from 'server/index.js';
import { config } from 'config.js';
import { logger } from 'logger.js';

try {
  const bot = createBot(config.BOT_TOKEN);
  const server = await createServer(bot);

  // Graceful shutdown
  onShutdown(async () => {
    logger.info('Shutting down');
    await server.close();
    await bot.stop();
  });

  if (config.BOT_MODE === 'polling') {
    bot.start({
      allowed_updates: config.BOT_ALLOWED_UPDATES,
      onStart: ({ username }) =>
        logger.info({
          msg: 'Bot started in polling mode',
          username,
        }),
    });
  }

  if (config.BOT_MODE === 'webhook') {
    // To prevent receiving updates before the bot is ready
    await bot.init();
    logger.info('Bot started in webhook mode');

    await server.listen({
      host: config.BOT_SERVER_HOST,
      port: config.BOT_SERVER_PORT,
    });

    await bot.api.setWebhook(config.BOT_WEBHOOK, {
      allowed_updates: config.BOT_ALLOWED_UPDATES,
    });

    logger.info(`Webhook was set to: ${config.BOT_WEBHOOK}`);
  }
} catch (error) {
  logger.error(error);
  process.exit(1);
}
