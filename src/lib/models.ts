// Database Models for AFFILIFY Platform
// File: src/lib/models.ts

import { ObjectId } from 'mongodb';

// User Model
export interface User {
  _id?: ObjectId;
  email: string;
  password: string; // hashed
  plan: 'free' | 'pro' | 'enterprise';
  stripeCustomerId?: string;
  apiKey?: string; // For enterprise users
  totalWebsites: number;
  totalAnalyses: number;
  totalClicks: number;
  totalRevenue: number;
  lastWebsiteGeneratedAt?: Date;
  lastAnalysisAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  emailVerified: boolean;
}

// Generated Website Model
export interface GeneratedWebsite {
  _id?: ObjectId;
  userId: ObjectId;
  affiliateLink: string;
  productName: string;
  websiteData: {
    title: string;
    description: string;
    url: string;
    niche: string;
    targetAudience: string;
    keyFeatures: string[];
    testimonials: {
      name: string;
      text: string;
      rating: number;
    }[];
    faq: {
      question: string;
      answer: string;
    }[];
    colorScheme: {
      primary: string;
      secondary: string;
      accent: string;
    };
    ctaText: string;
    estimatedRevenue: string;
    completionTime: string;
  };
  generationStages: string[];
  isPublished: boolean;
  customDomain?: string;
  deploymentUrl?: string;
  clicks: number;
  conversions: number;
  revenue: number;
  createdAt: Date;
  updatedAt: Date;
}

// Website Analysis Model
export interface WebsiteAnalysis {
  _id?: ObjectId;
  userId: ObjectId;
  websiteUrl: string;
  analysisResult: {
    score: number;
    niche: string;
    targetAudience: string;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    competitorAnalysis: {
      url: string;
      score: number;
      strengths: string[];
    }[];
    seoScore: number;
    performanceScore: number;
    conversionScore: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// User Analytics Model
export interface UserAnalytics {
  _id?: ObjectId;
  userId: ObjectId;
  websiteId?: ObjectId;
  action: 'website_generation' | 'website_analysis' | 'website_click' | 'conversion' | 'login' | 'signup';
  websiteUrl?: string;
  productName?: string;
  clicks?: number;
  conversions?: number;
  revenue?: number;
  timestamp: Date;
  plan: string;
  metadata?: Record<string, any>;
}

// Dashboard Stats Model (Aggregated)
export interface DashboardStats {
  _id?: ObjectId;
  userId: ObjectId;
  totalWebsites: number;
  totalAnalyses: number;
  totalClicks: number;
  totalRevenue: number;
  monthlyWebsites: number;
  monthlyAnalyses: number;
  monthlyClicks: number;
  monthlyRevenue: number;
  lastUpdated: Date;
}

// Subscription Model
export interface Subscription {
  _id?: ObjectId;
  userId: ObjectId;
  stripeSubscriptionId: string;
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'canceled' | 'past_due' | 'unpaid';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// API Usage Model (For Enterprise users)
export interface ApiUsage {
  _id?: ObjectId;
  userId: ObjectId;
  apiKey: string;
  endpoint: string;
  method: string;
  requestData?: Record<string, any>;
  responseStatus: number;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

// Website Template Model
export interface WebsiteTemplate {
  _id?: ObjectId;
  name: string;
  description: string;
  category: string;
  htmlTemplate: string;
  cssTemplate: string;
  jsTemplate?: string;
  variables: {
    name: string;
    type: 'text' | 'color' | 'image' | 'url';
    defaultValue: string;
    description: string;
  }[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Email Template Model
export interface EmailTemplate {
  _id?: ObjectId;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
  type: 'welcome' | 'verification' | 'password_reset' | 'subscription' | 'notification';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Plan Limits Configuration
export const PLAN_LIMITS = {
  free: {
    websites: 3,
    analyses: 5,
    customDomain: false,
    apiAccess: false,
    support: 'community'
  },
  pro: {
    websites: 50,
    analyses: 100,
    customDomain: true,
    apiAccess: false,
    support: 'email'
  },
  enterprise: {
    websites: 500,
    analyses: 1000,
    customDomain: true,
    apiAccess: true,
    support: 'priority'
  }
};

// Database Collections
export const COLLECTIONS = {
  USERS: 'users',
  GENERATED_WEBSITES: 'generated_websites',
  WEBSITE_ANALYSES: 'website_analyses',
  USER_ANALYTICS: 'user_analytics',
  DASHBOARD_STATS: 'dashboard_stats',
  SUBSCRIPTIONS: 'subscriptions',
  API_USAGE: 'api_usage',
  WEBSITE_TEMPLATES: 'website_templates',
  EMAIL_TEMPLATES: 'email_templates'
} as const;
