import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  name?: string;
  plan?: string;
}

export async function verifyAuthToken(token: string): Promise<AuthenticatedUser | null> {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-default-secret-key-for-development') as any;
    return {
      userId: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      plan: decoded.plan || 'basic'
    };
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

export async function authenticateRequest(request: NextRequest): Promise<{
  success: boolean;
  user?: AuthenticatedUser;
  error?: string;
}> {
  try {
    // Get the auth token from cookies
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return {
        success: false,
        error: 'Authentication required. Please sign in.'
      };
    }

    // Verify the token
    const user = await verifyAuthToken(token);
    
    if (!user) {
      return {
        success: false,
        error: 'Invalid authentication token.'
      };
    }

    return {
      success: true,
      user
    };

  } catch (error) {
    console.error('Authentication error:', error);
    return {
      success: false,
      error: 'Authentication failed.'
    };
  }
}

export async function getUserFromDatabase(userId: string) {
  try {
    const client = await connectToDatabase();
    const db = client.db('affilify');
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne(
      { _id: userId },
      { projection: { password: 0 } } // Exclude password
    );

    return user;
  } catch (error) {
    console.error('Database error:', error);
    return null;
  }
}

export function createAuthResponse(error: string, status: number = 401) {
  return Response.json(
    { success: false, error },
    { status }
  );
}

export function requireAuth(handler: (request: NextRequest, user: AuthenticatedUser) => Promise<Response>) {
  return async (request: NextRequest) => {
    const auth = await authenticateRequest(request);
    
    if (!auth.success || !auth.user) {
      return createAuthResponse(auth.error || 'Authentication failed');
    }

    return handler(request, auth.user);
  };
}
