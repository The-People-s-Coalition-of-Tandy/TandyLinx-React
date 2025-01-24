import { Navigation } from './components/Navigation';
import { Title } from './components/Title';
import styles from './styles/index.module.css';

export default function HomePage() {
    return (
        <div className={styles.content}>
            <div className={styles.interface}>
                <Title />
                <Navigation />
            </div>
        </div>
    );
} 