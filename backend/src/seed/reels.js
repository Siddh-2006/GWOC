import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Media } from '../models/Media.model.js';
import connectDB from '../config/db.js';

dotenv.config();

const seedMedia = async () => {
  try {
    await connectDB();

    // Seeding media (non-destructive)

    const ADMIN_USER_ID = '69501793c7e7686984f43d27';

    const mediaData = [
      {
        title: 'Stages of Grief - Denial',
        description: 'Denial is the first stage of grief. It helps us minimise the overwhelming pain of loss.',
        type: 'video',
        category: 'mental-health',
        fileUrl: 'https://res.cloudinary.com/dvsn6k8zm/video/upload/v1766989244/Screen_Recording_2025-12-29_114903_tomyxw.mp4',
        thumbnailUrl: 'https://res.cloudinary.com/dvsn6k8zm/image/upload/v1766992040/Screenshot_2025-12-29_123519_ziec9u.png',
        tags: ['grief', 'stages', 'denial'],
        duration: 180,
        fileSize: 5242880,
        mimeType: 'video/mp4',
        isPublished: true,
        publishedAt: new Date(),
        createdBy: ADMIN_USER_ID
      },
    {
        title: 'Stages of Grief - Anger',
        description: 'Anger is a natural response to the pain of loss. It often shows up as frustration, irritability, or blame, helping us release emotions that feel too heavy to hold inside.',
        type: 'video',
        category: 'mental-health',
        fileUrl: 'https://res.cloudinary.com/dvsn6k8zm/video/upload/v1766989479/Screen_Recording_2025-12-29_115311_oartso.mp4',
        thumbnailUrl: 'https://res.cloudinary.com/dvsn6k8zm/image/upload/v1766992040/Screenshot_2025-12-29_123550_ufmik2.png',
        tags: ['grief', 'stages', 'anger'],
        duration: 180,
        fileSize: 5242880,
        mimeType: 'video/mp4',
        isPublished: true,
        publishedAt: new Date(),
        createdBy: ADMIN_USER_ID
    },
    {
        title: 'Stages of Grief - Bargaining',
        description: 'Bargaining is the stage where we replay “what if” and “if only” thoughts. It reflects our desire to regain control and make sense of the loss by imagining different outcomes.',
        type: 'video',
        category: 'mental-health',
        fileUrl: 'https://res.cloudinary.com/dvsn6k8zm/video/upload/v1766989837/Screen_Recording_2025-12-29_115725_qfug6y.mp4',
        thumbnailUrl: 'https://res.cloudinary.com/dvsn6k8zm/image/upload/v1766992040/Screenshot_2025-12-29_123605_eoxoxy.png',
        tags: ['grief', 'stages', 'bargaining'],
        duration: 180,
        fileSize: 5242880,
        mimeType: 'video/mp4',
        isPublished: true,
        publishedAt: new Date(),
        createdBy: ADMIN_USER_ID
    },
    {
        title: 'Stages of Grief - Depression',
        description: 'Depression in grief is not a sign of weakness. It is the stage where the reality of loss settles in, often bringing sadness, withdrawal, and a deep need for rest and compassion.',
        type: 'video',
        category: 'mental-health',
        fileUrl: 'https://res.cloudinary.com/dvsn6k8zm/video/upload/v1766990084/Screen_Recording_2025-12-29_120422_e7fren.mp4',
        thumbnailUrl: 'https://res.cloudinary.com/dvsn6k8zm/image/upload/v1766992039/Screenshot_2025-12-29_123623_vwko7x.png',
        tags: ['grief', 'stages', 'depression'],
        duration: 180,
        fileSize: 5242880,
        mimeType: 'video/mp4',
        isPublished: true,
        publishedAt: new Date(),
        createdBy: ADMIN_USER_ID
    },
    {
        title: 'Understanding Attachment',
        description: 'Attachment refers to the emotional bonds we form with others, especially early in life. These patterns influence how we connect, trust, and feel safe in relationships as adults.',
        type: 'video',
        category: 'mental-health',
        fileUrl: 'https://res.cloudinary.com/dvsn6k8zm/video/upload/v1766990437/Screen_Recording_2025-12-29_120956_h8wqpy.mp4',
        thumbnailUrl: 'https://res.cloudinary.com/dvsn6k8zm/image/upload/v1766992281/Screenshot_2025-12-29_124052_ex5ki6.png',
        tags: ['attachment', 'relationships', 'emotional-health'],
        duration: 180,
        fileSize: 5242880,
        mimeType: 'video/mp4',
        isPublished: true,
        publishedAt: new Date(),
        createdBy: ADMIN_USER_ID
    },
    {
        title: 'Social Learning Theory',
        description: 'Social learning theory explains that we learn behaviours, emotions, and social responses by observing others. Through imitation, observation, and seeing the consequences of actions, we gradually shape how we behave and interact with the world.',
        type: 'video',
        category: 'mental-health',
        fileUrl: 'https://res.cloudinary.com/dvsn6k8zm/image/upload/v1766994649/Screenshot_2025-12-29_132023_bdg0hc.png',
        thumbnailUrl: 'https://res.cloudinary.com/dvsn6k8zm/video/upload/v1766994605/Screen_Recording_2025-12-29_131808_iaonhd.mp4',
        tags: ['social-learning', 'behaviour', 'psychology', 'observational-learning'],
        duration: 180,
        fileSize: 5242880,
        mimeType: 'video/mp4',
        isPublished: true,
        publishedAt: new Date(),
        createdBy: ADMIN_USER_ID
},{
  title: 'Law of Attraction',
  description: 'The Law of Attraction suggests that our thoughts and beliefs can influence how we experience the world. By becoming more aware of our mindset and aligning intentions with actions, we may create greater focus, motivation, and openness to positive experiences.',
  type: 'video',
  category: 'mental-health',
  fileUrl: 'https://res.cloudinary.com/dvsn6k8zm/video/upload/v1766995130/Screen_Recording_2025-12-29_132627_a8m9sn.mp4',
  thumbnailUrl: 'https://res.cloudinary.com/dvsn6k8zm/image/upload/v1766995213/Screenshot_2025-12-29_132933_eullre.png',
  tags: ['law-of-attraction', 'mindset', 'beliefs', 'personal-growth'],
  duration: 180,
  fileSize: 5242880,
  mimeType: 'video/mp4',
  isPublished: true,
  publishedAt: new Date(),
  createdBy: ADMIN_USER_ID
},{
  title: 'Imposter Syndrome',
  description: 'Imposter syndrome is a common experience where people doubt their abilities and feel undeserving of their achievements, even when there is clear evidence of their competence. Recognising these patterns, practicing self-compassion, and gently reframing negative thoughts can help reduce its impact over time.',
  type: 'video',
  category: 'mental-health',
  fileUrl: 'https://res.cloudinary.com/dvsn6k8zm/video/upload/v1766995470/Screen_Recording_2025-12-29_133305_myndlx.mp4',
  thumbnailUrl: 'https://res.cloudinary.com/dvsn6k8zm/image/upload/v1766995531/Screenshot_2025-12-29_133509_hszkrb.png',
  tags: ['imposter-syndrome', 'self-doubt', 'mental-health', 'confidence'],
  duration: 180,
  fileSize: 5242880,
  mimeType: 'video/mp4',
  isPublished: true,
  publishedAt: new Date(),
  createdBy: ADMIN_USER_ID
}







    ];

    let inserted = 0;
    let skipped = 0;

    for (const item of mediaData) {
      const exists = await Media.findOne({ fileUrl: item.fileUrl });

      if (exists) {
        skipped++;
        continue;
      }

      await Media.create(item);
      inserted++;
    }

    console.log(`✅ Seed complete`);
    console.log(`➕ Inserted: ${inserted}`);
    console.log(`⏭️ Skipped (already exists): ${skipped}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Media seed failed:', error);
    process.exit(1);
  }
};

seedMedia();
