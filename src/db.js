import { openDB } from 'idb';
import axios from 'axios';

const dbRequest = indexedDB.open('smartnote', 1);

dbRequest.onupgradeneeded = function(event) {
  const db = event.target.result;
  if (!db.objectStoreNames.contains('folders')) {
    db.createObjectStore('folders', { keyPath: 'id' });
  }
  if (!db.objectStoreNames.contains('notes')) {
    db.createObjectStore('notes', { keyPath: 'id' });
  }
  if (!db.objectStoreNames.contains('users')) {
    db.createObjectStore('users', { keyPath: 'id' });
  }
};

export function saveFolder(folder) {
  return new Promise((resolve, reject) => {
    const dbRequest = indexedDB.open('smartnote', 1);
    dbRequest.onsuccess = event => {
      const db = event.target.result;
      const transaction = db.transaction('folders', 'readwrite');
      const store = transaction.objectStore('folders');
      const request = store.put(folder);
      request.onsuccess = () => resolve();
      request.onerror = error => reject(error);
    };
    dbRequest.onerror = error => reject(error);
  });
}

export function getFolders() {
  return new Promise((resolve, reject) => {
    const dbRequest = indexedDB.open('smartnote', 1);
    dbRequest.onsuccess = event => {
      const db = event.target.result;
      const transaction = db.transaction('folders', 'readonly');
      const store = transaction.objectStore('folders');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = error => reject(error);
    };
    dbRequest.onerror = error => reject(error);
  });
}

export function saveNote(note) {
  return new Promise((resolve, reject) => {
    const dbRequest = indexedDB.open('smartnote', 1);
    dbRequest.onsuccess = event => {
      const db = event.target.result;
      const transaction = db.transaction('notes', 'readwrite');
      const store = transaction.objectStore('notes');
      const request = store.put(note);
      request.onsuccess = () => resolve();
      request.onerror = error => reject(error);
    };
    dbRequest.onerror = error => reject(error);
  });
}

export function getNotes() {
  return new Promise((resolve, reject) => {
    const dbRequest = indexedDB.open('smartnote', 1);
    dbRequest.onsuccess = event => {
      const db = event.target.result;
      const transaction = db.transaction('notes', 'readonly');
      const store = transaction.objectStore('notes');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = error => reject(error);
    };
    dbRequest.onerror = error => reject(error);
  });
}

export function deleteNote(noteId) {
  return new Promise((resolve, reject) => {
    const dbRequest = indexedDB.open('smartnote', 1);
    dbRequest.onsuccess = event => {
      const db = event.target.result;
      const transaction = db.transaction('notes', 'readwrite');
      const store = transaction.objectStore('notes');
      const request = store.delete(noteId);
      request.onsuccess = () => resolve();
      request.onerror = error => reject(error);
    };
    dbRequest.onerror = error => reject(error);
  });
}

export function deleteFolder(folderId) {
  return new Promise((resolve, reject) => {
    const dbRequest = indexedDB.open('smartnote', 1);
    dbRequest.onsuccess = event => {
      const db = event.target.result;
      const transaction = db.transaction('folders', 'readwrite');
      const store = transaction.objectStore('folders');
      const request = store.delete(folderId);
      request.onsuccess = () => resolve();
      request.onerror = error => reject(error);
    };
    dbRequest.onerror = error => reject(error);
  });
}

export function clearStore() {
  return new Promise((resolve, reject) => {
    const dbRequest = indexedDB.open('smartnote', 1);
    dbRequest.onsuccess = event => {
      const db = event.target.result;
      const foldersTransaction = db.transaction('folders', 'readwrite');
      const foldersStore = foldersTransaction.objectStore('folders');
      foldersStore.clear();

      const notesTransaction = db.transaction('notes', 'readwrite');
      const notesStore = notesTransaction.objectStore('notes');
      notesStore.clear();

      resolve();
    };
    dbRequest.onerror = error => reject(error);
  });
}

export async function syncNotes(user) {
  const localNotes = await getNotes();
  for (const note of localNotes) {
    try {
      await axios.post('/api/notes', note, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
    } catch (error) {
      console.error('Error syncing note', error);
    }
  }
}

export function saveUser(user) {
  return new Promise((resolve, reject) => {
    const dbRequest = indexedDB.open('smartnote', 1);
    dbRequest.onsuccess = event => {
      const db = event.target.result;
      const transaction = db.transaction('users', 'readwrite');
      const store = transaction.objectStore('users');
      const request = store.put(user);
      request.onsuccess = () => resolve();
      request.onerror = error => reject(error);
    };
    dbRequest.onerror = error => reject(error);
  });
}

export function getUser(userId) {
  return new Promise((resolve, reject) => {
    const dbRequest = indexedDB.open('smartnote', 1);
    dbRequest.onsuccess = event => {
      const db = event.target.result;
      const transaction = db.transaction('users', 'readonly');
      const store = transaction.objectStore('users');
      const request = store.get(userId); // Передача ключа userId в метод get
      request.onsuccess = () => resolve(request.result);
      request.onerror = error => reject(error);
    };
    dbRequest.onerror = error => reject(error);
  });
}
