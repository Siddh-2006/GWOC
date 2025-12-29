import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Media } from '../src/models/Media.model.js';

dotenv.config({ path: '.env' });

const fixPostThumbnails = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    // Find all posts that don't have thumbnailUrl but have assets
    const postsToFix = await Media.find({
      type: 'post',
      $or: [
        { thumbnailUrl: { $exists: false } },
        { thumbnailUrl: null },
        { thumbnailUrl: '' }
      ],
      assets: { $exists: true, $ne: [] }
    });

    console.log(`🔍 Found ${postsToFix.length} posts that need thumbnail fixes`);

    for (const post of postsToFix) {
      if (post.assets && post.assets.length > 0) {
        const firstAsset = post.assets[0];
        
        await Media.updateOne(
          { _id: post._id },
          {
            $set: {
              thumbnailUrl: firstAsset.fileUrl,
              fileUrl: firstAsset.fileUrl,
              mimeType: firstAsset.mimeType || 'image/jpeg'
            }
          }
        );
        
        console.log(`✅ Fixed thumbnail for post: ${post.title}`);
      }
    }

    // Also check for posts with broken image URLs
    const allPosts = await Media.find({ type: 'post' });
    console.log(`\n📊 Post thumbnail status:`);
    
    for (const post of allPosts) {
      const hasValidThumbnail = post.thumbnailUrl && post.thumbnailUrl.startsWith('http');
      console.log(`- ${post.title}: ${hasValidThumbnail ? '✅ Valid' : '❌ Missing'} thumbnail`);
    }

    console.log(`\n🎉 Thumbnail fix completed!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing thumbnails:', error);
    process.exit(1);
  }
};

fixPostThumbnails();