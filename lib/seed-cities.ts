import dbConnect from '../db';
import City from '../models/City';

const cities = [
  { name: 'Hà Nội', slug: 'hanoi', order: 1, districts: [{ name: 'Ba Đình', slug: 'ba-dinh' }, { name: 'Hoàn Kiếm', slug: 'hoan-kiem' }, { name: 'Tây Hồ', slug: 'tay-ho' }] },
  { name: 'TP. Hồ Chí Minh', slug: 'tphcm', order: 2, districts: [{ name: 'Quận 1', slug: 'quan-1' }, { name: 'Quận 3', slug: 'quan-3' }, { name: 'Quận 7', slug: 'quan-7' }] },
  { name: 'Đà Nẵng', slug: 'danang', order: 3, districts: [{ name: 'Hải Châu', slug: 'hai-chau' }, { name: 'Thanh Khê', slug: 'thanh-khe' }] },
  { name: 'Tiền Giang', slug: 'tiengiang', order: 10, districts: [{ name: 'Mỹ Tho', slug: 'my-tho' }, { name: 'Châu Thành', slug: 'chau-thanh' }] },
  { name: 'Bình Dương', slug: 'binhduong', order: 11, districts: [{ name: 'Thủ Dầu Một', slug: 'thu-dau-mot' }, { name: 'Thuận An', slug: 'thuan-an' }] },
  // ... Tôi sẽ thêm logic để bạn có thể import thêm sau này hoặc dùng tool để điền đủ 63 tỉnh
];

export async function seedCities() {
  await dbConnect();
  const count = await City.countDocuments();
  if (count === 0) {
    await City.insertMany(cities);
    console.log('✅ Đã khởi tạo danh mục hành chính mẫu');
  }
}
