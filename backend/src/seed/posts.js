import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Media } from '../models/Media.model.js';

dotenv.config();

const ADMIN_USER_ID = '69501793c7e7686984f43d27';

const posts = [
  {
  title: 'Understanding Intellectual Disability',
  description:
    "Intellectual disability affects the acquisition of knowledge and skills, particularly in neurodevelopmental conditions that influence intellectual processes, educational attainment, and the abilities needed for independent living and social functioning. It impacts a child’s developmental period and may be reflected in challenges with learning new concepts, developing social skills, and applying what they learn in everyday situations.",
  
  tags: [
    'intellectual-disability',
    'neurodevelopmental-disorders',
    'child-development',
    'learning-difficulties',
    'social-skills',
    'psychoeducation',
    'mental-health'
  ],

  assets: [
    {
      fileUrl:
        'https://res.cloudinary.com/dvsn6k8zm/image/upload/v1766988385/Screenshot_2025-12-29_113507_vt0fm1.png',
      assetType: 'image',
      mimeType: 'image/jpeg'
    },
    {
      fileUrl:
        'https://res.cloudinary.com/dvsn6k8zm/image/upload/v1766988422/Screenshot_2025-12-29_113516_gcuqv3.png',
      assetType: 'image',
      mimeType: 'image/jpeg'
    },
    {
      fileUrl:
        'https://res.cloudinary.com/dvsn6k8zm/image/upload/v1766988429/Screenshot_2025-12-29_113526_jpu27s.png',
      assetType: 'image',
      mimeType: 'image/jpeg'
    },
    {
      fileUrl:
        'https://res.cloudinary.com/dvsn6k8zm/image/upload/v1766988422/Screenshot_2025-12-29_113534_pagxig.png',
      assetType: 'image',
      mimeType: 'image/jpeg'
    },
    {
      fileUrl:
        'https://res.cloudinary.com/dvsn6k8zm/image/upload/v1766988412/Screenshot_2025-12-29_113541_sa2n4z.png',
      assetType: 'image',
      mimeType: 'image/jpeg'
    },
    {
      fileUrl:
        'https://res.cloudinary.com/dvsn6k8zm/image/upload/v1766988402/Screenshot_2025-12-29_113551_m5k6li.png',
      assetType: 'image',
      mimeType: 'image/jpeg'
    }
  ]
}
,
{
  title: 'Understanding Communication Disorders',
  description:
    'A communication disorder is characterised by a deficit in the ability to receive, send, process, and grasp concepts or nonverbal, spoken, and visual symbol systems. Hearing, language, as well as speech processes may be affected by a communication impairment. The severity of a communication issue can range from minor to severe.',
  
  tags: [
    'communication-disorder',
    'speech',
    'language',
    'hearing',
    'mental-health',
    'psychoeducation'
  ],

  assets: [
    {
      fileUrl:
        'https://res.cloudinary.com/dvsn6k8zm/image/upload/v1767005540/Screenshot_2025-12-29_161939_pzaig3.png',
      assetType: 'image',
      mimeType: 'image/jpeg'
    },
    {
      fileUrl:
        'https://res.cloudinary.com/dvsn6k8zm/image/upload/v1767005543/Screenshot_2025-12-29_161952_sy35im.png',
      assetType: 'image',
      mimeType: 'image/jpeg'
    },
    {
      fileUrl:
        'https://res.cloudinary.com/dvsn6k8zm/image/upload/v1767005543/Screenshot_2025-12-29_162024_o6xuxs.png',
      assetType: 'image',
      mimeType: 'image/jpeg'
    },
    {
      fileUrl:
        'https://res.cloudinary.com/dvsn6k8zm/image/upload/v1767005542/Screenshot_2025-12-29_162006_jj0e0d.png',
      assetType: 'image',
      mimeType: 'image/jpeg'
    },
    {
      fileUrl:
        'https://res.cloudinary.com/dvsn6k8zm/image/upload/v1767005542/Screenshot_2025-12-29_162042_ypiuns.png',
      assetType: 'image',
      mimeType: 'image/jpeg'
    },
    {
      fileUrl:
        'https://res.cloudinary.com/dvsn6k8zm/image/upload/v1767005540/Screenshot_2025-12-29_162053_p5fdlv.png',
      assetType: 'image',
      mimeType: 'image/jpeg'
    }
  ]
},
{
  title: 'Understanding Neurodevelopmental Disorders',
  description:
    'Neurodevelopmental disorders are disabilities associated primarily with the neurological system and brain functioning. Their causes can include severe social deprivation, genetic risk, metabolic and immune-related conditions, infectious diseases, nutritional factors, physical trauma, as well as toxic and environmental influences. These conditions often emerge early in development and vary widely in their impact and severity.',
  
  tags: [
    'neurodevelopmental-disorders',
    'brain-health',
    'neurology',
    'developmental-health',
    'mental-health',
    'psychoeducation'
  ],

  assets: [
    {
      fileUrl:
        'https://res.cloudinary.com/dvsn6k8zm/image/upload/v1766987471/Screenshot_2025-12-29_112007_foebed.png',
      assetType: 'image',
      mimeType: 'image/jpeg'
    },
    {
      fileUrl:
        'https://res.cloudinary.com/dvsn6k8zm/image/upload/v1766987485/Screenshot_2025-12-29_111946_jgdmkl.png',
      assetType: 'image',
      mimeType: 'image/jpeg'
    },
    {
      fileUrl:
        'https://res.cloudinary.com/dvsn6k8zm/image/upload/v1766987484/Screenshot_2025-12-29_111931_ichtsj.png',
      assetType: 'image',
      mimeType: 'image/jpeg'
    },
    {
      fileUrl:
        'https://res.cloudinary.com/dvsn6k8zm/image/upload/v1766987483/Screenshot_2025-12-29_111956_saaej4.png',
      assetType: 'image',
      mimeType: 'image/jpeg'
    }
  ]
},{
  title: 'What Is DSM-5?',
  description:
    'DSM-5 is a manual published by the American Psychiatric Association that provides standardized diagnostic criteria for mental disorders. It aims to offer a practical, functional, and flexible guide to help clinicians organize clinical information for accurate diagnosis. Although primarily designed for clinical use, DSM-5 is widely used by researchers across disciplines and serves as a valuable reference for psychiatrists, physicians, psychologists, social workers, nurses, counsellors, forensic and legal professionals, occupational and rehabilitation therapists, and other health professionals.',
  
  tags: [
    'DSM-5',
    'diagnosis',
    'mental-health',
    'psychiatry',
    'psychology',
    'clinical-practice',
    'psychoeducation'
  ],

  assets: [
    {
      fileUrl:
        'https://res.cloudinary.com/dvsn6k8zm/image/upload/v1766987065/Screenshot_2025-12-29_111335_lcbsck.png',
      assetType: 'image',
      mimeType: 'image/jpeg'
    },
    {
      fileUrl:
        'https://res.cloudinary.com/dvsn6k8zm/image/upload/v1766987222/Screenshot_2025-12-29_111450_h4ego4.png',
      assetType: 'image',
      mimeType: 'image/jpeg'
    },
    {
      fileUrl:
        'https://res.cloudinary.com/dvsn6k8zm/image/upload/v1766987219/Screenshot_2025-12-29_111516_alb6ks.png',
      assetType: 'image',
      mimeType: 'image/jpeg'
    },
    {
      fileUrl:
        'https://res.cloudinary.com/dvsn6k8zm/image/upload/v1766987226/Screenshot_2025-12-29_111532_sei4tp.png',
      assetType: 'image',
      mimeType: 'image/jpeg'
    },
    {
      fileUrl:
        'https://res.cloudinary.com/dvsn6k8zm/image/upload/v1766987204/Screenshot_2025-12-29_111545_zp5uqz.png',
      assetType: 'image',
      mimeType: 'image/jpeg'
    }
  ]
}



];

const seedMultiplePosts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // OPTIONAL: Uncomment if you want to remove old seeded posts
    // await Media.deleteMany({ type: 'post' });

    const formattedPosts = posts.map(post => ({
      ...post,
      type: 'post',
      isPublished: true,
      publishedAt: new Date(),
      createdBy: ADMIN_USER_ID,
      // Use the first asset as the main image
      fileUrl: post.assets && post.assets.length > 0 ? post.assets[0].fileUrl : null,
      thumbnailUrl: post.assets && post.assets.length > 0 ? post.assets[0].fileUrl : null,
      mimeType: post.assets && post.assets.length > 0 ? post.assets[0].mimeType : 'image/jpeg'
    }));

    await Media.insertMany(formattedPosts);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedMultiplePosts();
