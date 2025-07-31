// src/app/api/ai/analyze-website/route.ts
import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

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

export async function POST(request: NextRequest) {
  let browser;
  
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

    // LAUNCH PUPPETEER WITH ROBUST CONFIGURATION
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ],
    });

    const page = await browser.newPage();

    // SET REALISTIC USER AGENT
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    // SET VIEWPORT
    await page.setViewport({ width: 1920, height: 1080 });

    // PERFORMANCE TRACKING
    const startTime = Date.now();

    // NAVIGATE WITH TIMEOUT AND ERROR HANDLING
    try {
      await page.goto(normalizedUrl, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });
    } catch (navigationError: any) {
      console.error('Navigation error:', navigationError.message);
      
      if (navigationError.message.includes('net::ERR_NAME_NOT_RESOLVED')) {
        return NextResponse.json(
          { error: 'Website not found. Please check the URL.' },
          { status: 404 }
        );
      }
      
      if (navigationError.message.includes('timeout')) {
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

    // GET PAGE CONTENT
    const content = await page.content();
    const $ = cheerio.load(content);

    // COMPREHENSIVE ANALYSIS
    const analysis: AnalysisResult = {
      url: normalizedUrl,
      title: $('title').text().trim() || 'No title found',
      description: $('meta[name="description"]').attr('content') || 'No description found',
      keywords: ($('meta[name="keywords"]').attr('content') || '').split(',').map(k => k.trim()).filter(k => k),
      wordCount: $('body').text().split(/\s+/).filter(word => word.length > 0).length,
      headings: {
        h1: $('h1').map((i, el) => $(el).text().trim()).get(),
        h2: $('h2').map((i, el) => $(el).text().trim()).get(),
        h3: $('h3').map((i, el) => $(el).text().trim()).get(),
      },
      images: {
        total: $('img').length,
        withAlt: $('img[alt]').length,
        withoutAlt: $('img').length - $('img[alt]').length,
      },
      links: {
        internal: 0,
        external: 0,
        total: $('a[href]').length,
      },
      seo: {
        score: 0,
        issues: [],
        recommendations: [],
      },
      performance: {
        loadTime: loadTime,
        pageSize: Math.round(content.length / 1024) + ' KB',
      },
      content: {
        quality: 'Good',
        readability: 'Medium',
        structure: 'Well-structured',
      },
      affiliate: {
        potentialLinks: 0,
        amazonLinks: 0,
        otherAffiliateLinks: 0,
      }
    };

    // ANALYZE LINKS
    $('a[href]').each((i, el) => {
      const href = $(el).attr('href') || '';
      const fullUrl = new URL(href, normalizedUrl).href;
      
      if (fullUrl.includes(new URL(normalizedUrl).hostname)) {
        analysis.links.internal++;
      } else {
        analysis.links.external++;
      }

      // DETECT AFFILIATE LINKS
      if (href.includes('amazon.com') || href.includes('amzn.to')) {
        analysis.affiliate.amazonLinks++;
      }
      
      if (href.includes('?ref=') || href.includes('?aff=') || href.includes('affiliate') || href.includes('track')) {
        analysis.affiliate.potentialLinks++;
      }
    });

    analysis.affiliate.otherAffiliateLinks = analysis.affiliate.potentialLinks - analysis.affiliate.amazonLinks;

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

    await browser.close();

    console.log(`Analysis completed for ${normalizedUrl}`);
    
    return NextResponse.json({
      success: true,
      analysis: analysis,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Analysis error:', error);
    
    if (browser) {
      await browser.close();
    }
    
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
    version: '2.0',
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


