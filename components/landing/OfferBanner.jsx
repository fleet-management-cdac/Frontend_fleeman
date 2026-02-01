'use client';

import { useState, useEffect } from 'react';

export default function OfferBanner() {
    const [offer, setOffer] = useState(null);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                // Using relative path to proxy or full URL if needed. 
                // Assuming client-side fetch to localhost:8080 as per instructions/patterns used in Health page
                const res = await fetch('http://localhost:8080/api/offers');
                if (res.ok) {
                    const data = await res.json();
                    // Find the first active offer
                    const activeOffer = data.find(o => o.active);
                    if (activeOffer) {
                        setOffer(activeOffer);
                    }
                }
            } catch (error) {
                console.error("Failed to load offers", error);
            }
        };

        fetchOffers();
    }, []);

    if (!offer || !isVisible) return null;

    return (
        <div className="bg-gradient-to-r from-red-600 via-orange-500 to-red-600 text-white py-3 px-4 relative z-50 animate-gradient-x">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-4">

                <div className="flex items-center gap-2 justify-center">
                    <p className="font-bold text-sm md:text-base">
                        {offer.offerName}
                    </p>
                </div>

                <div className="text-sm font-medium flex-1">
                    Get <span className="font-bold text-yellow-300 text-lg">{offer.discountPercentage.toFixed(0)}% OFF</span> on your next booking!
                    <span className="opacity-90 ml-2 hidden sm:inline">
                        Valid: {new Date(offer.startDate).toLocaleDateString('en-GB').replace(/\//g, '-')} - {new Date(offer.endDate).toLocaleDateString('en-GB').replace(/\//g, '-')}
                    </span>
                </div>

                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 md:relative md:top-auto md:translate-y-0 text-white/80 hover:text-white p-2"
                    aria-label="Close"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}
