import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { templates } from '../../templates/registry';
import styles from './TemplateBrowser.module.css';
import Preview from '../Preview/Preview';

const TemplateBrowser = ({ currentTemplate, onSelect, pageTitle, links, onClose, pageURL }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(currentTemplate);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState('Connecting to Template Service...');

  const handleOverlayClick = (e) => {
    if (e.target.className === styles.browserOverlay) {
      onClose();
    }
  };

  useEffect(() => {
    // Simulate dial-up connection
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
        setTimeout(() => setIsLoading(false), 1000);
      }
    }, 1300);

    return () => clearInterval(interval);
  }, []);

  const handleSelect = async (templateKey) => {
    try {
      await axios.put(`/api/pages/${pageURL}`, 
        { style: templateKey },
        { withCredentials: true }
      );
      onSelect(templateKey);
      onClose();
    } catch (error) {
      console.error('Failed to update template:', error);
      // Revert selection on error
      setSelectedTemplate(currentTemplate);
    }
  };

  return (
    <div className={styles.browserOverlay} onClick={handleOverlayClick}>
      <div className={styles.browserContent}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        <h2>Choose a Template</h2>
        
        {isLoading ? (
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
                      {currentTemplate === key ? 'Current Template' : 'Select'}
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
  );
};

export default TemplateBrowser;