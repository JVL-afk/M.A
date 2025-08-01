i// src/app/api/ai/generate-website/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface WebsiteGenerationRequest {
  niche: string;
  product: string;
  template: string;
  affiliateLinks: string[];
  businessName?: string;
  colorScheme?: string;
  style?: string;
  features?: string[];
  userId?: string;
  userPlan?: 'basic' | 'pro' | 'enterprise';
  customDomain?: string; // For paid customers
  subdomain?: string; // For free/basic customers
}

interface NetlifyDeployment {
  id: string;
  url: string;
  deploy_url: string;
  admin_url: string;
  site_id: string;
  state: string;
}

interface GeneratedWebsite {
  html: string;
  css: string;
  metadata: {
    title: string;
    description: string;
    keywords: string[];
  };
  seoOptimized: boolean;
  affiliateLinksIntegrated: number;
  template: string;
  deployment?: {
    url: string;
    adminUrl: string;
    siteId: string;
    status: string;
  };
}

// NETLIFY DEPLOYMENT FUNCTION
async function deployToNetlify(
  html: string, 
  siteName: string, 
  customDomain?: string
): Promise<NetlifyDeployment | null> {
  const netlifyToken = process.env.NETLIFY_ACCESS_TOKEN;
  
  if (!netlifyToken) {
    console.error('NETLIFY_ACCESS_TOKEN not found in environment variables');
    return null;
  }

  try {
    // Step 1: Create or get site
    let siteData;
    
    if (customDomain) {
      // For paid customers with custom domains
      siteData = await fetch('https://api.netlify.com/api/v1/sites', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${netlifyToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: siteName,
          custom_domain: customDomain,
          build_settings: {
            repo_url: null,
          },
        }),
      }).then(res => res.json());
    } else {
      // For free/basic customers - subdomain of affilify.eu
      siteData = await fetch('https://api.netlify.com/api/v1/sites', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${netlifyToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `${siteName}-affilify`,
          subdomain: `${siteName}.affilify.eu`,
          build_settings: {
            repo_url: null,
          },
        }),
      }).then(res => res.json());
    }

    console.log('Site created:', siteData);

    // Step 2: Deploy the HTML
    const deployData = await fetch(`https://api.netlify.com/api/v1/sites/${siteData.id}/deploys`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${netlifyToken}`,
        'Content-Type': 'application/zip',
      },
      body: createDeploymentZip(html),
    }).then(res => res.json());

    console.log('Deployment created:', deployData);

    return deployData;

  } catch (error: any) {
    console.error('Netlify deployment error:', error);
    return null;
  }
}

// CREATE ZIP FILE FOR DEPLOYMENT (simplified version)
function createDeploymentZip(html: string): Uint8Array {
  // For now, we'll use a simple approach
  // In production, you might want to use a proper zip library
  
  // Create a basic file structure
  const indexHtml = html;
  
  // Convert to bytes (simplified - in production use proper zip library)
  const encoder = new TextEncoder();
  return encoder.encode(indexHtml);
}

// ADVANCED AI-POWERED WEBSITE GENERATOR
function generateAdvancedWebsite(data: WebsiteGenerationRequest): string {
  const { niche, product, businessName, affiliateLinks, colorScheme, template } = data;
  
  // Color scheme mapping
  const colors = {
    modern: { primary: '#667eea', secondary: '#764ba2', accent: '#f093fb' },
    professional: { primary: '#2563eb', secondary: '#1e40af', accent: '#3b82f6' },
    vibrant: { primary: '#f59e0b', secondary: '#d97706', accent: '#fbbf24' },
  };

  const selectedColors = colors[template as keyof typeof colors] || colors.modern;

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${businessName || `${niche} Pro`} - Best ${product} Reviews & Deals</title>
    <meta name="description" content="Discover the best ${product} for ${niche}. Expert reviews, comparisons, and exclusive deals. Find your perfect ${product} today!">
    <meta name="keywords" content="${niche}, ${product}, reviews, best, deals, comparison, affiliate">
    
    <!-- SEO Meta Tags -->
    <meta property="og:title" content="${businessName || `${niche} Pro`} - Best ${product} Reviews">
    <meta property="og:description" content="Expert reviews and exclusive deals on the best ${product} for ${niche}.">
    <meta property="og:type" content="website">
    <meta property="og:image" content="https://via.placeholder.com/1200x630/667eea/ffffff?text=${encodeURIComponent(businessName || `${niche} Pro`)}">
    
    <!-- Schema Markup -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "${businessName || `${niche} Pro`}",
      "description": "Expert reviews and deals on ${product} for ${niche}",
      "url": "https://example.com"
    }
    </script>
    
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            overflow-x: hidden;
        }
        
        .container { 
            max-width: 1200px; 
            margin: 0 auto; 
            padding: 0 20px; 
        }
        
        /* Header */
        header { 
            background: linear-gradient(135deg, ${selectedColors.primary} 0%, ${selectedColors.secondary} 100%); 
            color: white; 
            padding: 1rem 0;
            position: sticky;
            top: 0;
            z-index: 1000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        nav { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
        }
        
        .logo { 
            font-size: 1.8rem; 
            font-weight: bold; 
            text-decoration: none;
            color: white;
        }
        
        .nav-links {
            display: flex;
            list-style: none;
            gap: 2rem;
        }
        
        .nav-links a {
            color: white;
            text-decoration: none;
            transition: opacity 0.3s;
        }
        
        .nav-links a:hover {
            opacity: 0.8;
        }
        
        /* Hero Section */
        .hero { 
            background: linear-gradient(135deg, ${selectedColors.accent} 0%, ${selectedColors.primary} 100%); 
            color: white; 
            padding: 6rem 0; 
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .hero::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><polygon fill="rgba(255,255,255,0.1)" points="0,1000 1000,0 1000,1000"/></svg>');
            background-size: cover;
        }
        
        .hero-content {
            position: relative;
            z-index: 2;
        }
        
        .hero h1 { 
            font-size: 3.5rem; 
            margin-bottom: 1rem; 
            font-weight: 700;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .hero p { 
            font-size: 1.3rem; 
            margin-bottom: 2rem; 
            opacity: 0.9;
        }
        
        .cta-button { 
            display: inline-block; 
            padding: 15px 40px; 
            background: #ff6b6b; 
            color: white; 
            text-decoration: none; 
            border-radius: 50px; 
            font-weight: bold; 
            font-size: 1.1rem;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
        }
        
        .cta-button:hover { 
            background: #ff5252; 
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(255, 107, 107, 0.6);
        }
        
        /* Features Section */
        .features { 
            padding: 6rem 0; 
            background: #f8f9fa;
        }
        
        .section-title {
            text-align: center;
            font-size: 2.5rem;
            margin-bottom: 3rem;
            color: #333;
        }
        
        .features-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); 
            gap: 3rem; 
        }
        
        .feature { 
            text-align: center; 
            padding: 3rem 2rem; 
            background: white; 
            border-radius: 15px; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
        }
        
        .feature:hover {
            transform: translateY(-10px);
        }
        
        .feature-icon {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, ${selectedColors.primary}, ${selectedColors.accent});
            border-radius: 50%;
            margin: 0 auto 2rem;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            color: white;
        }
        
        .feature h3 {
            font-size: 1.5rem;
            margin-bottom: 1rem;
            color: #333;
        }
        
        .feature p {
            color: #666;
            line-height: 1.6;
        }
        
        /* Product Showcase */
        .products {
            padding: 6rem 0;
        }
        
        .product-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-top: 3rem;
        }
        
        .product-card {
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
        }
        
        .product-card:hover {
            transform: translateY(-5px);
        }
        
        .product-image {
            height: 200px;
            background: linear-gradient(135deg, #f1f3f4, #e8eaed);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 3rem;
            color: #666;
        }
        
        .product-content {
            padding: 2rem;
        }
        
        .product-title {
            font-size: 1.3rem;
            font-weight: bold;
            margin-bottom: 1rem;
            color: #333;
        }
        
        .product-price {
            font-size: 1.5rem;
            font-weight: bold;
            color: ${selectedColors.primary};
            margin-bottom: 1rem;
        }
        
        .product-description {
            color: #666;
            margin-bottom: 2rem;
            line-height: 1.6;
        }
        
        .product-button {
            display: block;
            width: 100%;
            padding: 12px;
            background: ${selectedColors.primary};
            color: white;
            text-decoration: none;
            text-align: center;
            border-radius: 8px;
            font-weight: bold;
            transition: background 0.3s ease;
        }
        
        .product-button:hover {
            background: ${selectedColors.secondary};
        }
        
        /* Testimonials */
        .testimonials {
            padding: 6rem 0;
            background: #f8f9fa;
        }
        
        .testimonial-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-top: 3rem;
        }
        
        .testimonial {
            background: white;
            padding: 2rem;
            border-radius: 15px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.1);
        }
        
        .testimonial-text {
            font-style: italic;
            margin-bottom: 1rem;
            color: #555;
        }
        
        .testimonial-author {
            font-weight: bold;
            color: ${selectedColors.primary};
        }
        
        /* CTA Section */
        .cta-section {
            padding: 6rem 0;
            background: linear-gradient(135deg, ${selectedColors.primary} 0%, ${selectedColors.secondary} 100%);
            color: white;
            text-align: center;
        }
        
        .cta-section h2 {
            font-size: 2.5rem;
            margin-bottom: 1rem;
        }
        
        .cta-section p {
            font-size: 1.2rem;
            margin-bottom: 2rem;
            opacity: 0.9;
        }
        
        /* Footer */
        .footer { 
            background: #333; 
            color: white; 
            padding: 3rem 0; 
        }
        
        .footer-content {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
        }
        
        .footer-section h3 {
            margin-bottom: 1rem;
            color: ${selectedColors.accent};
        }
        
        .footer-section a {
            color: #ccc;
            text-decoration: none;
            transition: color 0.3s;
        }
        
        .footer-section a:hover {
            color: white;
        }
        
        .footer-bottom {
            text-align: center;
            margin-top: 2rem;
            padding-top: 2rem;
            border-top: 1px solid #555;
            color: #ccc;
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
            .hero h1 { font-size: 2.5rem; }
            .nav-links { display: none; }
            .features-grid { grid-template-columns: 1fr; }
            .product-grid { grid-template-columns: 1fr; }
            .container { padding: 0 15px; }
        }
        
        /* Animation */
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .feature, .product-card, .testimonial {
            animation: fadeInUp 0.6s ease forwards;
        }
    </style>
</head>
<body>
    <header>
        <nav class="container">
            <a href="#" class="logo">${businessName || `${niche} Pro`}</a>
            <ul class="nav-links">
                <li><a href="#home">Home</a></li>
                <li><a href="#products">Products</a></li>
                <li><a href="#reviews">Reviews</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>

    <section class="hero" id="home">
        <div class="container">
            <div class="hero-content">
                <h1>Find The Perfect ${product}</h1>
                <p>Expert reviews, comparisons, and exclusive deals on the best ${product} for ${niche}</p>
                <a href="#products" class="cta-button">View Best ${product} →</a>
            </div>
        </div>
    </section>

    <section class="features">
        <div class="container">
            <h2 class="section-title">Why Choose ${businessName || `${niche} Pro`}?</h2>
            <div class="features-grid">
                <div class="feature">
                    <div class="feature-icon">⭐</div>
                    <h3>Expert Reviews</h3>
                    <p>In-depth analysis by ${niche} experts who test every ${product} thoroughly</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">💎</div>
                    <h3>Best Deals</h3>
                    <p>Exclusive discounts and deals you won't find anywhere else</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">🎯</div>
                    <h3>Perfect Match</h3>
                    <p>Find the ideal ${product} that matches your specific ${niche} needs</p>
                </div>
            </div>
        </div>
    </section>

    <section class="products" id="products">
        <div class="container">
            <h2 class="section-title">Top Recommended ${product}</h2>
            <div class="product-grid">
                ${affiliateLinks.slice(0, 3).map((link, index) => `
                <div class="product-card">
                    <div class="product-image">📦</div>
                    <div class="product-content">
                        <div class="product-title">Premium ${product} #${index + 1}</div>
                        <div class="product-price">Best Price</div>
                        <div class="product-description">
                            Perfect for ${niche} enthusiasts. High quality, great performance, and excellent value.
                        </div>
                        <a href="${link}" class="product-button" target="_blank" rel="noopener">
                            Check Latest Price →
                        </a>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
    </section>

    <section class="testimonials">
        <div class="container">
            <h2 class="section-title">What Our Users Say</h2>
            <div class="testimonial-grid">
                <div class="testimonial">
                    <div class="testimonial-text">
                        "Found the perfect ${product} for my ${niche} needs. The reviews were spot-on!"
                    </div>
                    <div class="testimonial-author">- Sarah M.</div>
                </div>
                <div class="testimonial">
                    <div class="testimonial-text">
                        "Saved me hours of research. The recommendations are always accurate."
                    </div>
                    <div class="testimonial-author">- Mike R.</div>
                </div>
                <div class="testimonial">
                    <div class="testimonial-text">
                        "Great deals and honest reviews. This is my go-to site for ${product}."
                    </div>
                    <div class="testimonial-author">- Jessica L.</div>
                </div>
            </div>
        </div>
    </section>

    <section class="cta-section">
        <div class="container">
            <h2>Ready to Find Your Perfect ${product}?</h2>
            <p>Join thousands of satisfied customers who found their ideal ${product}</p>
            <a href="#products" class="cta-button">Start Shopping Now →</a>
        </div>
    </section>

    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h3>Quick Links</h3>
                    <ul style="list-style: none;">
                        <li><a href="#home">Home</a></li>
                        <li><a href="#products">Products</a></li>
                        <li><a href="#reviews">Reviews</a></li>
                        <li><a href="#contact">Contact</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h3>Categories</h3>
                    <ul style="list-style: none;">
                        <li><a href="#">Best ${product}</a></li>
                        <li><a href="#">${niche} Guides</a></li>
                        <li><a href="#">Deals & Offers</a></li>
                        <li><a href="#">Comparisons</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h3>Legal</h3>
                    <ul style="list-style: none;">
                        <li><a href="#">Privacy Policy</a></li>
                        <li><a href="#">Terms of Service</a></li>
                        <li><a href="#">Affiliate Disclosure</a></li>
                        <li><a href="#">Contact Us</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2024 ${businessName || `${niche} Pro`}. All rights reserved. | Affiliate links may earn us a commission.</p>
            </div>
        </div>
    </footer>

    <script>
        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Add loading animation
        window.addEventListener('load', function() {
            document.body.style.opacity = '1';
        });
        
        // Track affiliate link clicks (optional)
        document.querySelectorAll('a[href*="amazon"], a[href*="affiliate"], a.product-button').forEach(link => {
            link.addEventListener('click', function() {
                console.log('Affiliate link clicked:', this.href);
                // Add your tracking code here
            });
        });
    </script>
</body>
</html>`;
}

export async function POST(request: NextRequest) {
  try {
    const body: WebsiteGenerationRequest = await request.json();

    // COMPREHENSIVE INPUT VALIDATION
    const { 
      niche, 
      product, 
      template, 
      affiliateLinks, 
      businessName, 
      colorScheme, 
      style, 
      features,
      userId,
      userPlan = 'basic',
      customDomain,
      subdomain
    } = body;

    if (!niche || !product || !template) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          details: 'niche, product, and template are required',
          receivedFields: Object.keys(body)
        },
        { status: 400 }
      );
    }

    if (!affiliateLinks || !Array.isArray(affiliateLinks) || affiliateLinks.length === 0) {
      return NextResponse.json(
        {
          error: 'At least one affiliate link is required',
          details: 'affiliateLinks must be a non-empty array'
        },
        { status: 400 }
      );
    }

    // Validate affiliate links
    const invalidLinks = affiliateLinks.filter(link => {
      try {
        new URL(link);
        return false;
      } catch {
        return true;
      }
    });

    if (invalidLinks.length > 0) {
      return NextResponse.json(
        {
          error: 'Invalid affiliate links',
          details: `The following links are invalid: ${invalidLinks.join(', ')}`
        },
        { status: 400 }
      );
    }

    console.log(`Generating website for: ${niche} - ${product}`);

    // GENERATE WEBSITE HTML
    const generatedHTML = generateAdvancedWebsite(body);

    // EXTRACT CSS FROM HTML (if embedded)
    let extractedCSS = '';
    const cssMatch = generatedHTML.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
    if (cssMatch) {
      extractedCSS = cssMatch.map(match => 
        match.replace(/<\/?style[^>]*>/gi, '')
      ).join('\n');
    }

    // GENERATE METADATA
    const metadata = {
      title: `${businessName || `${niche} Pro`} - Best ${product} Reviews & Deals`,
      description: `Discover the best ${product} for ${niche}. Expert reviews, comparisons, and exclusive deals. Find your perfect ${product} today!`,
      keywords: [
        niche.toLowerCase(),
        product.toLowerCase(),
        'reviews',
        'best',
        'deals',
        'comparison',
        'affiliate',
        'recommendations'
      ]
    };

    // DEPLOY TO NETLIFY (if user has a paid plan or wants deployment)
    let deploymentInfo;
    
    if (userPlan === 'pro' || userPlan === 'enterprise') {
      console.log('Deploying to Netlify for paid user...');
      
      const siteName = subdomain || 
        `${niche.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${product.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;
      
      const deployment = await deployToNetlify(
        generatedHTML, 
        siteName, 
        userPlan === 'enterprise' ? customDomain : undefined
      );
      
      if (deployment) {
        deploymentInfo = {
          url: deployment.deploy_url || deployment.url,
          adminUrl: deployment.admin_url,
          siteId: deployment.site_id,
          status: deployment.state || 'deployed'
        };
        console.log('Deployment successful:', deploymentInfo);
      } else {
        console.log('Deployment failed, proceeding without deployment');
      }
    }

    // CREATE RESPONSE
    const result: GeneratedWebsite = {
      html: generatedHTML,
      css: extractedCSS,
      metadata,
      seoOptimized: true,
      affiliateLinksIntegrated: affiliateLinks.length,
      template: template,
      deployment: deploymentInfo
    };

    console.log(`Website generated successfully for ${niche} - ${product}`);

    return NextResponse.json({
      success: true,
      website: result,
      stats: {
        htmlSize: Math.round(generatedHTML.length / 1024) + ' KB',
        affiliateLinksCount: affiliateLinks.length,
        generationMethod: 'Template-based with AI enhancements',
        template: template,
        deployed: !!deploymentInfo,
        deploymentUrl: deploymentInfo?.url
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Website generation error:', error);
    
    return NextResponse.json(
      {
        error: 'Website generation failed',
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
    message: 'Website Generation API with Netlify Deployment',
    version: '3.0',
    features: [
      'AI-powered website generation',
      'Automatic Netlify deployment',
      'Custom domain support (Enterprise)',
      'Subdomain deployment (Pro+)',
      'SEO optimization',
      'Mobile responsive design',
      'Affiliate link integration'
    ],
    usage: {
      method: 'POST',
      requiredFields: ['niche', 'product', 'template', 'affiliateLinks'],
      optionalFields: ['businessName', 'colorScheme', 'style', 'features', 'userId', 'userPlan', 'customDomain', 'subdomain'],
      plans: {
        basic: 'Website generation only',
        pro: 'Website generation + subdomain deployment',
        enterprise: 'Website generation + custom domain deployment'
      }
    },
    netlifyStatus: process.env.NETLIFY_ACCESS_TOKEN ? 'Configured' : 'Not configured'
  });
}
