import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { LinkContext } from '../../context/LinkContext';
import styles from './CreatePage.module.css';

const CreatePage = () => {
    const [pageTitle, setPageTitle] = useState('');
    const [pageURL, setPageURL] = useState('');
    const [error, setError] = useState('');
    const { createPage } = useContext(LinkContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!pageTitle || !pageURL) {
            setError('Please fill in all fields');
            return;
        }

        // Basic URL validation - alphanumeric and hyphens only
        if (!/^[a-zA-Z0-9-]+$/.test(pageURL)) {
            setError('URL can only contain letters, numbers, and hyphens');
            return;
        }

        try {
            await createPage(pageTitle, pageURL);
            navigate('/profile');
        } catch (err) {
            setError(err.message || 'Failed to create page');
        }
    };

    return (
        <div className={styles.createPageContainer}>
            <h1>Create New Page</h1>
            <form onSubmit={handleSubmit} className={styles.form}>
                {error && <div className={styles.error}>{error}</div>}
                <div className={styles.formGroup}>
                    <label htmlFor="pageTitle">Page Title</label>
                    <input
                        type="text"
                        id="pageTitle"
                        value={pageTitle}
                        onChange={(e) => setPageTitle(e.target.value)}
                        placeholder="My Awesome Links"
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="pageURL">Page URL</label>
                    <div className={styles.urlInput}>
                        <span>linx.pcotandy.org/</span>
                        <input
                            type="text"
                            id="pageURL"
                            value={pageURL}
                            onChange={(e) => setPageURL(e.target.value)}
                            placeholder="my-links"
                        />
                    </div>
                </div>
                <button type="submit" className={styles.submitButton}>
                    Create Page
                </button>
            </form>
        </div>
    );
};

export default CreatePage; 