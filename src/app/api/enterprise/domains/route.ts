// ENTERPRISE DOMAINS API ROUTE
// File: src/app/api/enterprise/domains/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// GET - Retrieve all custom domains for Enterprise user
export async function GET(request: NextRequest) {
  try {
    const token = cookies().get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const client = await connectToDatabase();
    const db = client.db('affilify');

    // Verify user is Enterprise
    const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
    if (!user || user.plan !== 'enterprise') {
      return NextResponse.json({ error: 'Enterprise plan required' }, { status: 403 });
    }

    // Get all custom domains for this user
    const domains = await db.collection('custom_domains').find({
      userId: user._id
    }).sort({ createdAt: -1 }).toArray();

    return NextResponse.json({
      success: true,
      domains: domains.map(domain => ({
        id: domain._id,
        domain: domain.domain,
        websiteId: domain.websiteId,
        status: domain.status,
        createdAt: domain.createdAt,
        verifiedAt: domain.verifiedAt
      }))
    });

  } catch (error) {
    console.error('Enterprise domains API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Add a new custom domain
export async function POST(request: NextRequest) {
  try {
    const token = cookies().get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const client = await connectToDatabase();
    const db = client.db('affilify');

    // Verify user is Enterprise
    const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
    if (!user || user.plan !== 'enterprise') {
      return NextResponse.json({ error: 'Enterprise plan required' }, { status: 403 });
    }

    const body = await request.json();
    const { domain, websiteId } = body;

    // Validate required fields
    if (!domain || !websiteId) {
      return NextResponse.json({ 
        error: 'Missing required fields: domain, websiteId' 
      }, { status: 400 });
    }

    // Validate domain format
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) {
      return NextResponse.json({ error: 'Invalid domain format' }, { status: 400 });
    }

    // Check if domain already exists
    const existingDomain = await db.collection('custom_domains').findOne({ domain });
    if (existingDomain) {
      return NextResponse.json({ error: 'Domain already exists' }, { status: 409 });
    }

    // Verify website belongs to user
    const website = await db.collection('generated_websites').findOne({
      _id: new ObjectId(websiteId),
      userId: user._id
    });
    if (!website) {
      return NextResponse.json({ error: 'Website not found' }, { status: 404 });
    }

    // Add domain to Vercel (if Vercel API token is available)
    let vercelDomainAdded = false;
    if (process.env.VERCEL_API_TOKEN && process.env.VERCEL_PROJECT_ID) {
      try {
        const vercelResponse = await fetch(`https://api.vercel.com/v9/projects/${process.env.VERCEL_PROJECT_ID}/domains`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.VERCEL_API_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name: domain })
        });

        if (vercelResponse.ok) {
          vercelDomainAdded = true;
        } else {
          console.error('Vercel domain addition failed:', await vercelResponse.text());
        }
      } catch (error) {
        console.error('Vercel API error:', error);
      }
    }

    // Create custom domain record
    const newDomain = {
      userId: user._id,
      websiteId: new ObjectId(websiteId),
      domain,
      status: vercelDomainAdded ? 'pending' : 'manual_setup_required',
      vercelConfigured: vercelDomainAdded,
      createdAt: new Date(),
      verifiedAt: null
    };

    const result = await db.collection('custom_domains').insertOne(newDomain);

    return NextResponse.json({
      success: true,
      domain: {
        id: result.insertedId,
        domain,
        websiteId,
        status: newDomain.status,
        vercelConfigured: vercelDomainAdded,
        dnsInstructions: {
          type: 'CNAME',
          name: domain,
          value: `${process.env.VERCEL_PROJECT_ID}.vercel.app`
        }
      }
    });

  } catch (error) {
    console.error('Enterprise domain creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Remove a custom domain
export async function DELETE(request: NextRequest) {
  try {
    const token = cookies().get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const client = await connectToDatabase();
    const db = client.db('affilify');

    // Verify user is Enterprise
    const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
    if (!user || user.plan !== 'enterprise') {
      return NextResponse.json({ error: 'Enterprise plan required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const domainId = searchParams.get('id');

    if (!domainId) {
      return NextResponse.json({ error: 'Domain ID required' }, { status: 400 });
    }

    // Find and verify domain ownership
    const domain = await db.collection('custom_domains').findOne({
      _id: new ObjectId(domainId),
      userId: user._id
    });

    if (!domain) {
      return NextResponse.json({ error: 'Domain not found' }, { status: 404 });
    }

    // Remove from Vercel if configured
    if (domain.vercelConfigured && process.env.VERCEL_API_TOKEN && process.env.VERCEL_PROJECT_ID) {
      try {
        await fetch(`https://api.vercel.com/v9/projects/${process.env.VERCEL_PROJECT_ID}/domains/${domain.domain}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${process.env.VERCEL_API_TOKEN}`
          }
        });
      } catch (error) {
        console.error('Vercel domain removal error:', error);
      }
    }

    // Remove from database
    await db.collection('custom_domains').deleteOne({ _id: new ObjectId(domainId) });

    return NextResponse.json({
      success: true,
      message: 'Domain removed successfully'
    });

  } catch (error) {
    console.error('Enterprise domain deletion error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
