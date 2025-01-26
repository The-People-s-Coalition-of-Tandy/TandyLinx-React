import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';

const TemplatePage = () => {
  const { pageURL } = useParams();
  const [pageData, setPageData] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadPage = async () => {
      try {
        const response = await axios.get(`/api/public/pages/${pageURL}`);
        if (!response.ok) {
          throw new Error('Page not found');
        }
        setPageData(response.data);
      } catch (error) {
        setError(error.message);
        console.error('Error loading page:', error);
      }
    };

    loadPage();
  }, [pageURL]);

  if (error) return <div>Error: {error}</div>;
  if (!pageData) return <div>Loading...</div>;

  // Redirect to the server-rendered template
  window.location.href = `/${pageURL}`;
  return null;
};

export default TemplatePage;