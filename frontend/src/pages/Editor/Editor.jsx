import React, { useContext, useEffect, useState } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { LinkContext } from '../../context/LinkContext';
import { templates } from '../../templates/registry';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import EditLink from '../../components/Editor/EditLink/EditLink';
import PageHeader from '../../components/Editor/TitleEditor/PageHeader';
import Preview from '../../components/Preview/Preview';
import './Editor.css';

const Editor = () => {
    const { 
        currentPageLinks, 
        setCurrentPageLinks, 
        getLinksFromPage,
        savePageChangesImmediate 
    } = useContext(LinkContext);
    const [isLoading, setIsLoading] = useState(true);
    const [pageTitle, setPageTitle] = useState('');
    const [currentTemplate, setCurrentTemplate] = useState('');
    const [showPreview, setShowPreview] = useState(false);
    const { pageURL } = useParams();

    useEffect(() => {
        const fetchPageData = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`http://localhost:3000/api/get-page/${pageURL}`, {
                    withCredentials: true
                });
                const links = response.data.links ? JSON.parse(response.data.links) : [];
                setCurrentPageLinks(links);
                setPageTitle(response.data.pageTitle);
                setCurrentTemplate(response.data.style || 'TandyLinx');
            } catch (error) {
                console.error('Error fetching page data:', error);
                setCurrentPageLinks([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPageData();
    }, [pageURL]);

    const handleTemplateChange = async (e) => {
        const newTemplate = e.target.value;
        setCurrentTemplate(newTemplate);
        try {
            await axios.post(`http://localhost:3000/api/update-page/${pageURL}`, 
                { style: newTemplate },
                { withCredentials: true }
            );
        } catch (error) {
            console.error('Failed to update template:', error);
        }
    };

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

    if (isLoading) return <div className="editor loading">Loading...</div>;

    return (
        <div className="editor-layout">
            <div className="editor">
                <PageHeader currentPageURL={pageURL} initialTitle={pageTitle} />
                
                <div className="template-selector">
                    <label htmlFor="template">Template Style:</label>
                    <select id="template" value={currentTemplate} onChange={handleTemplateChange}>
                        {Object.entries(templates).map(([key, template]) => (
                            <option key={key} value={key}>{template.name}</option>
                        ))}
                    </select>
                </div>

                <button className="add-link-button" onClick={handleAddLink}>Add Link</button>
                
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="droppable-column">
                        {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef}>
                                {currentPageLinks.map((link, index) => (
                                    <EditLink key={index} link={{...link, pageURL}} index={index} />
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>

            <Preview pageTitle={pageTitle} links={currentPageLinks} style={currentTemplate} />

            <button className="preview-button" onClick={() => setShowPreview(true)}>
                Preview
            </button>

            <div className={`preview-modal ${showPreview ? 'open' : ''}`}>
                <button className="close-preview" onClick={() => setShowPreview(false)}>×</button>
                <Preview pageTitle={pageTitle} links={currentPageLinks} style={currentTemplate} />
            </div>
        </div>
    );
};

export default Editor;