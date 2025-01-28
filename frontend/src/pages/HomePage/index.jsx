import { Navigation } from './components/Navigation';
import { Title } from './components/Title';
import styles from './styles/index.module.css';
import grass from './assets/images/grass.png';

export default function HomePage() {
    return (
        <div className={styles.content}>
            <div className={styles.interface}>
                <Title />
                <Navigation />
            </div>
            <div className={styles.background}>
                <img src={grass} alt="Grass" className={styles.grass} />
            </div>
        </div>
    );
} 