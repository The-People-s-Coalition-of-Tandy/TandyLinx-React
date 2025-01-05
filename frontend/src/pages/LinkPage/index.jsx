import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { templates } from '../../templates/registry';
import '../../templates/shared/template-base.css';

const TemplatePage = () => {
  const { pageURL } = useParams();
  const [pageData, setPageData] = useState(null);
  const [Template, setTemplate] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPage = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/public/pages/${pageURL}`);
        
        if (!response.ok) {
          throw new Error(`Page not found`);
        }
        
        const data = await response.json();
        setPageData(data);
        console.log(data.style);
        const templateStyle = templates[data.style] ? data.style : 'TandyLinx';
        const { folder } = templates[templateStyle];
        
        const module = await import(`../../templates/${folder}`);
        setTemplate(() => module.default);
      } catch (error) {
        setError(error.message);
        console.error('Error loading page:', error);
      }
    };

    loadPage();
  }, [pageURL]);

  if (error) return <div>Error: {error}</div>;
  if (!pageData || !Template) return <div>Loading...</div>;

  return (
    <>
      <Helmet>
        <title>{pageData.pageTitle}</title>
        <meta name="description" content={`Links for ${pageData.pageTitle}`} />
      </Helmet>
        <Template 
          pageTitle={pageData.pageTitle}
          links={JSON.parse(pageData.links)}
        />
    </>
  );
};

export default TemplatePage;