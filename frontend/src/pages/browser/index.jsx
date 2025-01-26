import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PageSettingsModal } from './PageSettingsModal';
import Preview from '../../components/Preview/Preview';
import styles from './index.module.css';
const Browser = () => {
    const [previewTemplate, setPreviewTemplate] = useState(null);
    const [pageTitle, setPageTitle] = useState('');
    const [pageURL, setPageURL] = useState('');
    const [links, setLinks] = useState([]);
    const [templates, setTemplates] = useState({});
    const [showPageSettingsModal, setShowPageSettingsModal] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingStatus, setLoadingStatus] = useState('Connecting to Template Service...');
    const [hasCompletedAnimation, setHasCompletedAnimation] = useState(false);

    useEffect(() => {
        const fetchTemplates = async () => {
            const response = await axios.get('/api/templates');
            setTemplates(response.data);
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
    

    const handleTemplateSelect = (key) => {
        setSelectedTemplate(key);
        setShowPageSettingsModal(true);
    };

    const handleOverlayClick = () => {
        setShowPageSettingsModal(true);
    };

    const onClose = () => {
        setShowPageSettingsModal(false);
    };

    const onSave = () => {
        setShowPageSettingsModal(false);
    };


    return (
        <>
         <div className={styles.browserOverlay} onClick={handleOverlayClick}>
      <div className={styles.browserContent}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
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
                        handleSelect(key);
                      }}
                    >
                      'Select'
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {previewTemplate && (
        <div className={styles.previewModal}>
          <button 
            className={styles.closePreviewButton} 
            onClick={() => setPreviewTemplate(null)}
          >
            ×
          </button>
          <Preview 
            pageTitle={pageTitle}
            links={links}
            style={previewTemplate}
            isFullPreview={true}
          />
        </div>
      )}
    </div>
            {showPageSettingsModal && <PageSettingsModal template={templates[selectedTemplate]} />}
            <div>
                {Object.entries(templates).map(([key, template]) => (
                    <div
        key={key}
      >
        <img 
          src={template.thumbnail} 
          alt={template.name} 
        />
        <div>
          <h3>{template.name}</h3>
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleTemplateSelect(key);
            }}
          >
            Use This Template
          </button>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default Browser;