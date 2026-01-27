'use client';

import { useI18n } from '../../context/I18nContext';

export default function FeaturesSection() {
    const { t } = useI18n();

    const features = [
        { icon: "💰", title: "Transparent Pricing", desc: "No hidden fees. Get upfront quotes with competitive rates tailored to your budget." },
        { icon: "✅", title: "Instant Booking", desc: "Reserve your vehicle in under 2 minutes. Fast, secure, and hassle-free." },
        { icon: "📍", title: "Convenient Pickup", desc: "Multiple pickup points across the city. Collect your car where it suits you best." }
    ];

    return (
        <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4">
                <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">
                    {t('home.features.title', 'Why Choose FLEMAN?')}
                </h2>
                <div className="grid md:grid-cols-3 gap-8">
                    {features.map((f, i) => (
                        <div key={i} className="group bg-white rounded-2xl p-8 shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-2 hover:border-blue-200 transition-all duration-300 ease-out cursor-pointer">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300">
                                <span className="text-2xl">{f.icon}</span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                                {f.title}
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                {f.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
