'use client';

import { useState } from 'react';
import { useI18n } from '../../context/I18nContext';

export default function LanguageSelector() {
    const [isOpen, setIsOpen] = useState(false);
    const { language, setLanguage, availableLanguages } = useI18n();

    // Find the current language object to display its name
    const currentLang = availableLanguages.find(l => l.code === language) || { name: 'English' };

    return (
        <div className="relative inline-block text-left">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-black text-blue-900 hover:bg-yellow-50 transition-all"
            >
                <span className="mr-2">🌐</span>
                {currentLang.name.toUpperCase()}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-2xl bg-white ring-1 ring-black ring-opacity-5 z-50 border-2 border-blue-900">
                    <div className="py-1">
                        {availableLanguages.map((lang, index) => (
                            <button
                                // FIX: Use a unique fallback key if lang.id is missing or undefined
                                key={lang.language_id || lang.id || lang.code || index}
                                onClick={() => {
                                    setLanguage(lang.code);
                                    setIsOpen(false);
                                }}
                                className={`flex items-center w-full px-4 py-3 text-sm font-black hover:bg-blue-900 hover:text-white transition-colors ${
                                    language === lang.code ? 'bg-yellow-200 text-blue-900' : 'text-gray-700'
                                }`}
                            >
                                {lang.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}