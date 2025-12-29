import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Media } from '../src/models/Media.model.js';

// Load environment variables
dotenv.config({ path: '../.env' });

const sampleMedia = [
  {
    title: "Understanding Anxiety: A Beginner's Guide",
    description: "Learn about anxiety disorders, their symptoms, and effective coping strategies in this comprehensive video guide.",
    type: "video",
    fileUrl: "https://example.com/videos/anxiety-guide.mp4",
    thumbnailUrl: "https://example.com/thumbnails/anxiety-guide.jpg",
    tags: ["anxiety", "mental health", "coping strategies", "beginner"],
    duration: 1200, // 20 minutes
    fileSize: 150000000, // 150MB
    mimeType: "video/mp4",
    isPublished: true,
    publishedAt: new Date(),
    views: 245,
    shares: 12
  },
  {
    title: "Mindfulness Meditation for Stress Relief",
    description: "A guided meditation session to help reduce stress and promote relaxation through mindfulness techniques.",
    type: "audio",
    fileUrl: "https://example.com/audio/mindfulness-meditation.mp3",
    thumbnailUrl: "https://example.com/thumbnails/meditation.jpg",
    tags: ["meditation", "mindfulness", "stress relief", "relaxation"],
    duration: 900, // 15 minutes
    fileSize: 25000000, // 25MB
    mimeType: "audio/mp3",
    isPublished: true,
    publishedAt: new Date(),
    views: 189,
    shares: 8
  },
  {
    title: "Building Healthy Relationships",
    description: "Explore the foundations of healthy relationships and learn communication skills that strengthen bonds with others.",
    type: "vlog",
    fileUrl: "https://example.com/vlogs/healthy-relationships.mp4",
    thumbnailUrl: "https://example.com/thumbnails/relationships.jpg",
    tags: ["relationships", "communication", "social skills", "wellness"],
    duration: 1800, // 30 minutes
    fileSize: 200000000, // 200MB
    mimeType: "video/mp4",
    isPublished: true,
    publishedAt: new Date(),
    views: 156,
    shares: 15
  },
  {
    title: "Cognitive Behavioral Therapy Basics",
    description: "An introduction to CBT principles and how they can help in managing negative thought patterns and behaviors.",
    type: "document",
    fileUrl: "https://example.com/documents/cbt-basics.pdf",
    thumbnailUrl: "https://example.com/thumbnails/cbt-document.jpg",
    tags: ["CBT", "therapy", "cognitive behavioral", "mental health"],
    fileSize: 5000000, // 5MB
    mimeType: "application/pdf",
    isPublished: true,
    publishedAt: new Date(),
    views: 98,
    shares: 6
  },
  {
    title: "Self-Care Practices for Daily Life",
    description: "Discover simple yet effective self-care practices that you can incorporate into your daily routine for better mental health.",
    type: "post",
    fileUrl: "https://example.com/posts/self-care-practices",
    thumbnailUrl: "https://example.com/thumbnails/self-care.jpg",
    tags: ["self-care", "daily routine", "wellness", "mental health"],
    isPublished: true,
    publishedAt: new Date(),
    views: 312,
    shares: 22
  }
];

async function seedMedia() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mindsettler');
    console.log('✅ Connected to MongoDB');

    // Clear existing media (optional)
    await Media.deleteMany({});
    console.log('🗑️ Cleared existing media');

    // Create a dummy user ID (you might need to adjust this based on your Auth model)
    const dummyUserId = new mongoose.Types.ObjectId();

    // Add createdBy field to all media
    const mediaWithCreator = sampleMedia.map(media => ({
      ...media,
      createdBy: dummyUserId
    }));

    // Insert sample media
    const insertedMedia = await Media.insertMany(mediaWithCreator);
    console.log(`✅ Inserted ${insertedMedia.length} media items`);

    // Display the inserted media
    insertedMedia.forEach((media, index) => {
      console.log(`${index + 1}. ${media.title} (${media.type}) - ${media.views} views`);
    });

    console.log('🎉 Media seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding media:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
}

// Run the seeding
seedMedia();