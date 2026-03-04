import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import City from '@/lib/models/City';
import Location from '@/lib/models/Location';

export async function GET() {
  await dbConnect();
  try {
    const cities = await City.find({ isActive: true }).sort({ order: 1, name: 1 });
    
    // Đếm số lượng quán cho từng tỉnh
    const cityCounts = await Location.aggregate([
      { $group: { _id: "$city", count: { $sum: 1 } } }
    ]);

    const result = cities.map(city => {
      const countObj = cityCounts.find(c => c._id === city.slug);
      return {
        ...city.toObject(),
        count: countObj ? countObj.count : 0
      };
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ msg: err.message }, { status: 500 });
  }
}
