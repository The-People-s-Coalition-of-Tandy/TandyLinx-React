import { Navigation } from './components/Navigation';
import { Title } from './components/Title';
import styles from './styles/index.module.css';
// import grass from './assets/images/grass5.png'; // alternate grass
import grass from './assets/images/grass6.webp';
import castle from './assets/images/castle.webp';
import city from './assets/images/city.webp';
import gsap from 'gsap';
import { useEffect } from 'react';

export default function HomePage() {
    useEffect(() => {
        gsap.set(`.${styles.castle}`, {
            opacity: 0
        });
        
        gsap.set(`.${styles.city}`, {
            opacity: 0
        });

        const handleThemeChange = () => {
            gsap.to(`.${styles.castle}`, {
                duration: 1.3,
                opacity: 0.8,
                ease: "linear.out"
            });

            gsap.to(`.${styles.city}`, {
                duration: 2,
                opacity: 0.6,
                ease: "linear.out",
                delay: 0.1
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