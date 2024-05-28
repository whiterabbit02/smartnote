import React from 'react';
import Note from './Note';
import '../stylesheet/MainContent.css';
import '../stylesheet/global.css';

const MainContent = ({ notes, onEditNote, onAddNote }) => {
  return (
    <div className="main-content">
      {notes.map(note => (
        <Note key={note.id} note={note} onEdit={() => onEditNote(note)} />
      ))}
      <div className="note add-note" onClick={onAddNote}>+</div>
    </div>
  );
};

export default MainContent;
