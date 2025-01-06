import { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LinkContext } from '../../context/LinkContext';
import { SlimeSimulation } from 'slime-simulation';
import styles from './index.module.css';

const Profile = () => {
    const { userPages, setCurrentPageLinks, getLinksFromPage, setUserPages } = useContext(LinkContext);
    const navigate = useNavigate();
    const [transitionToggle, setTransitionToggle] = useState(false);

    const handlePageClick = async (pageURL) => {
        const links = await getLinksFromPage(pageURL);
        setCurrentPageLinks(links);
        navigate(`/${pageURL}/edit`);
    };

    const canvasRef = useRef(null);
    const simulationRef = useRef(null);

    // Add debounced resize handler
    const resizeTimeoutRef = useRef(null);

    function toggleTransition() {
        if (transitionToggle) {
            simulationRef.current.startTransition({
                neighborThreshold: 0.6,
                speed: 0.3,
            });
            console.log('transition 1');
        } else {
            simulationRef.current.startTransition({
                secondaryColor: [0.2, .0, 0.0, 1.],
                baseColor: [0.8, 0.2, 0.91],
                duration: 800,
                neighborThreshold: 0.99,
                noiseFactor: 0.0,
                roughness: 0.2,
                metalness: 1.0,
                speed: 0.2,
            });
        }
        setTransitionToggle(!transitionToggle);
    }

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
    
        // Debounced resize handler
        const updateCanvasSize = () => {
            if (resizeTimeoutRef.current) {
                clearTimeout(resizeTimeoutRef.current);
            }
            
            resizeTimeoutRef.current = setTimeout(() => {
                const pixelRatio = Math.min(window.devicePixelRatio || 1, 2); // Cap pixel ratio
                const width = window.innerWidth;
                const height = window.innerHeight;
                
                canvas.width = width * pixelRatio;
                canvas.height = height * pixelRatio;
                canvas.style.width = `${width}px`;
                canvas.style.height = `${height}px`;

                if (simulationRef.current) {
                    initSimulation();
                }
            }, 250); // Wait 250ms after last resize event
        };
    
        // Initialize slime simulation
        const initSimulation = () => {
            if (simulationRef.current) {
                simulationRef.current.destroy?.();
            }
            
            simulationRef.current = new SlimeSimulation({
                canvas: canvas,
                slimeType: 'original',
                baseColor: [0.8, 0.2, 0.1]
            });
        };

        updateCanvasSize();
        window.addEventListener('resize', updateCanvasSize);
        
        // Start simulation
        initSimulation();

        window.addEventListener('keydown', (event) => {
            if (event.key === 'r') {
                simulationRef.current.startTransition({
                    neighborThreshold: 0.6,
                    speed: 0.3,
                });
            }

            if (event.key === 't') {
                simulationRef.current.startTransition({
                    secondaryColor: [0.2, .0, 0.0, 1.],
                    baseColor: [0.8, 0.2, 0.91],
                    duration: 800,
                    neighborThreshold: 0.99,
                    noiseFactor: 0.0,
                    roughness: 0.2,
                    metalness: 1.0,
                    speed: 0.2,
                });
            }
        });
    
        return () => {
            window.removeEventListener('resize', updateCanvasSize);
            if (simulationRef.current) {
                simulationRef.current.destroy?.();
                simulationRef.current = null;
            }
        };
    }, []);

    const handleDelete = async (pageURL, e) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this page?')) {
            try {
                const response = await fetch(`http://localhost:3000/api/pages/${pageURL}`, {
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

    const renderPageCard = ({ pageURL, pageTitle }) => {

        return (
            <div key={pageURL} className={styles.pageCardWrapper}>
                <div key={pageURL} className={styles.pageCard}>
                    <h2 className={styles.pageTitle}>{pageTitle}</h2>
                    <div className={styles.pageURL}>
                    linx.pcotandy.org/{pageURL}
                </div>
                <div className={styles.cardActions}>
                    <button 
                        className={styles.editButton}
                        onClick={() => handlePageClick(pageURL)}
                    >
                        Edit
                    </button>
                    <a 
                        href={`/${pageURL}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={styles.viewButton}
                    >
                        View
                    </a>
                    <button 
                        className={styles.deleteButton}
                        onClick={(e) => handleDelete(pageURL, e)}
                    >
                        Delete
                    </button>
                </div>
            </div>
            </div>
        );
    };

    return (
        <>
            <canvas ref={canvasRef} className={styles.slimeCanvas} id="canvas" />
            <div className={styles.pageHeader}>
                <div className={styles.headerContent}>
                    <h1 className={styles.headerTitle}>My Pages</h1>
                    <div className={styles.headerActions}>
                        <ul className={styles.navLinks}>
                            <li><a href="/dashboard">Directory</a></li>
                            <li><a href="/settings">Templates</a></li>
                        </ul>
                        <a href="/create" className={styles.createButton}>
                            + Create New Page
                        </a>
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