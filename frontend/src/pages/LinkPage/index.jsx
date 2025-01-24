import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { templates } from '../../templates/registry';
import '../../templates/shared/template-base.css';

const TemplatePage = () => {
  const [Template, setTemplate] = useState(null);
  const [error, setError] = useState(null);
  
  // Get data from URL params for preview mode
  const searchParams = new URLSearchParams(window.location.search);
  const pageTitle = searchParams.get('title');
  const style = searchParams.get('style');
  const links = JSON.parse(searchParams.get('links') || '[]');

  useEffect(() => {
    const loadTemplate = async () => {
      try {
        const templateStyle = templates[style] ? style : 'TandyLinx';
        const { folder } = templates[templateStyle];
        
        const module = await import(`../../templates/${folder}`);
        setTemplate(() => module.default);
      } catch (error) {
        setError(error.message);
        console.error('Error loading template:', error);
      }
    };

    loadTemplate();
  }, [style]);

  if (error) return <div>Error: {error}</div>;
  if (!Template) return <div>Loading...</div>;

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={`Links for ${pageTitle}`} />
      </Helmet>
      <Template 
        pageTitle={pageTitle}
        links={links}
      />
    </>
  );
};

export default TemplatePage;