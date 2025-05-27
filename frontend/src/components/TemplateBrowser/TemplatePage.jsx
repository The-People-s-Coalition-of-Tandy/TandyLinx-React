import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { templates } from '../../templates/registry';

const TemplatePage = () => {
  const { pageURL } = useParams();
  const [pageData, setPageData] = useState(null);
  const [Template, setTemplate] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPage = async () => {
      try {
        const response = await fetch(`/api/public/pages/${pageURL}`);
        
        if (!response.ok) {
          throw new Error(`Page not found`);
        }

        const data = await response.json();
        setPageData(data);
        
        if (templates[data.style]) {
          const { component } = templates[data.style];
          const module = await import(`./templates/${component}.jsx`);
          setTemplate(() => module.default);
        }
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
    <Template 
      pageTitle={pageData.pageTitle}
      links={JSON.parse(pageData.links)}
    />
  );
};

export default TemplatePage;