// Google Analytics 4 Configuration
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX'

// Initialize GA4
export const initGA = () => {
  if (typeof window !== 'undefined' && GA_TRACKING_ID) {
    window.gtag('config', GA_TRACKING_ID, {
      page_title: document.title,
      page_location: window.location.href,
    })
  }
}

// Track page views
export const trackPageView = (url) => {
  if (typeof window !== 'undefined' && GA_TRACKING_ID) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    })
  }
}

// Track custom events
export const trackEvent = (action, category, label, value) => {
  if (typeof window !== 'undefined' && GA_TRACKING_ID) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// Track affiliate clicks
export const trackAffiliateClick = (websiteId, productName, affiliateUrl) => {
  trackEvent('affiliate_click', 'engagement', `${websiteId}-${productName}`, 1)
  
  // Also send to our API for internal tracking
  fetch('/api/analytics/track', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'click',
      websiteId,
      productName,
      affiliateUrl,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      referrer: document.referrer
    })
  }).catch(console.error)
}

// Track conversions
export const trackConversion = (websiteId, productName, value, currency = 'USD') => {
  // GA4 Enhanced Ecommerce
  window.gtag('event', 'purchase', {
    transaction_id: `${websiteId}-${Date.now()}`,
    value: value,
    currency: currency,
    items: [{
      item_id: productName.replace(/\s+/g, '-').toLowerCase(),
      item_name: productName,
      category: 'affiliate_product',
      quantity: 1,
      price: value
    }]
  })
  
  // Internal tracking
  fetch('/api/analytics/track', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'conversion',
      websiteId,
      productName,
      value,
      currency,
      timestamp: new Date().toISOString()
    })
  }).catch(console.error)
}

// Track website generation
export const trackWebsiteGeneration = (niche, aiModel, generationTime) => {
  trackEvent('website_generated', 'ai_generation', niche, generationTime)
  
  fetch('/api/analytics/track', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'website_generation',
      niche,
      aiModel,
      generationTime,
      timestamp: new Date().toISOString()
    })
  }).catch(console.error)
}

// Get real-time analytics data
export const getAnalyticsData = async (websiteId, dateRange = '7d') => {
  try {
    const response = await fetch(`/api/analytics/data?websiteId=${websiteId}&range=${dateRange}`)
    return await response.json()
  } catch (error) {
    console.error('Failed to fetch analytics data:', error)
    return null
  }
}
