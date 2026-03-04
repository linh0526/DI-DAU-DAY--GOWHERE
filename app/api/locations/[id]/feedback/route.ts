import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Location from '@/lib/models/Location';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');

// @route   POST api/locations/[id]/feedback
// @desc    Gửi nhận xét (Cần đăng nhập)
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const { id } = await params;

  const token = request.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.json({ msg: 'Vui lòng đăng nhập để gửi nhận xét' }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const { comment, rating } = await request.json();

    const location = await Location.findById(id);
    if (!location) {
      return NextResponse.json({ msg: 'Không tìm thấy địa điểm' }, { status: 404 });
    }

    location.feedback.push({
      user: payload.username || 'Người dùng', // Tùy thuộc vào payload có username hay không
      comment,
      rating: Number(rating) || 5,
      date: new Date()
    });

    await location.save();
    return NextResponse.json(location);
  } catch (err: any) {
    return NextResponse.json({ msg: 'Lỗi khi gửi nhận xét' }, { status: 500 });
  }
}
