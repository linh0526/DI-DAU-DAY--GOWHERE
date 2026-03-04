import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Tag from '@/lib/models/Tag';
import { jwtVerify } from 'jose';
import { CATEGORIES } from '@/lib/data-locations';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');

export async function GET(request: NextRequest) {
  await dbConnect();
  const token = request.cookies.get('token')?.value;
  if (!token) return NextResponse.json({ msg: 'Unauthorized' }, { status: 401 });

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role !== 'admin') return NextResponse.json({ msg: 'Forbidden' }, { status: 403 });

    const tags = await Tag.find({}).sort({ updatedAt: -1 });

    return NextResponse.json(tags);
  } catch (err: any) {
    return NextResponse.json({ msg: err.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  await dbConnect();
  const token = request.cookies.get('token')?.value;
  if (!token) return NextResponse.json({ msg: 'Unauthorized' }, { status: 401 });

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role !== 'admin') return NextResponse.json({ msg: 'Forbidden' }, { status: 403 });

    const { id, status, name } = await request.json();
    const updateData: any = { updatedAt: new Date() };
    if (status) updateData.status = status;
    if (name) updateData.name = name;

    const updatedTag = await Tag.findByIdAndUpdate(id, updateData, { returnDocument: 'after' });
    return NextResponse.json(updatedTag);
  } catch (err: any) {
    return NextResponse.json({ msg: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  await dbConnect();
  const token = request.cookies.get('token')?.value;
  if (!token) return NextResponse.json({ msg: 'Unauthorized' }, { status: 401 });

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role !== 'admin') return NextResponse.json({ msg: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const ids = searchParams.get('ids');

    if (ids) {
      const idArray = ids.split(',');
      await Tag.deleteMany({ _id: { $in: idArray } });
      return NextResponse.json({ msg: 'Deleted tags successfully' });
    }

    if (!id) return NextResponse.json({ msg: 'Missing ID' }, { status: 400 });

    await Tag.findByIdAndDelete(id);
    return NextResponse.json({ msg: 'Deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ msg: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  await dbConnect();
  const token = request.cookies.get('token')?.value;
  if (!token) return NextResponse.json({ msg: 'Unauthorized' }, { status: 401 });

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role !== 'admin') return NextResponse.json({ msg: 'Forbidden' }, { status: 403 });

    const { name, status } = await request.json();
    if (!name) return NextResponse.json({ msg: 'Name is required' }, { status: 400 });

    const existingTag = await Tag.findOne({ name });
    if (existingTag) return NextResponse.json({ msg: 'Tag already exists' }, { status: 400 });

    const newTag = await Tag.create({ name, status: status || 'approved', count: 0 });
    return NextResponse.json(newTag);
  } catch (err: any) {
    return NextResponse.json({ msg: err.message }, { status: 500 });
  }
}
