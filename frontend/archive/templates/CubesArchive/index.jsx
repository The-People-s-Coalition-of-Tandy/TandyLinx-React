import Cubes from './Cubes';
import styles from './index.module.css';

export default function CubesTemplate({ pageTitle, links }) {
    return (
        <div className={styles.cubesTemplate}>
            <Cubes pageTitle={pageTitle} links={links} />
        </div>
    );
}