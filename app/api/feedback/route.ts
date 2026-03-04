import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema({
  email: String,
  message: { type: String, required: true },
  status: { type: String, enum: ['pending', 'resolved'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema);

export async function POST(request: NextRequest) {
  await dbConnect();
  try {
    const { email, message } = await request.json();
    if (!message) return NextResponse.json({ msg: 'Message is required' }, { status: 400 });

    const feedback = await Feedback.create({ email, message });
    return NextResponse.json(feedback);
  } catch (err: any) {
    return NextResponse.json({ msg: err.message }, { status: 500 });
  }
}

import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');

export async function GET(request: NextRequest) {
  await dbConnect();
  
  const token = request.cookies.get('token')?.value;
  if (!token) return NextResponse.json({ msg: 'Unauthorized' }, { status: 401 });

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role !== 'admin') {
      return NextResponse.json({ msg: 'Forbidden' }, { status: 403 });
    }

    const feedbacks = await Feedback.find({}).sort({ createdAt: -1 });
    return NextResponse.json(feedbacks);
  } catch (err: any) {
    return NextResponse.json({ msg: err.message }, { status: 500 });
  }
}
