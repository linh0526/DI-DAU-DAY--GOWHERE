import dbConnect from '@/lib/db';
import Tag from '@/lib/models/Tag';
import { CATEGORIES } from '@/lib/data-locations';
import { setServers } from 'dns';
setServers(["1.1.1.1", "8.8.8.8"]);

export async function syncTags(tags: string[]) {
  if (!tags || tags.length === 0) return;
  
  await dbConnect();
  
  for (const tagName of tags) {
    if (!tagName) continue;
    
    // Check if tag is in official list
    const isOfficial = CATEGORIES.some(cat => cat.toLowerCase() === tagName.toLowerCase());
    
    if (!isOfficial) {
      try {
        const existingTag = await Tag.findOne({ name: { $regex: new RegExp(`^${tagName}$`, 'i') } });
        if (existingTag) {
          existingTag.count += 1;
          existingTag.updatedAt = new Date();
          await existingTag.save();
        } else {
          await Tag.create({ name: tagName, status: 'pending' });
        }
      } catch (err) {
        console.error('Error syncing tag:', tagName, err);
      }
    }
  }
}
