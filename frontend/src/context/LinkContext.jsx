import { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import debounce from 'lodash.debounce';

export const LinkContext = createContext();

const API_URL = 'http://localhost:3000/api';

export const LinkProvider = ({ children }) => {
    const [userPages, setUserPages] = useState([]);
    const [currentPageLinks, setCurrentPageLinks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    const fetchUserPages = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/get-user-links`, {
                credentials: 'include',
                validateStatus: status => status === 200 || status === 401
            });
            
            if (response.ok) {
                const data = await response.json();
                setUserPages(data);
            } else {
                setUserPages([]);
            }
        } catch (error) {
            if (!error.response || error.response.status !== 401) {
                console.error('Error fetching pages:', error);
            }
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
            const response = await axios.get(`${API_URL}/get-page-links/${pageURL}`, {
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
                `${API_URL}/pages/${pageURL}`,
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
                `${API_URL}/pages/${pageURL}`,
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
        savePageChangesImmediate
    }), [userPages, currentPageLinks, isLoading, error, fetchUserPages, debouncedSave]);

    return (
        <LinkContext.Provider value={contextValue}>
            {children}
        </LinkContext.Provider>
    );
};