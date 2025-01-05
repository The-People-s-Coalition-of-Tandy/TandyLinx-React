import React, { useEffect, useRef } from 'react';
import { SlimeSimulation } from 'slime-simulation';
import businessPicture from './assets/EV095.jpg';
import Header from '../../components/common/Header';
import Hero from '../../components/Hero';
import Features from '../../components/Features';
import './index.css';

const HomePage = () => {
    const canvasRef = useRef(null);
    const simulationRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
    
        // Set canvas size with pixel ratio consideration
        const updateCanvasSize = () => {
            const pixelRatio = window.devicePixelRatio || 1;
            const width = window.innerWidth;
            const height = window.innerHeight;
            
            canvas.width = width * pixelRatio;
            canvas.height = height * pixelRatio;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;

            // Reinitialize simulation on resize to maintain correct rendering
            if (simulationRef.current) {
                initSimulation();
            }
        };
    
        // Initialize slime simulation
        const initSimulation = () => {
            if (simulationRef.current) {
                simulationRef.current.destroy?.();
            }
            
            simulationRef.current = new SlimeSimulation({
                canvas: canvas,
                imageUrl: businessPicture,
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

    return (
        <div className="home-page">
            <Header />
            <Hero slimeRef={simulationRef} />
            <Features />
            <canvas ref={canvasRef} id="canvas"></canvas>
        </div>
    );
};

export default HomePage;