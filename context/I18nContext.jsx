'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getLanguages, getTranslations } from '../services/i18nService';

const I18nContext = createContext();

const DEFAULT_LANG = 'en';

export function I18nProvider({ children }) {
    const [languages, setLanguages] = useState([]);
    const [currentLang, setCurrentLang] = useState(DEFAULT_LANG);
    const [translations, setTranslations] = useState({});
    const [loading, setLoading] = useState(true);

    // Load languages on mount
    useEffect(() => {
        async function loadLanguages() {
            const langs = await getLanguages();
            setLanguages(langs);

            // Get saved language or find default
            const saved = typeof window !== 'undefined' ? localStorage.getItem('lang') : null;
            const defaultLang = langs.find(l => l.isDefault)?.code || DEFAULT_LANG;
            const langToUse = saved || defaultLang;

            setCurrentLang(langToUse);
        }
        loadLanguages();
    }, []);

    // Load translations when language changes
    useEffect(() => {
        async function loadTranslations() {
            if (!currentLang) return;
            setLoading(true);
            const trans = await getTranslations(currentLang);
            setTranslations(trans);
            setLoading(false);
        }
        loadTranslations();
    }, [currentLang]);

    // Change language
    const changeLang = useCallback((code) => {
        setCurrentLang(code);
        if (typeof window !== 'undefined') {
            localStorage.setItem('lang', code);
        }
    }, []);

    // Translation function
    const t = useCallback((key, fallback) => {
        return translations[key] || fallback || key;
    }, [translations]);

    return (
        <I18nContext.Provider value={{
            languages,
            currentLang,
            changeLang,
            t,
            loading
        }}>
            {children}
        </I18nContext.Provider>
    );
}

export function useI18n() {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error('useI18n must be used within I18nProvider');
    }
    return context;
}
