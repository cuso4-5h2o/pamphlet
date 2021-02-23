import * as Localization from 'expo-localization';
import I18n from 'i18n-js';
import en from './en';
import zhHans from './zh-Hans';
import zhHant from './zh-Hant';

I18n.locale = Localization.locale;
I18n.defaultLocale = 'en-US';
I18n.fallbacks = true;
I18n.translations = {
    'en': en,
    'zh-Hans': zhHans,
    'zh-Hant': zhHant,
};

export { I18n };