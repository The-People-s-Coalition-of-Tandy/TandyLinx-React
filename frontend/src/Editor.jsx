import React, { useContext, useEffect, useState } from 'react';
import {DragDropContext, Droppable} from '@hello-pangea/dnd';
import { LinkContext } from './context/LinkContext';
import './Editor.css';
import EditLink from './EditLink';
import PageHeader from './components/PageHeader';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const Editor = () => {
    const { 
        currentPageLinks, 
        setCurrentPageLinks, 
        getLinksFromPage,
        savePageChangesImmediate 
    } = useContext(LinkContext);
    const [isLoading, setIsLoading] = useState(true);
    const [pageTitle, setPageTitle] = useState('');
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
            } catch (error) {
                console.error('Error fetching page data:', error);
                setCurrentPageLinks([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPageData();
    }, [pageURL]);

    if (isLoading) {
        return <div className="editor loading">Loading...</div>;
    }

    const onDragEnd = async (result) => {
        if (!result.destination) return;
        
        try {
            const items = Array.from(currentPageLinks);
            const [reorderedItem] = items.splice(result.source.index, 1);
            items.splice(result.destination.index, 0, reorderedItem);
            
            // Update the UI immediately
            setCurrentPageLinks(items);

            // Save immediately without debounce
            await savePageChangesImmediate(pageURL, { links: items });
        } catch (error) {
            console.error('Failed to save link order:', error);
            // Revert the change if save failed
            const originalLinks = await getLinksFromPage(pageURL);
            setCurrentPageLinks(originalLinks);
        }
    };

    const handleAddLink = async () => {
        const newLink = {
            name: 'New Link',
            url: 'https://',
        };
        
        const updatedLinks = [newLink, ...currentPageLinks];
        setCurrentPageLinks(updatedLinks);
        
        try {
            await savePageChangesImmediate(pageURL, { links: updatedLinks });
        } catch (error) {
            console.error('Failed to save new link:', error);
            // Revert on failure
            const originalLinks = await getLinksFromPage(pageURL);
            setCurrentPageLinks(originalLinks);
        }
    };

    return (
        <div className="editor">
            <PageHeader currentPageURL={pageURL} initialTitle={pageTitle} />
            <button 
                className="add-link-button" 
                onClick={handleAddLink}
            >
                Add Link
            </button>
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="droppable-column">
                    {(provided) => (
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                        >
                            {currentPageLinks.map((link, index) => (
                                <EditLink 
                                    key={index} 
                                    link={{...link, pageURL}}
                                    index={index} 
                                />
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    );
};

export default Editor;