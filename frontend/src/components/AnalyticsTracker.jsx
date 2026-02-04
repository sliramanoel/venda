import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { analyticsApi } from '../services/api';

// Get UTM params from URL
const getUtmParams = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
    utm_term: params.get('utm_term'),
    utm_content: params.get('utm_content')
  };
};

// Analytics Tracker Component
const AnalyticsTracker = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Track page view on route change
    const trackPageView = async () => {
      const utmParams = getUtmParams();
      
      await analyticsApi.trackPageview({
        page: location.pathname,
        referrer: document.referrer || null,
        ...utmParams
      });
    };
    
    trackPageView();
  }, [location.pathname]);
  
  return null;
};

// Helper functions for tracking actions
export const trackAction = (action, metadata = {}) => {
  analyticsApi.trackAction(action, window.location.pathname, metadata);
};

// Predefined action trackers
export const trackCTAClick = (buttonName) => {
  trackAction('click_cta', { button: buttonName });
};

export const trackStartCheckout = () => {
  trackAction('start_checkout');
};

export const trackCompleteCheckout = (orderId, total) => {
  trackAction('complete_checkout', { order_id: orderId, total });
};

export const trackAddToCart = (productId, quantity) => {
  trackAction('add_to_cart', { product_id: productId, quantity });
};

export const trackFormStart = (formName) => {
  trackAction('form_start', { form: formName });
};

export const trackFormComplete = (formName) => {
  trackAction('form_complete', { form: formName });
};

export const trackShare = (platform) => {
  trackAction('share', { platform });
};

export default AnalyticsTracker;
