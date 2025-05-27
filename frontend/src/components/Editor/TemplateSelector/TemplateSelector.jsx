import React, { useState } from 'react';
import './TemplateSelector.css';
import { templates } from '../../../templates/registry';

const TemplateSelector = ({ currentTemplate, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (templateKey) => {
        onChange({ target: { value: templateKey } });
        setIsOpen(false);
    };

    return (
        <div className="template-selector-container">
            <div 
                className="template-selector-header"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>{templates[currentTemplate]?.name || 'Select Template'}</span>
                <span className="arrow">{isOpen ? '▲' : '▼'}</span>
            </div>
            
            {isOpen && (
                <div className="template-options">
                    {Object.entries(templates).map(([key, template]) => (
                        <div
                            key={key}
                            className={`template-option ${currentTemplate === key ? 'selected' : ''}`}
                            onClick={() => handleSelect(key)}
                        >
                            {/* Add template thumbnail here if available */}
                            <span className="template-name">{template.name}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TemplateSelector; 