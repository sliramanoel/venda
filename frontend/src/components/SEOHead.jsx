import { useEffect } from 'react';

/**
 * SEO Component - Updates document head with meta tags
 * Supports Open Graph for social sharing and basic SEO
 */
const SEOHead = ({ settings, page = 'home', customData = {} }) => {
  useEffect(() => {
    if (!settings) return;

    const siteName = settings.siteName || 'NeuroVita';
    const siteUrl = window.location.origin;
    
    // Page-specific titles and descriptions
    const pageConfig = {
      home: {
        title: settings.metaTitle || `${siteName} - ${settings.tagline || 'Suplemento Natural'}`,
        description: settings.metaDescription || settings.description || '',
      },
      comprar: {
        title: `Comprar ${settings.productName || siteName} - Oferta Especial`,
        description: `Garanta sua amostra grátis de ${settings.productName || siteName}. Pague apenas o frete e experimente!`,
      },
      pagamento: {
        title: `Pagamento PIX - ${siteName}`,
        description: `Finalize seu pedido de ${settings.productName || siteName} via PIX.`,
      },
      faq: {
        title: `Perguntas Frequentes - ${siteName}`,
        description: `Tire suas dúvidas sobre ${settings.productName || siteName}. Saiba mais sobre uso, resultados e benefícios.`,
      },
      'quem-somos': {
        title: `Quem Somos - ${siteName}`,
        description: settings.aboutMission || `Conheça a história e missão da ${siteName}.`,
      },
    };

    const currentPage = pageConfig[page] || pageConfig.home;
    const title = customData.title || currentPage.title;
    const description = customData.description || currentPage.description;
    const ogImage = settings.ogImage || customData.image || '';
    const ogTitle = settings.ogTitle || title;
    const ogDescription = settings.ogDescription || description;

    // Update document title
    document.title = title;

    // Helper to set or create meta tag
    const setMetaTag = (name, content, isProperty = false) => {
      if (!content) return;
      
      const selector = isProperty 
        ? `meta[property="${name}"]` 
        : `meta[name="${name}"]`;
      
      let meta = document.querySelector(selector);
      
      if (!meta) {
        meta = document.createElement('meta');
        if (isProperty) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };

    // Basic SEO meta tags
    setMetaTag('description', description);
    setMetaTag('keywords', settings.metaKeywords || '');
    setMetaTag('author', siteName);
    
    // Open Graph meta tags (Facebook/Meta)
    setMetaTag('og:title', ogTitle, true);
    setMetaTag('og:description', ogDescription, true);
    setMetaTag('og:type', 'website', true);
    setMetaTag('og:url', window.location.href, true);
    setMetaTag('og:site_name', siteName, true);
    setMetaTag('og:locale', 'pt_BR', true);
    
    if (ogImage) {
      setMetaTag('og:image', ogImage, true);
      setMetaTag('og:image:width', '1200', true);
      setMetaTag('og:image:height', '630', true);
    }
    
    // Twitter Card meta tags
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', ogTitle);
    setMetaTag('twitter:description', ogDescription);
    if (ogImage) {
      setMetaTag('twitter:image', ogImage);
    }

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', window.location.href.split('?')[0]);

  }, [settings, page, customData]);

  return null; // This component only manipulates the head
};

export default SEOHead;
