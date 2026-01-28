'use client';

import { useState, useEffect } from 'react';

export default function HealthPage() {
    const [health, setHealth] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchHealth = async () => {
        try {
            const res = await fetch('http://localhost:8080/actuator/health');
            if (!res.ok) throw new Error('Failed to fetch health data');
            const data = await res.json();
            setHealth(data);
            setLastUpdated(new Date());
            setError(null);
        } catch (err) {
            setError('System Unreachable');
            setHealth(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHealth();
        const interval = setInterval(fetchHealth, 30000);
        return () => clearInterval(interval);
    }, []);

    const formatSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + ['B', 'KB', 'MB', 'GB', 'TB'][i];
    };

    if (loading && !health) {
        return <div className="p-10 text-gray-500">Loading system status...</div>;
    }

    if (error) {
        return (
            <div className="p-10 font-mono text-sm">
                <div className="text-red-600 font-bold mb-2">SYSTEM STATUS: OFFLINE</div>
                <div className="text-gray-500">{error}</div>
                <button onClick={() => { setLoading(true); fetchHealth(); }} className="mt-4 underline hover:text-black">Retry</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white p-6 md:p-12 font-mono text-sm">
            <div className="max-w-3xl mx-auto">
                <header className="mb-8 border-b border-gray-200 pb-4 flex justify-between items-end">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">SYSTEM HEALTH</h1>
                        <p className="text-gray-500 mt-1">Status: <span className={health.status === 'UP' ? 'text-green-600' : 'text-red-600'}>{health.status}</span></p>
                    </div>
                    {lastUpdated && <div className="text-gray-400 text-xs">Updated: {lastUpdated.toLocaleTimeString()}</div>}
                </header>

                <div className="space-y-8">
                    {/* Database */}
                    {health.components?.db && (
                        <div>
                            <h2 className="font-bold text-gray-900 mb-2 border-b border-gray-100 pb-1">DATABASE</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <span className="text-gray-500">Status</span>
                                <span className={health.components.db.status === 'UP' ? 'text-green-600' : 'text-red-600'}>{health.components.db.status}</span>
                                <span className="text-gray-500">Engine</span>
                                <span>{health.components.db.details?.database}</span>
                            </div>
                        </div>
                    )}

                    {/* Disk */}
                    {health.components?.diskSpace && (
                        <div>
                            <h2 className="font-bold text-gray-900 mb-2 border-b border-gray-100 pb-1">DISK SPACE</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <span className="text-gray-500">Status</span>
                                <span className={health.components.diskSpace.status === 'UP' ? 'text-green-600' : 'text-red-600'}>{health.components.diskSpace.status}</span>
                                <span className="text-gray-500">Free / Total</span>
                                <span>{formatSize(health.components.diskSpace.details?.free)} / {formatSize(health.components.diskSpace.details?.total)}</span>
                            </div>
                        </div>
                    )}

                    {/* Mail */}
                    {health.components?.mail && (
                        <div>
                            <h2 className="font-bold text-gray-900 mb-2 border-b border-gray-100 pb-1">MAIL SERVICE</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <span className="text-gray-500">Status</span>
                                <span className={health.components.mail.status === 'UP' ? 'text-green-600' : 'text-red-600'}>{health.components.mail.status}</span>
                                <span className="text-gray-500">Location</span>
                                <span>{health.components.mail.details?.location}</span>
                            </div>
                        </div>
                    )}

                    {/* SSL */}
                    {health.components?.ssl && (
                        <div>
                            <h2 className="font-bold text-gray-900 mb-2 border-b border-gray-100 pb-1">SSL CERTIFICATE</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <span className="text-gray-500">Status</span>
                                <span className={health.components.ssl.status === 'UP' ? 'text-green-600' : 'text-red-600'}>{health.components.ssl.status}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
