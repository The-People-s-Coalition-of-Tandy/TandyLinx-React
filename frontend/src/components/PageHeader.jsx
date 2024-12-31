import React, { useState, useContext, useEffect } from 'react';
import { LinkContext } from '../context/LinkContext';
import axios from 'axios';
import './PageHeader.css';

const PageHeader = ({ currentPageURL, initialTitle }) => {
    const [title, setTitle] = useState('');
    const [newURL, setNewURL] = useState(currentPageURL);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isEditingURL, setIsEditingURL] = useState(false);
    const [isURLAvailable, setIsURLAvailable] = useState(true);
    const [isChecking, setIsChecking] = useState(false);
    const { savePageChangesImmediate } = useContext(LinkContext);

    useEffect(() => {
        if (initialTitle) {
            setTitle(initialTitle);
        }
    }, [initialTitle]);

    useEffect(() => {
        const checkURL = async () => {
            if (newURL === currentPageURL) {
                setIsURLAvailable(true);
                return;
            }

            setIsChecking(true);
            try {
                const response = await axios.get(`http://localhost:3000/api/check-pageURL?name=${newURL}`, {
                    withCredentials: true
                });
                setIsURLAvailable(!response.data.exists);
            } catch (error) {
                console.error('Error checking URL availability:', error);
            } finally {
                setIsChecking(false);
            }
        };

        const timeoutId = setTimeout(checkURL, 500);
        return () => clearTimeout(timeoutId);
    }, [newURL, currentPageURL]);

    const handleSaveTitle = async () => {
        try {
            await savePageChangesImmediate(currentPageURL, { pageTitle: title });
            setIsEditingTitle(false);
        } catch (error) {
            console.error('Error saving title:', error);
        }
    };

    const handleSaveURL = async () => {
        // If URL is taken or hasn't changed, revert to original
        if (!isURLAvailable || newURL === currentPageURL) {
            setNewURL(currentPageURL);
            setIsEditingURL(false);
            return;
        }

        try {
            await savePageChangesImmediate(currentPageURL, { newPageURL: newURL });
            window.location.href = `/${newURL}/edit`; // Redirect to new URL
        } catch (error) {
            console.error('Error saving URL:', error);
            // Revert to original URL on error
            setNewURL(currentPageURL);
            setIsEditingURL(false);
        }
    };

    const handleURLBlur = () => {
        if (!isURLAvailable) {
            setNewURL(currentPageURL);
        }
        handleSaveURL();
    };

    return (
        <div className="page-header">
            <div className="header-field">
                <div className="field-label">Title:</div>
                {isEditingTitle ? (
                    <div className="edit-field">
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onBlur={handleSaveTitle}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                            autoFocus
                        />
                    </div>
                ) : (
                    <div className="display-field" onClick={() => setIsEditingTitle(true)}>
                        {title || 'Click to add title'}
                        <button className="edit-button">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            <div className="header-field">
                <div className="field-label">URL:</div>
                {isEditingURL ? (
                    <div className="edit-field">
                        <input
                            type="text"
                            value={newURL}
                            onChange={(e) => setNewURL(e.target.value)}
                            onBlur={handleURLBlur}
                            onKeyDown={(e) => e.key === 'Enter' && handleURLBlur()}
                            autoFocus
                            className={isChecking ? 'checking' : isURLAvailable ? 'available' : 'unavailable'}
                        />
                        <div className="url-status">
                            {isChecking ? 'Checking...' : 
                             isURLAvailable ? '✓ Available' : '✗ Already taken'}
                        </div>
                    </div>
                ) : (
                    <div className="display-field" onClick={() => setIsEditingURL(true)}>
                        {currentPageURL}
                        <button className="edit-button">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                            </svg>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PageHeader; 