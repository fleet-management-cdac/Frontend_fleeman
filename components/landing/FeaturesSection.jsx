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
    {
      imgSrc: "/Calender.jpg",
      title: t('home.features.flexible_scheduling_title', 'Flexible Scheduling'),
      desc: t('home.features.flexible_scheduling_desc', 'Instant booking with your choice of pickup and return dates.')
    },
    {
      imgSrc: "/freefuel.jpg",
      title: t('home.features.free_fuel_title', 'Free Fuel'),
      desc: t('home.features.free_fuel_desc', 'First tank is on us. Drive without worrying about refueling costs.')
    },
    {
      imgSrc: "/roadside_assistance.jpg",
      title: t('home.features.roadside_assistance_title', '24/7 Roadside Assistance'),
      desc: t('home.features.roadside_assistance_desc', 'Round-the-clock support ensuring you never get stuck.')
    },
    {
      imgSrc: "/IndiaPermit.jpg",
      title: t('home.features.india_permit_title', 'All India Permit'),
      desc: t('home.features.india_permit_desc', 'Travel anywhere across the country without border restrictions.')
    }
  ];

  // Quadruple logos for smooth infinite scroll
  const duplicatedLogos = [...carLogos, ...carLogos, ...carLogos, ...carLogos];

  return (
    <section className="py-20 bg-white relative overflow-hidden">

      {/* 1. TRUSTED BY SECTION */}
      <div className="mb-20 border-b border-gray-100 pb-12">
        <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">
          {t('home.features.trusted_by', 'Trusted by')}
        </p>
        <div className="relative w-full overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

          <div className="flex items-center w-max animate-scroll">
            {duplicatedLogos.map((logo, index) => (
              <div
                key={index}
                className="flex-shrink-0 mx-12 w-28 opacity-70 hover:opacity-100 transition-opacity duration-300"
              >
                <img
                  src={logo.src}
                  alt={logo.name}
                  className="w-full h-12 object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* 2. SECTION HEADER */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            {t('home.features.title_start', 'Why Choose')} <span className="text-blue-600">{t('home.features.title_highlight', 'FLEEMAN?')}</span>
          </h2>
          <p className="text-gray-600 text-lg">
            {t('home.features.subtitle', 'Simple, transparent, and designed for your comfort.')}
          </p>
        </div>

        {/* 3. FEATURE CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <div key={i} className="bg-gray-50 rounded-2xl p-4 text-center hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-100 flex flex-col items-center">

              <div className="w-full h-48 mb-6 overflow-hidden rounded-xl bg-white flex items-center justify-center">
                <img
                  src={f.imgSrc}
                  alt={f.title}
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                />
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {f.title}
              </h3>

              <p className="text-sm text-gray-500 leading-relaxed mb-2">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}