import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    // --- 1. Get User Credentials ---
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    // --- 2. Connect to Database ---
    const client = await connectToDatabase();
    const db = client.db('affilify');
    const usersCollection = db.collection('users');

    // --- 3. Find User ---
    const user = await usersCollection.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials. Please check your email and password.' },
        { status: 401 } // Unauthorized
      );
    }

    // --- 4. Compare Passwords ---
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials. Please check your email and password.' },
        { status: 401 }
      );
    }

    // --- 5. Generate JWT Token (THE CRITICAL FIX) ---
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-default-secret-key-for-development',
      { expiresIn: '7d' }
    );

    // --- 6. Update Last Login and Create Response (THE SECOND CRITICAL FIX) ---
    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { lastLoginAt: new Date() } }
    );

    const response = NextResponse.json({
      success: true,
      message: 'Login successful!',
    });

    // Set the token in a secure, HttpOnly cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    } );

    return response;

  } catch (error) {
    console.error('LOGIN_ERROR:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json(
      { success: false, error: 'An internal server error occurred.', details: errorMessage },
      { status: 500 }
    );
  }
}
