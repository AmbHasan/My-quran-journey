const CACHE_NAME = 'my-quran-journey-v1.0.0';
const STATIC_CACHE_NAME = 'my-quran-journey-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'my-quran-journey-dynamic-v1.0.0';

// Files to cache for offline functionality
const STATIC_FILES = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Noto+Naskh+Arabic:wght@400;700&display=swap'
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/quran/chapters',
  '/api/quran/reciters',
  '/api/user/profile'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Service Worker: Static files cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Error caching static files', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated successfully');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }
  
  // Handle static files and pages
  event.respondWith(handleStaticRequest(request));
});

// Handle API requests with cache-first strategy for specific endpoints
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  // Cache-first strategy for read-only endpoints
  const cacheFirstEndpoints = [
    '/api/quran/chapters',
    '/api/quran/reciters',
    '/api/quran/chapter/',
    '/api/quran/verse/'
  ];
  
  const shouldCacheFirst = cacheFirstEndpoints.some(endpoint => 
    url.pathname.startsWith(endpoint)
  );
  
  if (shouldCacheFirst && request.method === 'GET') {
    try {
      // Try cache first
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      const cachedResponse = await cache.match(request);
      
      if (cachedResponse) {
        console.log('Service Worker: Serving from cache', request.url);
        
        // Update cache in background
        fetch(request)
          .then(response => {
            if (response.ok) {
              cache.put(request, response.clone());
            }
          })
          .catch(() => {}); // Silently fail background update
        
        return cachedResponse;
      }
      
      // If not in cache, fetch and cache
      const response = await fetch(request);
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
      
    } catch (error) {
      console.error('Service Worker: Error handling API request', error);
      return new Response(
        JSON.stringify({ error: 'Offline - data not available' }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }
  
  // Network-first strategy for other API requests
  try {
    const response = await fetch(request);
    
    // Cache successful GET requests
    if (response.ok && request.method === 'GET') {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Try to serve from cache if network fails
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response
    return new Response(
      JSON.stringify({ error: 'Network unavailable' }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle static requests (HTML, CSS, JS, images)
async function handleStaticRequest(request) {
  try {
    // Try cache first for static assets
    const cache = await caches.open(STATIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('Service Worker: Serving static file from cache', request.url);
      return cachedResponse;
    }
    
    // If not in cache, fetch from network
    const response = await fetch(request);
    
    // Cache successful responses for static files
    if (response.ok && isStaticFile(request.url)) {
      cache.put(request, response.clone());
    }
    
    return response;
    
  } catch (error) {
    console.error('Service Worker: Error serving static request', error);
    
    // For navigation requests, serve the main page from cache
    if (request.mode === 'navigate') {
      const cache = await caches.open(STATIC_CACHE_NAME);
      const fallbackResponse = await cache.match('/');
      
      if (fallbackResponse) {
        return fallbackResponse;
      }
    }
    
    // Return a basic offline page
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>My Quran Journey - Offline</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              text-align: center;
              padding: 2rem;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0;
            }
            .container {
              max-width: 400px;
            }
            h1 { margin-bottom: 1rem; }
            p { margin-bottom: 2rem; line-height: 1.6; }
            button {
              background: white;
              color: #667eea;
              border: none;
              padding: 1rem 2rem;
              border-radius: 0.5rem;
              font-weight: bold;
              cursor: pointer;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>📖 My Quran Journey</h1>
            <p>You're currently offline, but you can still access cached content.</p>
            <button onclick="window.location.reload()">Try Again</button>
          </div>
        </body>
      </html>
      `,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
}

// Check if URL is for a static file
function isStaticFile(url) {
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf'];
  return staticExtensions.some(ext => url.includes(ext));
}

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'background-sync-learning-progress') {
    event.waitUntil(syncLearningProgress());
  }
});

// Sync learning progress when back online
async function syncLearningProgress() {
  try {
    // Get stored offline actions from IndexedDB
    const actions = await getStoredActions();
    
    for (const action of actions) {
      try {
        await fetch(action.url, {
          method: action.method,
          headers: action.headers,
          body: action.body
        });
        
        // Remove successfully synced action
        await removeStoredAction(action.id);
        console.log('Service Worker: Synced offline action', action.id);
      } catch (error) {
        console.error('Service Worker: Failed to sync action', action.id, error);
      }
    }
  } catch (error) {
    console.error('Service Worker: Error during background sync', error);
  }
}

// Handle push notifications (for future enhancement)
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    data: data.data,
    actions: [
      {
        action: 'open',
        title: 'Open App'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Helper functions for IndexedDB operations (simplified)
async function getStoredActions() {
  // In a real implementation, this would use IndexedDB
  return [];
}

async function removeStoredAction(actionId) {
  // In a real implementation, this would remove from IndexedDB
  console.log('Removing stored action:', actionId);
}

// Cache Quran audio files when requested
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_AUDIO') {
    const audioUrl = event.data.url;
    
    caches.open(DYNAMIC_CACHE_NAME)
      .then(cache => cache.add(audioUrl))
      .then(() => {
        event.ports[0].postMessage({ success: true });
      })
      .catch(error => {
        console.error('Error caching audio:', error);
        event.ports[0].postMessage({ success: false, error });
      });
  }
});

console.log('Service Worker: Loaded successfully');
