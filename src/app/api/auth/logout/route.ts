import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '../../../../lib/mongodb'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value

    if (token) {
      try {
        // Verify and decode token to get user info
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
        
        // Connect to database
        const client = await connectToDatabase()
        const db = client.db('affilify')

        // Update user's last active time
        await db.collection('users').updateOne(
          { _id: decoded.userId },
          { 
            $set: { 
              lastActiveAt: new Date(),
              lastLogoutAt: new Date()
            }
          }
        )

        // In a real implementation, you might want to:
        // 1. Add token to a blacklist
        // 2. Store logout event for analytics
        // 3. Clear any active sessions

      } catch (jwtError) {
        // Token is invalid, but we still want to clear the cookie
        console.log('Invalid token during logout:', jwtError)
      }
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    })

    // Clear the auth cookie
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0 // Expire immediately
    })

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    
    // Even if there's an error, we should still clear the cookie
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0
    });

    return response;
  }
}

export async function GET() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed. Use POST to logout.' },
    { status: 405 }
  )
}
