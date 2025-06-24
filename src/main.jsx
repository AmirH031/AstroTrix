import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/globals.css';
import { registerSW } from 'virtual:pwa-register';

// Performance monitoring
const startTime = performance.now();

// Register Service Worker
if ('serviceWorker' in navigator) {
  const updateSW = registerSW({
    onNeedRefresh() {
      const event = new CustomEvent('pwaUpdateAvailable');
      window.dispatchEvent(event);
    },
    onOfflineReady() {
      console.log('App ready to work offline');
    },
  });
}

// Preload critical resources
const preloadCriticalResources = () => {
  const fontLink = document.createElement('link');
  fontLink.rel = 'preload';
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
  fontLink.as = 'style';
  fontLink.onload = function() { this.rel = 'stylesheet'; };
  document.head.appendChild(fontLink);

  const criticalImages = ['/AstroTrix/favicon.ico', '/AstroTrix/icon-192.png'];
  criticalImages.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = src;
    link.as = 'image';
    document.head.appendChild(link);
  });
};

// Initialize critical resources
preloadCriticalResources();

// Optimize initial render
const container = document.getElementById('root');
const root = createRoot(container, {
  unstable_strictMode: false,
});

// Remove initial loader with optimized timing
const removeLoader = () => {
  const loader = document.getElementById('initial-loader');
  if (loader) {
    loader.style.opacity = '0';
    loader.style.transition = 'opacity 300ms ease-out';
    setTimeout(() => {
      if (loader.parentNode) {
        loader.parentNode.removeChild(loader);
      }
    }, 300);
  }
};

// Render app with error boundary
const renderApp = () => {
  try {
    root.render(<App />);
  } catch (error) {
    console.error('🚨 Critical render error:', error);
    document.getElementById('root').innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #000; color: #fff; font-family: system-ui;">
        <div style="text-align: center;">
          <h1 style="color: #00ff00; margin-bottom: 1rem;">AstroTrix</h1>
          <p>Something went wrong. Please refresh the page.</p>
          <button onclick="window.location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #00ff00; color: #000; border: none; border-radius: 4px; cursor: pointer;">
            Refresh
          </button>
        </div>
      </div>
    `;
  }
};

// Render immediately for better FCP
renderApp();

// Performance optimizations
const optimizePerformance = () => {
  requestAnimationFrame(() => {
    setTimeout(removeLoader, 100);
  });

  if ('loading' in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img[data-src]');
    images.forEach(img => {
      img.src = img.dataset.src;
    });
  }

  const prefetchResources = () => {
    const resources = ['/AstroTrix/sounds/default.wav', '/AstroTrix/sounds/completion.wav'];
    resources.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = href;
      document.head.appendChild(link);
    });
  };

  setTimeout(prefetchResources, 2000);
};

window.addEventListener('load', () => {
  const loadTime = performance.now() - startTime;
  console.log(`🚀 App loaded in ${loadTime.toFixed(2)}ms`);
  
  optimizePerformance();
  
  if (process.env.NODE_ENV === 'development' && 'performance' in window) {
    setTimeout(() => {
      const perfData = performance.getEntriesByType('navigation')[0];
      if (perfData) {
        console.log('📊 Performance Metrics:', {
          'DNS Lookup': `${(perfData.domainLookupEnd - perfData.domainLookupStart).toFixed(2)}ms`,
          'TCP Connection': `${(perfData.connectEnd - perfData.connectStart).toFixed(2)}ms`,
          'Request': `${(perfData.responseStart - perfData.requestStart).toFixed(2)}ms`,
          'Response': `${(perfData.responseEnd - perfData.responseStart).toFixed(2)}ms`,
          'DOM Processing': `${(perfData.domContentLoadedEventEnd - perfData.responseEnd).toFixed(2)}ms`,
          'Total Load Time': `${(perfData.loadEventEnd - perfData.navigationStart).toFixed(2)}ms`
        });
      }
    }, 1000);
  }
});

window.addEventListener('error', (event) => {
  console.error('🚨 Unhandled error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Unhandled promise rejection:', event.reason);
  event.preventDefault();
});