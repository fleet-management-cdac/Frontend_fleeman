import api from '../lib/api';

/**
 * Get all available languages
 * GET /api/i18n/languages
 * @returns {Promise<Array>} List of languages with id, code, name, isDefault
 */
export async function getLanguages() {
    try {
        const response = await api.get('/api/i18n/languages');
        return response.data?.data || [];
    } catch (error) {
        console.error('Failed to fetch languages:', error);
        return [];
    }
}

/**
 * Get all translations for a language code
 * GET /api/i18n/translations/{code}
 * @param {string} code - Language code (e.g., 'en', 'hi', 'mr')
 * @returns {Promise<Object>} Key-value map of translations
 */
export async function getTranslations(code) {
    try {
        const response = await api.get(`/api/i18n/translations/${code}`);
        return response.data?.data || {};
    } catch (error) {
        console.error(`Failed to fetch translations for ${code}:`, error);
        return {};
    }
}
