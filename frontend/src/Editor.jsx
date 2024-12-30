import React, { useContext } from 'react';
import {DragDropContext, Droppable} from '@hello-pangea/dnd';
import { LinkContext } from './context/LinkContext';
import './Editor.css';
import EditLink from './EditLink';

const Editor = () => {
    const { currentPageLinks, setCurrentPageLinks } = useContext(LinkContext);
    console.log(currentPageLinks);

    const onDragEnd = (result) => {
        if (!result.destination) return;
        const items = Array.from(currentPageLinks);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        setCurrentPageLinks(items);
    };

    return (
        <div className="editor">
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="droppable-column">
                    {(provided) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
        >
          {currentPageLinks.map((link, index) => (
            <EditLink key={index} link={link} index={index} />
          ))}
          {provided.placeholder}
        </div>
      )}
                </Droppable>
            </DragDropContext>
        </div>
    )
};

export default Editor;