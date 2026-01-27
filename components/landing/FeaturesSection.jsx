'use client';

import { useI18n } from '../../context/I18nContext';

export default function FeaturesSection() {
    const { t } = useI18n();

    const features = [
        { icon: "💰", titleKey: "home.features.pricing", descKey: "home.features.pricing_desc" },
        { icon: "✅", titleKey: "home.features.booking", descKey: "home.features.booking_desc" },
        { icon: "📍", titleKey: "home.features.locations", descKey: "home.features.locations_desc" }
    ];

    return (
        <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4">
                <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">
                    {t('home.features.title', 'Why Choose FLEMAN?')}
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                    {features.map((f, i) => (
                        <div key={i} className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                                <span className="text-2xl">{f.icon}</span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {t(f.titleKey, f.titleKey.split('.').pop())}
                            </h3>
                            <p className="text-gray-600 text-sm">
                                {t(f.descKey, 'Quality service for you')}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
