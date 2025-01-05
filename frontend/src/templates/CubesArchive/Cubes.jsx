import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry';
import TWEEN from '@tweenjs/tween.js';
import styles from './Cubes.module.css';

export default function Cubes({ pageTitle = "Your Name", links = [] }) {
    const containerRef = useRef(null);
    const sceneRef = useRef(null);
    const rendererRef = useRef(null);
    const animationFrameRef = useRef(null);
    const worldRef = useRef(null);
    const cubesRef = useRef([]);
    const cubeBodiesRef = useRef([]);
    const [hoveredBody, setHoveredBody] = useState(null);
    const [selectedCube, setSelectedCube] = useState(null);
    const [selectedBody, setSelectedBody] = useState(null);
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        if (!containerRef.current) return;

        // Scene setup
        const scene = new THREE.Scene();
        sceneRef.current = scene;
        
        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 35, 0);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true
        });
        rendererRef.current = renderer;
        
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.0;
        containerRef.current.appendChild(renderer.domElement);

        // Environment map setup
        const cubeTextureLoader = new THREE.CubeTextureLoader();
        const environmentMap = cubeTextureLoader
            .setPath('https://threejs.org/examples/textures/cube/SwedishRoyalCastle/')
            .load([
                'px.jpg', 'nx.jpg',
                'py.jpg', 'ny.jpg',
                'pz.jpg', 'nz.jpg'
            ]);
        
        scene.environment = environmentMap;
        scene.background = null;

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffffff, 2.0);
        pointLight.position.set(10, 20, 10);
        pointLight.castShadow = true;
        pointLight.shadow.mapSize.width = 2048;
        pointLight.shadow.mapSize.height = 2048;
        scene.add(pointLight);

        const rimLight = new THREE.PointLight(0xffffff, 1.5);
        rimLight.position.set(-15, 5, -15);
        scene.add(rimLight);

        // Ground
        const groundGeometry = new THREE.PlaneGeometry(60, 60);
        const groundMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x000000,
            roughness: 0.5,
            metalness: 0.3,
            envMapIntensity: 0.4,
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        scene.add(ground);

        // Physics world
        const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.82, 0) });
        worldRef.current = world;

        // Ground physics
        const groundBody = new CANNON.Body({
            mass: 0,
            shape: new CANNON.Plane(),
        });
        groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
        world.addBody(groundBody);

        // Create walls
        const createWall = (width, height, depth, x, y, z, rotation = 0) => {
            const wallShape = new CANNON.Box(new CANNON.Vec3(width/2, height/2, depth/2));
            const wallBody = new CANNON.Body({
                mass: 0,
                shape: wallShape,
            });
            wallBody.position.set(x, y, z);
            wallBody.quaternion.setFromEuler(0, rotation, 0);
            world.addBody(wallBody);
        };

        // Add walls
        const wallThickness = 0.5;
        const wallHeight = 10;
        const areaSize = 15;

        createWall(30, wallHeight, wallThickness, 0, wallHeight/2, -areaSize);
        createWall(30, wallHeight, wallThickness, 0, wallHeight/2, areaSize);
        createWall(30, wallHeight, wallThickness, -areaSize, wallHeight/2, 0, Math.PI/2);
        createWall(30, wallHeight, wallThickness, areaSize, wallHeight/2, 0, Math.PI/2);

        // Create cubes
        const createCube = (x, y, z, linkData) => {
            const cubeSize = 5;
            const geometry = new RoundedBoxGeometry(cubeSize, cubeSize, cubeSize, 16, 0.5);
            const material = new THREE.MeshPhysicalMaterial({
                color: 0xF010D4,
                metalness: 0.8,
                roughness: 0.1,
                envMapIntensity: 1.5,
                clearcoat: 1.0,
                clearcoatRoughness: 0.1,
                reflectivity: 1.0,
                ior: 2.0,
                specularIntensity: 1.0,
                specularColor: 0xffffff
            });

            const cube = new THREE.Mesh(geometry, material);
            cube.castShadow = true;
            cube.receiveShadow = true;
            cube.position.set(x, y, z);
            cube.userData.link = linkData;
            scene.add(cube);
            cubesRef.current.push(cube);

            const shape = new CANNON.Box(new CANNON.Vec3(cubeSize/2, cubeSize/2, cubeSize/2));
            const body = new CANNON.Body({ 
                mass: 1,
                shape: shape,
                linearDamping: 0.3,
                angularDamping: 0.9
            });
            body.position.set(x, y, z);
            world.addBody(body);
            cubeBodiesRef.current.push(body);
        };

        // Create cube grid
        const createCubesGrid = () => {
            const isMobile = window.innerWidth <= 768;
            const cubesPerRow = Math.ceil(Math.sqrt(links.length));
            const spacing = isMobile ? 8 : 10;
            const startX = -(cubesPerRow - 1) * spacing / 2;
            const startZ = startX;

            links.forEach((link, index) => {
                const row = Math.floor(index / cubesPerRow);
                const col = index % cubesPerRow;
                const x = startX + col * spacing;
                const z = startZ + row * spacing;
                createCube(
                    x,
                    isMobile ? 12 : 15,
                    z,
                    link
                );
            });
        };

        createCubesGrid();

        // Raycaster setup
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        // Interaction handlers
        const handleInteraction = (event) => {
            const coords = event.type.includes('touch') 
                ? { x: event.touches[0].clientX, y: event.touches[0].clientY }
                : { x: event.clientX, y: event.clientY };

            mouse.x = (coords.x / window.innerWidth) * 2 - 1;
            mouse.y = -(coords.y / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(cubesRef.current);

            if (intersects.length > 0) {
                const intersectedCube = intersects[0].object;
                const cubeIndex = cubesRef.current.indexOf(intersectedCube);
                const body = cubeBodiesRef.current[cubeIndex];
                setHoveredBody(body);

                // Apply force
                body.angularVelocity.scale(0.5);
                const force = new CANNON.Vec3(
                    mouse.x * 15,
                    25,
                    -mouse.y * 15
                );
                const point = new CANNON.Vec3(
                    body.position.x + intersects[0].point.x * 0.05,
                    body.position.y + intersects[0].point.y * 0.05,
                    body.position.z + intersects[0].point.z * 0.05
                );
                body.applyForce(force, point);
            } else {
                setHoveredBody(null);
            }
        };

        const handleClick = (event) => {
            const coords = event.type === 'touchend'
                ? { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY }
                : { x: event.clientX, y: event.clientY };

            mouse.x = (coords.x / window.innerWidth) * 2 - 1;
            mouse.y = -(coords.y / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(cubesRef.current);

            if (intersects.length > 0) {
                const intersectedCube = intersects[0].object;
                const cubeIndex = cubesRef.current.indexOf(intersectedCube);

                if (selectedCube === intersectedCube) {
                    window.open(intersectedCube.userData.link.url, '_blank');
                } else {
                    if (selectedCube) {
                        deselectCube();
                    }

                    setSelectedCube(intersectedCube);
                    setSelectedBody(cubeBodiesRef.current[cubeIndex]);
                    setIsTransitioning(true);

                    // Show details panel with animation
                    const detailsPanel = document.querySelector(`.${styles.detailsPanel}`);
                    if (detailsPanel) {
                        detailsPanel.style.opacity = '1';
                        detailsPanel.style.pointerEvents = 'auto';
                    }

                    const targetY = 20;
                    cubeBodiesRef.current[cubeIndex].type = CANNON.Body.KINEMATIC;

                    new TWEEN.Tween(cubeBodiesRef.current[cubeIndex].position)
                        .to({ x: 0, y: targetY, z: 0 }, 1000)
                        .easing(TWEEN.Easing.Quadratic.Out)
                        .onComplete(() => setIsTransitioning(false))
                        .start();
                }
            } else if (!intersects.length && selectedCube) {
                deselectCube();
            }
        };

        const deselectCube = () => {
            if (selectedCube && selectedBody) {
                // Hide details panel
                const detailsPanel = document.querySelector(`.${styles.detailsPanel}`);
                if (detailsPanel) {
                    detailsPanel.style.opacity = '0';
                    detailsPanel.style.pointerEvents = 'none';
                }

                selectedBody.type = CANNON.Body.DYNAMIC;

                new TWEEN.Tween(selectedBody.position)
                    .to({ y: 15 }, 800)
                    .easing(TWEEN.Easing.Quadratic.In)
                    .onComplete(() => {
                        setSelectedCube(null);
                        setSelectedBody(null);
                    })
                    .start();
            }
        };

        // Animation loop
        const animate = () => {
            animationFrameRef.current = requestAnimationFrame(animate);
            TWEEN.update();

            world.step(1 / 60);
            const time = Date.now() * 0.001;

            cubesRef.current.forEach((cube, i) => {
                const body = cubeBodiesRef.current[i];

                if (body === selectedBody && !isTransitioning) {
                    body.position.x = 0;
                    body.position.z = 0;
                    body.velocity.setZero();
                    body.angularVelocity.setZero();
                }

                cube.position.copy(body.position);
                cube.quaternion.copy(body.quaternion);

                if (body !== selectedBody && !isTransitioning) {
                    const floatOffset = Math.sin(time + i) * 0.1;
                    cube.rotation.x += 0.001;
                    cube.rotation.z += 0.001;
                    body.position.y += floatOffset * 0.01;
                }

                if (body === selectedBody) {
                    cube.material.emissive.setHex(0x440044);
                    cube.material.emissiveIntensity = 0.4;
                    cube.rotation.y += 0.02;
                } else if (body === hoveredBody) {
                    cube.material.emissive.setHex(0x220022);
                    cube.material.emissiveIntensity = 0.2;
                } else {
                    cube.material.emissive.setHex(0x000000);
                    cube.material.emissiveIntensity = 0;
                }
            });

            renderer.render(scene, camera);
        };

        animate();

        // Event listeners
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        document.addEventListener('mousemove', handleInteraction);
        document.addEventListener('touchmove', handleInteraction, { passive: false });
        document.addEventListener('click', handleClick);
        document.addEventListener('touchend', handleClick);

        // Cleanup
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }

            document.removeEventListener('mousemove', handleInteraction);
            document.removeEventListener('touchmove', handleInteraction);
            document.removeEventListener('click', handleClick);
            document.removeEventListener('touchend', handleClick);

            scene.traverse((object) => {
                if (object instanceof THREE.Mesh) {
                    object.geometry.dispose();
                    object.material.dispose();
                }
            });

            renderer.dispose();
            containerRef.current?.removeChild(renderer.domElement);
        };
    }, [links]);

    return (
        <div className={styles.cubesContainer}>
            <div ref={containerRef} className={styles.canvasContainer} />
            <div className={styles.title}>{pageTitle}</div>
            <div className={styles.linkLabel} />
            <div 
                className={styles.detailsPanel}
                style={{
                    opacity: selectedCube ? 1 : 0,
                    pointerEvents: selectedCube ? 'auto' : 'none'
                }}
            >
                <h2>{selectedCube?.userData.link.title || ''}</h2>
                <p>{selectedCube ? `Click again to visit ${selectedCube.userData.link.title}` : ''}</p>
                <a 
                    href={selectedCube?.userData.link.url || '#'} 
                    className={styles.visitLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                >
                    Visit Link
                </a>
            </div>
        </div>
    );
} 