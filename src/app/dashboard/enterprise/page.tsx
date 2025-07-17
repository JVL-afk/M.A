import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import EnterpriseClient from './enterprise-client';

// Define the interface for whiteLabelSettings
interface WhiteLabelSettings {
  companyName?: string;
  companyLogo?: string;
  primaryColor?: string;
  accentColor?: string;
  footerText?: string;
}

// Enterprise Dashboard Page (Server Component)
export default async function EnterprisePage({ searchParams }: { searchParams: { tab?: string; error?: string; success?: string } }) {
  const token = cookies().get('auth-token')?.value;
  
  let userInfo = null;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      
      const client = await connectToDatabase();
      const db = client.db('affilify');
      
      const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
      if (user) {
        const userPlan = user.plan || 'basic';
        userInfo = { user, plan: userPlan };
      }
    } catch (error) {
      return redirect('/login');
    }
  }
  
  if (!userInfo || userInfo.plan !== 'enterprise') {
    return redirect('/pricing?feature=enterprise');
  }
  
  const activeTab = searchParams?.tab || 'team';
  const errorMessage = searchParams?.error;
  const successMessage = searchParams?.success;
  
  // Get team members, API keys, and white-label settings
  const client = await connectToDatabase();
  const db = client.db('affilify');
  
  const teamMembers = await db.collection('team_members')
    .find({ organizationId: userInfo.user._id })
    .sort({ createdAt: -1 })
    .toArray();
  
  const apiKeys = await db.collection('api_keys')
    .find({ userId: userInfo.user._id })
    .sort({ createdAt: -1 })
    .toArray();
  
  // Initialize with empty object and proper type casting
  const dbSettings = await db.collection('white_label_settings')
    .findOne({ userId: userInfo.user._id });
    
  // Convert MongoDB document to our interface type with proper type casting
  const whiteLabelSettings: WhiteLabelSettings = dbSettings ? {
    companyName: dbSettings.companyName,
    companyLogo: dbSettings.companyLogo,
    primaryColor: dbSettings.primaryColor,
    accentColor: dbSettings.accentColor,
    footerText: dbSettings.footerText
  } : {};
  
  // Pass all data to client component
  return (
    <EnterpriseClient 
      userInfo={userInfo}
      activeTab={activeTab}
      errorMessage={errorMessage}
      successMessage={successMessage}
      teamMembers={teamMembers}
      apiKeys={apiKeys}
      whiteLabelSettings={whiteLabelSettings}
    />
  );
}

function redirect(path: string) {
  return {
    redirect: {
      destination: path,
      permanent: false,
    },
  };
}

