import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Location from '@/lib/models/Location';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const { id } = await params;
  
  const token = request.cookies.get('token')?.value;
  let username = 'Anonymous';
  
  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      username = (payload.username as string) || 'User';
    } catch (e) {}
  }
  
  try {
    const { reason } = await request.json();
    const location = await Location.findById(id);
    if (!location) return NextResponse.json({ msg: 'Not found' }, { status: 404 });
    
    if (!location.reports) location.reports = [];
    location.reports.push({
      user: username,
      reason,
      status: 'pending',
      date: new Date()
    });
    
    await location.save();
    return NextResponse.json({ msg: 'Report submitted' });
  } catch (err: any) {
    return NextResponse.json({ msg: err.message }, { status: 500 });
  }
}
