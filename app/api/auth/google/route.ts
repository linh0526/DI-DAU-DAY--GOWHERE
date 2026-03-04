import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import * as jose from 'jose';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');

export async function POST(request: Request) {
  try {
    const { credential } = await request.json();
    
    // 1. Verify Google Token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return NextResponse.json({ msg: 'Invalid Google token' }, { status: 400 });
    }

    await dbConnect();

    // 2. Find or Create User
    let user = await User.findOne({ email: payload.email });
    
    if (!user) {
      user = await User.create({
        username: payload.name || payload.email.split('@')[0],
        email: payload.email,
        role: 'user', // Default role
        // No password needed for social login
      });
    }

    // 3. Create Session Token (JWT)
    const token = await new jose.SignJWT({ 
      id: user._id.toString(), 
      username: user.username, 
      role: user.role 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('30d')
      .sign(JWT_SECRET);

    // 4. Set Cookie
    const response = NextResponse.json({
      msg: 'Login successful',
      user: {
        username: user.username,
        role: user.role
      }
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return response;

  } catch (error: any) {
    console.error('Google Auth Error:', error);
    return NextResponse.json({ msg: 'Internal Server Error' }, { status: 500 });
  }
}
