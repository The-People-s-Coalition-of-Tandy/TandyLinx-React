import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LinkContext } from '../../context/LinkContext';
import styles from './index.module.css';
import AeroButton from '../../components/common/AeroButton/AeroButton';
import { useAuth } from '../../context/AuthContext';
import { useEffect } from 'react';
import DeleteConfirmModal from '../../components/Editor/DeleteConfirmModal/DeleteConfirmModal';

const Profile = () => {
    const { userPages, setCurrentPageLinks, getLinksFromPage, setUserPages } = useContext(LinkContext);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [deleteModalState, setDeleteModalState] = useState({ isOpen: false, pageURL: null });

    const themeChangeEvent = new CustomEvent('themeChange', {
        detail: { theme: 'sunset' }
    });

    useEffect(() => {
        window.dispatchEvent(themeChangeEvent);
    }, []);

    const handlePageClick = async (pageURL) => {
        const links = await getLinksFromPage(pageURL);
        setCurrentPageLinks(links);
        navigate(`/${pageURL}/edit`);
    };

    const handleDelete = async (pageURL, e) => {
        e.stopPropagation();
        setDeleteModalState({ isOpen: true, pageURL });
    };

    const handleDeleteConfirm = async () => {
        const pageURL = deleteModalState.pageURL;
        try {
            const response = await fetch(`/api/pages/${pageURL}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to delete page');
            }

            // Remove the page from the local state
            setUserPages(prev => prev.filter(page => page.pageURL !== pageURL));
        } catch (err) {
            console.error('Error deleting page:', err);
            alert('Failed to delete page');
        }
        setDeleteModalState({ isOpen: false, pageURL: null });
    };

    const handleSignOut = async () => {
        await logout();
        navigate('/login');
    };

    const renderPageCard = ({ pageURL, pageTitle }) => {
        return (
                <div key={pageURL} className={styles.pageCard}>
                    <h2 className={styles.pageTitle}>{pageTitle}</h2>
                    <div className={styles.pageURL}>
                    linx.pcotandy.org/{pageURL}
                </div>
                <div className={styles.cardActions}>
                   <AeroButton color="blue" onClick={() => handlePageClick(pageURL)}>Edit</AeroButton>
                    <AeroButton color="green" onClick={() => window.open(`/${pageURL}`, '_blank')}>View</AeroButton>
                    <AeroButton color="red" onClick={(e) => handleDelete(pageURL, e)}>Delete</AeroButton>
                </div>
            </div>
        );
    };

    return (
        <>
            <div className={styles.pageHeader}>
                <div className={styles.headerContent}>
                    <div className={styles.headerLeft}>
                        <h1 className={styles.headerTitle}>Hello, <span className={styles.username}>{user.username}</span></h1>
                        <p className={styles.headerSubtitle}>Manage your pages and templates</p>
                    </div>
                    <div className={styles.headerRight}>
                        <div className={styles.headerButtons}>
                            <AeroButton color="blue" onClick={() => navigate('/browser')}>
                                + Create New Page
                            </AeroButton>
                            <AeroButton 
                                color="red"
                                onClick={handleSignOut}
                            >
                                Sign Out
                            </AeroButton>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className={styles.profileContainer}>
                <div className={styles.pagesGrid}>
                    {userPages.length > 0 ? (
                        userPages.map(renderPageCard)
                    ) : (
                        <div className={styles.pageCardWrapper}>
                            <div className={styles.pageCard}>
                                <div className={styles.emptyStateContent}>
                                    <h2 className={styles.pageTitle}>Create Your First Page</h2>
                                    <div className={styles.pageURL}>
                                        linx.pcotandy.org/your-page
                                    </div>
                                    <div className={styles.cardActions}>
                                        <AeroButton color="blue" onClick={() => navigate('/browser')}>
                                            + Create New Page
                                        </AeroButton>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <DeleteConfirmModal 
                isOpen={deleteModalState.isOpen}
                onClose={() => setDeleteModalState({ isOpen: false, pageURL: null })}
                onConfirm={handleDeleteConfirm}
                message="Delete this page?"
            />
        </>
    );
};

export default Profile;