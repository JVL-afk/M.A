// FIXED AUTHENTICATION SYSTEM - USES SHARED MONGODB CONNECTION
// Replace: src/app/api/auth/login/route.ts

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '../../../lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { 
          error: 'Email and password are required',
          code: 'MISSING_CREDENTIALS'
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          error: 'Invalid email format',
          code: 'INVALID_EMAIL'
        },
        { status: 400 }
      );
    }

    // Connect to database using shared connection
    const { db } = await connectToDatabase();

    // Find user
    const user = await db.collection('users').findOne({ 
      email: email.toLowerCase().trim() 
    });

    if (!user) {
      return NextResponse.json(
        { 
          error: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        },
        { status: 401 }
      );
    }

    // Check if account is locked
    if (user.accountLocked && user.lockUntil && new Date() < user.lockUntil) {
      return NextResponse.json(
        { 
          error: 'Account temporarily locked due to too many failed attempts',
          code: 'ACCOUNT_LOCKED',
          lockUntil: user.lockUntil
        },
        { status: 423 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      // Increment failed login attempts
      const failedAttempts = (user.failedLoginAttempts || 0) + 1;
      const updateData: any = {
        failedLoginAttempts: failedAttempts,
        lastFailedLogin: new Date()
      };

      // Lock account after 5 failed attempts
      if (failedAttempts >= 5) {
        updateData.accountLocked = true;
        updateData.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      }

      await db.collection('users').updateOne(
        { _id: user._id },
        { $set: updateData }
      );

      return NextResponse.json(
        { 
          error: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS',
          attemptsRemaining: Math.max(0, 5 - failedAttempts)
        },
        { status: 401 }
      );
    }

    // Check if email is verified (if email verification is enabled)
    if (user.emailVerificationRequired && !user.isVerified) {
      return NextResponse.json(
        { 
          error: 'Please verify your email address before logging in',
          code: 'EMAIL_NOT_VERIFIED',
          email: user.email
        },
        { status: 403 }
      );
    }

    // Generate JWT token
    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      plan: user.subscription?.planType || 'basic',
      isVerified: user.isVerified || false,
      role: user.role || 'user'
    };

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // Reset failed login attempts and update last login
    await db.collection('users').updateOne(
      { _id: user._id },
      { 
        $set: { 
          lastLoginAt: new Date(),
          lastLoginIP: request.headers.get('x-forwarded-for') || 'unknown'
        },
        $inc: { loginCount: 1 },
        $unset: { 
          failedLoginAttempts: '',
          accountLocked: '',
          lockUntil: ''
        }
      }
    );

    // Log successful login
    await db.collection('login_logs').insertOne({
      userId: user._id,
      email: user.email,
      timestamp: new Date(),
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      success: true
    });

    // Prepare response
    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        plan: user.subscription?.planType || 'basic',
        isVerified: user.isVerified || false,
        role: user.role || 'user',
        subscription: user.subscription ? {
          planType: user.subscription.planType,
          status: user.subscription.status,
          currentPeriodEnd: user.subscription.currentPeriodEnd
        } : null
      },
      token // Include token in response for client-side storage if needed
    });

    // Set HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/'
    });

    return response;

  } catch (error: any) {
    console.error('Login error:', error);

    // Log error
    try {
      const { db } = await connectToDatabase();
      await db.collection('error_logs').insertOne({
        error: error.message,
        stack: error.stack,
        endpoint: '/api/auth/login',
        timestamp: new Date(),
        type: 'login_error',
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    return NextResponse.json(
      { 
        error: 'Internal server error',
        code: 'SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}

// OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}


