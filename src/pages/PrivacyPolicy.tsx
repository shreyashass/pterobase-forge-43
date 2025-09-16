/**
 * Privacy Policy Page
 * Dynamically loads content from Supabase with fallback to static content
 * Fully SEO optimized with proper meta tags and structured data
 */
import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SEOHead } from '@/components/SEOHead';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface LegalPage {
  id: string;
  title: string;
  content: string;
  meta_title: string;
  meta_description: string;
  last_updated: string;
}

export const PrivacyPolicy = () => {
  const [content, setContent] = useState<LegalPage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data, error } = await supabase
          .from('legal_pages')
          .select('*')
          .eq('page_type', 'privacy_policy')
          .single();

        if (error) throw error;
        setContent(data);
      } catch (error) {
        console.error('Error fetching privacy policy:', error);
        // Fallback content
        setContent({
          id: 'fallback',
          title: 'Privacy Policy',
          content: 'Our privacy policy content is currently being updated. Please contact support for more information.',
          meta_title: 'Privacy Policy - Pterodactyl Billing Panel',
          meta_description: 'Learn how we protect your privacy and handle your personal information.',
          last_updated: new Date().toISOString()
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": content?.meta_title || "Privacy Policy",
    "description": content?.meta_description,
    "url": window.location.href,
    "lastReviewed": content?.last_updated,
    "publisher": {
      "@type": "Organization",
      "name": "Pterodactyl Billing Panel"
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title={content?.meta_title || "Privacy Policy - Pterodactyl Billing Panel"}
        description={content?.meta_description || "Learn how we protect your privacy and handle your personal information."}
        canonical="/privacy-policy"
        structuredData={structuredData}
      />
      
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              {loading ? (
                <Skeleton className="h-8 w-64" />
              ) : (
                <CardTitle className="text-3xl font-bold">{content?.title}</CardTitle>
              )}
              {content?.last_updated && (
                <p className="text-sm text-muted-foreground">
                  Last updated: {new Date(content.last_updated).toLocaleDateString()}
                </p>
              )}
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ) : (
                <div 
                  className="prose prose-gray dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: content?.content.replace(/\n/g, '<br />') || ''
                  }}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};