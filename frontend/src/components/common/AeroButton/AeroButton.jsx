import styles from './AeroButton.module.css';

export default function AeroButton({ children, color, className, ...props }) {
    const buttonClassName = `${styles.aeroButton} ${styles[color]} ${className || ''}`;
    return <button className={buttonClassName} {...props}>{children}</button>;
}
