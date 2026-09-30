import config from "../config/index.js";
import { LRUCache } from 'lru-cache';
import { Agent } from 'undici';

const tokenCache = new LRUCache({
    max: 1, // Only store one token
    ttl: 1000 * 60 * 59, // 59 minutes in milliseconds
});

const agent = new Agent({
    connect: {
        rejectUnauthorized: false
    }
});

// Get cached token or fetch a new one
const getValidToken = async () => {
    let token = tokenCache.get('sbca_token');

    if (!token) {
        token = await fetchNewToken();
        if (token) {
            tokenCache.set('sbca_token', token);
        }
    }

    // Verify token is still valid
    const isValid = await verifyToken(token);
    if (!isValid) {
        token = await fetchNewToken();
        if (token) {
            tokenCache.set('sbca_token', token);
        }
    }

    return token;
};

// Fetch new token from SBCA API
const fetchNewToken = async () => {
    try {

        const response = await fetch(`${config.config.SBCA_api_base_url}ClientApi/authenticate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Accept": "application/json",
                "username": config.config.SBCA_api_username,
                "password": config.config.SBCA_api_password,
            },
            dispatcher: agent,
        });

        const tokenData = await response.json();
        return tokenData.data.token;
    } catch (error) {
        console.error('❌ Error fetching new token:', error);
        return null;
    }
};

// Verify if token is still valid
const verifyToken = async (token) => {
    try {
        if (!token) return false;

        const response = await fetch(`${config.config.SBCA_api_base_url}ClientApi/verify_token`, {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${token}`
            },
            dispatcher: agent,
        });

        const verifyData = await response.json();
        return response.ok && verifyData.success !== 0;
    } catch (error) {
        console.error('❌ Error verifying token:', error);
        return false;
    }
};

const getSbcaFiles = async (formData) => {
    try {
        let token = tokenCache.get('sbca_token');
        if (!token) {
            token = await getValidToken();
        }

        const response = await fetch(`${config.config.SBCA_api_base_url}ClientApi/get_proposals`, {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData,
            dispatcher: agent
        });

        const data = await response.json();
        if (response.status === 403 || data.success === 0) {

            tokenCache.delete('sbca_token');

            const newToken = await getValidToken();
            if (newToken) {
                const retryResponse = await fetch(`${config.config.SBCA_api_base_url}ClientApi/get_proposals`, {
                    method: 'POST',
                    headers: {
                        "Authorization": `Bearer ${newToken}`
                    },
                    body: formData,
                    dispatcher: agent
                });
                return retryResponse.json();
            }
        }

        return data;
    } catch (error) {
        console.error('❌ Error fetching SBCA files:', error);
        throw error;
    }
};

const clearTokenCache = () => {
    tokenCache.clear();
};

export {
    getValidToken,
    getSbcaFiles,
    verifyToken,
    clearTokenCache
};
