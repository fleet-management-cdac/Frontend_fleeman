'use client';

import Link from 'next/link';
import { useI18n } from '../../context/I18nContext';
import Button from '../ui/Button';

export default function CTASection() {
    const { t } = useI18n();

    return (
        <section className="py-16 bg-gray-900 text-white">
            <div className="max-w-4xl mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold mb-4">
                    {t('home.cta.title', 'Ready to Hit the Road?')}
                </h2>
                <p className="text-gray-300 mb-6">
                    {t('home.cta.subtitle', 'Join thousands of happy customers.')}
                </p>
                <Link href="/register">
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                        {t('home.cta.button', 'Create Free Account')}
                    </Button>
                </Link>
            </div>
        </section>
    );
}
