/**
 * Meta Pixel (Facebook Pixel) Tracking Utility
 * Handles all conversion events for Meta Ads optimization
 */

// Initialize Meta Pixel
export const initMetaPixel = (pixelId) => {
  if (!pixelId || typeof window === 'undefined') return;
  
  // Check if already initialized
  if (window.fbq) return;

  // Meta Pixel base code
  (function(f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function() {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = true;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

  window.fbq('init', pixelId);
  window.fbq('track', 'PageView');
  
  console.log('[Meta Pixel] Initialized with ID:', pixelId);
};

// Track Page View
export const trackPageView = () => {
  if (window.fbq) {
    window.fbq('track', 'PageView');
  }
};

// Track View Content (Product Page)
export const trackViewContent = (productData) => {
  if (window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_name: productData.name || 'NeuroVita',
      content_category: 'Suplementos',
      content_type: 'product',
      content_ids: [productData.id || '1'],
      value: productData.price || 0,
      currency: 'BRL'
    });
    console.log('[Meta Pixel] ViewContent tracked');
  }
};

// Track Add to Cart (Option Selection)
export const trackAddToCart = (productData) => {
  if (window.fbq) {
    window.fbq('track', 'AddToCart', {
      content_name: productData.name,
      content_type: 'product',
      content_ids: [productData.id || '1'],
      value: productData.price || 0,
      currency: 'BRL'
    });
    console.log('[Meta Pixel] AddToCart tracked');
  }
};

// Track Initiate Checkout (Start order form)
export const trackInitiateCheckout = (orderData) => {
  if (window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      content_name: orderData.productName || 'NeuroVita',
      content_category: 'Suplementos',
      content_ids: [orderData.optionId || '1'],
      num_items: 1,
      value: orderData.totalPrice || 0,
      currency: 'BRL'
    });
    console.log('[Meta Pixel] InitiateCheckout tracked');
  }
};

// Track Add Payment Info (CEP calculated, ready to pay)
export const trackAddPaymentInfo = (orderData) => {
  if (window.fbq) {
    window.fbq('track', 'AddPaymentInfo', {
      content_category: 'Suplementos',
      content_ids: [orderData.optionId || '1'],
      value: orderData.totalPrice || 0,
      currency: 'BRL'
    });
    console.log('[Meta Pixel] AddPaymentInfo tracked');
  }
};

// Track Purchase (Order Created / Payment Initiated)
export const trackPurchase = (orderData) => {
  if (window.fbq) {
    window.fbq('track', 'Purchase', {
      content_name: orderData.productName || 'NeuroVita',
      content_type: 'product',
      content_ids: [orderData.optionId || '1'],
      num_items: 1,
      value: orderData.totalPrice || 0,
      currency: 'BRL',
      order_id: orderData.orderId || ''
    });
    console.log('[Meta Pixel] Purchase tracked:', orderData.orderId);
  }
};

// Track Lead (Form Started)
export const trackLead = (data = {}) => {
  if (window.fbq) {
    window.fbq('track', 'Lead', {
      content_name: data.source || 'Checkout Form',
      content_category: 'Suplementos'
    });
    console.log('[Meta Pixel] Lead tracked');
  }
};

// Track Complete Registration (Order Submitted)
export const trackCompleteRegistration = (orderData) => {
  if (window.fbq) {
    window.fbq('track', 'CompleteRegistration', {
      content_name: orderData.productName || 'NeuroVita',
      value: orderData.totalPrice || 0,
      currency: 'BRL'
    });
    console.log('[Meta Pixel] CompleteRegistration tracked');
  }
};

// Track Custom Event
export const trackCustomEvent = (eventName, data = {}) => {
  if (window.fbq) {
    window.fbq('trackCustom', eventName, data);
    console.log('[Meta Pixel] Custom event tracked:', eventName);
  }
};

// ============== UTM TRACKING ==============

const UTM_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid'];
const UTM_STORAGE_KEY = 'neurovita_utm_params';

// Get UTM params from URL
export const getUTMParams = () => {
  if (typeof window === 'undefined') return {};
  
  const params = new URLSearchParams(window.location.search);
  const utmData = {};
  
  UTM_PARAMS.forEach(param => {
    const value = params.get(param);
    if (value) {
      utmData[param] = value;
    }
  });
  
  return utmData;
};

// Save UTM params to session storage
export const saveUTMParams = () => {
  const utmData = getUTMParams();
  
  if (Object.keys(utmData).length > 0) {
    // Merge with existing params (first touch wins)
    const existing = getStoredUTMParams();
    const merged = { ...utmData, ...existing }; // Existing takes precedence
    sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(merged));
    console.log('[UTM] Params saved:', merged);
  }
};

// Get stored UTM params
export const getStoredUTMParams = () => {
  if (typeof window === 'undefined') return {};
  
  try {
    const stored = sessionStorage.getItem(UTM_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

// Get UTM params for order attribution
export const getOrderUTMParams = () => {
  const current = getUTMParams();
  const stored = getStoredUTMParams();
  return { ...stored, ...current }; // Current takes precedence
};

// ============== INITIALIZATION ==============

// Initialize all tracking on app load
export const initTracking = (settings) => {
  // Save UTM params from URL
  saveUTMParams();
  
  // Initialize Meta Pixel if configured
  if (settings?.metaPixelId) {
    initMetaPixel(settings.metaPixelId);
  }
};

export default {
  initMetaPixel,
  initTracking,
  trackPageView,
  trackViewContent,
  trackAddToCart,
  trackInitiateCheckout,
  trackAddPaymentInfo,
  trackPurchase,
  trackLead,
  trackCompleteRegistration,
  trackCustomEvent,
  getUTMParams,
  saveUTMParams,
  getStoredUTMParams,
  getOrderUTMParams
};
