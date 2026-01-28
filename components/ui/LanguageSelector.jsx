'use client';

import { useState, useRef, useEffect } from 'react';
import { useI18n } from '../../context/I18nContext';

export default function LanguageSelector({ theme = 'light' }) {
    const { languages, currentLang, changeLang } = useI18n();
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);

    const currentLanguage = languages.find(l => l.code === currentLang);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (languages.length <= 1) return null;

    const textColor = theme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100';

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition ${textColor}`}
            >
                <span className="text-base">🌐</span>
                <span className="uppercase tracking-wide">{currentLang}</span>
                <svg className="w-3 h-3 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    {languages.map((lang) => (
                        <button
                            key={lang.id || lang.code}
                            onClick={() => {
                                changeLang(lang.code);
                                setIsOpen(false);
                            }}
                            className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${lang.code === currentLang ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                                }`}
                        >
                            {lang.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
