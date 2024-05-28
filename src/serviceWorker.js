/* eslint-disable no-restricted-globals */
import axios from './api/axios';

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(
    /^127(?:\.(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])){3}$/
  )
);

const CACHE_NAME = 'smartnote-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/static/js/bundle.js',
  '/static/js/1.chunk.js',
  '/static/js/main.chunk.js',
];

export function register(config) {
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${publicUrl.origin}/serviceWorker.js`;

      if (isLocalhost) {
        checkValidServiceWorker(swUrl, config);
        navigator.serviceWorker.ready.then(() => {
          console.log(
            'Это веб-приложение обслуживается service worker с кэшированием. Подробнее: https://bit.ly/CRA-PWA'
          );
        });
      } else {
        registerValidSW(swUrl, config);
      }
    });
  }
}

function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then(registration => {
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              console.log(
                'Новое содержимое доступно и будет использоваться после закрытия всех вкладок для этой страницы. Подробнее: https://bit.ly/CRA-PWA.'
              );

              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              console.log('Содержимое закэшировано для оффлайн использования.');

              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch(error => {
      console.error('Ошибка при регистрации service worker:', error);
    });

  navigator.serviceWorker.addEventListener('fetch', event => {
    event.respondWith(
      caches.match(event.request).then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(response => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return response;
        });
      }).catch(() => {
        return caches.match('/offline.html');
      })
    );
  });

  navigator.serviceWorker.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (!cacheWhitelist.includes(cacheName)) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    );
  });

  self.addEventListener('sync', event => {
    if (event.tag === 'sync-data') {
      event.waitUntil(syncData());
    }
  });
}

function checkValidServiceWorker(swUrl, config) {
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' }
  })
    .then(response => {
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        navigator.serviceWorker.ready.then(registration => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log(
        'Интернет-соединение не найдено. Приложение работает в оффлайн режиме.'
      );
    });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(registration => {
        registration.unregister();
      })
      .catch(error => {
        console.error(error.message);
      });
  }
}

async function syncData() {
  const localNotes = await getNotes();
  const localFolders = await getFolders();
  const user = await getUser();
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    await Promise.all([
      ...localNotes.map(note => {
        return axios.post('/api/notes', note, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }),
      ...localFolders.map(folder => {
        return axios.post('/api/folders', folder, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }),
      axios.put('/api/user', user, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
    ]);
  } catch (error) {
    console.error('Error syncing data', error);
  }
}

function getNotes() {
  return new Promise((resolve, reject) => {
    const dbRequest = indexedDB.open('smartnote', 1);
    dbRequest.onsuccess = event => {
      const db = event.target.result;
      const transaction = db.transaction('notes', 'readonly');
      const store = transaction.objectStore('notes');
      const getRequest = store.getAll();
      getRequest.onsuccess = () => resolve(getRequest.result);
      getRequest.onerror = error => reject(error);
    };
    dbRequest.onerror = error => reject(error);
  });
}

function getFolders() {
  return new Promise((resolve, reject) => {
    const dbRequest = indexedDB.open('smartnote', 1);
    dbRequest.onsuccess = event => {
      const db = event.target.result;
      const transaction = db.transaction('folders', 'readonly');
      const store = transaction.objectStore('folders');
      const getRequest = store.getAll();
      getRequest.onsuccess = () => resolve(getRequest.result);
      getRequest.onerror = error => reject(error);
    };
    dbRequest.onerror = error => reject(error);
  });
}

function getUser() {
  return new Promise((resolve, reject) => {
    const dbRequest = indexedDB.open('smartnote', 1);
    dbRequest.onsuccess = event => {
      const db = event.target.result;
      const transaction = db.transaction('user', 'readonly');
      const store = transaction.objectStore('user');
      const getRequest = store.get(1);
      getRequest.onsuccess = () => resolve(getRequest.result);
      getRequest.onerror = error => reject(error);
    };
    dbRequest.onerror = error => reject(error);
  });
}
