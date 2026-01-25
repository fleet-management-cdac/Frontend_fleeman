import api from '../lib/api';

// === LANGUAGES ===
export const getAllLanguages = async () => {
    const response = await api.get('/api/i18n/languages');
    return response.data;
};

export const getLanguageCodes = async () => {
    const response = await api.get('/api/i18n/languages/codes');
    return response.data;
};

export const getDefaultLanguage = async () => {
    const response = await api.get('/api/i18n/languages/default');
    return response.data;
};

// === TRANSLATIONS ===
export const getTranslationsMap = async (languageId) => {
    const response = await api.get(`/api/i18n/translations/${languageId}/map`);
    return response.data;
};

export const getTranslationsByCode = async (langCode) => {
    const response = await api.get(`/api/i18n/translations/code/${langCode}`);
    return response.data;
};

// Single translation
export const translate = async (key, lang = 'en') => {
    const response = await api.get('/api/translations/translate', {
        params: { key, lang }
    });
    return response.data;
};
