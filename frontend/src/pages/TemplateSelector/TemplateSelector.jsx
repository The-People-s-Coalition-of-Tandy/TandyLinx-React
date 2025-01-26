import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import styles from './TemplateSelector.module.css';
import Preview from '../../components/Preview/Preview';

const TemplateSelector = () => {
  const [templates, setTemplates] = useState({});
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState('Connecting to Template Service...');
  const [hasCompletedAnimation, setHasCompletedAnimation] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [pageTitle, setPageTitle] = useState('');
  const [pageURL, setPageURL] = useState('');
  const [urlError, setUrlError] = useState('');
  const [urlStatus, setUrlStatus] = useState({ isAvailable: true, isChecking: false });
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await axios.get('/api/templates');
        if (response.data) {
          setTemplates(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch templates:', error);
      } finally {
        setHasCompletedAnimation(true);
      }
    };

    fetchTemplates();
  }, []);

  useEffect(() => {
    const statusMessages = [
      'Dialing template service...',
      'Connecting to remote server...',
      'Downloading template data...',
      'Establishing secure connection...',
      'Buffering template previews...',
      'Connection established!'
    ];

    let currentMessage = 0;
    const interval = setInterval(() => {
      setLoadingStatus(statusMessages[currentMessage]);
      currentMessage++;
      
      if (currentMessage >= statusMessages.length) {
        clearInterval(interval);
        setTimeout(() => {
          setHasCompletedAnimation(true);
          setIsLoading(false);
        }, 1000);
      }
    }, 1300);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Check URL parameters for pre-selected template
    const params = new URLSearchParams(window.location.search);
    const selectedTemplateFromURL = params.get('selected');
    
    if (selectedTemplateFromURL && isAuthenticated) {
      setSelectedTemplate(selectedTemplateFromURL);
      setShowCreateModal(true);
    }
  }, [isAuthenticated]);

  const handleTemplateSelect = (templateKey) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { returnTo: `/templates?selected=${templateKey}` } });
      return;
    }
    setSelectedTemplate(templateKey);
    setShowCreateModal(true);
  };

  const validateURL = (value) => {
    return /^[a-zA-Z0-9-]+$/.test(value);
  };

  const handleURLChange = async (e) => {
    const newUrl = e.target.value;
    setPageURL(newUrl);
    
    if (!newUrl) {
      setUrlError('');
      return;
    }
    
    if (!validateURL(newUrl)) {
      setUrlError('URL can only contain letters, numbers, and hyphens');
      setUrlStatus({ isAvailable: false, isChecking: false });
    } else {
      setUrlError('');
      checkURL(newUrl);
    }
  };

  const checkURL = async (newUrl) => {
    setUrlStatus(prev => ({ ...prev, isChecking: true }));
    try {
      const response = await axios.get(`/api/check-pageURL?name=${newUrl}`);
      setUrlStatus({ isAvailable: !response.data.exists, isChecking: false });
    } catch (error) {
      console.error('Error checking URL:', error);
      setUrlStatus({ isAvailable: false, isChecking: false });
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!pageTitle || !pageURL || !urlStatus.isAvailable || urlError) return;

    try {
      const response = await axios.post('/api/pages', {
        pageTitle,
        pageURL,
        style: selectedTemplate
      });
      
      if (response.data.success) {
        navigate(`/${pageURL}/edit`);
      }
    } catch (error) {
      console.error('Failed to create page:', error);
    }
  };

  return (
    <div className={styles.browserOverlay}>
      <div className={styles.browserContent}>
        <h2>Choose a Template</h2>
        
        {isLoading && !hasCompletedAnimation ? (
          <div className={styles.loadingOverlay}>
            <div className={styles.loadingText}>{loadingStatus}</div>
            <div className={styles.dialupSound}>
              <div className={styles.dialupBar} />
              <div className={styles.dialupStatus}>
                {Math.floor(Math.random() * 5.2 + 2.8).toFixed(1)}kb/s
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.templateGrid}>
            {Object.entries(templates).map(([key, template]) => (
              <div 
                key={key}
                className={`${styles.templateCard} ${selectedTemplate === key ? styles.selected : ''}`}
                onClick={() => setSelectedTemplate(key)}
              >
                <div className={styles.thumbnailWrapper}>
                  <img 
                    src={template.thumbnail} 
                    alt={`${template.name} template preview`} 
                    className={styles.thumbnail}
                  />
                </div>
                <div className={styles.templateInfo}>
                  <h3>{template.name}</h3>
                  <div className={styles.buttonGroup}>
                    <button 
                      className={styles.previewButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewTemplate(key);
                      }}
                    >
                      Preview
                    </button>
                    <button 
                      className={styles.selectButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTemplateSelect(key);
                      }}
                    >
                      Select
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Create New Page</h2>
            <form onSubmit={handleCreate}>
              <div className={styles.formGroup}>
                <label>Page Title</label>
                <input
                  type="text"
                  value={pageTitle}
                  onChange={(e) => setPageTitle(e.target.value)}
                  placeholder="My Awesome Links"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Page URL</label>
                <div className={styles.urlInput}>
                  <span>linx.pcotandy.org/</span>
                  <input
                    type="text"
                    value={pageURL}
                    onChange={handleURLChange}
                    placeholder="my-links"
                    required
                  />
                </div>
                {urlError && <div className={styles.error}>{urlError}</div>}
                {!urlError && pageURL && (
                  <div className={styles.urlStatus}>
                    {urlStatus.isChecking ? 'Checking...' : 
                     urlStatus.isAvailable ? '✓ Available' : '✗ URL taken'}
                  </div>
                )}
              </div>
              <div className={styles.modalActions}>
                <button type="button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={!urlStatus.isAvailable || !!urlError}
                >
                  Create Page
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {previewTemplate && (
        <div className={styles.previewModal}>
          <button 
            className={styles.closePreviewButton} 
            onClick={() => setPreviewTemplate(null)}
          >
            ×
          </button>
          <Preview 
            pageTitle="Preview"
            links={[]}
            style={previewTemplate}
            isFullPreview={true}
          />
        </div>
      )}
    </div>
  );
};

export default TemplateSelector; 