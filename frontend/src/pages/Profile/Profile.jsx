import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { LinkContext } from '../../context/LinkContext';
import styles from './index.module.css';
import AeroButton from '../../components/common/AeroButton/AeroButton';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
    const { userPages, setCurrentPageLinks, getLinksFromPage, setUserPages } = useContext(LinkContext);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handlePageClick = async (pageURL) => {
        const links = await getLinksFromPage(pageURL);
        setCurrentPageLinks(links);
        navigate(`/${pageURL}/edit`);
    };

    const handleDelete = async (pageURL, e) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this page?')) {
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
        }
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
                            <a href="/create" className={styles.createButton}>
                                + Create New Page
                            </a>
                            <button 
                                className={styles.signOutButton}
                                onClick={handleSignOut}
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className={styles.profileContainer}>
                <div className={styles.pagesGrid}>
                    {userPages.length > 0 ? (
                        userPages.map(renderPageCard)
                    ) : (
                        <div className={styles.emptyState}>
                            <h2>No pages yet</h2>
                            <p>Create your first page to get started!</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Profile;