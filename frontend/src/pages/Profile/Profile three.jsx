import { useContext, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry';
import { LinkContext } from '../../context/LinkContext';
import { SlimeSimulation } from 'slime-simulation';
import styles from './index.module.css';
import * as THREE from 'three';

const Profile = () => {
    const { userPages, setCurrentPageLinks, getLinksFromPage, setUserPages } = useContext(LinkContext);
    const navigate = useNavigate();

    const handlePageClick = async (pageURL) => {
        const links = await getLinksFromPage(pageURL);
        setCurrentPageLinks(links);
        navigate(`/${pageURL}/edit`);
    };

    const canvasRef = useRef(null);
    const simulationRef = useRef(null);

    // Add debounced resize handler
    const resizeTimeoutRef = useRef(null);

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
                slimeType: 'modern',
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
                    baseColor: [0.8, 0.411, 0.1],
                    secondaryColor: [0.2, .0, 0.0, 1.],
                    noiseFactor: 0.0,
                    roughness: 0.2,
                    metalness: 1.0,
                    duration: 800,
                    neighborThreshold: 0.2,
                });
            }

            if (event.key === 't') {
                simulationRef.current.startTransition({
                    baseColor: [0.8, 0.2, 0.91],
                    duration: 800,
                    neighborThreshold: 0.99,
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

    const createCube = (canvas) => {
        const renderer = new THREE.WebGLRenderer({
            canvas,
            alpha: true,
            antialias: true,
            powerPreference: "low-power"
        });
        renderer.setSize(1080, 1080, false);
        
        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
        camera.position.z = 2;

        const cubeSize = 0.4;
        const octahedronSize = 0.9;

        // Create a simple environment map
        const envTexture = new THREE.CubeTextureLoader().load([
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==',
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==',
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==',
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==',
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==',
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg=='
        ]);
        scene.environment = envTexture;

        // Reuse geometries and materials
        if (!window.sharedGeometry) {
            window.sharedGeometry = new RoundedBoxGeometry(cubeSize, cubeSize, cubeSize, 16, 0.05);
            window.sharedMaterial = new THREE.MeshPhysicalMaterial({
                color: 0xff00ea,
                metalness: 0.8,
                roughness: 0.1,
                clearcoat: 1,
                clearcoatRoughness: 0.1,
            });
            
            // Create diamond-like geometry
            window.outerDiamondGeometry = new THREE.OctahedronGeometry(octahedronSize, 0);
            window.innerDiamondGeometry = new THREE.OctahedronGeometry(octahedronSize - 0.03, 0);
            
            // Crystal-like material
            window.crystalMaterial = new THREE.MeshPhysicalMaterial({
                color: 0xffffff,
                metalness: 0.2,
                roughness: 0,
                transmission: 0.95,
                thickness: 0.5,
                envMapIntensity: 3,
                clearcoat: 1,
                clearcoatRoughness: 0,
                ior: 2.4, // Higher IOR for more dramatic refraction
                transparent: true,
                opacity: 0.3,
            });
            
            // Inner crystal material
            window.innerCrystalMaterial = new THREE.MeshPhysicalMaterial({
                color: 0xffffff,
                metalness: 0.1,
                roughness: 0,
                transmission: 0.95,
                thickness: 0.2,
                envMapIntensity: 2,
                clearcoat: 1,
                clearcoatRoughness: 0,
                ior: 2.2,
                transparent: true,
                opacity: 0.2,
            });
        }
        
        const cube = new THREE.Mesh(window.sharedGeometry, window.sharedMaterial);
        const outerDiamond = new THREE.Mesh(window.outerDiamondGeometry, window.crystalMaterial);
        const innerDiamond = new THREE.Mesh(window.innerDiamondGeometry, window.innerCrystalMaterial);
        
        // Rotate the diamonds to a more interesting initial position
        outerDiamond.rotation.x = Math.PI / 6;
        outerDiamond.rotation.y = Math.PI / 4;
        innerDiamond.rotation.x = Math.PI / 6;
        innerDiamond.rotation.y = Math.PI / 4;
        
        scene.add(cube);
        scene.add(innerDiamond);
        scene.add(outerDiamond);

        // Add multiple lights for better crystal effect
        const mainLight = new THREE.DirectionalLight(0xffffff, 1);
        mainLight.position.set(1, 1, 2);
        
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
        fillLight.position.set(-1, -1, -2);
        
        const topLight = new THREE.DirectionalLight(0xffffff, 0.3);
        topLight.position.set(0, 2, 0);
        
        scene.add(mainLight);
        scene.add(fillLight);
        scene.add(topLight);
        scene.add(new THREE.AmbientLight(0x909090, 0.5));

        cube.rotation.x = Math.PI / 4;
        cube.rotation.y = Math.PI / 4;

        let animationFrameId;
        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            
            // Rotate cube
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;
            
            // Rotate diamonds in different directions
            outerDiamond.rotation.y += 0.005;
            outerDiamond.rotation.x += 0.003;
            innerDiamond.rotation.y -= 0.003;
            innerDiamond.rotation.x -= 0.002;
            
            renderer.render(scene, camera);
        };
        
        animate();

        return () => {
            cancelAnimationFrame(animationFrameId);
            scene.remove(cube);
            scene.remove(outerDiamond);
            scene.remove(innerDiamond);
            renderer.dispose();
        };
    };

    const renderPageCard = ({ pageURL, pageTitle }) => {
        const topCubeRef = useRef(null);
        const bottomCubeRef = useRef(null);

        useEffect(() => {
            if (topCubeRef.current && bottomCubeRef.current) {
                const cleanupTop = createCube(topCubeRef.current);
                const cleanupBottom = createCube(bottomCubeRef.current);
                return () => {
                    cleanupTop();
                    cleanupBottom();
                };
            }
        }, []);

        return (
            <div key={pageURL} className={styles.pageCardWrapper}>
                 <canvas ref={topCubeRef} className={styles.topCube} />
                 <canvas ref={bottomCubeRef} className={styles.bottomCube} />
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
            <div className={styles.profileContainer}>
                <div className={styles.header}>
                    <h1>Your Pages</h1>
                <Link to="/create" className={styles.createButton}>
                    + Create New Page
                </Link>
            </div>

            {userPages.length > 0 ? (
                <div className={styles.pagesGrid}>
                    {userPages.map(renderPageCard)}
                </div>
            ) : (
                <div className={styles.emptyState}>
                    <h2>No pages yet</h2>
                    <p>Create your first page to get started!</p>
                </div>
            )}
        </div>
        </>
    );
};

export default Profile;