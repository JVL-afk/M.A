'use server';

import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';
import crypto from 'crypto';

export async function addTeamMember(formData: FormData) {
  const email = formData.get('email') as string;
  const role = formData.get('role') as string;
  const permissions = formData.getAll('permissions') as string[];
  
  // Validate email
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: 'Please enter a valid email address.' };
  }
  
  try {
    const token = cookies().get('auth-token')?.value;
    if (!token) {
      return { success: false, error: 'Authentication required.' };
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    
    const client = await connectToDatabase();
    const db = client.db('affilify');
    
    // Check if email already exists
    const existingMember = await db.collection('team_members').findOne({ email });
    if (existingMember) {
      return { success: false, error: 'This email is already a team member.' };
    }
    
    // Add team member
    await db.collection('team_members').insertOne({
      email,
      role,
      permissions,
      organizationId: new ObjectId(decoded.userId),
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    // TODO: Send invitation email
    
    return { success: true, message: 'Team member has been successfully added!' };
  } catch (error) {
    console.error('ADD_TEAM_MEMBER_ERROR:', error);
    return { success: false, error: 'Failed to add team member. Please try again.' };
  }
}

export async function removeTeamMember(formData: FormData) {
  const memberId = formData.get('memberId') as string;
  
  try {
    const token = cookies().get('auth-token')?.value;
    if (!token) {
      return { success: false, error: 'Authentication required.' };
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    
    const client = await connectToDatabase();
    const db = client.db('affilify');
    
    // Remove team member
    await db.collection('team_members').deleteOne({
      _id: new ObjectId(memberId),
      organizationId: new ObjectId(decoded.userId),
    });
    
    return { success: true, message: 'Team member has been removed.' };
  } catch (error) {
    console.error('REMOVE_TEAM_MEMBER_ERROR:', error);
    return { success: false, error: 'Failed to remove team member. Please try again.' };
  }
}

export async function generateApiKey(formData: FormData) {
  const keyName = formData.get('keyName') as string;
  const permissions = formData.getAll('apiPermissions') as string[];
  
  try {
    const token = cookies().get('auth-token')?.value;
    if (!token) {
      return { success: false, error: 'Authentication required.' };
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    
    const client = await connectToDatabase();
    const db = client.db('affilify');
    
    // Check API key limit
    const keyCount = await db.collection('api_keys').countDocuments({
      userId: new ObjectId(decoded.userId),
    });
    
    if (keyCount >= 5) {
      return { success: false, error: 'Maximum number of API keys reached (5).' };
    }
    
    // Generate API key
    const apiKey = crypto.randomBytes(32).toString('hex');
    
    // Save API key
    await db.collection('api_keys').insertOne({
      name: keyName,
      key: apiKey,
      permissions,
      userId: new ObjectId(decoded.userId),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    return { success: true, message: 'API key has been generated successfully!', apiKey };
  } catch (error) {
    console.error('GENERATE_API_KEY_ERROR:', error);
    return { success: false, error: 'Operation failed. Please try again.' };
  }
}

export async function deleteApiKey(formData: FormData) {
  const keyId = formData.get('keyId') as string;
  
  try {
    const token = cookies().get('auth-token')?.value;
    if (!token) {
      return { success: false, error: 'Authentication required.' };
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    
    const client = await connectToDatabase();
    const db = client.db('affilify');
    
    // Delete API key
    await db.collection('api_keys').deleteOne({
      _id: new ObjectId(keyId),
      userId: new ObjectId(decoded.userId),
    });
    
    return { success: true, message: 'API key has been deleted.' };
  } catch (error) {
    console.error('DELETE_API_KEY_ERROR:', error);
    return { success: false, error: 'Failed to delete API key. Please try again.' };
  }
}

export async function updateWhiteLabel(formData: FormData) {
  const companyName = formData.get('companyName') as string;
  const companyLogo = formData.get('companyLogo') as string;
  const primaryColor = formData.get('primaryColor') as string;
  const accentColor = formData.get('accentColor') as string;
  const footerText = formData.get('footerText') as string;
  
  try {
    const token = cookies().get('auth-token')?.value;
    if (!token) {
      return { success: false, error: 'Authentication required.' };
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    
    const client = await connectToDatabase();
    const db = client.db('affilify');
    
    // Update or create white-label settings
    await db.collection('white_label_settings').updateOne(
      { userId: new ObjectId(decoded.userId) },
      {
        $set: {
          companyName,
          companyLogo,
          primaryColor,
          accentColor,
          footerText,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );
    
    return { success: true, message: 'White-label settings have been updated!' };
  } catch (error) {
    console.error('UPDATE_WHITE_LABEL_ERROR:', error);
    return { success: false, error: 'Failed to update white-label settings. Please try again.' };
  }
}
