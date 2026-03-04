import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Location from '@/lib/models/Location';
import User from '@/lib/models/User';
import * as jose from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const { id } = await params;
  
  const token = request.cookies.get('token')?.value;
  if (!token) return NextResponse.json({ msg: 'Unauthorized' }, { status: 401 });

  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    const userId = payload.id as string;

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ msg: 'User not found' }, { status: 404 });

    const location = await Location.findById(id);
    if (!location) return NextResponse.json({ msg: 'Location not found' }, { status: 404 });

    const index = user.favorites.indexOf(id);
    let isLiked = false;

    if (index > -1) {
      // Unlike
      user.favorites.splice(index, 1);
      location.likes = Math.max(0, (location.likes || 1) - 1);
      isLiked = false;
    } else {
      // Like
      user.favorites.push(id);
      location.likes = (location.likes || 0) + 1;
      isLiked = true;
    }

    await Promise.all([user.save(), location.save()]);
    
    // Return updated location with user-specific flag
    const updatedLocation = location.toObject();
    updatedLocation.isLiked = isLiked;

    return NextResponse.json(updatedLocation);
  } catch (err: any) {
    return NextResponse.json({ msg: err.message }, { status: 500 });
  }
}
