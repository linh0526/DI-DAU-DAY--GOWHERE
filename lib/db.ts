import mongoose from 'mongoose';
import dns from 'node:dns';

// Fix 1: Ép Node.js sử dụng DNS Server công cộng để giải quyết lỗi SRV trên Windows/ISP Việt Nam
// Chạy lệnh này ngay lập tức ở mức file để đảm bảo nó có tác dụng sớm nhất
try {
  dns.setServers(['1.1.1.1', '1.0.0.1', '8.8.8.8', '8.8.4.4']);
  console.log('🌐 DNS Servers set to Cloudflare/Google');
} catch (e) {
  console.warn('⚠️ Không thể thiết lập DNS servers, đang dùng mặc định của hệ thống.');
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      family: 4, // Ép dùng IPv4 để tránh lỗi resolve trên một số mạng
    };

    console.log('📡 Đang kết nối tới MongoDB Atlas...');

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      console.log('✅ Kết nối MongoDB thành công!');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e: any) {
    cached.promise = null;
    console.error('❌ Lỗi kết nối MongoDB:', e.message);
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
