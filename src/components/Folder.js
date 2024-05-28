import React, { useState, useEffect } from 'react';
import Note from './Note';
import '../stylesheet/Folder.css';
import '../stylesheet/global.css';

const Folder = ({ folder, updateFolderName, addNote, handleEditNote, handleDeleteFolder, handleDeleteNote }) => {
  const [notes, setNotes] = useState(folder.notes || []);
  const [isEditing, setIsEditing] = useState(false);
  const [folderName, setFolderName] = useState(folder.name);
  const [error, setError] = useState('');
  const [deletingNote, setDeletingNote] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState([]);

  useEffect(() => {
    setFolderName(folder.name);
  }, [folder.name]);

  useEffect(() => {
    setNotes(folder.notes || []);
  }, [folder.notes]);

  const handleAddNote = () => {
    const newNote = {
      id: notes.length + 1,
      title: `Заметка ${notes.length + 1}`,
      content: 'Новое содержимое заметки'
    };
    setNotes([...notes, newNote]);
    addNote(folder.id, newNote);
  };

  const handleFolderNameChange = (e) => {
    setFolderName(e.target.value);
  };

  const handleFolderNameBlur = () => {
    if (folderName.trim() === '') {
      setError('Имя папки не может быть пустым');
      return;
    }
    setError('');
    updateFolderName(folder.id, folderName);
    setIsEditing(false);
  };

  const toggleDeletingNote = () => {
    setDeletingNote(!deletingNote);
    setSelectedNotes([]);
  };

  const toggleNoteSelection = (noteId) => {
    if (selectedNotes.includes(noteId)) {
      setSelectedNotes(selectedNotes.filter(id => id !== noteId));
    } else {
      setSelectedNotes([...selectedNotes, noteId]);
    }
  };

  const confirmDeleteNotes = async () => {
    for (const noteId of selectedNotes) {
      await handleDeleteNote(noteId);
    }
    setDeletingNote(false);
    setSelectedNotes([]);
  };

  const confirmDeleteFolder = () => {
    if (window.confirm('Вы действительно хотите удалить эту папку и все её заметки?')) {
      handleDeleteFolder(folder.id);
    }
  };

  return (
    <>
      <div className="folder">
        {isEditing ? (
          <>
            <input
              type="text"
              className="folder-name-input"
              value={folderName}
              onChange={handleFolderNameChange}
              onBlur={handleFolderNameBlur}
              autoFocus
            />
            {error && <p className="error">{error}</p>}
          </>
        ) : (
          <div className="folder-header">
            <h2 className="folder-name" onClick={() => setIsEditing(true)}>
              {folderName}
            </h2>
            <button className="delete-folder" onClick={confirmDeleteFolder}>Удалить папку</button>
          </div>
        )}
        
        <div className="notes">
          {notes.map(note => (
            <div key={note.id} className="note-wrapper">
              {deletingNote && (
                <input
                  type="checkbox"
                  checked={selectedNotes.includes(note.id)}
                  onChange={() => toggleNoteSelection(note.id)}
                />
              )}
              <Note note={note} onEdit={() => handleEditNote(note)} />
            </div>
          ))}
          <div className="note add-note" onClick={handleAddNote}>+</div>
        </div>
        <div className="note-actions">
          {deletingNote ? (
            <button className="confirm-delete" onClick={confirmDeleteNotes}>Подтвердить</button>
          ) : (
            <button className="delete-note" onClick={toggleDeletingNote}>Удалить заметку</button>
          )}
        </div>
      </div>
      <div className="myInfo">Программу написал студент группы ИВТ-02 - Машенкин Олег</div>
    </>
  );
};


export default Folder;
