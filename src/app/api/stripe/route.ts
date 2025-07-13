import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '../../../lib/mongodb'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const { plan, priceId, successUrl, cancelUrl } = await request.json()

    if (!plan || !priceId) {
      return NextResponse.json(
        { success: false, error: 'Plan and price ID are required' },
        { status: 400 }
      )
    }

    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    let decoded: any
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
    } catch (jwtError) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Connect to database
    const client = await connectToDatabase()
    const db = client.db('affilify')

    // Get user information
    const user = await db.collection('users').findOne({ _id: decoded.userId })
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Validate plan
    const validPlans = ['pro', 'enterprise']
    if (!validPlans.includes(plan)) {
      return NextResponse.json(
        { success: false, error: 'Invalid plan selected' },
        { status: 400 }
      )
    }

    // Check if user already has this plan or higher
    if (user.plan === plan || (user.plan === 'enterprise' && plan === 'pro')) {
      return NextResponse.json(
        { success: false, error: 'You already have this plan or a higher one' },
        { status: 400 }
      )
    }

    // For demo purposes, we'll simulate a successful payment
    // In a real implementation, you would:
    // 1. Create a Stripe checkout session
    // 2. Handle the payment flow
    // 3. Update user plan after successful payment

    // Simulate payment processing
    const paymentSession = {
      id: `cs_${Date.now()}`,
      url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id=cs_${Date.now()}`,
      status: 'open',
      plan: plan,
      priceId: priceId,
      amount: plan === 'pro' ? 2900 : 9900, // $29 or $99
      currency: 'usd'
    }

    // Store payment intent in database
    await db.collection('payment_sessions').insertOne({
      sessionId: paymentSession.id,
      userId: decoded.userId,
      plan: plan,
      priceId: priceId,
      amount: paymentSession.amount,
      currency: paymentSession.currency,
      status: 'pending',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    })

    return NextResponse.json({
      success: true,
      message: 'Payment session created successfully',
      session: {
        id: paymentSession.id,
        url: paymentSession.url,
        plan: plan,
        amount: paymentSession.amount,
        currency: paymentSession.currency
      }
    })

  } catch (error) {
    console.error('Stripe checkout error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create payment session',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    let decoded: any
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
    } catch (jwtError) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Connect to database
    const client = await connectToDatabase()
    const db = client.db('affilify')

    // Get payment session
    const paymentSession = await db.collection('payment_sessions').findOne({
      sessionId: sessionId,
      userId: decoded.userId
    })

    if (!paymentSession) {
      return NextResponse.json(
        { success: false, error: 'Payment session not found' },
        { status: 404 }
      )
    }

    // For demo purposes, mark as completed and upgrade user
    if (paymentSession.status === 'pending') {
      // Update payment session
      await db.collection('payment_sessions').updateOne(
        { sessionId: sessionId },
        { 
          $set: { 
            status: 'completed',
            completedAt: new Date()
          }
        }
      )

      // Upgrade user plan
      await db.collection('users').updateOne(
        { _id: decoded.userId },
        { 
          $set: { 
            plan: paymentSession.plan,
            planUpgradedAt: new Date(),
            updatedAt: new Date()
          }
        }
      )

      // Log upgrade event
      await db.collection('user_events').insertOne({
        userId: decoded.userId,
        event: 'plan_upgraded',
        timestamp: new Date(),
        metadata: {
          fromPlan: 'basic',
          toPlan: paymentSession.plan,
          amount: paymentSession.amount,
          sessionId: sessionId
        }
      })
    }

    return NextResponse.json({
      success: true,
      session: {
        id: paymentSession.sessionId,
        status: 'completed',
        plan: paymentSession.plan,
        amount: paymentSession.amount,
        completedAt: new Date()
      }
    })

  } catch (error) {
    console.error('Get payment session error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to retrieve payment session',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    )
  }
}
