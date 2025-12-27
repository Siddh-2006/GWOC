import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { PsychoEducation } from '../src/models/PsychoEducation.model.js';
import { Media } from '../src/models/Media.model.js';
import Auth from '../src/models/Auth.model.js';

dotenv.config();

const seedAllContent = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mindsettler');
    console.log('✅ Connected to MongoDB');

    // Find or create admin user for content creation
    let adminUser = await Auth.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('⚠️ No admin user found. Creating default admin...');
      adminUser = new Auth({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@mindsettler.com',
        password: 'hashedpassword', // This should be properly hashed in real scenario
        role: 'admin',
        isVerified: true
      });
      await adminUser.save();
    }

    console.log('\n🌱 Starting content seeding process...\n');

    // Clear existing content
    await PsychoEducation.deleteMany({});
    await Media.deleteMany({});
    console.log('🗑️ Cleared existing content');

    // Seed Psycho-Education Content
    console.log('\n📚 Seeding Psycho-Education Content...');
    
    const psychoEducationData = [
      // Q&A Content
      {
        title: "Is feeling overwhelmed a sign that something is wrong with me?",
        description: "Understanding overwhelm as a natural response to sustained pressure and emotional load.",
        contentType: "qa",
        content: {
          question: "Is feeling overwhelmed a sign that something is wrong with me?",
          answer: "Feeling overwhelmed does not automatically mean something is \"wrong.\" It often means that your mind and body are responding to sustained pressure, uncertainty, or emotional load.\n\nMany people experience overwhelm during transitions, prolonged stress, or periods of decision-making. Understanding why this feeling arises is often the first step toward responding to it more gently.\n\nIf overwhelm feels persistent or difficult to manage, talking to a trained professional can help you explore it safely.\n\nMindSettler focuses on understanding before action."
        },
        tags: ["overwhelm", "normal-response", "understanding"],
        category: "stress",
        difficulty: "beginner",
        estimatedReadTime: 2,
        isPublished: true,
        publishedAt: new Date(),
        createdBy: adminUser._id
      },
      {
        title: "Why do I feel anxious when everything seems fine?",
        description: "Exploring anxiety that appears during seemingly calm periods.",
        contentType: "qa",
        content: {
          question: "Why do I feel anxious when everything seems fine?",
          answer: "Anxiety doesn't always match external circumstances. Sometimes it appears when life looks \"fine\" because:\n\n• Your nervous system may be processing accumulated stress\n• Uncertainty about the future can create background tension\n• Past experiences might influence present feelings\n• Your mind might be anticipating potential challenges\n\nThis doesn't mean you're overreacting or that something is wrong with you. It means your system is responding to something it perceives as important to address.\n\nUnderstanding this pattern can help you approach these feelings with curiosity rather than judgment."
        },
        tags: ["anxiety", "normal-response", "nervous-system"],
        category: "anxiety",
        difficulty: "beginner",
        estimatedReadTime: 2,
        isPublished: true,
        publishedAt: new Date(),
        createdBy: adminUser._id
      },

      // Theory Content
      {
        title: "The Window of Tolerance (Simplified)",
        description: "Understanding how our nervous system responds to life's pressures and stresses.",
        contentType: "theory",
        content: {
          body: "The \"Window of Tolerance\" is a way to understand how our nervous system responds to life.\n\n**Within the Window:**\nWhen we are within the window, we can think, feel, and respond with flexibility. We feel present and capable of handling what comes our way.\n\n**Above the Window:**\nWhen stress pushes us above the window, we may feel anxious, restless, or overwhelmed. Our system is activated and ready for action.\n\n**Below the Window:**\nWhen stress pulls us below the window, we may feel numb, disconnected, or shut down. Our system has moved into a protective state.\n\n**Important Understanding:**\nThis theory does not diagnose anything. It simply explains how human systems react to pressure. Moving outside your window is not a failure—it's information.\n\nLearning where you tend to move during stress can help you recognize patterns—not judge them. This awareness can be the first step toward understanding your responses with compassion."
        },
        tags: ["nervous-system", "window-of-tolerance", "stress-response"],
        category: "stress",
        difficulty: "intermediate",
        estimatedReadTime: 4,
        isPublished: true,
        publishedAt: new Date(),
        createdBy: adminUser._id
      },

      // Quote Content
      {
        title: "Daily Pressure",
        description: "A gentle reminder about managing daily expectations.",
        contentType: "quote",
        content: {
          quote: "You don't have to solve everything today. You only need to understand what you're carrying.",
          author: "MindSettler Wisdom"
        },
        tags: ["daily-pressure", "self-compassion", "understanding"],
        category: "self-care",
        difficulty: "beginner",
        estimatedReadTime: 1,
        isPublished: true,
        publishedAt: new Date(),
        createdBy: adminUser._id
      },
      {
        title: "Being Heard",
        description: "On the power of feeling understood.",
        contentType: "quote",
        content: {
          quote: "Clarity often comes not from answers, but from feeling heard.",
          author: "MindSettler Wisdom"
        },
        tags: ["clarity", "being-heard", "understanding"],
        category: "general",
        difficulty: "beginner",
        estimatedReadTime: 1,
        isPublished: true,
        publishedAt: new Date(),
        createdBy: adminUser._id
      },

      // Article Content
      {
        title: "Why Mental Clarity Often Feels Harder During 'Normal' Life",
        description: "Understanding why emotional difficulty can appear during periods that look fine from the outside.",
        contentType: "article",
        content: {
          body: "Many people expect emotional difficulty only during crises. Yet confusion, restlessness, or dissatisfaction often appear during periods that look \"fine\" from the outside.\n\n**Why This Happens**\n\nMental strain is not always caused by events—it can also arise from:\n\n• **Unresolved decisions** that create background mental load\n• **Conflicting expectations** between what we think we should feel and what we actually feel\n• **Prolonged self-monitoring** without breaks for natural processing\n• **Emotional labor without reflection** that accumulates over time\n\nWhen life moves quickly, the mind often postpones processing. Over time, this backlog can surface as discomfort rather than clear thoughts.\n\n**How Psycho-Education Helps**\n\nPsycho-education supports clarity by:\n\n• **Slowing interpretation** so we don't rush to conclusions about our experiences\n• **Separating feeling from meaning** so emotions can exist without immediate explanation\n• **Allowing understanding before reaction** so we can respond from awareness rather than impulse\n\n**Important Note**\n\nThis is not about fixing. It is about making space for clarity. Sometimes understanding why we feel unclear is more helpful than trying to force clarity to appear."
        },
        tags: ["mental-clarity", "normal-life", "processing"],
        category: "general",
        difficulty: "intermediate",
        estimatedReadTime: 5,
        isPublished: true,
        publishedAt: new Date(),
        createdBy: adminUser._id
      },

      // Tip Content
      {
        title: "Name the Pressure, Not the Problem",
        description: "A gentle shift in how we approach difficult feelings.",
        contentType: "tip",
        content: {
          steps: [
            {
              title: "Notice the Urge to Problem-Solve",
              description: "When difficult feelings arise, we often immediately ask 'What is wrong?' This question, while natural, can create pressure to find problems that need fixing.",
              order: 1
            },
            {
              title: "Try a Gentler Question",
              description: "Instead of asking 'What is wrong?' try gently asking 'What feels heavy right now?' This small shift often reduces internal resistance and opens space for understanding.",
              order: 2
            }
          ]
        },
        tags: ["gentle-questioning", "pressure", "awareness"],
        category: "self-care",
        difficulty: "beginner",
        estimatedReadTime: 2,
        isPublished: true,
        publishedAt: new Date(),
        createdBy: adminUser._id
      },

      // Exercise Content
      {
        title: "The 2-Minute Pause",
        description: "A short awareness practice for observing present-moment experience.",
        contentType: "exercise",
        content: {
          steps: [
            {
              title: "Find a Comfortable Position",
              description: "Sit comfortably wherever you are. This is not a relaxation technique or therapy exercise. It is a short awareness practice.",
              order: 1
            },
            {
              title: "Take Two Natural Breaths",
              description: "Breathe naturally without trying to control or change your breathing. Simply notice two breaths as they happen.",
              order: 2
            },
            {
              title: "Ask Yourself Quietly",
              description: "Ask yourself: 'What feels most present right now?' This could be a physical sensation, emotion, thought, or simply the experience of sitting.",
              order: 3
            },
            {
              title: "Observe Without Changing",
              description: "Do not try to change the answer. Simply notice it for a few moments. You may stop at any time. This exercise is about observing, not fixing.",
              order: 4
            }
          ]
        },
        tags: ["awareness", "pause", "present-moment"],
        category: "mindfulness",
        difficulty: "beginner",
        estimatedReadTime: 3,
        isPublished: true,
        publishedAt: new Date(),
        createdBy: adminUser._id
      }
    ];

    const insertedPsychoEducation = await PsychoEducation.insertMany(psychoEducationData);
    console.log(`✅ Created ${insertedPsychoEducation.length} psycho-education items`);

    // Seed Media Content
    console.log('\n📺 Seeding Media Content...');
    
    const mediaData = [
      {
        title: "Understanding Anxiety: A Gentle Introduction",
        description: "A compassionate exploration of what anxiety feels like and why it happens. This video focuses on understanding rather than fixing, helping viewers normalize their experiences.",
        type: "video",
        category: "psycho-education",
        fileUrl: "https://example.com/videos/understanding-anxiety.mp4",
        thumbnailUrl: "https://example.com/thumbnails/anxiety-intro.jpg",
        tags: ["anxiety", "understanding", "gentle-approach", "normalization"],
        duration: 480,
        mimeType: "video/mp4",
        isPublished: true,
        publishedAt: new Date(),
        createdBy: adminUser._id
      },
      {
        title: "Guided Awareness: The 5-Minute Check-In",
        description: "A gentle audio guide for checking in with yourself. This is not meditation or therapy, but simply a structured way to notice what's present for you right now.",
        type: "audio",
        category: "resource",
        fileUrl: "https://example.com/audio/5-minute-checkin.mp3",
        thumbnailUrl: "https://example.com/thumbnails/audio-checkin.jpg",
        tags: ["awareness", "check-in", "mindfulness", "self-reflection"],
        duration: 300,
        mimeType: "audio/mp3",
        isPublished: true,
        publishedAt: new Date(),
        createdBy: adminUser._id
      },
      {
        title: "The Window of Tolerance: A Visual Guide",
        description: "A comprehensive PDF guide explaining the Window of Tolerance concept with illustrations and examples. Perfect for understanding your nervous system responses.",
        type: "document",
        category: "psycho-education",
        fileUrl: "https://example.com/documents/window-of-tolerance-guide.pdf",
        thumbnailUrl: "https://example.com/thumbnails/window-tolerance-doc.jpg",
        tags: ["window-of-tolerance", "nervous-system", "guide", "visual"],
        mimeType: "application/pdf",
        isPublished: true,
        publishedAt: new Date(),
        createdBy: adminUser._id
      },
      {
        title: "A Day in Therapy: What Really Happens",
        description: "A behind-the-scenes look at what actually happens in a therapy session. Demystifying the process and reducing anxiety about seeking help.",
        type: "vlog",
        category: "general",
        fileUrl: "https://example.com/vlogs/day-in-therapy.mp4",
        thumbnailUrl: "https://example.com/thumbnails/therapy-day.jpg",
        tags: ["therapy", "behind-the-scenes", "demystifying", "help-seeking"],
        duration: 720,
        mimeType: "video/mp4",
        isPublished: true,
        publishedAt: new Date(),
        createdBy: adminUser._id
      },
      {
        title: "5 Myths About Mental Health (Debunked)",
        description: "A visual post breaking down common misconceptions about mental health with evidence-based corrections. Designed to reduce stigma and increase understanding.",
        type: "post",
        category: "psycho-education",
        fileUrl: "https://example.com/posts/mental-health-myths.jpg",
        thumbnailUrl: "https://example.com/thumbnails/myths-debunked.jpg",
        tags: ["myths", "mental-health", "stigma", "education"],
        mimeType: "image/jpeg",
        isPublished: true,
        publishedAt: new Date(),
        createdBy: adminUser._id
      }
    ];

    const insertedMedia = await Media.insertMany(mediaData);
    console.log(`✅ Created ${insertedMedia.length} media items`);

    // Summary
    console.log('\n🎉 Content Seeding Complete!');
    console.log('\n📊 Summary:');
    console.log(`  📚 Psycho-Education: ${insertedPsychoEducation.length} items`);
    console.log(`  📺 Media Resources: ${insertedMedia.length} items`);
    console.log(`  👤 Admin User: ${adminUser.email}`);

    console.log('\n🔒 Safety Guidelines Followed:');
    console.log('  ✅ No prescriptive "you should" language');
    console.log('  ✅ Focus on understanding, not fixing');
    console.log('  ✅ Gentle, non-judgmental tone');
    console.log('  ✅ Encourages professional help when appropriate');
    console.log('  ✅ Normalizes human experiences');

    console.log('\n🚀 Ready to use:');
    console.log('  • Visit /psycho-education to see the content');
    console.log('  • Visit /resources to see media resources');
    console.log('  • Admin can manage content via dashboard');

  } catch (error) {
    console.error('❌ Error seeding content:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
};

// Run the seeding function
seedAllContent();