import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './TemplateBrowser.module.css';
import Preview from '../Preview/Preview';
import TemplateGrid from '../TemplateGrid/TemplateGrid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faX } from '@fortawesome/free-solid-svg-icons';
import logo from '../../assets/images/logo.ico';

const TemplateBrowser = ({ currentTemplate, onSelect, pageTitle, links, onClose, pageURL }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(currentTemplate);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState('Connecting to Template Service...');
  const [templates, setTemplates] = useState({});
  const [hasCompletedAnimation, setHasCompletedAnimation] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  
  const handleOverlayClick = (e) => {
    if (e.target.className === styles.browserOverlay) {
      onClose();
    }
  };

  const handlePreviewOverlayClick = (e) => {
    if (e.target.className === styles.previewModal) {
      setPreviewTemplate(null);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
        setCurrentTime(new Date());
    }, 500);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
    });
};

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await axios.get('/api/templates');
        if (response.data) {
          setTemplates(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch templates:', error);
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
        <div className={styles.headerContainer}>
          <div className={styles.titleContainer}>

            <h2>          
              <span className={styles.titleBold}>Template</span>
              <span className={styles.titleLight}>Browser</span>
            </h2>
          </div>
          <div className={styles.timeContainer}>
          <div className={styles.logoContainer}>
                <img src={logo} alt="Template Browser" className={styles.logo} />
                <sub className={styles.version}>ver 0.0.1</sub>
          </div>
            <p className={styles.clock}>{formatTime(currentTime)}</p>
          </div>
        </div>
      <div className={styles.divider}></div>
        
        <TemplateGrid
          isLoading={isLoading}
          hasCompletedAnimation={hasCompletedAnimation}
          loadingStatus={loadingStatus}
          templates={templates}
          selectedTemplate={selectedTemplate}
          onTemplateSelect={setSelectedTemplate}
          onPreviewClick={setPreviewTemplate}
          onSelectClick={handleSelect}
          selectButtonText={(key) => currentTemplate === key ? 'Current Template' : 'Select'}
        />
      </div>

      {previewTemplate && (
        <div className={styles.previewModal} onClick={handlePreviewOverlayClick}>
          <button 
            className={styles.closePreviewButton} 
            onClick={() => setPreviewTemplate(null)}
          >
            <FontAwesomeIcon icon={faX} />
          </button>
          <Preview 
            pageTitle={pageTitle}
            pageURL={`preview/${previewTemplate}`}
            links={links}
            style={previewTemplate}
            isFullPreview={true}
            className={"mobile-template-browser"}
          />
        </div>
      )}
    </div>
  );
};

export default TemplateBrowser;