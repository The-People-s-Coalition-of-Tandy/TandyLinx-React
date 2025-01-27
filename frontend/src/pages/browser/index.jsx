import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PageSettingsModal } from './PageSettingsModal';
import Preview from '../../components/Preview/Preview';
import styles from './index.module.css';
import TemplateGrid from '../../components/TemplateGrid/TemplateGrid';
import { useNavigate } from 'react-router-dom';

const Browser = () => {
    const [previewTemplate, setPreviewTemplate] = useState(null);
    const [templates, setTemplates] = useState({});
    const [showPageSettingsModal, setShowPageSettingsModal] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingStatus, setLoadingStatus] = useState('Connecting to Template Service...');
    const [hasCompletedAnimation, setHasCompletedAnimation] = useState(false);
    const navigate = useNavigate();

    const themeChangeEvent = new CustomEvent('themeChange', {
      detail: { theme: 'midnight' }
    });

    useEffect(() => {
        window.dispatchEvent(themeChangeEvent);
    }, []);

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
      navigate(-1);
    };

    const onClose = () => {
        setShowPageSettingsModal(false);
        setSelectedTemplate(null);
    };

    const onSave = () => {
        setShowPageSettingsModal(false);
    };


    return (
        <>
         <div className={styles.browserOverlay} onClick={handleOverlayClick}>
      <div className={styles.browserContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        <h2>Choose a Template</h2>
        
        <TemplateGrid
          isLoading={isLoading}
          hasCompletedAnimation={hasCompletedAnimation}
          loadingStatus={loadingStatus}
          templates={templates}
          selectedTemplate={selectedTemplate}
          onTemplateSelect={setSelectedTemplate}
          onPreviewClick={setPreviewTemplate}
          onSelectClick={handleTemplateSelect}
        />
      </div>

      {previewTemplate && (
        <div 
          className={styles.previewModal} 
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              e.stopPropagation();
              setPreviewTemplate(null);
            }
          }}
        >
          <button 
            className={styles.closePreviewButton} 
            onClick={(e) => {
              e.stopPropagation();
              setPreviewTemplate(null);
            }}
          >
            ×
          </button>
          <Preview 
            pageURL={`preview/${previewTemplate}`}
            style={previewTemplate}
            isFullPreview={true}
          />
        </div>
      )}
    </div>
            {showPageSettingsModal && (
                <PageSettingsModal 
                    template={templates[selectedTemplate]} 
                    onClose={onClose}
                />
            )}
        </>
    );
};

export default Browser;