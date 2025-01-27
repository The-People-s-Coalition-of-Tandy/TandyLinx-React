import React, { useEffect } from 'react';
import styles from './TemplateGrid.module.css';
import { shouldShowLoading, setLastLoadTime } from '../../utils/loadingCache';

const TemplateGrid = ({ 
  isLoading,
  hasCompletedAnimation,
  loadingStatus,
  templates,
  selectedTemplate,
  onTemplateSelect,
  onPreviewClick,
  onSelectClick,
  selectButtonText = (key) => 'Select'  // Configurable button text
}) => {
  const showLoadingScreen = shouldShowLoading() && isLoading && !hasCompletedAnimation;
  
  useEffect(() => {
    if (!isLoading && hasCompletedAnimation) {
      setLastLoadTime();
    }
  }, [isLoading, hasCompletedAnimation]);

  console.log('Loading state:', { // Debug log
    shouldShow: shouldShowLoading(),
    isLoading,
    hasCompletedAnimation,
    showLoadingScreen
  });

  return (
    <>
      {showLoadingScreen ? (
        <div className={styles.loadingOverlay}>
          <img 
            src="/assets/images/default-profile.png" 
            alt="Loading animation" 
            className={styles.loadingGif}
          />
          <div className={styles.loadingText}>{loadingStatus}</div>
          <div className={styles.dialupSound}>
            <div className={styles.dialupBars}>
              {[...Array(20)].map((_, i) => (
                <div 
                  key={i} 
                  className={styles.bar} 
                  style={{
                    animationDelay: `${i * 0.4}s`,
                    opacity: 0
                  }} 
                />
              ))}
            </div>
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
              onClick={() => onTemplateSelect(key)}
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
                      onPreviewClick(key);
                    }}
                  >
                    Preview
                  </button>
                  <button 
                    className={styles.selectButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectClick(key);
                    }}
                  >
                    {selectButtonText(key)}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default TemplateGrid; 