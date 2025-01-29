import { Link } from 'react-router-dom';
import usericon from '../assets/icons/user.webp';
import foldericon from '../assets/icons/folder.webp';
import addIcon from '../assets/icons/addIcon.webp';
import bubbleBackground from '../assets/images/bubble.webp';
import styles from '../styles/index.module.css';

export const Navigation = () => {

    return (
        <div className={styles.navContainer}>
            <Link to="/register" className={styles.link}>
                <img className={`${styles.linkBackground} ${styles.linkBackgroundLarge}`} src={bubbleBackground} alt="" />
                <img width={40} src={addIcon} alt="add" />
                Sign up
            </Link>
            <Link to="/login" className={styles.link}>
                <img className={`${styles.linkBackground} ${styles.linkBackgroundLarge}`} src={bubbleBackground} alt="" />
                <img width={40} src={usericon} alt="user" />
                Login
            </Link>
            <Link to="/browser" className={styles.link}>
                <img className={`${styles.linkBackground} ${styles.linkBackgroundLarge}`} src={bubbleBackground} alt="" />
                <img width={40} src={foldericon} alt="folder" />
                Templates
            </Link>
        </div>
    );
}; 