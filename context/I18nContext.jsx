"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const I18nContext = createContext();

export const I18nProvider = ({ children }) => {
    const [language, setLanguage] = useState('en');
    const [translations, setTranslations] = useState({});
    const [availableLanguages, setAvailableLanguages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedLang = localStorage.getItem('app_lang');
        if (savedLang) setLanguage(savedLang);
    }, []);

    useEffect(() => {
        const fetchTranslations = async () => {
            setLoading(true);
            try {
                const response = await fetch(`http://localhost:8080/api/translations/all/${language}`);
                const result = await response.json();
                
                if (result.success && result.data) {
                    if (Array.isArray(result.data)) {
                        const map = {};
                        result.data.forEach(item => {
                            // Mapping database column names to JS keys
                            const key = item.t_key || item.tkey || item.key;
                            const value = item.t_value || item.tvalue || item.value;
                            if (key) map[key] = value;
                        });
                        setTranslations(map);
                    } else {
                        setTranslations(result.data);
                    }
                    console.log(`✅ Translations Loaded (${language}):`, result.data);
                }
            } catch (error) {
                console.error("❌ Fetch Error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTranslations();
    }, [language]);

    useEffect(() => {
        const fetchLanguages = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/languages');
                const result = await response.json();
                if (result.success && result.data) setAvailableLanguages(result.data);
            } catch (error) {
                console.error("Error fetching languages:", error);
            }
        };
        fetchLanguages();
    }, []);

    // Optimized translation function
    const t = useCallback((key) => {
        return translations[key] || key;
    }, [translations]);

    return (
        <I18nContext.Provider value={{ 
            language, 
            setLanguage: (l) => { setLanguage(l); localStorage.setItem('app_lang', l); }, 
            t, 
            availableLanguages, 
            loading 
        }}>
            {children}
        </I18nContext.Provider>
    );
};

export const useI18n = () => useContext(I18nContext);