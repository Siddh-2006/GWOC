import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { PsychoEducation } from '../src/models/PsychoEducation.model.js';
import Auth from '../src/models/Auth.model.js';

dotenv.config();

const seedPsychoEducationContent = async () => {
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

    // Clear existing psycho-education content (optional)
    await PsychoEducation.deleteMany({});

    const psychoEducationData = [
      // 1️⃣ Q&A Content (Clarifying, not advising)
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
      {
        title: "Is it normal to feel disconnected from others sometimes?",
        description: "Understanding periods of social disconnection as part of human experience.",
        contentType: "qa",
        content: {
          question: "Is it normal to feel disconnected from others sometimes?",
          answer: "Feeling disconnected from others is a common human experience. It can happen during:\n\n• Times of personal change or growth\n• Periods of stress or emotional processing\n• When your needs or interests are shifting\n• After significant life events\n\nThis feeling doesn't mean you're broken or that your relationships are failing. Sometimes disconnection is your mind's way of creating space for internal processing.\n\nIf this feeling persists or causes distress, exploring it with someone trained in mental health can provide clarity and support."
        },
        tags: ["disconnection", "relationships", "normal-experience"],
        category: "relationships",
        difficulty: "beginner",
        estimatedReadTime: 2,
        isPublished: true,
        publishedAt: new Date(),
        createdBy: adminUser._id
      },

      // 2️⃣ Theory Content (Conceptual frameworks, simplified)
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
      {
        title: "Understanding Emotional Waves",
        description: "A framework for understanding how emotions naturally rise and fall.",
        contentType: "theory",
        content: {
          body: "Emotions are not permanent states—they are waves that naturally rise, peak, and fall.\n\n**The Rise:**\nEmotions often begin as subtle sensations or thoughts. They may build gradually or appear suddenly, depending on the trigger and your current state.\n\n**The Peak:**\nAt their strongest point, emotions can feel overwhelming or all-consuming. This is when they demand the most attention and can influence our thoughts and actions most strongly.\n\n**The Fall:**\nNaturally, emotions begin to decrease in intensity. This happens without effort when we allow the process to unfold.\n\n**Key Understanding:**\nResisting or fighting emotions often prolongs them. Accepting their temporary nature—without needing to fix or change them immediately—can allow the natural wave pattern to complete.\n\nThis framework helps normalize the intensity of emotional experiences and reminds us that \"this too shall pass\" is not just a saying—it's how emotions actually work."
        },
        tags: ["emotions", "emotional-waves", "acceptance"],
        category: "general",
        difficulty: "beginner",
        estimatedReadTime: 3,
        isPublished: true,
        publishedAt: new Date(),
        createdBy: adminUser._id
      },

      // 3️⃣ Quote Content (Emotional anchoring)
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
      {
        title: "The Power of Pausing",
        description: "Understanding rest as recalibration, not falling behind.",
        contentType: "quote",
        content: {
          quote: "Pausing is not falling behind. It is how the system recalibrates.",
          author: "MindSettler Wisdom"
        },
        tags: ["pausing", "rest", "recalibration"],
        category: "self-care",
        difficulty: "beginner",
        estimatedReadTime: 1,
        isPublished: true,
        publishedAt: new Date(),
        createdBy: adminUser._id
      },
      {
        title: "Progress and Patience",
        description: "A reminder about the nature of personal growth.",
        contentType: "quote",
        content: {
          quote: "Growth happens in spirals, not straight lines. Each return to a familiar feeling brings deeper understanding.",
          author: "MindSettler Wisdom"
        },
        tags: ["growth", "patience", "spirals"],
        category: "general",
        difficulty: "beginner",
        estimatedReadTime: 1,
        isPublished: true,
        publishedAt: new Date(),
        createdBy: adminUser._id
      },

      // 4️⃣ Article Content (Deep but gentle)
      {
        title: "Why Mental Clarity Often Feels Harder During 'Normal' Life",
        description: "Understanding why emotional difficulty can appear during periods that look fine from the outside.",
        contentType: "article",
        content: {
          body: "Many people expect emotional difficulty only during crises. Yet confusion, restlessness, or dissatisfaction often appear during periods that look \"fine\" from the outside.\n\n**Why This Happens**\n\nMental strain is not always caused by events—it can also arise from:\n\n• **Unresolved decisions** that create background mental load\n• **Conflicting expectations** between what we think we should feel and what we actually feel\n• **Prolonged self-monitoring** without breaks for natural processing\n• **Emotional labor without reflection** that accumulates over time\n\nWhen life moves quickly, the mind often postpones processing. Over time, this backlog can surface as discomfort rather than clear thoughts.\n\n**How Psycho-Education Helps**\n\nPsycho-education supports clarity by:\n\n• **Slowing interpretation** so we don't rush to conclusions about our experiences\n• **Separating feeling from meaning** so emotions can exist without immediate explanation\n• **Allowing understanding before reaction** so we can respond from awareness rather than impulse\n\n**Important Note**\n\nThis is not about fixing. It is about making space for clarity. Sometimes understanding why we feel unclear is more helpful than trying to force clarity to appear.\n\nIf persistent confusion or distress interferes with daily life, speaking with a mental health professional can provide personalized support and guidance."
        },
        tags: ["mental-clarity", "normal-life", "processing"],
        category: "general",
        difficulty: "intermediate",
        estimatedReadTime: 5,
        isPublished: true,
        publishedAt: new Date(),
        createdBy: adminUser._id
      },
      {
        title: "The Hidden Weight of Constant Decisions",
        description: "Understanding decision fatigue and its impact on mental energy.",
        contentType: "article",
        content: {
          body: "Modern life requires countless small decisions every day. From what to wear to how to respond to messages, our minds are constantly choosing. This mental activity, while often invisible, can accumulate into what researchers call \"decision fatigue.\"\n\n**What Decision Fatigue Looks Like**\n\n• Feeling drained even when the day wasn't particularly eventful\n• Difficulty making choices that usually feel simple\n• Increased irritability or emotional reactivity\n• Procrastination on decisions that require mental energy\n\n**Why It Happens**\n\nEvery decision, no matter how small, uses mental resources. When these resources become depleted, our capacity for clear thinking and emotional regulation naturally decreases.\n\n**Understanding, Not Solving**\n\nRecognizing decision fatigue doesn't mean you need to eliminate all choices from your life. Instead, it can help you:\n\n• **Normalize** feelings of mental tiredness\n• **Understand** why some days feel harder than others\n• **Approach** your mental energy as a finite resource that deserves respect\n\n**Gentle Awareness**\n\nIf you notice patterns of decision fatigue, this awareness itself can be valuable. Sometimes simply understanding why we feel mentally tired can reduce the additional stress of wondering \"what's wrong with me?\"\n\nThis understanding may naturally lead to small adjustments in how you structure your day, but the goal is awareness, not optimization."
        },
        tags: ["decision-fatigue", "mental-energy", "awareness"],
        category: "stress",
        difficulty: "intermediate",
        estimatedReadTime: 4,
        isPublished: true,
        publishedAt: new Date(),
        createdBy: adminUser._id
      },

      // 5️⃣ Tip Content (Micro-guidance, not instruction)
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
            },
            {
              title: "Allow the Answer to Simply Exist",
              description: "Whatever comes up in response to this question doesn't need to be solved immediately. Sometimes naming what feels heavy is enough for the moment.",
              order: 3
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
      {
        title: "Reduce Interpretation",
        description: "Creating space between feeling and meaning-making.",
        contentType: "tip",
        content: {
          steps: [
            {
              title: "Notice When Feelings Appear",
              description: "When you become aware of an emotion or sensation, pause before trying to understand what it means.",
              order: 1
            },
            {
              title: "Resist Immediate Explanation",
              description: "If a feeling appears, you don't need to explain it immediately. Sometimes noticing that it exists is enough for the moment.",
              order: 2
            },
            {
              title: "Allow Mystery",
              description: "It's okay not to know why you feel something right away. Feelings can exist without immediate stories or solutions.",
              order: 3
            }
          ]
        },
        tags: ["interpretation", "feelings", "mystery"],
        category: "mindfulness",
        difficulty: "beginner",
        estimatedReadTime: 2,
        isPublished: true,
        publishedAt: new Date(),
        createdBy: adminUser._id
      },

      // 6️⃣ Exercise Content (Safe, non-therapeutic)
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
              description: "Do not try to change the answer. Simply notice it for a few moments. You may stop at any time.",
              order: 4
            },
            {
              title: "Complete When Ready",
              description: "This exercise is about observing, not fixing. When you feel complete, simply return to your day.",
              order: 5
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
      },
      {
        title: "Emotional Weather Check",
        description: "A gentle way to notice your internal climate without judgment.",
        contentType: "exercise",
        content: {
          steps: [
            {
              title: "Imagine Your Internal Weather",
              description: "Think of your current emotional state as weather. Is it sunny, cloudy, stormy, foggy, or something else entirely?",
              order: 1
            },
            {
              title: "Notice Without Judgment",
              description: "Just as we don't judge actual weather as 'good' or 'bad,' try to observe your emotional weather without needing to change it.",
              order: 2
            },
            {
              title: "Remember Weather Changes",
              description: "Weather naturally shifts and changes. Your emotional weather will also shift, often without any effort on your part.",
              order: 3
            },
            {
              title: "Simply Acknowledge",
              description: "You might say to yourself: 'Right now, my internal weather is [cloudy/stormy/calm/etc.]' This is about awareness, not improvement.",
              order: 4
            }
          ]
        },
        tags: ["emotional-weather", "awareness", "acceptance"],
        category: "mindfulness",
        difficulty: "beginner",
        estimatedReadTime: 2,
        isPublished: true,
        publishedAt: new Date(),
        createdBy: adminUser._id
      }
    ];

    // Insert all psycho-education content
    const insertedContent = await PsychoEducation.insertMany(psychoEducationData);

    // Display summary by content type
    const contentByType = {};
    insertedContent.forEach(item => {
      contentByType[item.contentType] = (contentByType[item.contentType] || 0) + 1;
    });

  } catch (error) {
    console.error('❌ Error seeding psycho-education content:', error);
  } finally {
    await mongoose.disconnect();
  }
};

// Run the seeding function
seedPsychoEducationContent();