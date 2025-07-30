import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import jwt from 'jsonwebtoken';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

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
      status: response.status
    };
  } catch (error) {
    return {
      loadTime: 0,
      contentLength: 0,
      performanceScore: 0,
      status: 'error',
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

    // Measure page speed first
    const pageSpeedData = await measurePageSpeed(url);

    // Fetch website content for analysis
    let websiteContent = '';
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 15000
      });
      
      if (response.ok) {
        const html = await response.text();
        
        // Extract meaningful content
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i);
        const h1Matches = html.match(/<h1[^>]*>([^<]+)<\/h1>/gi);
        const h2Matches = html.match(/<h2[^>]*>([^<]+)<\/h2>/gi);
        
        websiteContent = `
        Title: ${titleMatch ? titleMatch[1] : 'No title found'}
        Description: ${descMatch ? descMatch[1] : 'No description found'}
        H1 Headers: ${h1Matches ? h1Matches.map(h => h.replace(/<[^>]*>/g, '')).join(', ') : 'None'}
        H2 Headers: ${h2Matches ? h2Matches.slice(0, 5).map(h => h.replace(/<[^>]*>/g, '')).join(', ') : 'None'}
        Content Length: ${html.length} characters
        Has Images: ${html.includes('<img') ? 'Yes' : 'No'}
        Has Forms: ${html.includes('<form') ? 'Yes' : 'No'}
        Has Analytics: ${html.includes('google-analytics') || html.includes('gtag') ? 'Yes' : 'No'}
        `;
      } else {
        websiteContent = `Failed to fetch content. Status: ${response.status}`;
      }
    } catch (error) {
      websiteContent = `Error fetching content: ${error.message}`;
    }

    // Generate AI analysis with Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Analyze this website comprehensively and provide actionable insights:

URL: ${url}
Page Speed: ${pageSpeedData.loadTime}ms (Score: ${pageSpeedData.performanceScore}/100)
Content Size: ${pageSpeedData.contentLength} bytes

Website Content Analysis:
${websiteContent}

Provide a detailed analysis covering:

1. **SEO OPTIMIZATION**
   - Title and meta description quality
   - Header structure and keyword usage
   - Content optimization opportunities
   - Technical SEO issues

2. **PERFORMANCE ANALYSIS**
   - Page load speed assessment
   - Content size optimization
   - Performance improvement recommendations

3. **USER EXPERIENCE**
   - Design and layout evaluation
   - Mobile responsiveness indicators
   - Navigation and usability

4. **CONVERSION OPTIMIZATION**
   - Call-to-action effectiveness
   - Trust signals and credibility
   - Form optimization opportunities

5. **TECHNICAL RECOMMENDATIONS**
   - Code optimization suggestions
   - Security considerations
   - Best practices implementation

6. **COMPETITIVE ADVANTAGES**
   - Unique selling propositions
   - Market positioning
   - Differentiation opportunities

Provide specific, actionable recommendations for each area. Be detailed and professional.
Focus on practical improvements that can increase conversions and revenue.`;

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

