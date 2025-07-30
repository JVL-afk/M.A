// app/api/ai/analyze-website/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    // Validate URL
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Validate URL format
    let validUrl: URL
    try {
      validUrl = new URL(url)
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Only allow HTTP and HTTPS protocols
    if (!['http:', 'https:'].includes(validUrl.protocol)) {
      return NextResponse.json(
        { error: 'Only HTTP and HTTPS URLs are allowed' },
        { status: 400 }
      )
    }

    // Fetch the website
    let response: Response
    try {
      response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'AFFILIFY-Analyzer/1.0'
        },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(10000) // 10 second timeout
      })
    } catch (fetchError) {
      console.error('Fetch error:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch website. Please check if the URL is accessible.' },
        { status: 500 }
      )
    }

    if (!response.ok) {
      return NextResponse.json(
        { 
          error: `HTTP error! status: ${response.status}`,
          statusCode: response.status 
        },
        { status: 500 }
      )
    }

    // Get the HTML content
    let html: string
    try {
      html = await response.text()
    } catch (error) {
      console.error('Error reading response:', error)
      return NextResponse.json(
        { error: 'Failed to read website content' },
        { status: 500 }
      )
    }

    // Basic analysis (keeping original functionality)
    const analysis = {
      url: url,
      title: extractTitle(html),
      metaDescription: extractMetaDescription(html),
      headings: extractHeadings(html),
      links: extractLinks(html),
      images: extractImages(html),
      performance: {
        loadTime: Date.now(), // Placeholder
        size: html.length,
        hasCompression: response.headers.get('content-encoding') !== null
      },
      seo: {
        hasTitle: extractTitle(html) !== null,
        hasMetaDescription: extractMetaDescription(html) !== null,
        hasH1: html.includes('<h1'),
        titleLength: extractTitle(html)?.length || 0
      },
      accessibility: {
        hasAltText: checkImageAltText(html),
        hasLangAttribute: html.includes('lang=')
      }
    }

    return NextResponse.json(analysis)

  } catch (error) {
    console.error('Unexpected error in analyze-website:', error)
    return NextResponse.json(
      { error: 'Internal server error occurred during analysis' },
      { status: 500 }
    )
  }
}

// Helper functions (keeping original functionality)
function extractTitle(html: string): string | null {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  return titleMatch ? titleMatch[1].trim() : null
}

function extractMetaDescription(html: string): string | null {
  const metaMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i)
  return metaMatch ? metaMatch[1].trim() : null
}

function extractHeadings(html: string): { level: string; text: string }[] {
  const headings = []
  const headingRegex = /<(h[1-6])[^>]*>([^<]+)<\/h[1-6]>/gi
  let match

  while ((match = headingRegex.exec(html)) !== null) {
    headings.push({
      level: match[1].toUpperCase(),
      text: match[2].trim()
    })
  }

  return headings
}

function extractLinks(html: string): { href: string; text: string }[] {
  const links = []
  const linkRegex = /<a[^>]*href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi
  let match

  while ((match = linkRegex.exec(html)) !== null) {
    links.push({
      href: match[1],
      text: match[2].trim()
    })
  }

  return links.slice(0, 50) // Limit to first 50 links
}

function extractImages(html: string): { src: string; alt: string }[] {
  const images = []
  const imgRegex = /<img[^>]*src=["']([^"']+)["'][^>]*(?:alt=["']([^"']*)["'])?[^>]*>/gi
  let match

  while ((match = imgRegex.exec(html)) !== null) {
    images.push({
      src: match[1],
      alt: match[2] || ''
    })
  }

  return images.slice(0, 20) // Limit to first 20 images
}

function checkImageAltText(html: string): boolean {
  const images = extractImages(html)
  if (images.length === 0) return true // No images to check
  
  const imagesWithAlt = images.filter(img => img.alt && img.alt.trim() !== '')
  return imagesWithAlt.length / images.length > 0.8 // 80% of images should have alt text
}

