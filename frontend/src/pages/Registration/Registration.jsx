import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Registration.module.css';
import AeroButton from '../../components/common/AeroButton/AeroButton';
import castle from '../HomePage/assets/images/castle.png';
import city from '../HomePage/assets/images/city.png';
import axios from 'axios';

const Registration = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  const themeChangeEvent = new CustomEvent('themeChange', {
    detail: { theme: 'midnight' }
  });

  useEffect(() => {
    window.dispatchEvent(themeChangeEvent);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      if (data.success) {
        await checkAuth(true);
        const pendingPage = localStorage.getItem('pendingPage');
        if (pendingPage) {
          const pageData = JSON.parse(pendingPage);
          try {
            const pageResponse = await axios.post('/api/pages', {
              pageTitle: pageData.pageTitle,
              pageURL: pageData.pageURL,
              style: pageData.template
            }, {
              withCredentials: true
            });
            
            if (pageResponse.status === 200) {
              localStorage.removeItem('pendingPage');
              navigate(`/${pageData.pageURL}/edit`);
              return;
            }
          } catch (error) {
            console.error('Failed to create pending page:', error);
          }
        }
        navigate('/profile', { replace: true });
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
      <div className={styles.registrationContainer}>
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
        <h1>Create Account</h1>
        {error && <p className={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit} className={styles.registrationForm}>
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
          <AeroButton type="submit">Register</AeroButton>
        </form>
        <p className={styles.loginLink}>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
  );
};

export default Registration; 