import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import jwt from 'jsonwebtoken';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Verify authentication
function verifyAuth(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) return null;
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-fallback-secret-key');
    return decoded;
  } catch {
    return null;
  }
}

// Function to measure page speed
async function measurePageSpeed(url: string) {
  try {
    const startTime = Date.now();
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 15000
    });
    const endTime = Date.now();
    
    const loadTime = endTime - startTime;
    const contentLength = parseInt(response.headers.get('content-length') || '0');
    
    // Calculate performance score
    let performanceScore = 100;
    if (loadTime > 3000) performanceScore -= 30;
    else if (loadTime > 2000) performanceScore -= 20;
    else if (loadTime > 1000) performanceScore -= 10;
    
    if (contentLength > 2000000) performanceScore -= 20; // 2MB+
    else if (contentLength > 1000000) performanceScore -= 10; // 1MB+
    
    return {
      loadTime,
      contentLength,
      performanceScore: Math.max(performanceScore, 0),
      status: response.status,
      statusText: response.statusText
    };
  } catch (error) {
    return {
      loadTime: 0,
      contentLength: 0,
      performanceScore: 0,
      status: 0,
      statusText: 'Failed to load',
      error: error.message
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'Website URL is required' },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Check Gemini API key
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    // Measure page speed first
    const pageSpeedData = await measurePageSpeed(url);

    // Fetch website content
    let websiteContent = '';
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      websiteContent = await response.text();
      
      // Clean HTML content
      websiteContent = websiteContent
        .replace(/<script[^>]*>.*?<\/script>/gis, '')
        .replace(/<style[^>]*>.*?<\/style>/gis, '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 3000);
        
    } catch (fetchError) {
      return NextResponse.json(
        { 
          error: 'Failed to fetch website content',
          details: fetchError.message
        },
        { status: 400 }
      );
    }

    // Analyze with Gemini AI - Enhanced prompt with page speed
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `You are an expert website performance analyzer. Analyze the provided website content and page speed data, then provide detailed insights.

Website URL: ${url}
Page Speed Data:
- Load Time: ${pageSpeedData.loadTime}ms
- Content Size: ${(pageSpeedData.contentLength / 1024).toFixed(2)}KB
- Performance Score: ${pageSpeedData.performanceScore}/100
- Status: ${pageSpeedData.status} ${pageSpeedData.statusText}

Website Content: ${websiteContent}

Please provide a comprehensive analysis covering:

1. **Page Speed Analysis**
   - Load time assessment (${pageSpeedData.loadTime}ms)
   - Performance score interpretation (${pageSpeedData.performanceScore}/100)
   - Speed optimization recommendations

2. **SEO Optimization**
   - Title and meta description analysis
   - Header structure (H1, H2, etc.)
   - Content quality and keyword usage
   - Technical SEO recommendations

3. **User Experience (UX)**
   - Content readability and structure
   - Navigation and layout assessment
   - Mobile-friendliness indicators
   - Accessibility considerations

4. **Conversion Optimization**
   - Call-to-action effectiveness
   - Trust signals and credibility
   - Content persuasiveness
   - Conversion funnel analysis

5. **Technical Recommendations**
   - Performance improvements
   - Code optimization suggestions
   - Security considerations
   - Best practices implementation

Provide specific, actionable recommendations for each area. Be detailed and professional.`;

    const result = await model.generateContent(prompt);
    const analysis = result.response.text();

    return NextResponse.json({
      success: true,
      url,
      analysis,
      pageSpeed: {
        loadTime: pageSpeedData.loadTime,
        contentSize: pageSpeedData.contentLength,
        performanceScore: pageSpeedData.performanceScore,
        status: pageSpeedData.status,
        recommendations: pageSpeedData.loadTime > 3000 ? 
          ['Optimize images', 'Minify CSS/JS', 'Enable compression', 'Use CDN'] :
          pageSpeedData.loadTime > 1000 ?
          ['Optimize images', 'Minify resources'] :
          ['Great performance!']
      },
      timestamp: new Date().toISOString(),
      contentLength: websiteContent.length,
      aiModel: 'Gemini Pro'
    });

  } catch (error) {
    console.error('AI Analysis error:', error);
    return NextResponse.json(
      { 
        error: 'Analysis failed',
        details: error.message
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
