import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    // --- 1. Get User Data ---
    let data;
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = await request.json();
    } else {
      const formData = await request.formData();
      data = Object.fromEntries(formData.entries());
    }

    // --- 2. Validate Input (FINAL, MOST ROBUST VERSION) ---
    const { name, fullName, email, password, confirmPassword, password_confirmation } = data;

    const finalName = name || fullName;
    // This is the key fix: check for multiple common names for the confirmation field.
    const finalConfirmPassword = confirmPassword || password_confirmation;

    if (!email || !password || !finalName) {
      return NextResponse.json(
        { success: false, error: 'Full Name, email, and password are required.' },
        { status: 400 }
      );
    }
    
    // The final check
    if (password !== finalConfirmPassword) {
        // For debugging, let's see what the server is receiving.
        console.log('Password Mismatch Details:', { password, finalConfirmPassword, receivedData: data });
        return NextResponse.json(
            { success: false, error: 'Passwords do not match. Please ensure both fields are identical.' },
            { status: 400 }
        );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    // --- 3. Connect to Database ---
    const client = await connectToDatabase();
    const db = client.db('affilify');
    const usersCollection = db.collection('users');

    // --- 4. Check for Existing User ---
    const existingUser = await usersCollection.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists.' },
        { status: 409 }
      );
    }

    // --- 5. Hash Password ---
    const hashedPassword = await bcrypt.hash(password, 10);

    // --- 6. Create New User in Database ---
    const newUser = {
      _id: new ObjectId(),
      name: finalName,
      email: email.toLowerCase(),
      password: hashedPassword,
      plan: 'basic',
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);

    // --- 7. Generate JWT Token ---
    const token = jwt.sign(
      { userId: result.insertedId, email: newUser.email },
      process.env.JWT_SECRET || 'your-default-secret-key-for-development',
      { expiresIn: '7d' }
    );

    // --- 8. Create Response and Set Cookie ---
    const response = NextResponse.json({
      success: true,
      message: 'Signup successful!',
      userId: result.insertedId,
    }, { status: 201 });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    } );

    return response;

  } catch (error) {
    console.error('SIGNUP_ERROR:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json(
      { success: false, error: 'Failed to create account.', details: errorMessage },
      { status: 500 }
    );
  }
}
