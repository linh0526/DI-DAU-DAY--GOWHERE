import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Location from '@/lib/models/Location';
import { jwtVerify } from 'jose';
import { syncTags } from '@/lib/tag-service';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const { id } = await params;
  try {
    const location = await Location.findById(id);
    if (!location) return NextResponse.json({ msg: 'Not found' }, { status: 404 });
    return NextResponse.json(location);
  } catch (err: any) {
    return NextResponse.json({ msg: err.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const { id } = await params;

  const token = request.cookies.get('token')?.value;
  if (!token) return NextResponse.json({ msg: 'Unauthorized' }, { status: 401 });

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role !== 'admin') {
      // Allow views update for non-admins
      const data = await request.json();
      if (Object.keys(data).length === 1 && data.views !== undefined) {
        const updatedLocation = await Location.findByIdAndUpdate(id, { views: data.views }, { returnDocument: 'after' });
        return NextResponse.json(updatedLocation);
      }
      return NextResponse.json({ msg: 'Forbidden' }, { status: 403 });
    }

    const data = await request.json();
    const updatedLocation = await Location.findByIdAndUpdate(id, data, { returnDocument: 'after' });
    
    if (data.tags && data.tags.length > 0) {
      await syncTags(data.tags);
    }

    return NextResponse.json(updatedLocation);
  } catch (err: any) {
    return NextResponse.json({ msg: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const { id } = await params;

  const token = request.cookies.get('token')?.value;
  if (!token) return NextResponse.json({ msg: 'Unauthorized' }, { status: 401 });

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role !== 'admin') {
      return NextResponse.json({ msg: 'Forbidden' }, { status: 403 });
    }

    await Location.findByIdAndDelete(id);
    return NextResponse.json({ msg: 'Deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ msg: err.message }, { status: 500 });
  }
}
