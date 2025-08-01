// src/app/api/ai/analyze-website/route.ts
import { NextRequest, NextResponse } from 'next/server';

// IMPORTANT: Remove puppeteer for build fix - use fetch + cheerio instead
// import puppeteer from 'puppeteer'; // REMOVED - causing build issues
// import * as cheerio from 'cheerio'; // REMOVED - causing build issues

interface AnalysisResult {
  url: string;
  title: string;
  description: string;
  keywords: string[];
  wordCount: number;
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
  };
  images: {
    total: number;
    withAlt: number;
    withoutAlt: number;
  };
  links: {
    internal: number;
    external: number;
    total: number;
  };
  seo: {
    score: number;
    issues: string[];
    recommendations: string[];
  };
  performance: {
    loadTime: number;
    pageSize: string;
  };
  content: {
    quality: string;
    readability: string;
    structure: string;
  };
  affiliate: {
    potentialLinks: number;
    amazonLinks: number;
    otherAffiliateLinks: number;
  };
}

// LIGHTWEIGHT HTML PARSER (no external dependencies)
function parseHTML(html: string) {
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i);
  const keywordsMatch = html.match(/<meta[^>]*name="keywords"[^>]*content="([^"]*)"[^>]*>/i);
  
  // Count headings
  const h1Count = (html.match(/<h1[^>]*>/gi) || []).length;
  const h2Count = (html.match(/<h2[^>]*>/gi) || []).length;
  const h3Count = (html.match(/<h3[^>]*>/gi) || []).length;
  
  // Count images
  const imgMatches = html.match(/<img[^>]*>/gi) || [];
  const imagesWithAlt = imgMatches.filter(img => img.includes('alt=')).length;
  
  // Count links
  const linkMatches = html.match(/<a[^>]*href="[^"]*"[^>]*>/gi) || [];
  
  // Get text content (rough estimation)
  const textContent = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
    
  const wordCount = textContent.split(' ').filter(word => word.length > 0).length;

  return {
    title: titleMatch ? titleMatch[1].trim() : '',
    description: descMatch ? descMatch[1].trim() : '',
    keywords: keywordsMatch ? keywordsMatch[1].split(',').map(k => k.trim()).filter(k => k) : [],
    wordCount,
    headings: {
      h1: Array(h1Count).fill('H1 heading'),
      h2: Array(h2Count).fill('H2 heading'),
      h3: Array(h3Count).fill('H3 heading'),
    },
    images: {
      total: imgMatches.length,
      withAlt: imagesWithAlt,
      withoutAlt: imgMatches.length - imagesWithAlt,
    },
    links: {
      total: linkMatches.length,
      internal: 0, // Will calculate below
      external: 0, // Will calculate below
    },
    textContent,
    linkMatches
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, analysisType = 'full' } = body;

    // COMPREHENSIVE URL VALIDATION
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Normalize URL
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    // Validate URL format
    try {
      new URL(normalizedUrl);
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    console.log(`Starting analysis for: ${normalizedUrl}`);

    // FETCH WEBSITE CONTENT (no puppeteer needed)
    const startTime = Date.now();
    let html = '';
    
    try {
      const response = await fetch(normalizedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        timeout: 30000, // 30 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      html = await response.text();
    } catch (fetchError: any) {
      console.error('Fetch error:', fetchError.message);
      
      if (fetchError.message.includes('timeout')) {
        return NextResponse.json(
          { error: 'Website took too long to load. Please try again.' },
          { status: 408 }
        );
      }
      
      return NextResponse.json(
        { error: 'Unable to access website. Please check the URL and try again.' },
        { status: 400 }
      );
    }

    const loadTime = Date.now() - startTime;

    // PARSE HTML CONTENT
    const parsed = parseHTML(html);

    // ANALYZE LINKS FOR INTERNAL/EXTERNAL
    const hostname = new URL(normalizedUrl).hostname;
    let internalLinks = 0;
    let externalLinks = 0;
    let amazonLinks = 0;
    let potentialAffiliateLinks = 0;

    parsed.linkMatches.forEach(linkHtml => {
      const hrefMatch = linkHtml.match(/href="([^"]*)"/i);
      if (hrefMatch) {
        const href = hrefMatch[1];
        
        try {
          const fullUrl = new URL(href, normalizedUrl).href;
          if (fullUrl.includes(hostname)) {
            internalLinks++;
          } else {
            externalLinks++;
          }

          // DETECT AFFILIATE LINKS
          if (href.includes('amazon.com') || href.includes('amzn.to')) {
            amazonLinks++;
          }
          
          if (href.includes('?ref=') || href.includes('?aff=') || href.includes('affiliate') || href.includes('track')) {
            potentialAffiliateLinks++;
          }
        } catch (e) {
          // Invalid URL, skip
        }
      }
    });

    // BUILD ANALYSIS RESULT
    const analysis: AnalysisResult = {
      url: normalizedUrl,
      title: parsed.title || 'No title found',
      description: parsed.description || 'No description found',
      keywords: parsed.keywords,
      wordCount: parsed.wordCount,
      headings: parsed.headings,
      images: parsed.images,
      links: {
        internal: internalLinks,
        external: externalLinks,
        total: parsed.links.total,
      },
      seo: {
        score: 0,
        issues: [],
        recommendations: [],
      },
      performance: {
        loadTime: loadTime,
        pageSize: Math.round(html.length / 1024) + ' KB',
      },
      content: {
        quality: 'Good',
        readability: 'Medium',
        structure: 'Well-structured',
      },
      affiliate: {
        potentialLinks: potentialAffiliateLinks,
        amazonLinks: amazonLinks,
        otherAffiliateLinks: potentialAffiliateLinks - amazonLinks,
      }
    };

    // SEO ANALYSIS
    let seoScore = 100;
    
    if (!analysis.title || analysis.title === 'No title found') {
      analysis.seo.issues.push('Missing page title');
      analysis.seo.recommendations.push('Add a descriptive page title');
      seoScore -= 20;
    } else if (analysis.title.length < 30 || analysis.title.length > 60) {
      analysis.seo.issues.push('Title length not optimal');
      analysis.seo.recommendations.push('Keep title between 30-60 characters');
      seoScore -= 10;
    }

    if (!analysis.description || analysis.description === 'No description found') {
      analysis.seo.issues.push('Missing meta description');
      analysis.seo.recommendations.push('Add a meta description');
      seoScore -= 15;
    }

    if (analysis.headings.h1.length === 0) {
      analysis.seo.issues.push('Missing H1 heading');
      analysis.seo.recommendations.push('Add an H1 heading');
      seoScore -= 15;
    }

    if (analysis.images.withoutAlt > 0) {
      analysis.seo.issues.push(`${analysis.images.withoutAlt} images missing alt text`);
      analysis.seo.recommendations.push('Add alt text to all images');
      seoScore -= 10;
    }

    if (loadTime > 3000) {
      analysis.seo.issues.push('Slow page load time');
      analysis.seo.recommendations.push('Optimize page loading speed');
      seoScore -= 10;
    }

    analysis.seo.score = Math.max(0, seoScore);

    // CONTENT QUALITY ASSESSMENT
    if (analysis.wordCount < 300) {
      analysis.content.quality = 'Poor - Too little content';
    } else if (analysis.wordCount < 800) {
      analysis.content.quality = 'Fair - Could use more content';
    } else if (analysis.wordCount < 1500) {
      analysis.content.quality = 'Good - Adequate content';
    } else {
      analysis.content.quality = 'Excellent - Rich content';
    }

    console.log(`Analysis completed for ${normalizedUrl}`);
    
    return NextResponse.json({
      success: true,
      analysis: analysis,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Analysis error:', error);
    
    return NextResponse.json(
      {
        error: 'Analysis failed',
        details: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    message: 'Website Analysis API is running',
    version: '2.1',
    status: 'Build-optimized',
    capabilities: [
      'SEO analysis',
      'Content analysis',
      'Performance metrics',
      'Affiliate link detection',
      'Image optimization check',
      'Link analysis'
    ],
    usage: {
      method: 'POST',
      body: {
        url: 'https://example.com',
        analysisType: 'full' // optional
      }
    }
  });
}
