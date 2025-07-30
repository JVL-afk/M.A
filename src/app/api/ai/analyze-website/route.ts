import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import jwt from 'jsonwebtoken';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

    // Analyze with OpenAI - EXACT same prompt as local testing
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert website performance analyzer. Analyze the provided website content and provide detailed insights on SEO, performance, user experience, conversion optimization, and technical improvements. Be specific and actionable."
        },
        {
          role: "user",
          content: `Please analyze this website and provide comprehensive insights:\n\nURL: ${url}\n\nContent: ${websiteContent}\n\nProvide analysis on:\n1. SEO optimization\n2. Performance issues\n3. User experience\n4. Conversion optimization\n5. Technical recommendations`
        }
      ],
      max_tokens: 1500,
      temperature: 0.7,
    });

    const analysis = completion.choices[0]?.message?.content || 'Analysis not available';

    return NextResponse.json({
      success: true,
      url,
      analysis,
      timestamp: new Date().toISOString(),
      contentLength: websiteContent.length
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
