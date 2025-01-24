import { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import debounce from 'lodash.debounce';

export const LinkContext = createContext();

export const LinkProvider = ({ children }) => {
    const [userPages, setUserPages] = useState([]);
    const [currentPageLinks, setCurrentPageLinks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    const fetchUserPages = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/get-user-links', {
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setUserPages(data);
            } else {
                setUserPages([]);
            }
        } catch (error) {
            console.error('Error fetching pages:', error);
            setUserPages([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Reset state when user changes
    useEffect(() => {
        if (!user) {
            setUserPages([]);
            setCurrentPageLinks([]);
            setError(null);
        } else {
            fetchUserPages();
        }
    }, [user, fetchUserPages]);

    const getLinksFromPage = async (pageURL) => {
        try {
            const response = await axios.get(`/api/get-page-links/${pageURL}`, {
                withCredentials: true
            });
            const links = response.data.links ? JSON.parse(response.data.links) : [];
            return links;
        } catch (err) {
            console.error('Error fetching page links:', err);
            throw err;
        }
    };

    const savePageChanges = async (pageURL, changes) => {
        try {
            await axios.put(
                `/api/pages/${pageURL}`,
                changes,
                { withCredentials: true }
            );
        } catch (err) {
            console.error('Error saving changes:', err);
            throw err;
        }
    };

    // Debounced version that will wait 1 second after last call
    const debouncedSave = useMemo(
        () => debounce(savePageChanges, 1000),
        []
    );

    // Add a new immediate save function for drag-and-drop
    const savePageChangesImmediate = async (pageURL, changes) => {
        console.log('Saving changes immediately:', changes);
        try {
            await axios.put(
                `/api/pages/${pageURL}`,
                changes,
                { withCredentials: true }
            );
        } catch (err) {
            console.error('Error saving changes:', err);
            throw err;
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            debouncedSave.cancel();
        };
    }, [debouncedSave]);

    const createPage = async (pageTitle, pageURL) => {
        try {
            const response = await fetch('/api/pages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ pageTitle, pageURL }),
            });

            if (!response.ok) {
                throw new Error('Failed to create page');
            }

            const newPage = await response.json();
            setUserPages(prev => [...prev, newPage]);
            return newPage;
        } catch (error) {
            throw error;
        }
    };

    const contextValue = useMemo(() => ({
        userPages,
        setUserPages,
        currentPageLinks,
        setCurrentPageLinks,
        isLoading,
        error,
        fetchUserPages,
        getLinksFromPage,
        savePageChanges: debouncedSave,
        savePageChangesImmediate,
        createPage
    }), [userPages, currentPageLinks, isLoading, error, fetchUserPages, debouncedSave, savePageChangesImmediate, createPage]);

    return (
        <LinkContext.Provider value={contextValue}>
            {children}
        </LinkContext.Provider>
    );
};