import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as cheerio from 'cheerio';

interface ProductData {
  title: string;
  description: string;
  price: string;
  features: string[];
  images: string[];
  category: string;
  brand: string;
}

async function scrapeProductData(url: string): Promise<ProductData> {
  try {
    console.log('🔍 Scraping product data from:', url);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Extract product information using common selectors
    const title = $('h1').first().text().trim() || 
                  $('[data-testid="product-title"]').text().trim() ||
                  $('title').text().trim();
    
    const description = $('[data-testid="product-description"]').text().trim() ||
                       $('meta[name="description"]').attr('content') ||
                       $('.product-description').text().trim() ||
                       $('p').first().text().trim();
    
    const price = $('[data-testid="price"]').text().trim() ||
                  $('.price').text().trim() ||
                  $('[class*="price"]').first().text().trim();
    
    // Extract features from bullet points or lists
    const features: string[] = [];
    $('ul li, .features li, [class*="feature"] li').each((i, el) => {
      const feature = $(el).text().trim();
      if (feature && feature.length > 10 && feature.length < 200) {
        features.push(feature);
      }
    });
    
    // Extract images
    const images: string[] = [];
    $('img').each((i, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src');
      if (src && (src.includes('product') || src.includes('item'))) {
        images.push(src);
      }
    });
    
    // Determine category and brand from URL and content
    const urlParts = url.toLowerCase();
    let category = 'general';
    if (urlParts.includes('fitness') || urlParts.includes('sport')) category = 'fitness';
    else if (urlParts.includes('tech') || urlParts.includes('electronic')) category = 'technology';
    else if (urlParts.includes('beauty') || urlParts.includes('cosmetic')) category = 'beauty';
    else if (urlParts.includes('home') || urlParts.includes('kitchen')) category = 'home';
    
    const brand = $('[data-testid="brand"]').text().trim() ||
                  $('.brand').text().trim() ||
                  $('meta[property="product:brand"]').attr('content') ||
                  '';
    
    return {
      title: title || 'Premium Product',
      description: description || 'High-quality product with excellent features',
      price: price || '',
      features: features.slice(0, 5), // Limit to 5 features
      images: images.slice(0, 3), // Limit to 3 images
      category,
      brand
    };
    
  } catch (error) {
    console.error('❌ Error scraping product data:', error);
    
    // Fallback: Extract basic info from URL
    const urlParts = url.split('/');
    const productSlug = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2];
    const title = productSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    return {
      title: title || 'Premium Product',
      description: 'High-quality product with excellent features and great value',
      price: '',
      features: ['High quality', 'Great value', 'Excellent performance'],
      images: [],
      category: 'general',
      brand: ''
    };
  }
}

function determineTargetAudience(productData: ProductData, category: string): string {
  const { title, description, features } = productData;
  const content = `${title} ${description} ${features.join(' ')}`.toLowerCase();
  
  if (content.includes('professional') || content.includes('business') || content.includes('office')) {
    return 'busy professionals';
  } else if (content.includes('fitness') || content.includes('workout') || content.includes('exercise')) {
    return 'fitness enthusiasts';
  } else if (content.includes('student') || content.includes('study') || content.includes('college')) {
    return 'students';
  } else if (content.includes('parent') || content.includes('family') || content.includes('home')) {
    return 'families';
  } else if (content.includes('gamer') || content.includes('gaming') || content.includes('tech')) {
    return 'tech enthusiasts';
  } else {
    return 'people looking for quality products';
  }
}

function generateCallToAction(productData: ProductData): string {
  const { price, category } = productData;
  
  if (price && (price.includes('$') || price.includes('€') || price.includes('£'))) {
    return 'Buy Now';
  } else if (category === 'fitness') {
    return 'Start Training';
  } else if (category === 'technology') {
    return 'Get Yours Today';
  } else if (category === 'beauty') {
    return 'Transform Now';
  } else {
    return 'Shop Now';
  }
}

export async function POST(request: NextRequest) {
  try {
    const { affiliateLink, niche, product, audience, features, callToAction, template } = await request.json();

    if (!affiliateLink) {
      return NextResponse.json({ error: 'Affiliate link is required' }, { status: 400 });
    }

    console.log('🚀 AI Generation from Affiliate Link:', affiliateLink);

    // Scrape product data from the affiliate link
    const productData = await scrapeProductData(affiliateLink);
    console.log('📊 Scraped Product Data:', productData);

    // Use provided values or generate from scraped data
    const finalNiche = niche || productData.category;
    const finalProduct = product || productData.title;
    const finalAudience = audience || determineTargetAudience(productData, productData.category);
    const finalFeatures = features || productData.features.slice(0, 3);
    const finalCallToAction = callToAction || generateCallToAction(productData);
    const finalTemplate = template || 'Simple Landing Page';

    // Initialize Google Generative AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Enhanced prompt with scraped product data
    const prompt = `Generate a complete affiliate marketing website for the following product:

PRODUCT INFORMATION (from affiliate link analysis):
- Product Name: ${productData.title}
- Description: ${productData.description}
- Price: ${productData.price || 'Contact for pricing'}
- Brand: ${productData.brand || 'Premium Brand'}
- Key Features: ${productData.features.join(', ')}

WEBSITE CONFIGURATION:
- Niche: ${finalNiche}
- Product/Service: ${finalProduct}
- Target Audience: ${finalAudience}
- Key Features to Highlight: ${Array.isArray(finalFeatures) ? finalFeatures.join(', ') : finalFeatures}
- Call to Action: ${finalCallToAction}
- Template Style: ${finalTemplate}
- Affiliate Link: ${affiliateLink}

Create a professional, high-converting affiliate website with the following sections:
1. Hero section with compelling headline and ${finalCallToAction} button
2. About section explaining the product benefits based on scraped data
3. Features section highlighting the key features from product analysis
4. Testimonials section with realistic customer reviews for this specific product
5. Call-to-action section with urgency and conversion focus

Make the content highly specific to the actual product from the affiliate link. Use the scraped product information to create authentic, accurate copy that matches the real product.

Format the response as a JSON object with this structure:
{
  "websiteTitle": "Compelling website title based on actual product",
  "heroSection": {
    "headline": "Main headline that reflects the real product",
    "subheadline": "Supporting text based on product description",
    "ctaText": "${finalCallToAction}"
  },
  "aboutSection": {
    "title": "About section title",
    "content": "Detailed description based on scraped product data"
  },
  "featuresSection": {
    "title": "Features section title",
    "features": [
      {
        "title": "Feature 1 from scraped data",
        "description": "Feature description based on actual product"
      },
      {
        "title": "Feature 2 from scraped data", 
        "description": "Feature description based on actual product"
      },
      {
        "title": "Feature 3 from scraped data",
        "description": "Feature description based on actual product"
      }
    ]
  },
  "testimonialsSection": {
    "title": "Testimonials section title",
    "testimonials": [
      {
        "name": "Customer Name",
        "text": "Testimonial text specific to this product",
        "rating": 5
      },
      {
        "name": "Customer Name",
        "text": "Testimonial text specific to this product", 
        "rating": 5
      }
    ]
  },
  "ctaSection": {
    "title": "Final CTA title",
    "text": "Urgency text specific to this product",
    "buttonText": "${finalCallToAction}"
  },
  "affiliateLink": "${affiliateLink}",
  "productData": {
    "originalTitle": "${productData.title}",
    "originalPrice": "${productData.price}",
    "originalBrand": "${productData.brand}"
  }
}

Make the content professional, persuasive, and specifically tailored to ${finalAudience} interested in ${finalProduct}. Base all content on the actual scraped product data to ensure accuracy and authenticity.`;

    const result = await model.generateContent(prompt);
    const aiResponse = await result.response;
    const generatedContent = aiResponse.text();

    console.log('🎉 AI Generated Content from Affiliate Link:', generatedContent);
    
    // Parse the AI generated content as JSON
    let websiteData: any;
    try {
      // Clean the content to extract only the JSON part
      let cleanContent = generatedContent.trim();
      
      // Find the first opening brace and the last closing brace that completes the JSON
      const firstBrace = cleanContent.indexOf('{');
      if (firstBrace !== -1) {
        let braceCount = 0;
        let lastValidBrace = -1;
        
        for (let i = firstBrace; i < cleanContent.length; i++) {
          if (cleanContent[i] === '{') {
            braceCount++;
          } else if (cleanContent[i] === '}') {
            braceCount--;
            if (braceCount === 0) {
              lastValidBrace = i;
              break; // Found the complete JSON object
            }
          }
        }
        
        if (lastValidBrace !== -1) {
          cleanContent = cleanContent.substring(firstBrace, lastValidBrace + 1);
        }
      }
      
      websiteData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse AI generated content as JSON:', parseError);
      console.log('Raw content:', generatedContent);
      
      // Try to extract JSON manually if parsing fails
      try {
        const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          websiteData = JSON.parse(jsonMatch[0]);
        } else {
          websiteData = { rawContent: generatedContent };
        }
      } catch (secondParseError) {
        websiteData = { rawContent: generatedContent };
      }
    }

    // Generate a unique website URL
    const websiteId = Math.random().toString(36).substring(2, 15);
    const websiteUrl = `https://affilify.eu/generated/${websiteId}`;

    return NextResponse.json({
      success: true,
      message: 'Website generated successfully from affiliate link!',
      websiteUrl: websiteUrl,
      websiteData: websiteData,
      generatedContent: generatedContent,
      scrapedData: productData,
      config: {
        niche: finalNiche,
        product: finalProduct,
        audience: finalAudience,
        features: finalFeatures,
        callToAction: finalCallToAction,
        template: finalTemplate,
        affiliateLink: affiliateLink
      }
    });

  } catch (error) {
    console.error('🚨 AI Generation from Link Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate website from affiliate link',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
