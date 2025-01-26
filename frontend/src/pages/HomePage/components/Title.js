import { useEffect, useRef } from 'react';
import joinIcon from '../assets/icons/join.ico';
import PCoTandyLogo from '../assets/icons/PCoTandyLogo.ico';
import pcotandylogo3 from '../assets/icons/pcotandylogo3.ico';
import { gsap } from 'gsap';
import styles from '../styles/index.module.css';

export const Title = () => {
    const particlesContainerRef = useRef(null);

    useEffect(() => {
        const createParticleBurst = () => {
            const particleCount = 16;
            const images = [joinIcon, joinIcon, PCoTandyLogo, pcotandylogo3];
            const colors = ['#9575CD'];
            
            const title = document.querySelector('h1');
            const titleRect = title.getBoundingClientRect();
            const centerX = window.innerWidth / 2;
            const centerY = titleRect.top + (titleRect.height / 2);
            
            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('img');
                particle.className = styles.particle;
                particle.src = images[Math.floor(Math.random() * images.length)];
                const color = colors[Math.floor(Math.random() * colors.length)];
                particle.style.filter = `drop-shadow(0 0 8px ${color})`;
                particlesContainerRef.current.appendChild(particle);
                
                const startAngle = (i / particleCount) * Math.PI * 2;
                const startRadius = 0;
                const endRadius = gsap.utils.random(100, 200);
                const size = gsap.utils.random(35, 50);
                
                const startX = centerX + Math.cos(startAngle) * startRadius;
                const startY = centerY + Math.sin(startAngle) * startRadius;
                
                const endX = centerX + Math.cos(startAngle) * endRadius;
                const endY = centerY + Math.sin(startAngle) * endRadius;
                
                gsap.set(particle, {
                    width: size,
                    height: size,
                    x: startX,
                    y: startY,
                    opacity: 1,
                    scale: 0
                });
                
                gsap.to(particle, {
                    duration: gsap.utils.random(1.5, 2.5),
                    x: endX,
                    y: endY,
                    rotation: gsap.utils.random(-180, 180),
                    opacity: 0,
                    scale: gsap.utils.random(0.8, 2),
                    ease: 'power2.out',
                    onComplete: () => particle.remove()
                });
            }
        };

        const themeChangeEvent = new CustomEvent('themeChange', {
            detail: { theme: 'plain' }
        });

        document.fonts.ready.then(() => {
            const tl = gsap.timeline();
            
            tl.set([`.${styles.titleTandy}`, `.${styles.titleLinx}`], { 
                opacity: 0
            })
            .set(`.${styles.titleLinx}`, {
                visibility: 'visible'
            })
            .set(`.${styles.titleTandy}`, { 
                x: window.innerWidth < 768 ? 0 : '1.5em',
                y: '-0.2em'
            })
            .to(`.${styles.titleTandy}`, {
                opacity: 1,
                duration: 0.8,
                x: 0,
                ease: "power2.out",
                clearProps: "x"
            })
            .to(`.${styles.titleLinx}`, {
                duration: 1.2,
                y: 0,
                opacity: 1,
                ease: "elastic.out(0.5, 0.3)",
                transformOrigin: "center bottom"
            }, "=0")
            .to(`.${styles.titleTandy}`, {
                duration: 1.5,
                y: 0,
                ease: "elastic.out(1.9, 0.45)",
                transformOrigin: "center bottom",
                onStart: createParticleBurst
            }, "<+=0.125")
            .to(`.${styles.link}`, {
                duration: 0.8,
                scale: 1,
                opacity: 1,
                stagger: 0.15,
                ease: "elastic.out(1, 0.5)",
                transformOrigin: "center center",
                onComplete: () => {
                    window.dispatchEvent(themeChangeEvent);
                }
            }, "-=0.5")
            .add(() => {
                gsap.to(`.${styles.link}`, {
                    y: -15,
                    duration: 2.5,
                    ease: "sine.inOut",
                    stagger: {
                        each: 0.5,
                        repeat: -1,
                        yoyo: true
                    },
                    rotation: 2
                });
                
                gsap.to(`.${styles.link}`, {
                    y: 5,
                    duration: 2.5,
                    ease: "sine.inOut",
                    stagger: {
                        each: 0.5,
                        repeat: -1,
                        yoyo: true
                    },
                    rotation: -2
                }, "<1");
            });
        });
    }, []);

    return (
        <>
            <div className={styles.particlesContainer} ref={particlesContainerRef} />
            <h1 className={styles.title}>
                <span className={styles.titleTandy}>Tandy</span>
                <span className={styles.titleLinx}>Linx</span>
            </h1>
        </>
    );
}; 