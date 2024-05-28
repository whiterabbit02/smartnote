import React from 'react';
import '../stylesheet/Note.css';

function Note({ note, onEdit }) {
  const createMarkup = (content) => {
    return { __html: content };
  };

  return (
    <div className="note-container" onClick={() => onEdit(note)}>
      <div className="note">
        <div className="note-outside-text" dangerouslySetInnerHTML={createMarkup(note.content)} />
        {note.imageUrl && <img src={note.imageUrl} alt="Attachment" style={{ maxWidth: '100%' }} />}
      </div>
      <div className="note-name">{note.title}</div>
    </div>
  );
}

export default Note;
