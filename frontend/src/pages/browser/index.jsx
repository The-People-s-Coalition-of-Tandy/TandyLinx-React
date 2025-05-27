import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PageSettingsModal } from './PageSettingsModal';
import Preview from '../../components/Preview/Preview';
import TemplateGrid from '../../components/TemplateGrid/TemplateGrid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faX } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import styles from './index.module.css';
import logo from './assets/logo.ico';
const Browser = () => {
    const [previewTemplate, setPreviewTemplate] = useState(null);
    const [templates, setTemplates] = useState({});
    const [showPageSettingsModal, setShowPageSettingsModal] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingStatus, setLoadingStatus] = useState('Connecting to Template Service...');
    const [loadingGif, setLoadingGif] = useState('orbstar');
    const [hasCompletedAnimation, setHasCompletedAnimation] = useState(false);
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());

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

    const loadingGifs = [
      'orbstar',
      'Castle2',
      'Flaming_Demon',
      'Wizard_Walking',
      'dream3d',
      'Warrior_Wind'
    ];

    let currentMessage = 0;
    const interval = setInterval(() => {
      setLoadingStatus(statusMessages[currentMessage]);
      setLoadingGif(loadingGifs[currentMessage]);
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

    const handleTemplateSelect = (key) => {
        setSelectedTemplate(key);
        setShowPageSettingsModal(true);
    };

    const handleOverlayClick = (e) => {
      // Don't navigate away if clicking within the preview
      if (e.target.closest('.preview-container')) {
        return;
      }
      navigate(-1);
    };

    const onClosePageSettings = () => {
        setShowPageSettingsModal(false);
        setSelectedTemplate(null);
    };

    const onCloseBrowser = () => {
        navigate(-1);
    };

    const onSave = () => {
        setShowPageSettingsModal(false);
    };


    return (
        <>
         <div className={styles.browserOverlay} onClick={handleOverlayClick}>
      <div className={styles.browserContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onCloseBrowser}>×</button>
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
          loadingGif={loadingGif}
          templates={templates}
          selectedTemplate={selectedTemplate}
          onTemplateSelect={handleTemplateSelect}
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
            <FontAwesomeIcon icon={faX} />
          </button>
          <Preview 
            pageURL={`preview/${previewTemplate}`}
            style={previewTemplate}
            isFullPreview={true}
            className={"mobile-template-browser"}
          />
        </div>
      )}
    </div>
            {showPageSettingsModal && (
                <PageSettingsModal 
                    template={selectedTemplate}
                    onClose={onClosePageSettings}
                />
            )}
        </>
    );
};

export default Browser;