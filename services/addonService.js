const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Get all available addons
export const getAddons = async () => {
    const response = await fetch(`${API_BASE_URL}/api/addons`, {
        credentials: 'omit',
    });

    if (!response.ok) {
        throw new Error('Failed to fetch addons');
    }

    return response.json();
};

// Get addon by ID
export const getAddonById = async (addonId) => {
    const response = await fetch(`${API_BASE_URL}/api/addons/${addonId}`, {
        credentials: 'omit',
    });

    if (!response.ok) {
        throw new Error('Addon not found');
    }

    return response.json();
};
