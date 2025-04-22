import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { adminAuth } from '@/lib/firebase-admin';

// Create a new session
export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    const { id, title, type, createdAt } = body;

    // Get authorization token
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Extract the token
    const token = authHeader.split('Bearer ')[1];
    
    // Verify the token and get the user
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Create the session document
    await db.collection('sessions').doc(id).set({
      id,
      title,
      type: type || 'default',
      createdAt: createdAt || new Date().toISOString(),
      createdBy: userId,
      active: true,
    });

    return NextResponse.json({ 
      id, 
      title,
      success: true 
    });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

// Get sessions
export async function GET(req: NextRequest) {
  try {
    // Get URL parameters
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required parameter: userId' },
        { status: 400 }
      );
    }
    
    // Get authorization token
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Extract the token
    const token = authHeader.split('Bearer ')[1];
    
    // Verify the token and get the user
    const decodedToken = await adminAuth.verifyIdToken(token);
    const requestUserId = decodedToken.uid;
    
    // Ensure the user is requesting their own sessions or has admin access
    // Here we're just checking if they're requesting their own sessions
    if (userId !== requestUserId) {
      // For a real app, you might want to check if they have permission to view other users' sessions
      return NextResponse.json(
        { error: 'Unauthorized to access these sessions' },
        { status: 403 }
      );
    }
    
    // Query sessions where user is the creator
    const sessionsQuery = await db.collection('sessions')
      .where('createdBy', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();
    
    // Format the sessions
    const sessions = sessionsQuery.docs.map(doc => {
      const data = doc.data();
      return {
        id: data.id,
        title: data.title,
        type: data.type,
        createdAt: data.createdAt,
        scheduledFor: data.scheduledFor || null,
        active: data.active || false,
      };
    });
    
    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

// For a production app, you might want to add PUT to update sessions and DELETE to remove them