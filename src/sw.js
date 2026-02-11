// Custom Service Worker for Advanced Caching Strategies
const CACHE_NAME = 'ionic-boilerplate-v1';
const STATIC_CACHE = 'ionic-static-v1';
const DYNAMIC_CACHE = 'ionic-dynamic-v1';
const API_CACHE = 'ionic-api-v1';

// Cache configuration
const CACHE_CONFIG = {
  static: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    maxEntries: 100
  },
  dynamic: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    maxEntries: 50
  },
  api: {
    maxAge: 60 * 60 * 1000, // 1 hour
    maxEntries: 200
  }
};

// URLs to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/assets/icon/favicon.png',
  '/assets/icon/icon.png'
];

// API endpoints that should be cached
const API_ENDPOINTS = [
  '/api/config',
  '/api/static'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
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
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== API_CACHE) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle different types of requests
  if (isStaticAsset(request.url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  } else if (isAPIRequest(request.url)) {
    event.respondWith(handleAPIRequest(request));
  } else if (isNavigationRequest(request)) {
    event.respondWith(handleNavigationRequest(request));
  } else {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE));
  }
});

// Check if request is for static asset
function isStaticAsset(url) {
  return url.includes('/assets/') || 
         url.includes('/fonts.googleapis.com/') ||
         url.includes('/fonts.gstatic.com/') ||
         url.match(/\.(css|js|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/);
}

// Check if request is for API
function isAPIRequest(url) {
  return url.includes('/api/') || url.includes('api.');
}

// Check if request is for navigation
function isNavigationRequest(request) {
  return request.mode === 'navigate' || 
         (request.method === 'GET' && request.headers.get('accept').includes('text/html'));
}

// Cache-first strategy for static assets
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    // Update cache in background
    updateCache(request, cacheName);
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network request failed, serving from cache if available');
    return cachedResponse || new Response('Offline', { status: 503 });
  }
}

// Network-first strategy for dynamic content
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache the successful response
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network request failed, trying cache');
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (isNavigationRequest(request)) {
      return caches.match('/index.html');
    }
    
    return new Response('Offline', { status: 503 });
  }
}

// Handle API requests with specific strategies
async function handleAPIRequest(request) {
  const url = new URL(request.url);
  const cache = await caches.open(API_CACHE);
  
  // Check if this is a cacheable API endpoint
  const isCacheableEndpoint = API_ENDPOINTS.some(endpoint => 
    url.pathname.startsWith(endpoint)
  );
  
  if (isCacheableEndpoint) {
    // Use stale-while-revalidate for cacheable endpoints
    const cachedResponse = await cache.match(request);
    
    // Always try to fetch fresh data
    const fetchPromise = fetch(request).then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    }).catch(() => {
      console.log('API fetch failed, using cached response');
    });
    
    // Return cached response immediately if available
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Otherwise wait for network
    return fetchPromise;
  } else {
    // For non-cacheable API calls, use network only
    try {
      return await fetch(request);
    } catch (error) {
      // Try to serve from cache as fallback
      const cachedResponse = await cache.match(request);
      return cachedResponse || new Response('Offline', { status: 503 });
    }
  }
}

// Handle navigation requests
async function handleNavigationRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Navigation request failed, serving cached index.html');
    return caches.match('/index.html');
  }
}

// Update cache in background
async function updateCache(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse);
    }
  } catch (error) {
    console.log('Background cache update failed:', error);
  }
}

// Clean up old cache entries
async function cleanupCache(cacheName, maxAge, maxEntries) {
  const cache = await caches.open(cacheName);
  const requests = await cache.keys();
  const now = Date.now();
  
  // Remove expired entries
  for (const request of requests) {
    const response = await cache.match(request);
    const dateHeader = response?.headers.get('date');
    
    if (dateHeader) {
      const responseDate = new Date(dateHeader).getTime();
      if (now - responseDate > maxAge) {
        await cache.delete(request);
      }
    }
  }
  
  // Remove oldest entries if too many
  const remainingRequests = await cache.keys();
  if (remainingRequests.length > maxEntries) {
    const toDelete = remainingRequests.slice(0, remainingRequests.length - maxEntries);
    await Promise.all(toDelete.map(request => cache.delete(request)));
  }
}

// Periodic cache cleanup
setInterval(() => {
  cleanupCache(STATIC_CACHE, CACHE_CONFIG.static.maxAge, CACHE_CONFIG.static.maxEntries);
  cleanupCache(DYNAMIC_CACHE, CACHE_CONFIG.dynamic.maxAge, CACHE_CONFIG.dynamic.maxEntries);
  cleanupCache(API_CACHE, CACHE_CONFIG.api.maxAge, CACHE_CONFIG.api.maxEntries);
}, 60 * 60 * 1000); // Run every hour

// Message handling for cache management
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CACHE_CLEAR':
      clearAllCaches().then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
      
    case 'CACHE_STATUS':
      getCacheStatus().then((status) => {
        event.ports[0].postMessage(status);
      });
      break;
      
    default:
      console.log('Unknown message type:', type);
  }
});

// Clear all caches
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map(name => caches.delete(name)));
  console.log('All caches cleared');
}

// Get cache status
async function getCacheStatus() {
  const cacheNames = await caches.keys();
  const status = {};
  
  for (const name of cacheNames) {
    const cache = await caches.open(name);
    const keys = await cache.keys();
    status[name] = keys.length;
  }
  
  return status;
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  console.log('Background sync triggered');
  // Implement background sync logic here
}

// Push notification handling
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/assets/icon/icon.png',
    badge: '/assets/icon/favicon.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Explore',
        icon: '/assets/icon/icon.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/assets/icon/icon.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Ionic Boilerplate', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('Service Worker loaded');
