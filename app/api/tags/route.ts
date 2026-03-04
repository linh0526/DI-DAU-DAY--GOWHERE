import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Tag from '@/lib/models/Tag';
import { CATEGORIES } from '@/lib/data-locations';

import { setServers } from 'dns';
setServers(["1.1.1.1", "8.8.8.8"]);

export async function GET() {
  try {
    await dbConnect();
    const approvedTags = await Tag.find({ status: 'approved' }).select('name');
    return NextResponse.json(approvedTags.map(t => (t as any).name));
  } catch (err: any) {
    console.error('API /api/tags error:', err);
    return NextResponse.json([], { status: 500 });
  }
}
