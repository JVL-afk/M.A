import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    // Get the URL and userId from the request body sent by the frontend page
    const body = await request.json();
    const { url, userId } = body;

    if (!url) {
      return NextResponse.json({ success: false, error: 'Website URL is required.' }, { status: 400 });
    }

    // Verify user authentication
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    
