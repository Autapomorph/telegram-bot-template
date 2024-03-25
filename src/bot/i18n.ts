import path from 'node:path';
import { I18n } from '@grammyjs/i18n';

import type { AppContext } from 'bot/context.js';

export const defaultLocale = 'en';

export const i18n = new I18n<AppContext>({
  defaultLocale,
  directory: path.resolve(process.cwd(), 'locales'),
  useSession: true,
  fluentBundleOptions: {
    useIsolating: false,
  },
});

export const isMultipleLocales = i18n.locales.length > 1;
