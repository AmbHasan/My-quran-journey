import React, { useEffect } from 'react';

const AdComponents = ({ adType = 'banner', adSlot = '1234567890' }) => {
  useEffect(() => {
    try {
      // Load AdSense ads when component mounts
      if (window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  // Different ad configurations based on type
  const getAdConfig = () => {
    switch (adType) {
      case 'banner':
        return {
          className: 'adsbygoogle',
          style: { display: 'block' },
          'data-ad-client': 'ca-pub-YOUR_ADSENSE_ID',
          'data-ad-slot': adSlot,
          'data-ad-format': 'auto',
          'data-full-width-responsive': 'true'
        };
      
      case 'rectangle':
        return {
          className: 'adsbygoogle',
          style: { display: 'inline-block', width: '300px', height: '250px' },
          'data-ad-client': 'ca-pub-YOUR_ADSENSE_ID',
          'data-ad-slot': adSlot
        };
      
      case 'leaderboard':
        return {
          className: 'adsbygoogle',
          style: { display: 'inline-block', width: '728px', height: '90px' },
          'data-ad-client': 'ca-pub-YOUR_ADSENSE_ID',
          'data-ad-slot': adSlot
        };
      
      case 'mobile-banner':
        return {
          className: 'adsbygoogle',
          style: { display: 'inline-block', width: '320px', height: '50px' },
          'data-ad-client': 'ca-pub-YOUR_ADSENSE_ID',
          'data-ad-slot': adSlot
        };
      
      default:
        return {
          className: 'adsbygoogle',
          style: { display: 'block' },
          'data-ad-client': 'ca-pub-YOUR_ADSENSE_ID',
          'data-ad-slot': adSlot,
          'data-ad-format': 'auto',
          'data-full-width-responsive': 'true'
        };
    }
  };

  const adConfig = getAdConfig();

  return (
    <div className="ad-container my-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <div className="text-xs text-gray-500 mb-2 text-center">Advertisement</div>
      
      {/* AdSense Ad Unit */}
      <ins {...adConfig}></ins>
      
      {/* Fallback content if ads don't load */}
      <div className="ad-fallback hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg text-center">
          <h3 className="font-bold mb-2">Upgrade to Premium</h3>
          <p className="text-sm mb-3">Remove ads and unlock all features</p>
          <button className="bg-white text-blue-600 px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition duration-300">
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
};

// Banner Ad Component
export const BannerAd = ({ adSlot }) => {
  return <AdComponents adType="banner" adSlot={adSlot} />;
};

// Rectangle Ad Component
export const RectangleAd = ({ adSlot }) => {
  return <AdComponents adType="rectangle" adSlot={adSlot} />;
};

// Leaderboard Ad Component
export const LeaderboardAd = ({ adSlot }) => {
  return <AdComponents adType="leaderboard" adSlot={adSlot} />;
};

// Mobile Banner Ad Component
export const MobileBannerAd = ({ adSlot }) => {
  return <AdComponents adType="mobile-banner" adSlot={adSlot} />;
};

// Responsive Ad Component that adapts to screen size
export const ResponsiveAd = ({ adSlot }) => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <AdComponents 
      adType={isMobile ? 'mobile-banner' : 'leaderboard'} 
      adSlot={adSlot} 
    />
  );
};

// Ad with loading state
export const AdWithLoading = ({ adType = 'banner', adSlot }) => {
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Simulate ad loading

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="ad-container my-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="text-xs text-gray-500 mb-2 text-center">Loading advertisement...</div>
        <div className="animate-pulse bg-gray-300 h-20 rounded"></div>
      </div>
    );
  }

  return <AdComponents adType={adType} adSlot={adSlot} />;
};

// Ad blocker detection component
export const AdBlockerDetector = ({ children }) => {
  const [adBlockerDetected, setAdBlockerDetected] = React.useState(false);

  React.useEffect(() => {
    // Simple ad blocker detection
    const detectAdBlocker = () => {
      const testAd = document.createElement('div');
      testAd.innerHTML = '&nbsp;';
      testAd.className = 'adsbox';
      testAd.style.position = 'absolute';
      testAd.style.left = '-10000px';
      
      document.body.appendChild(testAd);
      
      setTimeout(() => {
        if (testAd.offsetHeight === 0) {
          setAdBlockerDetected(true);
        }
        document.body.removeChild(testAd);
      }, 100);
    };

    detectAdBlocker();
  }, []);

  if (adBlockerDetected) {
    return (
      <div className="ad-container my-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="text-center">
          <h3 className="font-bold text-yellow-800 mb-2">Ad Blocker Detected</h3>
          <p className="text-sm text-yellow-700 mb-3">
            Please consider disabling your ad blocker to support My Quran Journey, or upgrade to Premium.
          </p>
          <button className="bg-yellow-600 text-white px-4 py-2 rounded-md font-medium hover:bg-yellow-700 transition duration-300">
            Upgrade to Premium
          </button>
        </div>
      </div>
    );
  }

  return children;
};

// Sticky Ad Component
export const StickyAd = ({ adSlot, position = 'bottom' }) => {
  const [isVisible, setIsVisible] = React.useState(true);

  const positionClasses = {
    top: 'fixed top-0 left-0 right-0 z-40',
    bottom: 'fixed bottom-0 left-0 right-0 z-40'
  };

  if (!isVisible) return null;

  return (
    <div className={`${positionClasses[position]} bg-white border-t shadow-lg`}>
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex-1">
          <AdComponents adType="mobile-banner" adSlot={adSlot} />
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="ml-2 text-gray-500 hover:text-gray-700 p-1"
          aria-label="Close ad"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Video Ad Component
export const VideoAd = ({ adSlot }) => {
  return (
    <div className="ad-container my-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <div className="text-xs text-gray-500 mb-2 text-center">Video Advertisement</div>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-YOUR_ADSENSE_ID"
        data-ad-slot={adSlot}
        data-ad-format="fluid"
        data-ad-layout-key="-gw-3+1f-3d+2z"
      ></ins>
    </div>
  );
};

export default AdComponents;
