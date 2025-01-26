import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faUser, faTh } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import styles from '../styles/index.module.css';

export const Navigation = () => {
    return (
        <div className={styles.navContainer}>
            <Link to="/register" className={styles.link}>
                <FontAwesomeIcon icon={faPlus} />
                Sign up
            </Link>
            <Link to="/login" className={styles.link}>
                <FontAwesomeIcon icon={faUser} />
                Login
            </Link>
            <Link to="/browser" className={styles.link}>
                <FontAwesomeIcon icon={faTh} />
                Create from Template
            </Link>
        </div>
    );
}; 