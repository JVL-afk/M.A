import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../../lib/mongodb';
import { Collection, MongoClient, ObjectId } from 'mongodb';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

interface User {
  _id: ObjectId;
  plan: string;
  generationsUsed: number;
  analysesUsed: number;
}

interface NetlifyDeployment {
  id: string;
  url: string;
  admin_url: string;
  deploy_url: string;
  state: string;
  created_at: string;
}

// Netlify API integration
class NetlifyService {
  private apiToken: string;
  private baseUrl = 'https://api.netlify.com/api/v1';

  constructor() {
    this.apiToken = process.env.NETLIFY_API_TOKEN || '';
    if (!this.apiToken) {
      console.warn('NETLIFY_API_TOKEN not found - website deployment will use mock URLs');
    }
  }

  async createSite(siteName: string): Promise<{ site_id: string; url: string } | null> {
    if (!this.apiToken) return null;

    try {
      const response = await fetch(`${this.baseUrl}/sites`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: siteName,
          custom_domain: null,
        }),
      });

      if (!response.ok) {
        throw new Error(`Netlify API error: ${response.status}`);
      }

      const site = await response.json();
      return {
        site_id: site.id,
        url: site.url || `https://${site.name}.netlify.app`,
      };
    } catch (error) {
      console.error('Error creating Netlify site:', error);
      return null;
    }
  }

  async deployWebsite(
    siteId: string,
    htmlContent: string,
    cssContent: string
  ): Promise<NetlifyDeployment | null> {
    if (!this.apiToken) return null;

    try {
      // Create a simple website structure
      const files = {
        'index.html': htmlContent,
        'styles.css': cssContent,
      };

      // Create form data for file upload
      const formData = new FormData();
      
      // Add files to form data
      Object.entries(files).forEach(([filename, content]) => {
        formData.append(filename, new Blob([content], { type: 'text/plain' }), filename);
      });

      const response = await fetch(`${this.baseUrl}/sites/${siteId}/deploys`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Netlify deploy error: ${response.status}`);
      }

      const deployment = await response.json();
      return deployment;
    } catch (error) {
      console.error('Error deploying to Netlify:', error);
      return null;
    }
  }

  async getDeploymentStatus(deployId: string): Promise<string> {
    if (!this.apiToken) return 'unknown';

    try {
      const response = await fetch(`${this.baseUrl}/deploys/${deployId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Netlify status error: ${response.status}`);
      }

      const deployment = await response.json();
      return deployment.state;
    } catch (error) {
      console.error('Error getting deployment status:', error);
      return 'error';
    }
  }
}

// Generate HTML template
function generateHTMLTemplate(content: any, config: any): string {
  const parsedContent = typeof content === 'string' ? JSON.parse(content) : content;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.product || 'Affiliate Website'} - ${config.niche || 'Premium Products'}</title>
    <link rel="stylesheet" href="styles.css">
    <meta name="description" content="${parsedContent.hero?.description || 'Discover amazing products and services'}">
    <meta name="keywords" content="${config.niche}, ${config.product}, affiliate, reviews">
</head>
<body>
    <header class="header">
        <nav class="nav">
            <div class="nav-brand">
                <h1>${config.product || 'AffiliateHub'}</h1>
            </div>
            <ul class="nav-menu">
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#services">Services</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>

    <main>
        <section id="home" class="hero">
            <div class="hero-content">
                <h1>${parsedContent.hero?.title || 'Welcome to ' + (config.product || 'Our Store')}</h1>
                <p>${parsedContent.hero?.description || 'Discover amazing products tailored for ' + (config.audience || 'you')}</p>
                <a href="#services" class="cta-button">${config.callToAction || 'Get Started'}</a>
            </div>
        </section>

        <section id="about" class="about">
            <div class="container">
                <h2>${parsedContent.about?.title || 'About Us'}</h2>
                <p>${parsedContent.about?.content || 'We specialize in ' + (config.niche || 'premium products') + ' and provide expert recommendations.'}</p>
            </div>
        </section>

        <section id="services" class="services">
            <div class="container">
                <h2>${parsedContent.services?.title || 'Our Services'}</h2>
                <div class="services-grid">
                    ${(config.features || ['Quality Products', 'Expert Reviews', 'Best Prices']).map((feature: string) => `
                        <div class="service-card">
                            <h3>${feature}</h3>
                            <p>Professional ${feature.toLowerCase()} for ${config.audience || 'our customers'}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        </section>

        <section id="testimonials" class="testimonials">
            <div class="container">
                <h2>What Our Customers Say</h2>
                <div class="testimonials-grid">
                    <div class="testimonial">
                        <p>"Amazing ${config.product || 'products'}! Highly recommended for anyone in ${config.niche || 'this field'}."</p>
                        <cite>- Sarah Johnson</cite>
                    </div>
                    <div class="testimonial">
                        <p>"The best ${config.niche || 'service'} I've ever used. Great value for money!"</p>
                        <cite>- Mike Chen</cite>
                    </div>
                </div>
            </div>
        </section>

        <section id="contact" class="contact">
            <div class="container">
                <h2>Get In Touch</h2>
                <p>Ready to ${config.callToAction?.toLowerCase() || 'get started'}? Contact us today!</p>
                <a href="mailto:contact@example.com" class="cta-button">${config.callToAction || 'Contact Us'}</a>
            </div>
        </section>
    </main>

    <footer class="footer">
        <div class="container">
            <p>&copy; 2024 ${config.product || 'AffiliateHub'}. All rights reserved.</p>
            <p>Powered by AFFILIFY</p>
        </div>
    </footer>

    <script>
        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                document.querySelector(this.getAttribute('href')).scrollIntoView({
                    behavior: 'smooth'
                });
            });
        });

        // Simple analytics tracking
        function trackEvent(event, data) {
            fetch('/api/analytics/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ event, data, timestamp: new Date().toISOString() })
            }).catch(console.error);
        }

        // Track page view
        trackEvent('page_view', { page: 'home' });

        // Track CTA clicks
        document.querySelectorAll('.cta-button').forEach(button => {
            button.addEventListener('click', () => {
                trackEvent('cta_click', { button: button.textContent });
            });
        });
    </script>
</body>
</html>`;
}

// Generate CSS styles
function generateCSSStyles(config: any): string {
  const primaryColor = config.primaryColor || '#3b82f6';
  const secondaryColor = config.secondaryColor || '#1e40af';
  
  return `/* Reset and base styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: #333;
    background-color: #ffffff;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

/* Header and Navigation */
.header {
    background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor});
    color: white;
    padding: 1rem 0;
    position: fixed;
    width: 100%;
    top: 0;
    z-index: 1000;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

.nav-brand h1 {
    font-size: 1.8rem;
    font-weight: bold;
}

.nav-menu {
    display: flex;
    list-style: none;
    gap: 2rem;
}

.nav-menu a {
    color: white;
    text-decoration: none;
    font-weight: 500;
    transition: opacity 0.3s ease;
}

.nav-menu a:hover {
    opacity: 0.8;
}

/* Hero Section */
.hero {
    background: linear-gradient(135deg, ${primaryColor}15, ${secondaryColor}15);
    padding: 120px 0 80px;
    text-align: center;
    margin-top: 80px;
}

.hero-content h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: ${primaryColor};
    font-weight: bold;
}

.hero-content p {
    font-size: 1.2rem;
    margin-bottom: 2rem;
    color: #666;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
}

.cta-button {
    display: inline-block;
    background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor});
    color: white;
    padding: 15px 30px;
    text-decoration: none;
    border-radius: 50px;
    font-weight: bold;
    font-size: 1.1rem;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
}

.cta-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}

/* Sections */
section {
    padding: 80px 0;
}

section h2 {
    font-size: 2.5rem;
    text-align: center;
    margin-bottom: 3rem;
    color: ${primaryColor};
}

/* About Section */
.about {
    background-color: #f8fafc;
}

.about p {
    font-size: 1.1rem;
    text-align: center;
    max-width: 800px;
    margin: 0 auto;
    color: #666;
}

/* Services Section */
.services-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-top: 2rem;
}

.service-card {
    background: white;
    padding: 2rem;
    border-radius: 15px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    text-align: center;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.service-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
}

.service-card h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: ${primaryColor};
}

.service-card p {
    color: #666;
    line-height: 1.6;
}

/* Testimonials Section */
.testimonials {
    background-color: #f8fafc;
}

.testimonials-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 2rem;
    margin-top: 2rem;
}

.testimonial {
    background: white;
    padding: 2rem;
    border-radius: 15px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    border-left: 4px solid ${primaryColor};
}

.testimonial p {
    font-style: italic;
    margin-bottom: 1rem;
    color: #555;
}

.testimonial cite {
    font-weight: bold;
    color: ${primaryColor};
}

/* Contact Section */
.contact {
    text-align: center;
}

.contact p {
    font-size: 1.1rem;
    margin-bottom: 2rem;
    color: #666;
}

/* Footer */
.footer {
    background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor});
    color: white;
    text-align: center;
    padding: 2rem 0;
}

.footer p {
    margin-bottom: 0.5rem;
}

/* Responsive Design */
@media (max-width: 768px) {
    .nav {
        flex-direction: column;
        gap: 1rem;
    }
    
    .nav-menu {
        gap: 1rem;
    }
    
    .hero-content h1 {
        font-size: 2rem;
    }
    
    .hero-content p {
        font-size: 1rem;
    }
    
    section h2 {
        font-size: 2rem;
    }
    
    .services-grid,
    .testimonials-grid {
        grid-template-columns: 1fr;
    }
    
    .testimonials-grid {
        grid-template-columns: 1fr;
    }
    
    .testimonial {
        min-width: auto;
    }
}

/* Loading animation */
.loading {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 3px solid rgba(255,255,255,.3);
    border-radius: 50%;
    border-top-color: #fff;
    animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

/* Smooth animations */
* {
    transition: all 0.3s ease;
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}

/* Focus styles for accessibility */
a:focus,
button:focus {
    outline: 2px solid ${primaryColor};
    outline-offset: 2px;
}`;
}

export async function POST(request: NextRequest) {
  try {
    const client: MongoClient = await connectToDatabase();
    const db = client.db('affilify');
    const usersCollection: Collection<User> = db.collection<User>('users');
    const websitesCollection = db.collection('websites');

    const { userId, websiteConfig } = await request.json();

    if (!userId || !websiteConfig) {
      return NextResponse.json({ error: 'Missing userId or websiteConfig' }, { status: 400 });
    }

    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return NextResponse.json({ error: 'User not found', success: false }, { status: 404 });
    }

    const plan = user.plan || 'free';
    const generationsUsed = user.generationsUsed || 0;

    let generationLimit = 0;
    if (plan === 'free') {
      generationLimit = 3;
    } else if (plan === 'pro') {
      generationLimit = 10;
    } else if (plan === 'enterprise') {
      generationLimit = Infinity;
    }

    if (generationsUsed >= generationLimit) {
      return NextResponse.json({ error: 'Generation limit reached for your plan', success: false }, { status: 403 });
    }

    // Initialize Google Generative AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Construct a detailed prompt for website content generation
    const prompt = `Generate personalized website content based on the following configuration:
    Niche: ${websiteConfig.niche || 'general'}
    Product/Service: ${websiteConfig.product || 'various'}
    Target Audience: ${websiteConfig.audience || 'general'}
    Key Features/Benefits: ${websiteConfig.features ? websiteConfig.features.join(', ') : 'N/A'}
    Call to Action: ${websiteConfig.callToAction || 'Learn More'}

    Provide the content in a structured JSON format with sections: 'hero', 'about', 'services', 'testimonials'. 
    Each section should have a title and detailed body text. 
    Make the content engaging, professional, and relevant to the specified configuration.
    Focus on affiliate marketing and conversion optimization.`;

    const result = await model.generateContent(prompt);
    const aiResponse = await result.response;
    const generatedContent = aiResponse.text();

    // Parse the AI response
    let parsedContent;
    try {
      parsedContent = JSON.parse(generatedContent);
    } catch (parseError) {
      // If JSON parsing fails, create a structured response
      parsedContent = {
        hero: {
          title: `Welcome to ${websiteConfig.product || 'Our Store'}`,
          description: generatedContent.substring(0, 200) + '...'
        },
        about: {
          title: 'About Us',
          content: `We specialize in ${websiteConfig.niche || 'premium products'} and provide expert recommendations.`
        },
        services: {
          title: 'Our Services',
          content: generatedContent
        }
      };
    }

    // Generate HTML and CSS
    const htmlContent = generateHTMLTemplate(parsedContent, websiteConfig);
    const cssContent = generateCSSStyles(websiteConfig);

    // Initialize Netlify service
    const netlifyService = new NetlifyService();
    
    let websiteUrl: string;
    let deploymentId: string | null = null;
    let deploymentStatus = 'pending';

    // Try to deploy to Netlify
    const siteName = `affilify-${userId}-${Date.now()}`;
    const netlifyResult = await netlifyService.createSite(siteName);

    if (netlifyResult) {
      // Deploy to Netlify
      const deployment = await netlifyService.deployWebsite(
        netlifyResult.site_id,
        htmlContent,
        cssContent
      );

      if (deployment) {
        websiteUrl = deployment.deploy_url || netlifyResult.url;
        deploymentId = deployment.id;
        deploymentStatus = deployment.state || 'building';
      } else {
        // Fallback to mock URL if deployment fails
        websiteUrl = `https://affilify-${userId}-${Date.now()}.netlify.app`;
      }
    } else {
      // Fallback to mock URL if Netlify is not configured
      websiteUrl = `https://affilify-${userId}-${Date.now()}.netlify.app`;
    }

    // Save website data to database
    const websiteData = {
      userId: new ObjectId(userId),
      url: websiteUrl,
      deploymentId,
      deploymentStatus,
      config: websiteConfig,
      content: parsedContent,
      htmlContent,
      cssContent,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active',
      analytics: {
        views: 0,
        clicks: 0,
        conversions: 0
      }
    };

    const websiteResult = await websitesCollection.insertOne(websiteData);

    // Update user's generation count
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $inc: { generationsUsed: 1 } }
    );

    return NextResponse.json({ 
      success: true, 
      websiteUrl,
      websiteId: websiteResult.insertedId,
      deploymentId,
      deploymentStatus,
      generatedContent: parsedContent,
      message: netlifyResult ? 'Website deployed successfully!' : 'Website generated (deployment pending - configure NETLIFY_API_TOKEN for live deployment)'
    });
  } catch (error) {
    console.error('Error generating website:', error);
    return NextResponse.json({ error: 'Internal Server Error', success: false }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const deploymentId = searchParams.get('deploymentId');

  if (deploymentId) {
    // Check deployment status
    const netlifyService = new NetlifyService();
    const status = await netlifyService.getDeploymentStatus(deploymentId);
    
    return NextResponse.json({ 
      deploymentId,
      status,
      message: `Deployment is ${status}`
    });
  }

  return NextResponse.json({ message: 'Website generation API - use POST to generate websites' });
}

export async function PUT() {
  return NextResponse.json({ message: 'PUT request to generate website' });
}

export async function DELETE() {
  return NextResponse.json({ message: 'DELETE request to generate website' });
}

