# AFFILIFY - AI-Powered Affiliate Website Generator

AFFILIFY is a comprehensive SaaS platform that enables users to create professional affiliate marketing websites instantly using AI. Built with Next.js 14, TypeScript, and modern web technologies.

## 🚀 Features

### Core Functionality
- **AI-Powered Website Generation**: Create professional affiliate websites in seconds
- **Multiple Templates**: Choose from modern, responsive templates
- **Custom Domains**: Deploy to your own domain
- **SEO Optimization**: Built-in SEO best practices
- **Analytics Dashboard**: Track performance, conversions, and revenue

### Subscription Plans
- **Basic Plan** ($29/month): 5 websites, basic templates, standard support
- **Pro Plan** ($79/month): 25 websites, premium templates, custom domains, advanced analytics
- **Enterprise Plan** ($199/month): Unlimited websites, API access, white-label solution

### Payment & Billing
- **Stripe Integration**: Secure payment processing
- **Subscription Management**: Automatic billing and plan upgrades
- **Webhook Handling**: Real-time payment status updates

### Email System
- **Automated Emails**: Welcome, payment confirmations, notifications
- **Creator Outreach**: Built-in email templates for affiliate partnerships
- **Professional Templates**: HTML email designs with branding

### API & Integrations
- **REST API**: Full API access for Enterprise users
- **API Key Management**: Secure key generation and management
- **Webhook Support**: Real-time data synchronization

## 🛠 Tech Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Modern icon library

### Backend
- **Next.js API Routes**: Serverless API endpoints
- **MongoDB**: NoSQL database with Mongoose ODM
- **Stripe**: Payment processing and subscription management
- **Nodemailer**: Email sending functionality

### Authentication & Security
- **JWT**: JSON Web Token authentication
- **bcryptjs**: Password hashing
- **API Key Authentication**: Secure API access

### Development Tools
- **ESLint**: Code linting
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixes

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/affilify.git
   cd affilify
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # Stripe Configuration
   STRIPE_PUBLISHABLE_KEY=pk_test_your_key
   STRIPE_SECRET_KEY=sk_test_your_key
   STRIPE_WEBHOOK_SECRET=whsec_your_secret
   
   # Database
   MONGODB_URI=mongodb://localhost:27017/affilify
   
   # Authentication
   NEXTAUTH_SECRET=your_secret_here
   NEXTAUTH_URL=http://localhost:3000
   
   # Email Configuration
   EMAIL_SERVER_HOST=smtp.sendgrid.net
   EMAIL_SERVER_PORT=587
   EMAIL_SERVER_USER=apikey
   EMAIL_SERVER_PASSWORD=your_sendgrid_key
   EMAIL_FROM=noreply@affilify.eu
   
   # Application
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── api/               # API routes
│   ├── checkout/          # Checkout page
│   ├── docs/              # Documentation
│   ├── pricing/           # Pricing page
│   ├── privacy/           # Privacy policy
│   └── terms/             # Terms of service
├── components/            # Reusable components
│   ├── ui/                # UI components
│   ├── forms/             # Form components
│   └── dashboard/         # Dashboard components
├── lib/                   # Utility libraries
│   ├── auth/              # Authentication utilities
│   ├── database/          # Database models and connection
│   ├── email/             # Email utilities
│   └── stripe/            # Stripe utilities
└── styles/                # Global styles
```

## 🔧 Configuration

### Stripe Setup
1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from the Stripe dashboard
3. Set up webhook endpoints for payment events
4. Configure your product prices in Stripe

### Database Setup
1. Set up MongoDB (local or cloud)
2. Update the `MONGODB_URI` in your environment variables
3. The application will automatically create the necessary collections

### Email Setup
1. Configure your email service (SendGrid, Mailgun, etc.)
2. Update email configuration in environment variables
3. Test email sending functionality

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy automatically on push

### Other Platforms
The application can be deployed to any platform that supports Node.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 📊 API Documentation

### Authentication
All API requests require authentication via JWT token or API key (Enterprise only).

```bash
# JWT Authentication
Authorization: Bearer <jwt_token>

# API Key Authentication (Enterprise)
Authorization: Bearer <api_key>
```

### Endpoints

#### Website Generation
```bash
POST /api/websites/generate
{
  "niche": "fitness",
  "product": "protein powder",
  "template": "modern",
  "affiliateLinks": ["https://example.com/affiliate"]
}
```

#### Analytics
```bash
GET /api/analytics?websiteId=123&period=30d
```

#### Stripe Integration
```bash
POST /api/stripe/create-checkout-session
{
  "priceId": "price_123",
  "planName": "pro",
  "billingCycle": "monthly"
}
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.affilify.eu](https://docs.affilify.eu)
- **Email Support**: support@affilify.eu
- **GitHub Issues**: [Create an issue](https://github.com/yourusername/affilify/issues)

## 🎯 Roadmap

- [ ] Advanced AI content generation
- [ ] Multi-language support
- [ ] Advanced A/B testing
- [ ] Mobile app
- [ ] WordPress plugin
- [ ] Shopify integration

---

Built with ❤️ by the AFFILIFY Person
