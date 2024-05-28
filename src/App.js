import React, { useState, useEffect, useMemo } from 'react';
import './stylesheet/global.css';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Folder from './components/Folder';
import EditNote from './components/EditNote';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import UserProfile from './components/UserProfile';
import axios from './api/axios';
import { jwtDecode } from 'jwt-decode';
import { saveFolder, getFolders, saveNote, getNotes, deleteNote, deleteFolder, clearStore, saveUser, getUser } from './db';

function App() {
  const [folders, setFolders] = useState([]);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [creatingNote, setCreatingNote] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isUserProfileVisible, setIsUserProfileVisible] = useState(false);
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogin = async (user, token) => {
    localStorage.setItem('token', token);
    setUser(user);
    setIsLoggedIn(true);
    await saveUser(user); // Save user data to IndexedDB
    loadFolders();
  };

  const handleRegister = async (user, token) => {
    localStorage.setItem('token', token);
    setUser(user);
    setIsLoggedIn(true);
    await saveUser(user); // Save user data to IndexedDB
    loadFolders();
  };

  const handleGoToRegister = () => {
    setIsRegistering(true);
  };

  const handleGoBack = () => {
    setIsRegistering(false);
  };

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSelectFolder = (folder) => {
    setCurrentFolderId(folder.id);
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
  };

  const handleSaveNoteInFolder = async (updatedNote) => {
    try {
      if (navigator.onLine) {
        await axios.put(`/api/notes/${updatedNote.id}`, updatedNote, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
      }
      setFolders(folders.map(folder =>
        folder.id === currentFolderId
          ? { ...folder, notes: folder.notes.map(note => note.id === updatedNote.id ? updatedNote : note) }
          : folder
      ));
      setEditingNote(null);
      await saveNote(updatedNote);
    } catch (error) {
      console.error('Error saving note', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingNote(null);
  };

  const handleAddFolder = async () => {
    const newFolder = { id: Date.now(), name: `Папка ${folders.length + 1}`, userId: user.id, notes: [] };
    setFolders([...folders, newFolder]);
    await saveFolder(newFolder);
  
    try {
      const result = await axios.post('/api/folders', { name: newFolder.name }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const updatedFolder = { ...newFolder, id: result.data.id };
      setFolders(prevFolders => prevFolders.map(folder => (folder.id === newFolder.id ? updatedFolder : folder)));
      await saveFolder(updatedFolder);
    } catch (error) {
      console.error('Error adding folder', error);
    }
  };


  const handleUpdateFolderName = async (folderId, newName) => {
    try {
      if (navigator.onLine) {
        await axios.put(`/api/folders/${folderId}`, { name: newName }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
      }
      setFolders(folders.map(folder =>
        folder.id === folderId
          ? { ...folder, name: newName }
          : folder
      ));
    } catch (error) {
      console.error('Error updating folder name', error);
    }
  };

  const handleAddNote = async (folderId, newNote) => {
    const noteWithId = { ...newNote, id: Date.now(), folderId };
    setFolders(prevFolders =>
      prevFolders.map(folder =>
        folder.id === folderId ? { ...folder, notes: [...folder.notes, noteWithId] } : folder
      )
    );
    await saveNote(noteWithId);
  
    try {
      const result = await axios.post('/api/notes', { title: newNote.title, content: newNote.content, folderId }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const updatedNote = { ...noteWithId, id: result.data.id };
      setFolders(prevFolders =>
        prevFolders.map(folder =>
          folder.id === folderId ? { ...folder, notes: folder.notes.map(note => (note.id === noteWithId.id ? updatedNote : note)) } : folder
        )
      );
      await saveNote(updatedNote);
    } catch (error) {
      console.error('Error adding note', error);
    }
  };

  const handleDeleteNote = async (noteId) => {
    setFolders(folders.map(folder => ({
      ...folder,
      notes: folder.notes.filter(note => note.id !== noteId)
    })));
    await deleteNote(noteId);

    try {
      if (navigator.onLine) {
        await axios.delete(`/api/notes/${noteId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
      }
    } catch (error) {
      console.error('Error deleting note', error);
    }
  };

  const handleDeleteFolder = async (folderId) => {
    setFolders(folders.filter(folder => folder.id !== folderId));
    await deleteFolder(folderId);

    try {
      if (navigator.onLine) {
        await axios.delete(`/api/folders/${folderId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
      }
    } catch (error) {
      console.error('Error deleting folder', error);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleToggleUserProfile = () => {
    setIsUserProfileVisible(true);
  };

  const handleGoBackFromUserProfile = () => {
    setIsUserProfileVisible(false);
  };

  const handleLogout = async () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setIsUserProfileVisible(false);
    setUser(null);
    await clearStore(); // Clear IndexedDB data on logout
  };

  const filteredNotes = useMemo(() => {
    if (!searchQuery) {
      return [];
    }

    return folders.flatMap(folder =>
      folder.notes.filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase())
      ).map(note => ({ ...note, folderName: folder.name }))
    );
  }, [folders, searchQuery]);

  const currentFolder = folders.find(folder => folder.id === currentFolderId);

useEffect(() => {
  const loadLocalData = async () => {
    const localFolders = await getFolders();
    const localNotes = await getNotes();
    const foldersWithNotes = localFolders.map(folder => ({
      ...folder,
      notes: localNotes.filter(note => note.folderId === folder.id)
    }));
    setFolders(foldersWithNotes);

    const token = localStorage.getItem('token');
    if (token) {
      const userId = jwtDecode(token).userId;
      const localUser = await getUser(userId);
      if (localUser) {
        setUser(localUser);
        setIsLoggedIn(true);
        loadFolders();
      } else {
        axios.get('/api/user', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
          .then(response => {
            setUser(response.data);
            setIsLoggedIn(true);
            saveUser(response.data);
            loadFolders();
          })
          .catch(error => {
            console.error('Error fetching user profile', error);
          });
      }
    }
  };

  loadLocalData();
}, []);

  const loadFolders = async () => {
    try {
      const result = await axios.get('/api/folders', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const foldersWithNotes = result.data.map(folder => ({
        ...folder,
        notes: folder.notes || []
      }));
      setFolders(foldersWithNotes);
      foldersWithNotes.forEach(folder => saveFolder(folder));
      foldersWithNotes.flatMap(folder => folder.notes).forEach(note => saveNote(note));
    } catch (error) {
      console.error('Error loading folders', error);
    }
  };

  if (!isLoggedIn) {
    return isRegistering ? (
      <RegisterPage onRegister={handleRegister} onGoBack={handleGoBack} />
    ) : (
      <LoginPage onLogin={handleLogin} onGoToRegister={handleGoToRegister} />
    );
  }

  return (
    <div className="App">
      {isUserProfileVisible ? (
        <UserProfile user={user} onGoBack={handleGoBackFromUserProfile} />
      ) : (
        <>
          <Sidebar folders={folders} 
            onSelectFolder={handleSelectFolder} 
            addFolder={handleAddFolder} 
            isOpen={isSidebarOpen}
            toggleSidebar={handleToggleSidebar}
          />
          <div className="main">
            <Header
              onSearch={handleSearch}
              onToggleUserProfile={handleToggleUserProfile}
              onLogout={handleLogout}
              user={user} 
              nickname={user.nickname}
              isSidebarOpen={isSidebarOpen}
              handleToggleSidebar={handleToggleSidebar}
            />
            {editingNote ? (
              <EditNote
                note={editingNote}
                onSave={handleSaveNoteInFolder}
                onCancel={handleCancelEdit}
              />
            ) : searchQuery && filteredNotes.length === 0 ? (
              <div className="no-results">
                <div>Ничего не найдено</div>
                {creatingNote ? (
                  <div className="select-folder">
                    {folders.map(folder => (
                      <div
                        key={folder.id}
                        className="select-folder-item"
                        onClick={() => handleAddNote(folder.id, { id: Date.now(), title: 'Новая заметка', content: '' })}
                      >
                        {folder.name}
                      </div>
                    ))}
                  </div>
                ) : (
                  <button className="add-note" onClick={() => setCreatingNote(true)}>+</button>
                )}
              </div>
            ) : searchQuery ? (
              <div className="search-results">
                {filteredNotes.map(note => (
                  <div key={note.id} className="note-container">
                    <div className="note" onClick={() => handleEditNote(note)}>
                      <div className="note-content">{note.content}</div>
                    </div>
                    <div className="note-name">
                      {note.title}
                      <div className="note-folder">в {note.folderName}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : currentFolder ? (
              <Folder
                folder={currentFolder}
                updateFolderName={handleUpdateFolderName}
                addNote={handleAddNote}
                handleEditNote={handleEditNote}
                handleDeleteFolder={handleDeleteFolder}
                handleDeleteNote={handleDeleteNote}
              />
            ) : (
              <div className="welcome-message">Выберите папку для просмотра или редактирования заметок</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default App;





