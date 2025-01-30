import { Navigation } from './components/Navigation';
import { Title } from './components/Title';
import styles from './styles/index.module.css';
// import grass from './assets/images/grass.webp';
// import grass from './assets/images/grassTwo.webp';
// import grass from './assets/images/grassThree.webp';
// import grass from './assets/images/grassFour.webp';
import grass from './assets/images/grass5.png';
import castle from './assets/images/castle.png';
import city from './assets/images/city.png';
import gsap from 'gsap';
import { useEffect } from 'react';

export default function HomePage() {
    useEffect(() => {
        // Initial state - hide castle and city
        gsap.set(`.${styles.castle}`, {
            // transform: 'translateX(-2vw)',  // Start from left edge of screen
            opacity: 0
        });
        
        gsap.set(`.${styles.city}`, {
            // transform: 'translateX(150vw)',   // Start from right edge of screen
            opacity: 0
        });

        const handleThemeChange = () => {
            gsap.to(`.${styles.castle}`, {
                duration: 2,
                opacity: 0.8,
                ease: "linear.out"
            });

            gsap.to(`.${styles.city}`, {
                duration: 2,
                opacity: 0.6,
                ease: "linear.out"
            });
        };


        window.addEventListener('castleThemeChange', handleThemeChange);
        return () => {
            window.removeEventListener('castleThemeChange', handleThemeChange);
        };
    }, []);

    return (
        <div className={styles.content}>

            <div className={styles.interface}>
                <Title />
                <Navigation />
            </div>
            <div className={styles.castleContainer}>
                <div className={styles.castle}>
                    <img src={castle} alt="Castle" className={styles.castle} />
                </div>
            </div>
            <div className={styles.background}>
                <img src={grass} alt="Grass" className={styles.grass} />
            </div>

            <div className={styles.cityContainer}>
                <div className={styles.city}>
                    <img src={city} alt="City" className={styles.city} />
                </div>
            </div>
        </div>
    );
} 