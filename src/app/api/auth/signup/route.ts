import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '../../../lib/mongodb'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { ObjectId } from 'mongodb'

// This function will handle the signup request.
export async function POST(request: NextRequest) {
  try {
    // --- 1. Get User Data ---
    // Tries to parse JSON, falls back to form data if it fails.
    let data;
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = await request.json();
    } else {
      const formData = await request.formData();
      data = Object.fromEntries(formData.entries());
    }

    const { name, email, password } = data;

    // --- 2. Validate Input ---
    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and password are required.' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      )
    }

    // --- 3. Connect to Database ---
    const client = await connectToDatabase()
    const db = client.db('affilify')
    const usersCollection = db.collection('users')

    // --- 4. Check for Existing User ---
    const existingUser = await usersCollection.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists.' },
        { status: 409 } // 409 Conflict is more appropriate here
      )
    }

    // --- 5. Hash Password ---
    const hashedPassword = await bcrypt.hash(password, 10)

    // --- 6. Create New User in Database ---
    const newUser = {
      _id: new ObjectId(),
      name: name,
      email: email.toLowerCase(),
      password: hashedPassword,
      plan: 'basic',
      isVerified: false, // Or true if you have an email verification flow
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: new Date(),
    }

    const result = await usersCollection.insertOne(newUser)

    // --- 7. Generate JWT Token ---
    // This is the critical step for logging the user in right after signup.
    const token = jwt.sign(
      { userId: result.insertedId, email: newUser.email },
      process.env.JWT_SECRET || 'your-default-secret-key-for-development',
      { expiresIn: '7d' } // Token expires in 7 days
    )

    // --- 8. Create Response and Set Cookie ---
    const response = NextResponse.json({
      success: true,
      message: 'Signup successful!',
      userId: result.insertedId,
    }, { status: 201 }); // 201 Created is more appropriate

    // Set the token in a secure, HttpOnly cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: 'lax', // Or 'strict' for more security
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
    } );

    console.log('SIGNUP SUCCESS: User created and auth cookie set.');
    return response;

  } catch (error) {
    // --- 9. Comprehensive Error Handling ---
    console.error('SIGNUP_ERROR:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.'
    return NextResponse.json(
      { success: false, error: 'Failed to create account.', details: errorMessage },
      { status: 500 }
    )
  }
}
