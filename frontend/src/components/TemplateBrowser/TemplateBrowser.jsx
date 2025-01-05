import React, { useState } from 'react';
import { templates } from '../../templates/registry';
import styles from './TemplateBrowser.module.css';
import Preview from '../Preview/Preview';

const TemplateBrowser = ({ currentTemplate, onSelect, pageTitle, links, onClose }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(currentTemplate);
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const handleSelect = () => {
    onSelect(selectedTemplate);
    onClose();
  };

  return (
    <div className={styles.browserOverlay}>
      <div className={styles.browserContent}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        <h2>Choose a Template</h2>
        
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
                    onClick={() => handleSelect(key)}
                  >
                    {currentTemplate === key ? 'Current Template' : 'Select'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
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