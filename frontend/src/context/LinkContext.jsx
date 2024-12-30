import { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';

export const LinkContext = createContext();

const API_URL = 'http://localhost:3000/api';

export const LinkProvider = ({ children }) => {
    const [userPages, setUserPages] = useState([]);
    const [currentPageLinks, setCurrentPageLinks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);

    const fetchUserPages = useCallback(async () => {
        if (isInitialized) return;

        try {
            const response = await axios.get(`${API_URL}/get-user-links`, {
                withCredentials: true
            });
            setUserPages(response.data);
            setIsInitialized(true);
        } catch (err) {
            console.error('Error fetching pages:', err);
            setError(err.message);
            setUserPages([]);
        } finally {
            setIsLoading(false);
        }
    }, [isInitialized]);

    const getLinksFromPage = async (pageURL) => {
        try {
            const response = await axios.get(`${API_URL}/get-page-links/${pageURL}`, {
                withCredentials: true
            });
            // Parse the links from the response if they're stored as a JSON string
            const links = response.data.links ? JSON.parse(response.data.links) : [];
            return links;
        } catch (err) {
            console.error('Error fetching page links:', err);
            throw err;
        }
    };

    useEffect(() => {
        let mounted = true;

        const initFetch = async () => {
            if (!isInitialized && mounted) {
                await fetchUserPages();
            }
        };

        initFetch();

        return () => {
            mounted = false;
        };
    }, [fetchUserPages, isInitialized]);

    const contextValue = useMemo(() => ({
        userPages,
        setUserPages,
        currentPageLinks,
        setCurrentPageLinks,
        isLoading,
        error,
        fetchUserPages,
        getLinksFromPage
    }), [userPages, currentPageLinks, isLoading, error, fetchUserPages]);

    return (
        <LinkContext.Provider value={contextValue}>
            {children}
        </LinkContext.Provider>
    );
};