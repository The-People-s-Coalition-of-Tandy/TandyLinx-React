import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import AeroButton from '../../components/common/AeroButton/AeroButton';
import castle from '../HomePage/assets/images/castle.png';
import city from '../HomePage/assets/images/city.png';
import styles from './Login.module.css';
import axios from 'axios';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const message = location.state?.message;

  const themeChangeEvent = new CustomEvent('themeChange', {
    detail: { theme: 'midnight', duration: 800, easingFunction: "linear" }
  });

  useEffect(() => {
    window.dispatchEvent(themeChangeEvent);
  }, []);

  // Get the redirect path from state, or default to /profile
  const from = location.state?.from?.pathname || '/profile';

  useEffect(() => {
    if (!loading && user) {
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(username, password);
    
    if (result.success) {
        const pendingPage = localStorage.getItem('pendingPage');
        if (pendingPage) {
            const pageData = JSON.parse(pendingPage);
            try {
                const response = await axios.post('/api/pages', {
                    pageTitle: pageData.pageTitle,
                    pageURL: pageData.pageURL,
                    style: pageData.template
                }, {
                    withCredentials: true
                });
                
                if (response.status === 200) {
                    localStorage.removeItem('pendingPage');
                    navigate(`/${pageData.pageURL}/edit`, { replace: true });
                    return;
                }
            } catch (error) {
                console.error('Failed to create pending page:', error);
            }
        }
        navigate(from, { replace: true });
    } else {
        setError(result.error);
    }
  };

  if (loading) {
    return <div></div>;
  }

  return (
      <div className={styles.loginContainer}>
        <div className={styles.castleContainer}>
        <div className={styles.castle}>
            <img src={castle} alt="Castle" className={styles.castle} />
          </div>
        </div>
        <div className={styles.cityContainer}>
          <div className={styles.city}>
            <img src={city} alt="City" className={styles.city} />
          </div>
        </div>
        <h1>Login</h1>
        {message && (
          <div className={styles.infoMessage}>
            {message}
          </div>
        )}
        {error && <p className={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <AeroButton type="submit">Login</AeroButton>
        </form>
        <p className={styles.registerLink}>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
  );
};

export default Login;
