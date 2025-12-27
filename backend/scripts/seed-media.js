import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Media } from '../src/models/Media.model.js';
import Auth from '../src/models/Auth.model.js';

dotenv.config();

const seedMediaContent = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mindsettler');

    // Find or create admin user for content creation
    let adminUser = await Auth.findOne({ role: 'admin' });
    if (!adminUser) {
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

    // Clear existing media content (optional)
    await Media.deleteMany({});

    const mediaData = [
      // Video Content
      {
        title: "Understanding Anxiety: A Gentle Introduction",
        description: "A compassionate exploration of what anxiety feels like and why it happens. This video focuses on understanding rather than fixing, helping viewers normalize their experiences.",
        type: "video",
        category: "psycho-education",
        fileUrl: "https://example.com/videos/understanding-anxiety.mp4",
        thumbnailUrl: "https://example.com/thumbnails/anxiety-intro.jpg",
        tags: ["anxiety", "understanding", "gentle-approach", "normalization"],
        duration: 480, // 8 minutes
        mimeType: "video/mp4",
        isPublished: true,
        publishedAt: new Date(),
        createdBy: adminUser._id
      },
      {
        title: "The Science of Overwhelm",
        description: "Learn about what happens in your brain and body when you feel overwhelmed. This educational video explains the biological basis of overwhelm without pathologizing the experience.",
        type: "video",
        category: "psycho-education",
        fileUrl: "https://example.com/videos/science-of-overwhelm.mp4",
        thumbnailUrl: "https://example.com/thumbnails/overwhelm-science.jpg",
        tags: ["overwhelm", "neuroscience", "biology", "education"],
        duration: 600, // 10 minutes
        mimeType: "video/mp4",
        isPublished: true,
        publishedAt: new Date(),
        createdBy: adminUser._id
      },

      // Audio Content
      {
        title: "Guided Awareness: The 5-Minute Check-In",
        description: "A gentle audio guide for checking in with yourself. This is not meditation or therapy, but simply a structured way to notice what's present for you right now.",
        type: "audio",
        category: "resource",
        fileUrl: "https://example.com/audio/5-minute-checkin.mp3",
        thumbnailUrl: "https://example.com/thumbnails/audio-checkin.jpg",
        tags: ["awareness", "check-in", "mindfulness", "self-reflection"],
        duration: 300, // 5 minutes
        mimeType: "audio/mp3",
        isPublished: true,
        publishedAt: new Date(),
        createdBy: adminUser._id
      },
      {
        title: "Understanding Emotional Waves",
        description: "An audio explanation of how emotions naturally rise and fall, helping listeners understand the temporary nature of intense feelings.",
        type: "audio",
        category: "psycho-education",
        fileUrl: "https://example.com/audio/emotional-waves.mp3",
        thumbnailUrl: "https://example.com/thumbnails/emotional-waves.jpg",
        tags: ["emotions", "waves", "temporary", "understanding"],
        duration: 420, // 7 minutes
        mimeType: "audio/mp3",
        isPublished: true,
        publishedAt: new Date(),
        createdBy: adminUser._id
      },

      // Document/Article Content
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
        title: "Self-Compassion Practices Workbook",
        description: "A downloadable workbook with gentle exercises for developing self-compassion. Includes reflection prompts and awareness practices.",
        type: "document",
        category: "resource",
        fileUrl: "https://example.com/documents/self-compassion-workbook.pdf",
        thumbnailUrl: "https://example.com/thumbnails/self-compassion-workbook.jpg",
        tags: ["self-compassion", "workbook", "exercises", "reflection"],
        mimeType: "application/pdf",
        isPublished: true,
        publishedAt: new Date(),
        createdBy: adminUser._id
      },

      // Vlog Content
      {
        title: "A Day in Therapy: What Really Happens",
        description: "A behind-the-scenes look at what actually happens in a therapy session. Demystifying the process and reducing anxiety about seeking help.",
        type: "vlog",
        category: "general",
        fileUrl: "https://example.com/vlogs/day-in-therapy.mp4",
        thumbnailUrl: "https://example.com/thumbnails/therapy-day.jpg",
        tags: ["therapy", "behind-the-scenes", "demystifying", "help-seeking"],
        duration: 720, // 12 minutes
        mimeType: "video/mp4",
        isPublished: true,
        publishedAt: new Date(),
        createdBy: adminUser._id
      },
      {
        title: "Therapist Thoughts: On Normalizing Struggle",
        description: "Personal reflections from a therapist about the universality of human struggle and why seeking help is a sign of wisdom, not weakness.",
        type: "vlog",
        category: "general",
        fileUrl: "https://example.com/vlogs/normalizing-struggle.mp4",
        thumbnailUrl: "https://example.com/thumbnails/normalizing-struggle.jpg",
        tags: ["struggle", "normalization", "therapist-perspective", "wisdom"],
        duration: 540, // 9 minutes
        mimeType: "video/mp4",
        isPublished: true,
        publishedAt: new Date(),
        createdBy: adminUser._id
      },

      // Post Content
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
      },
      {
        title: "The Therapy Process: A Visual Journey",
        description: "An infographic showing the typical journey through therapy, from first session to ongoing work. Helps set realistic expectations.",
        type: "post",
        category: "resource",
        fileUrl: "https://example.com/posts/therapy-journey.jpg",
        thumbnailUrl: "https://example.com/thumbnails/therapy-journey.jpg",
        tags: ["therapy-process", "journey", "expectations", "infographic"],
        mimeType: "image/jpeg",
        isPublished: true,
        publishedAt: new Date(),
        createdBy: adminUser._id
      },

      // Image Resources
      {
        title: "Breathing Space: Visual Reminder Cards",
        description: "A collection of beautiful reminder cards about taking breathing space during difficult moments. Perfect for saving to your phone or printing.",
        type: "image",
        category: "resource",
        fileUrl: "https://example.com/images/breathing-space-cards.jpg",
        thumbnailUrl: "https://example.com/thumbnails/breathing-cards.jpg",
        tags: ["breathing", "reminders", "visual", "self-care"],
        mimeType: "image/jpeg",
        isPublished: true,
        publishedAt: new Date(),
        createdBy: adminUser._id
      },
      {
        title: "Emotional Weather Chart",
        description: "A visual chart helping you identify and name your emotional weather. A gentle tool for increasing emotional awareness.",
        type: "image",
        category: "resource",
        fileUrl: "https://example.com/images/emotional-weather-chart.jpg",
        thumbnailUrl: "https://example.com/thumbnails/weather-chart.jpg",
        tags: ["emotions", "weather", "awareness", "chart"],
        mimeType: "image/jpeg",
        isPublished: true,
        publishedAt: new Date(),
        createdBy: adminUser._id
      },

      // Additional Educational Videos
      {
        title: "Why Therapy Isn't Just for Crisis",
        description: "Exploring the preventive and growth aspects of therapy. Understanding therapy as a tool for understanding yourself, not just fixing problems.",
        type: "video",
        category: "psycho-education",
        fileUrl: "https://example.com/videos/therapy-not-crisis.mp4",
        thumbnailUrl: "https://example.com/thumbnails/therapy-growth.jpg",
        tags: ["therapy", "prevention", "growth", "understanding"],
        duration: 360, // 6 minutes
        mimeType: "video/mp4",
        isPublished: true,
        publishedAt: new Date(),
        createdBy: adminUser._id
      },
      {
        title: "The Nervous System and Daily Life",
        description: "How your nervous system responds to everyday stressors and why understanding this can help you be more compassionate with yourself.",
        type: "video",
        category: "psycho-education",
        fileUrl: "https://example.com/videos/nervous-system-daily.mp4",
        thumbnailUrl: "https://example.com/thumbnails/nervous-system.jpg",
        tags: ["nervous-system", "daily-life", "stress", "compassion"],
        duration: 450, // 7.5 minutes
        mimeType: "video/mp4",
        isPublished: true,
        publishedAt: new Date(),
        createdBy: adminUser._id
      }
    ];

    // Insert all media content
    const insertedMedia = await Media.insertMany(mediaData);

    // Display summary by type
    const mediaByType = {};
    insertedMedia.forEach(item => {
      mediaByType[item.type] = (mediaByType[item.type] || 0) + 1;
    });

  } catch (error) {
    // Error seeding media content
  } finally {
    await mongoose.disconnect();
  }
};

// Run the seeding function
seedMediaContent();