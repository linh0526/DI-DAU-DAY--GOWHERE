import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';
import * as jose from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');

export async function POST(request: NextRequest) {
  await dbConnect();

  try {
    const { username, password, role = 'user' } = await request.json();

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return NextResponse.json({ msg: 'Tên người dùng đã tồn tại' }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      username,
      password: hashedPassword,
      role: role === 'admin' ? 'admin' : 'user', // Basic role guard
    });

    const token = await new jose.SignJWT({ id: newUser._id.toString(), role: newUser.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

    const response = NextResponse.json({
      success: true,
      user: { id: newUser._id, username: newUser.username, role: newUser.role },
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ msg: err.message }, { status: 500 });
  }
}
