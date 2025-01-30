import React, { useContext, useEffect, useState } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { LinkContext } from '../../context/LinkContext';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import EditLink from '../../components/Editor/EditLink/EditLink';
import Preview from '../../components/Preview/Preview';
import TemplateBrowser from '../../components/TemplateBrowser/TemplateBrowser';
import Browser from '../browser';
import EditorHeader from '../../components/Editor/EditorHeader/EditorHeader';
import './Editor.css';
import AeroButton from '../../components/common/AeroButton/AeroButton';
import DeleteConfirmModal from '../../components/Editor/DeleteConfirmModal/DeleteConfirmModal';
import { useProfilePhoto } from '../../context/ProfilePhotoContext';

const Editor = () => {
    const { 
        currentPageLinks, 
        setCurrentPageLinks, 
        getLinksFromPage,
        savePageChangesImmediate 
    } = useContext(LinkContext);
    const { setCurrentPagePhotoUrl } = useProfilePhoto();
    const [isLoading, setIsLoading] = useState(true);
    const [pageTitle, setPageTitle] = useState('');
    const [currentTemplate, setCurrentTemplate] = useState('TandyLinx');
    const [showPreview, setShowPreview] = useState(false);
    const [showTemplateBrowser, setShowTemplateBrowser] = useState(false);
    const { pageURL } = useParams();
    const navigate = useNavigate();
    const [deleteModalState, setDeleteModalState] = useState({ isOpen: false, linkIndex: null });
    const [showSettings, setShowSettings] = useState(false);
    const [previewMode, setPreviewMode] = useState('desktop');

    const themeChangeEvent = new CustomEvent('themeChange', {
        detail: { theme: 'plain' }
    });

    useEffect(() => {
        window.dispatchEvent(themeChangeEvent);
    }, []);

    useEffect(() => {
        const fetchPageData = async () => {
            try {
                const response = await axios.get(`/api/get-page/${pageURL}`, {
                    withCredentials: true
                });
                
                const links = response.data?.links ? JSON.parse(response.data.links) : [];
                const title = response.data?.pageTitle || '';
                const style = response.data?.style || 'TandyLinx';
                const photoUrl = response.data?.pagePhotoUrl;
                
                setCurrentPageLinks(links);
                setPageTitle(title);
                setCurrentTemplate(style);
                console.log(style);
                setCurrentPagePhotoUrl(photoUrl);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching page data:', error);
                setCurrentPageLinks([]);
                setIsLoading(false);
            }
        };

        fetchPageData();
    }, [pageURL, setCurrentPageLinks, setCurrentPagePhotoUrl]);

    useEffect(() => {
        const editor = document.querySelector('.editor');
        if (deleteModalState.isOpen || showSettings) {
            editor?.classList.add('no-scroll');
        } else {
            editor?.classList.remove('no-scroll');
        }
    }, [deleteModalState.isOpen, showSettings]);

    const onDragEnd = async (result) => {
        if (!result.destination) return;
        
        try {
            const items = Array.from(currentPageLinks);
            const [reorderedItem] = items.splice(result.source.index, 1);
            items.splice(result.destination.index, 0, reorderedItem);
            setCurrentPageLinks(items);
            await savePageChangesImmediate(pageURL, { links: items });
        } catch (error) {
            console.error('Failed to save link order:', error);
            const originalLinks = await getLinksFromPage(pageURL);
            setCurrentPageLinks(originalLinks);
        }
    };

    const handleAddLink = async () => {
        const newLink = { name: 'New Link', url: 'https://' };
        const updatedLinks = [newLink, ...currentPageLinks];
        setCurrentPageLinks(updatedLinks);
        
        try {
            await savePageChangesImmediate(pageURL, { links: updatedLinks });
        } catch (error) {
            console.error('Failed to save new link:', error);
            const originalLinks = await getLinksFromPage(pageURL);
            setCurrentPageLinks(originalLinks);
        }
    };

    const handleURLChange = async (newURL) => {
        try {
            const response = await axios.put(
                `/api/pages/${pageURL}`,
                { newPageURL: newURL },
                { withCredentials: true }
            );
            
            if (response.data.success) {
                navigate(`/${response.data.newPageURL}/edit`, { replace: true });
            }
        } catch (error) {
            console.error('Failed to update URL:', error);
        }
    };

    const handleDeleteClick = (index) => {
        setDeleteModalState({ isOpen: true, linkIndex: index });
    };

    const handleDeleteConfirm = async () => {
        const index = deleteModalState.linkIndex;
        const updatedLinks = [
            ...currentPageLinks.slice(0, index),
            ...currentPageLinks.slice(index + 1)
        ];
        
        try {
            await savePageChangesImmediate(pageURL, { links: updatedLinks });
            setCurrentPageLinks(updatedLinks);
        } catch (error) {
            console.error('Failed to delete link:', error);
            const originalLinks = await getLinksFromPage(pageURL);
            setCurrentPageLinks(originalLinks);
        }
        setDeleteModalState({ isOpen: false, linkIndex: null });
    };

    const handleShowSettings = (show) => {
        setShowSettings(show);
    };

    const togglePreviewMode = () => {
        setPreviewMode(prev => prev === 'desktop' ? 'mobile' : 'desktop');
    };

    if (isLoading) return <div className="editor loading"></div>;

    return (
        <div className="editor-layout">
            {showTemplateBrowser && (
                <TemplateBrowser
                    currentTemplate={currentTemplate}
                    onSelect={setCurrentTemplate}
                    pageTitle={pageTitle}
                    links={currentPageLinks}
                    onClose={() => setShowTemplateBrowser(false)}
                    pageURL={pageURL}
                />
            )}
            <div className="editor">
                <EditorHeader
                    currentPageURL={pageURL}
                    initialTitle={pageTitle}
                    onTitleChange={setPageTitle}
                    onURLChange={handleURLChange}
                    currentTemplate={currentTemplate}
                    onBrowseTemplates={() => setShowTemplateBrowser(true)}
                    showSettings={showSettings}
                    onShowSettings={handleShowSettings}
                    previewMode={previewMode}
                    onTogglePreviewMode={togglePreviewMode}
                />

                <div className="editor-actions">
                    <AeroButton onClick={handleAddLink} color="white" className="add-link-button">+ Add Link</AeroButton>
                </div>
                
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="droppable-column">
                        {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef}>
                                {currentPageLinks.map((link, index) => (
                                    <EditLink 
                                        key={index} 
                                        link={{...link, pageURL}} 
                                        index={index}
                                        onDeleteClick={handleDeleteClick}
                                    />
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>

                <DeleteConfirmModal 
                    isOpen={deleteModalState.isOpen}
                    onClose={() => setDeleteModalState({ isOpen: false, linkIndex: null })}
                    onConfirm={handleDeleteConfirm}
                />
            </div>

            <Preview 
                pageURL={pageURL} 
                style={currentTemplate} 
                pageTitle={pageTitle}
                viewportMode={previewMode} 
            />

            <AeroButton onClick={() => setShowPreview(true)} className="preview-button" color="green">
                Preview
            </AeroButton>

            <div className={`preview-modal ${showPreview ? 'open' : ''}`}>
                <button className="close-preview" onClick={() => setShowPreview(false)}>×</button>
                <Preview 
                    pageTitle={pageTitle} 
                    links={currentPageLinks} 
                    style={currentTemplate}
                    pageURL={pageURL} 
                />
            </div>
        </div>
    );
};

export default Editor;