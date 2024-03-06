import { Context, Api, SessionFlavor } from 'grammy';
import type { Update, UserFromGetMe } from '@grammyjs/types';
import type { HydrateFlavor, HydrateApiFlavor } from '@grammyjs/hydrate';
import type { I18nFlavor } from '@grammyjs/i18n';
import type { ConversationFlavor } from '@grammyjs/conversations';
import type { ParseModeFlavor } from '@grammyjs/parse-mode';
import type { FileFlavor, FileApiFlavor } from '@grammyjs/files';
import type { AutoChatActionFlavor } from '@grammyjs/auto-chat-action';

import type { Logger } from 'logger.js';
import type { SessionData } from 'bot/types/session.js';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ExtendedContextFlavor {}

interface ExtendedContextFlavorWithConstructor {
  logger: Logger;
}

export type AppContext = FileFlavor<
  ParseModeFlavor<
    HydrateFlavor<
      Context &
        ExtendedContextFlavor &
        ExtendedContextFlavorWithConstructor &
        SessionFlavor<SessionData> &
        I18nFlavor &
        ConversationFlavor &
        AutoChatActionFlavor
    >
  >
>;

export type AppApi = FileApiFlavor<HydrateApiFlavor<Api>>;

interface Dependencies {
  logger: Logger;
}

export function createContextConstructor({ logger }: Dependencies) {
  return class extends Context implements ExtendedContextFlavor {
    logger: Logger;

    constructor(update: Update, api: Api, me: UserFromGetMe) {
      super(update, api, me);

      this.logger = logger.child({
        update_id: this.update.update_id,
      });
    }
  } as unknown as new (update: Update, api: Api, me: UserFromGetMe) => AppContext;
}
