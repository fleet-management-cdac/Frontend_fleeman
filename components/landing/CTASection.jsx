'use client';

import Link from 'next/link';
import Button from '../ui/Button';
import { useI18n } from '../../context/I18nContext';

export default function CTASection() {
    const { t } = useI18n();

    return (
        <section className="py-20 bg-slate-900 text-white border-t border-slate-800">
            <div className="max-w-4xl mx-auto px-6 text-center">
                <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
                    {t('home.cta.title', 'Ready to Hit the Road?')}
                </h2>

                <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                    {t('home.cta.desc', 'Join thousands of satisfied customers who trust Fleeman for their journey. Transparent pricing, premium cars, and zero hidden fees.')}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="/register" className="w-full sm:w-auto">
                        <Button className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg rounded-xl shadow-lg transition-all">
                            {t('home.cta.btn_create_account', 'Create Free Account')}
                        </Button>
                    </Link>

                    <Link href="/vehicles" className="w-full sm:w-auto">
                        <Button variant="outline" className="w-full sm:w-auto px-8 py-4 border-slate-600 text-slate-300 hover:text-white hover:border-white hover:bg-slate-800 font-semibold text-lg rounded-xl transition-all">
                            {t('home.cta.btn_browse_fleet', 'Browse Fleet')}
                        </Button>
                    </Link>
                </div>

                <p className="mt-8 text-sm text-gray-500">
                    {t('home.cta.footer_note', 'No credit card required for registration.')}
                </p>
            </div>
        </section>
    );
}
