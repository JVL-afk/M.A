import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    // Get request body
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    // Connect to database
    const { db } = await connectToDatabase();

    // Find user by email
    const user = await db.collection('users').findOne({ email });

    // Check if user exists
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-default-secret-key-for-development',
      { expiresIn: '7d' }
    );

    // Prepare user data (excluding password)
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      plan: user.plan || 'basic',
      createdAt: user.createdAt,
    };

    // Create response
    const response = NextResponse.json({
      success: true,
      user: userData,
      message: 'Login successful!'
    });

    // Get the hostname for proper cookie domain setting
    const hostname = request.headers.get('host') || '';
    const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1');
    
    // Determine the correct cookie domain
    let cookieDomain;
    if (isLocalhost) {
      cookieDomain = undefined; // Let browser set for localhost
    } else if (hostname.includes('netlify.app')) {
      cookieDomain = '.netlify.app'; // For Netlify subdomain
    } else if (hostname.includes('affilify.eu')) {
      cookieDomain = '.affilify.eu'; // For custom domain
    } else {
      // Extract domain from hostname (e.g., example.com from subdomain.example.com)
      const domainParts = hostname.split('.');
      if (domainParts.length >= 2) {
        cookieDomain = `.${domainParts[domainParts.length - 2]}.${domainParts[domainParts.length - 1]}`;
      }
    }

    // Set auth token cookie with appropriate domain
    response.cookies.set({
      name: 'auth-token',
      value: token,
      httpOnly: true,
      secure: !isLocalhost, // Secure in production
      sameSite: 'lax',
      path: '/',
      domain: cookieDomain, // Use the determined domain
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    });

    // Log successful login
    console.log(`User logged in: ${email}`);

    return response;
  } catch (error) {
    console.error('LOGIN_ERROR:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred during login.' },
      { status: 500 }
    );
  }
}

