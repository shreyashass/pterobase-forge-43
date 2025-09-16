/**
 * SEO Head Component
 * Provides comprehensive SEO optimization including meta tags, Open Graph, and structured data
 * Automatically handles canonical URLs and social media sharing
 */
import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  noIndex?: boolean;
  structuredData?: object;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title = "Pterodactyl Billing Panel - Game Server Hosting",
  description = "Professional Pterodactyl game server hosting with flexible billing, PayPal & Razorpay payments. Order your Minecraft, CS2, Valheim servers today.",
  keywords = "pterodactyl, game server hosting, minecraft hosting, billing panel, paypal, razorpay",
  canonical,
  ogImage = "/og-image.jpg",
  ogType = "website",
  noIndex = false,
  structuredData
}) => {
  useEffect(() => {
    // Set document title
    document.title = title;
    
    // Update meta tags
    const updateMeta = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = name;
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    const updateProperty = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Basic meta tags
    updateMeta('description', description);
    updateMeta('keywords', keywords);
    updateMeta('viewport', 'width=device-width, initial-scale=1');

    // Robots meta
    if (noIndex) {
      updateMeta('robots', 'noindex, nofollow');
    } else {
      updateMeta('robots', 'index, follow');
    }

    // Open Graph tags
    updateProperty('og:title', title);
    updateProperty('og:description', description);
    updateProperty('og:type', ogType);
    updateProperty('og:image', window.location.origin + ogImage);
    updateProperty('og:url', window.location.href);
    updateProperty('og:site_name', 'Pterodactyl Billing Panel');

    // Twitter Card tags
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', title);
    updateMeta('twitter:description', description);
    updateMeta('twitter:image', window.location.origin + ogImage);

    // Canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonical || window.location.href;

    // Structured Data
    if (structuredData) {
      let script = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);
    }
  }, [title, description, keywords, canonical, ogImage, ogType, noIndex, structuredData]);

  return null; // This component doesn't render anything visible
};