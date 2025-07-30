import { notFound } from 'next/navigation';
import { connectToDatabase } from '../../../lib/mongodb';

interface WebsitePageProps {
  params: {
    slug: string;
  };
}

async function getWebsiteData(slug: string) {
  try {
    const { db, client } = await connectToDatabase();
    
    try {
      const website = await db.collection('generated_websites').findOne({ 
        slug: slug,
        status: 'active'
      });
      
      if (!website) {
        return null;
      }
      
      // Update view count
      await db.collection('generated_websites').updateOne(
        { slug: slug },
        { 
          $inc: { 'analytics.views': 1 },
          $set: { 'analytics.lastViewed': new Date() }
        }
      );
      
      return website;
    } finally {
      await client.close();
    }
  } catch (error) {
    console.error('Failed to fetch website data:', error);
    return null;
  }
}

export default async function WebsitePage({ params }: WebsitePageProps) {
  const website = await getWebsiteData(params.slug);
  
  if (!website) {
    notFound();
  }
  
  return (
    <div className="min-h-screen">
      {/* SEO Meta Tags */}
      <head>
        <title>{website.seo.title}</title>
        <meta name="description" content={website.seo.description} />
        <meta name="keywords" content={website.seo.keywords} />
        <meta property="og:title" content={website.seo.title} />
        <meta property="og:description" content={website.seo.description} />
        <meta property="og:url" content={website.url} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      
      {/* Render the AI-generated website */}
      <div 
        dangerouslySetInnerHTML={{ __html: website.html }}
        className="w-full"
      />
      
      {/* Analytics tracking */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Track affiliate link clicks
            document.addEventListener('click', function(e) {
              if (e.target.href && e.target.href.includes('${website.productUrl}')) {
                fetch('/api/analytics/track-click', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ 
                    websiteId: '${website._id}',
                    type: 'affiliate_click',
                    url: e.target.href
                  })
                });
              }
            });
          `
        }}
      />
    </div>
  );
}

export async function generateMetadata({ params }: WebsitePageProps) {
  const website = await getWebsiteData(params.slug);
  
  if (!website) {
    return {
      title: 'Website Not Found',
      description: 'The requested website could not be found.'
    };
  }
  
  return {
    title: website.seo.title,
    description: website.seo.description,
    keywords: website.seo.keywords,
    openGraph: {
      title: website.seo.title,
      description: website.seo.description,
      url: website.url,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: website.seo.title,
      description: website.seo.description,
    },
  };
}
