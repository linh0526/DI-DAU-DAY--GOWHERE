import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import City from '@/lib/models/City';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');

import mongoose from 'mongoose';

export async function GET() {
  await dbConnect();
  try {
    const cities = await City.find().sort({ order: 1 }).lean();
    const Location = mongoose.models.Location || mongoose.model('Location', new mongoose.Schema({ 
      city: String,
      district: String
    }));
    
    // Aggregation to get counts by city and district
    const counts = await Location.aggregate([
      { $group: { _id: { city: '$city', district: '$district' }, count: { $sum: 1 } } }
    ]);

    const citiesWithCount = cities.map((city: any) => {
      // Calculate total count for the city
      const cityTotal = counts
        .filter(c => c._id.city === city.slug)
        .reduce((sum, c) => sum + c.count, 0);

      // Add count to each district
      const districtsWithCount = city.districts.map((dist: any) => {
        const dCount = counts.find(c => c._id.city === city.slug && c._id.district === dist.name)?.count || 0;
        return { ...dist, count: dCount };
      });

      return {
        ...city,
        count: cityTotal,
        districts: districtsWithCount
      };
    });

    return NextResponse.json(citiesWithCount);
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

    const data = await request.json();
    const city = await City.create(data);
    return NextResponse.json(city);
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

    const data = await request.json();
    const { _id, ...updateData } = data;
    const city = await City.findByIdAndUpdate(_id, updateData, { new: true });
    return NextResponse.json(city);
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
    if (!id) return NextResponse.json({ msg: 'Missing ID' }, { status: 400 });

    await City.findByIdAndDelete(id);
    return NextResponse.json({ msg: 'Deleted' });
  } catch (err: any) {
    return NextResponse.json({ msg: err.message }, { status: 500 });
  }
}
