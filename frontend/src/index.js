import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Create root element
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the app
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// PWA install prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('beforeinstallprompt fired');
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;
  
  // Show install button/banner
  const installButton = document.getElementById('install-button');
  if (installButton) {
    installButton.style.display = 'block';
    
    installButton.addEventListener('click', () => {
      // Hide the app provided install promotion
      installButton.style.display = 'none';
      // Show the install prompt
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        deferredPrompt = null;
      });
    });
  }
});

// Track PWA installation
window.addEventListener('appinstalled', (evt) => {
  console.log('My Quran Journey was installed');
  // Track the event in analytics if needed
  if (window.gtag) {
    window.gtag('event', 'pwa_install', {
      'event_category': 'PWA',
      'event_label': 'App Installed'
    });
  }
});

// Handle offline/online status
window.addEventListener('online', () => {
  console.log('App is online');
  // Show online indicator
  const offlineIndicator = document.getElementById('offline-indicator');
  if (offlineIndicator) {
    offlineIndicator.style.display = 'none';
  }
});

window.addEventListener('offline', () => {
  console.log('App is offline');
  // Show offline indicator
  const offlineIndicator = document.getElementById('offline-indicator');
  if (offlineIndicator) {
    offlineIndicator.style.display = 'block';
  }
});

// Performance monitoring
if (process.env.NODE_ENV === 'production') {
  // Measure and report performance metrics
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'measure') {
        console.log(`${entry.name}: ${entry.duration}ms`);
        
        // Send to analytics if available
        if (window.gtag) {
          window.gtag('event', 'performance_measure', {
            'event_category': 'Performance',
            'event_label': entry.name,
            'value': Math.round(entry.duration)
          });
        }
      }
    }
  });
  
  observer.observe({ entryTypes: ['measure'] });
  
  // Report Core Web Vitals
  import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
    getCLS(console.log);
    getFID(console.log);
    getFCP(console.log);
    getLCP(console.log);
    getTTFB(console.log);
  });
}

// Error boundary for production
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  
  // Send error to monitoring service in production
  if (process.env.NODE_ENV === 'production') {
    // Track error in analytics
    if (window.gtag) {
      window.gtag('event', 'exception', {
        'description': event.error?.message || 'Unknown error',
        'fatal': false
      });
    }
  }
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  
  // Send error to monitoring service in production
  if (process.env.NODE_ENV === 'production') {
    // Track error in analytics
    if (window.gtag) {
      window.gtag('event', 'exception', {
        'description': event.reason?.message || 'Unhandled promise rejection',
        'fatal': false
      });
    }
  }
});

// Initialize app theme based on user preference
const initializeTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme) {
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  } else if (prefersDark) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }
};

// Initialize theme on load
initializeTheme();

// Listen for theme preference changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (!localStorage.getItem('theme')) {
    document.documentElement.classList.toggle('dark', e.matches);
  }
});

// Initialize Arabic text direction
document.documentElement.setAttribute('dir', 'ltr');

// Add viewport meta tag for proper mobile scaling
if (!document.querySelector('meta[name="viewport"]')) {
  const viewport = document.createElement('meta');
  viewport.name = 'viewport';
  viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
  document.head.appendChild(viewport);
}

// Prevent zoom on iOS Safari
document.addEventListener('gesturestart', function (e) {
  e.preventDefault();
});

// Add touch-action CSS for better mobile performance
document.addEventListener('DOMContentLoaded', () => {
  document.body.style.touchAction = 'manipulation';
});

console.log('My Quran Journey app initialized');
