// 🚀 FIXED AFFILIFY SIGNUP API ROUTE
// File: src/app/api/auth/signup/route.ts

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { MongoClient } from 'mongodb';

// MongoDB connection with CORRECTED password case
const MONGODB_URI = process.env.MONGODB_URI!;
const JWT_SECRET = process.env.JWT_SECRET!;

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!global._mongoClientPromise) {
  client = new MongoClient(MONGODB_URI, {
    // REMOVED deprecated bufferMaxEntries parameter
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

export async function POST(request: NextRequest) {
  try {
    const { fullName, email, password, confirmPassword, plan } = await request.json();

    // Validation
    if (!fullName || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: 'Full name, email, and password are required' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Connect to database
    const client = await clientPromise;
    const db = client.db('affilify');
    const users = db.collection('users');

    // Check if user already exists
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = {
      fullName,
      email,
      password: hashedPassword,
      plan: plan || 'basic',
      websitesCreated: 0,
      websiteLimit: plan === 'pro' ? 10 : plan === 'enterprise' ? -1 : 3,
      createdAt: new Date(),
      isActive: true,
      subscription: {
        status: plan === 'basic' ? 'active' : 'pending',
        plan: plan || 'basic',
        startDate: new Date(),
        endDate: null
      }
    };

    const result = await users.insertOne(newUser);

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: result.insertedId, 
        email, 
        plan: plan || 'basic' 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Create response
    const response = NextResponse.json(
      { 
        message: 'Account created successfully',
        user: {
          id: result.insertedId,
          fullName,
          email,
          plan: plan || 'basic'
        }
      },
      { status: 201 }
    );

    // Set JWT cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return response;

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
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

