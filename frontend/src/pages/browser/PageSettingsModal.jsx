import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { LinkContext } from '../../context/LinkContext';
import styles from './index.module.css';

export const PageSettingsModal = ({ template, onClose }) => {
    const [pageTitle, setPageTitle] = useState('');
    const [pageURL, setPageURL] = useState('');
    const navigate = useNavigate();
    const { user } = useAuth();
    const { setUserPages } = useContext(LinkContext);
    
    const createPage = async () => {
        if (user) {
            try {
                const response = await axios.post('/api/pages', {
                    pageTitle,
                    pageURL,
                    style: template.name
                }, {
                    withCredentials: true
                });
                if (response.status === 200) {
                    setUserPages(prevPages => [...prevPages, {
                        pageTitle,
                        pageURL,
                        style: template.name
                    }]);
                    navigate(`/${pageURL}/edit`);
                }
            } catch (error) {
                console.error('Failed to create page:', error);
            }
        } else {
            console.error('User is not authenticated');
        }
    };

    return (
        <>
            <div className={styles.modalOverlay} onClick={onClose} />
            <div className={styles.pageSettingsModal}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>Page Settings</h2>
                    <button className={styles.closeButton} onClick={onClose}>×</button>
                </div>
                <input
                    type="text"
                    className={styles.modalInput}
                    placeholder="Page Title"
                    value={pageTitle}
                    onChange={(e) => setPageTitle(e.target.value)}
                />
                <input
                    type="text"
                    className={styles.modalInput}
                    placeholder="Page URL"
                    value={pageURL}
                    onChange={(e) => setPageURL(e.target.value)}
                />
                <div className={styles.modalButtons}>
                    <button className={styles.modalButton} onClick={onClose}>Cancel</button>
                    <button className={styles.modalButton} onClick={createPage}>Create Page</button>
                </div>
            </div>
        </>
    );
};
