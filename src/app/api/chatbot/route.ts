// CHATBOT API ROUTE - /api/chatbot/route.ts
// Handles AI chatbot requests using Google Gemini

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { connectToDatabase } from '@/lib/mongodb';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { message, websiteId, productContext, userId } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Log the conversation for analytics
    if (userId) {
      try {
        const client = await connectToDatabase();
        const db = client.db('affilify');
        
        await db.collection('chatbot_conversations').insertOne({
          userId,
          websiteId,
          message,
          timestamp: new Date(),
          type: 'user_message'
        });
      } catch (logError) {
        console.error('Failed to log conversation:', logError);
        // Continue with chatbot response even if logging fails
      }
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Create context-aware prompt for affiliate marketing
    const systemPrompt = `You are a helpful AI assistant for an affiliate marketing website. 
Your role is to help visitors learn about products and guide them toward making a purchase.

Product Context: ${productContext || 'General affiliate products and services'}

Guidelines:
- Be friendly, helpful, and professional
- Focus on product benefits and value proposition
- Answer questions about features, pricing, usage, and comparisons
- Encourage visitors to learn more or make a purchase when appropriate
- If you don't know something specific, be honest but still helpful
- Keep responses concise but informative (2-3 sentences max)
- Always maintain a positive, sales-oriented tone
- Use emojis sparingly to keep responses friendly
- If asked about technical support, direct them to contact the website owner
- Never make false claims about products you don't have specific information about

User Question: ${message}

Provide a helpful response that assists the user while encouraging engagement with the affiliate products:`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const aiResponse = response.text();

    // Log the AI response for analytics
    if (userId) {
      try {
        const client = await connectToDatabase();
        const db = client.db('affilify');
        
        await db.collection('chatbot_conversations').insertOne({
          userId,
          websiteId,
          message: aiResponse,
          timestamp: new Date(),
          type: 'ai_response'
        });
      } catch (logError) {
        console.error('Failed to log AI response:', logError);
      }
    }

    return NextResponse.json({ 
      response: aiResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chatbot API error:', error);
    
    // Fallback response if Gemini fails
    const fallbackResponse = "I'm sorry, I'm having trouble processing your request right now. Please try again in a moment, or feel free to browse our products and contact us if you need assistance!";
    
    return NextResponse.json({ 
      response: fallbackResponse,
      timestamp: new Date().toISOString(),
      fallback: true
    });
  }
}

// GET endpoint to retrieve chatbot configuration
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const websiteId = url.searchParams.get('websiteId');
    
    if (!websiteId) {
      return NextResponse.json({ error: 'Website ID is required' }, { status: 400 });
    }

    const client = await connectToDatabase();
    const db = client.db('affilify');
    
    // Find the website and its owner's chatbot configuration
    const website = await db.collection('generated_websites').findOne({ 
      subdomain: websiteId 
    });
    
    if (!website) {
      return NextResponse.json({ error: 'Website not found' }, { status: 404 });
    }

    const user = await db.collection('users').findOne({ 
      _id: website.userId 
    });

    if (!user || !user.chatbotConfig || !user.chatbotConfig.enabled) {
      return NextResponse.json({ 
        enabled: false,
        message: 'Chatbot not enabled for this website'
      });
    }

    // Return chatbot configuration (without sensitive data)
    return NextResponse.json({
      enabled: true,
      config: {
        name: user.chatbotConfig.name || 'AI Assistant',
        welcomeMessage: user.chatbotConfig.welcomeMessage || 'Hi! How can I help you today?',
        color: user.chatbotConfig.color || 'blue',
        position: user.chatbotConfig.position || 'bottom-right',
        productContext: user.chatbotConfig.productContext || ''
      }
    });

  } catch (error) {
    console.error('Failed to get chatbot config:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve chatbot configuration' },
      { status: 500 }
    );
  }
}
