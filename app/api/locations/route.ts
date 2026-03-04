import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Location from '@/lib/models/Location';
import User from '@/lib/models/User';
import { jwtVerify } from 'jose';
import { syncTags } from '@/lib/tag-service';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');

export async function GET(request: NextRequest) {
  await dbConnect();
  
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');
  const district = searchParams.get('district');
  const tag = searchParams.get('tag');
  const search = searchParams.get('search');
  const page = parseInt(searchParams.get('page') || '0');
  const limit = parseInt(searchParams.get('limit') || '0');

  const token = request.cookies.get('token')?.value;
  let userFavorites: string[] = [];

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const user = await User.findById(payload.id);
      if (user) {
        userFavorites = user.favorites.map((f: any) => f.toString());
      }
    } catch (err) {
      // Ignored
    }
  }

  try {
    const query: any = {};
    if (city && city !== 'all') query.city = city;
    if (district && district !== 'all') query.district = district;
    if (tag && tag !== 'all') query.tags = tag;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } }
      ];
    }

    let mongoQuery = Location.find(query).sort({ createdAt: -1 });

    if (page > 0 && limit > 0) {
      mongoQuery = mongoQuery.skip((page - 1) * limit).limit(limit);
    }

    const locations = await mongoQuery;
    
    // Convert to plain objects and add isLiked
    const result = locations.map(loc => {
      const obj = loc.toObject();
      obj.isLiked = userFavorites.includes(obj._id.toString());
      return obj;
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ msg: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  await dbConnect();

  const token = request.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.json({ msg: 'Vui lòng đăng nhập để thêm địa điểm' }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.id as string;
    
    const data = await request.json();
    const newLocation = await Location.create({
      ...data,
      addedBy: userId
    });

    if (data.tags && data.tags.length > 0) {
      await syncTags(data.tags);
    }
    
    return NextResponse.json(newLocation);
  } catch (err: any) {
    console.error('Location POST Error:', err);
    if (err.name === 'JWTExpress' || err.code === 'ERR_JWT_EXPIRED' || err.code === 'ERR_JWS_INVALID') {
      return NextResponse.json({ msg: 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ' }, { status: 401 });
    }
    return NextResponse.json({ msg: 'Lỗi server: ' + err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  await dbConnect();

  const token = request.cookies.get('token')?.value;
  if (!token) return NextResponse.json({ msg: 'Unauthorized' }, { status: 401 });

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role !== 'admin') {
      return NextResponse.json({ msg: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const idsString = searchParams.get('ids');

    if (!idsString) {
      return NextResponse.json({ msg: 'No IDs provided' }, { status: 400 });
    }

    const ids = idsString.split(',');
    await Location.deleteMany({ _id: { $in: ids } });

    return NextResponse.json({ msg: 'Deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ msg: 'Lỗi server: ' + err.message }, { status: 500 });
  }
}
