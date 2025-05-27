import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import EditIcon from '../../common/EditIcon/EditIcon';
import '../ProfilePhotoUpload/ProfilePhotoUpload.css';
import { useProfilePhoto } from '../../../context/ProfilePhotoContext';

const SUPPORTED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
];

const PagePhotoUpload = ({ pageURL }) => {
  const { currentPagePhotoUrl, setCurrentPagePhotoUrl } = useProfilePhoto();
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    fetchPagePhoto();
  }, [pageURL]);

  const fetchPagePhoto = async () => {
    try {
      const response = await axios.get(`/api/pages/${pageURL}/photo`, {
        withCredentials: true
      });
      setCurrentPagePhotoUrl(response.data.photoUrl);
    } catch (error) {
      console.error('Error fetching page photo:', error);
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!SUPPORTED_FILE_TYPES.includes(file.type)) {
      alert('Please upload a supported image format (JPEG, PNG, WebP, or GIF)');
      return;
    }

    const formData = new FormData();
    formData.append('photo', file);
    
    setIsUploading(true);
    try {
      const response = await axios.post(`/api/pages/${pageURL}/photo`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setCurrentPagePhotoUrl(response.data.photoUrl);
    } catch (error) {
      console.error('Error uploading photo:', error);
      const errorMessage = error.response?.data?.message || 'Failed to upload photo. Please try again.';
      alert(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handlePhotoClick = () => {
    inputRef.current.click();
  };

  return (
    <div className="profile-photo-upload">
      <div className="photo-preview">
        <div className="photo-content" onClick={handlePhotoClick}>
          <img 
            src={currentPagePhotoUrl} 
            alt="Page Photo" 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/assets/images/default-profile.png';
            }}
          />
        </div>
        <label htmlFor="photo-upload" className="edit-overlay">
          <EditIcon />
        </label>
      </div>
      
      <div className="upload-controls">
        <input
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          id="photo-upload"
          className="file-input"
          disabled={isUploading}
          ref={inputRef}
        />
      </div>
    </div>
  );
};

export default PagePhotoUpload; 