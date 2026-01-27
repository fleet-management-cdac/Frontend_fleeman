'use client';

import { useI18n } from '../../context/I18nContext';

const carLogos = [
  { name: 'Audi', src: '/Audi.jpg' },
  { name: 'BMW', src: '/Bmw.jpg' },
  { name: 'Bentley', src: '/Bentley.jpg' },
  { name: 'Jaguar', src: '/Jaguar.jpg' },
  { name: 'Lexus', src: '/Lexus.jpg' },
  { name: 'Mercedes', src: '/Mercy.jpg' },
];

export default function FeaturesSection() {
  const { t } = useI18n();

  const features = [
    { icon: "💰", titleKey: "home.features.pricing", descKey: "home.features.pricing_desc" },
    { icon: "✅", titleKey: "home.features.booking", descKey: "home.features.booking_desc" },
    { icon: "📍", titleKey: "home.features.locations", descKey: "home.features.locations_desc" }
  ];

  // Quadruple logos to ensure no gaps during animation
  const duplicatedLogos = [...carLogos, ...carLogos, ...carLogos, ...carLogos];

  return (
    <section className="py-16 bg-gray-50">
      
      {/* 1. THE MOVING LOGOS (Now at the very top) */}
      <div className="relative mb-12 overflow-hidden w-full border-b border-gray-100 pb-8">
        {/* Fading Edges */}
        <div className="absolute inset-y-0 left-0 w-32 b z-10 pointer-events-none"></div>
        <div className="absolute inset-y-0 right-0 w-32  z-10 pointer-events-none"></div>

        {/* Moving Container - MUST have w-max to move */}
        <div className="flex items-center w-max animate-scroll hover:[animation-play-state:paused]">
          {duplicatedLogos.map((logo, index) => (
            <div
              key={index}
              className="flex-shrink-0 mx-12 w-28 h-16 "
            >
              <img
                src={logo.src}
                alt={logo.name}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* 2. THE TITLE (Now moved below the logos) */}
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          {t('home.features.title', 'Why Choose FLEMAN?')}
        </h2>

        {/* 3. FEATURE CARDS */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div key={i} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-3xl">{f.icon}</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {t(f.titleKey, f.titleKey.split('.').pop())}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {t(f.descKey, 'Quality service for you')}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}