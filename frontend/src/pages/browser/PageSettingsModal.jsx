import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { LinkContext } from '../../context/LinkContext';
import logo from './assets/logo.ico';
import styles from './index.module.css';

export const PageSettingsModal = ({ template, onClose }) => {
    const [pageTitle, setPageTitle] = useState('');
    const [pageURL, setPageURL] = useState('');
    const [showAuthPrompt, setShowAuthPrompt] = useState(false);
    const [validationError, setValidationError] = useState('');
    const [urlStatus, setUrlStatus] = useState({ isAvailable: false, isChecking: false });
    const navigate = useNavigate();
    const { user } = useAuth();
    const { setUserPages } = useContext(LinkContext);
    
    const validateInputs = () => {
        if (!pageTitle.trim() || !pageURL.trim()) {
            setValidationError('Title and URL are required');
            return false;
        }

        // Basic URL validation - alphanumeric, hyphens, and underscores only
        const urlPattern = /^[a-zA-Z0-9-_]+$/;
        if (!urlPattern.test(pageURL)) {
            setValidationError('URL can only contain letters, numbers, hyphens, and underscores');
            return false;
        }

        setValidationError('');
        return true;
    };

    const checkURL = async (newUrl) => {
        if (!newUrl) return;
        
        setUrlStatus(prev => ({ ...prev, isChecking: true }));
        try {
            const response = await axios.get(`/api/check-pageURL?name=${newUrl}`);
            setUrlStatus({ isAvailable: !response.data.exists, isChecking: false });
        } catch (error) {
            console.error('Error checking URL:', error);
            setUrlStatus({ isAvailable: false, isChecking: false });
        }
    };

    const handleURLChange = (e) => {
        const newUrl = e.target.value;
        setPageURL(newUrl);
        
        if (!newUrl) {
            setValidationError('');
            setUrlStatus({ isAvailable: false, isChecking: false });
            return;
        }
        
        const urlPattern = /^[a-zA-Z0-9-_]+$/;
        if (!urlPattern.test(newUrl)) {
            setValidationError('URL can only contain letters, numbers, hyphens, and underscores');
            setUrlStatus({ isAvailable: false, isChecking: false });
        } else {
            setValidationError('');
            checkURL(newUrl);
        }
    };

    const createPage = async () => {
        if (!validateInputs() || !urlStatus.isAvailable) {
            return;
        }

        if (!user) {
            setShowAuthPrompt(true);
            localStorage.setItem('pendingPage', JSON.stringify({
                template: template,
                pageTitle,
                pageURL
            }));
            return;
        }

        try {
            const response = await axios.post('/api/pages', {
                pageTitle,
                pageURL,
                style: template
            }, {
                withCredentials: true
            });
            if (response.status === 200) {
                setUserPages(prevPages => [...prevPages, {
                    pageTitle,
                    pageURL,
                    style: template
                }]);
                navigate(`/${pageURL}/edit`, { 
                    state: { transition: true }
                });
            }
        } catch (error) {
            console.error('Failed to create page:', error);
        }
    };

    return (
        <>
            <div className={styles.modalOverlay} onClick={onClose} />
            <div className={styles.pageSettingsModal}>
                {!showAuthPrompt ? (
                    <>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>Page Settings</h2>
                            <button className={styles.closeButton} onClick={onClose}>×</button>
                        </div>
                        {validationError && (
                            <div className={styles.errorMessage}>
                                {validationError}
                            </div>
                        )}
                        <input
                            type="text"
                            className={styles.modalInput}
                            placeholder="Page Title"
                            value={pageTitle}
                            onChange={(e) => setPageTitle(e.target.value)}
                        />
                            <div className={styles.urlPrefix}>
                                https://links.pcotandy.org/<span className={styles.urlPrefixInput}>{pageURL}</span>
                            </div>
                        <div className={styles.urlInputWrapper}>
                            <input
                                type="text"
                                className={`${styles.modalInput} ${styles.urlInput}`}
                                placeholder="your-page-url"
                                value={pageURL}
                                onChange={handleURLChange}
                            />
                            {pageURL && !validationError && (
                                <span className={`${styles.urlStatus} ${
                                    urlStatus.isChecking ? styles.checking :
                                    urlStatus.isAvailable ? styles.available : styles.unavailable
                                }`}>
                                    {urlStatus.isChecking ? 'Checking...' : 
                                     urlStatus.isAvailable ? '✓ Available' : '✗ URL taken'}
                                </span>
                            )}
                        </div>
                        <div className={styles.modalButtons}>
                            <button className={styles.modalButton} onClick={onClose}>Cancel</button>
                            <button 
                                className={styles.modalButton} 
                                onClick={createPage}
                                disabled={!urlStatus.isAvailable || !!validationError || !pageTitle.trim()}
                            >
                                Create Page
                            </button>
                        </div>
                    </>
                ) : (
                    <div className={styles.authPrompt}>
                        <button className={styles.closeButton} onClick={onClose}>×</button>
                        <h3><img src={logo} width={20} alt="logo" className={styles.logo} />Sign in Required<img src={logo} width={20} alt="logo" className={styles.logo} /></h3>
                        <p className={styles.authPromptText}>Sign in to create your page. Your page settings will be saved.</p>
                        <span className={styles.authPromptWelcome}>Welcome to the People's Coalition of Tandy.</span>
                        <div className={styles.authButtons}>
                            <button 
                                className={styles.loginButton}
                                onClick={() => navigate('/login', { 
                                    state: { returnTo: '/browser' }
                                })}
                            >
                                Sign In
                            </button>
                            <button 
                                className={styles.registerButton}
                                onClick={() => navigate('/register', { 
                                    state: { returnTo: '/browser' }
                                })}
                            >
                                Create Account
                            </button>
                        </div>
                        <button 
                            className={styles.cancelButton}
                            onClick={() => setShowAuthPrompt(false)}
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};
