import mongoose from 'mongoose'

// User Schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  plan: {
    type: String,
    enum: ['basic', 'pro', 'enterprise'],
    default: 'basic',
  },
  stripeCustomerId: {
    type: String,
    unique: true,
    sparse: true,
  },
  stripeSubscriptionId: {
    type: String,
    unique: true,
    sparse: true,
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'inactive', 'cancelled', 'past_due'],
    default: 'inactive',
  },
  subscriptionEndDate: {
    type: Date,
  },
  apiKeys: [{
    id: String,
    keyHash: String,
    name: String,
    createdAt: Date,
    lastUsed: Date,
    isActive: Boolean,
  }],
  websites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Website',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

// Website Schema
const websiteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  niche: {
    type: String,
    required: true,
  },
  product: {
    type: String,
    required: true,
  },
  template: {
    type: String,
    default: 'modern',
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  affiliateLinks: [{
    id: String,
    url: String,
    product: String,
    network: String,
  }],
  customization: {
    colors: {
      primary: String,
      secondary: String,
      accent: String,
    },
    fonts: {
      heading: String,
      body: String,
    },
    layout: String,
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
    ogImage: String,
  },
  status: {
    type: String,
    enum: ['draft', 'generated', 'published', 'archived'],
    default: 'draft',
  },
  url: {
    type: String,
    unique: true,
  },
  customDomain: {
    type: String,
    unique: true,
    sparse: true,
  },
  analytics: {
    pageViews: { type: Number, default: 0 },
    uniqueVisitors: { type: Number, default: 0 },
    clickThroughs: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

// Analytics Schema
const analyticsSchema = new mongoose.Schema({
  websiteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Website',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  pageViews: { type: Number, default: 0 },
  uniqueVisitors: { type: Number, default: 0 },
  clickThroughs: { type: Number, default: 0 },
  conversions: { type: Number, default: 0 },
  revenue: { type: Number, default: 0 },
  referrers: [{
    source: String,
    visits: Number,
    type: String, // 'search', 'social', 'direct', 'referral'
  }],
  pages: [{
    path: String,
    views: Number,
    title: String,
  }],
  devices: {
    desktop: Number,
    mobile: Number,
    tablet: Number,
  },
  countries: [{
    country: String,
    visits: Number,
  }],
})

// Email Template Schema
const emailTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    enum: ['welcome', 'payment_success', 'payment_failed', 'creator_outreach'],
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  htmlContent: {
    type: String,
    required: true,
  },
  textContent: {
    type: String,
    required: true,
  },
  variables: [String], // Available template variables
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

// Export models
export const User = mongoose.models.User || mongoose.model('User', userSchema)
export const Website = mongoose.models.Website || mongoose.model('Website', websiteSchema)
export const Analytics = mongoose.models.Analytics || mongoose.model('Analytics', analyticsSchema)
export const EmailTemplate = mongoose.models.EmailTemplate || mongoose.model('EmailTemplate', emailTemplateSchema)
