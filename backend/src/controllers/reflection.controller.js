import { ReflectionQuestion } from '../models/ReflectionQuestion.model.js';
import { User } from '../models/User.model.js';
import { Booking } from '../models/Booking.model.js';
import { geminiService } from '../services/gemini-reflection.service.js';

/**
 * NEW REFLECTION CONTROLLER - FIRST SESSION ONLY
 * 
 * Core Rules:
 * 1. Reflection quiz ONLY for users who haven't had a confirmed session
 * 2. Fixed 10 questions (admin-editable)
 * 3. One-time AI summary generation
 * 4. No adaptive learning or repeated reflections
 */

export const reflectionController = {
  
  /**
   * Check if user is eligible for reflection (first session only)
   */
  checkEligibility: async (req, res) => {
    try {
      const userId = req.user.userId;
      
      // Get user data
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if user has confirmed sessions
      const hasConfirmedSession = await Booking.exists({
        userId,
        status: 'confirmed'
      });

      // Update user's session status
      if (hasConfirmedSession && !user.hasConfirmedSession) {
        await User.findByIdAndUpdate(userId, { hasConfirmedSession: true });
      }

      const isEligible = !hasConfirmedSession && !user.reflectionCompleted;

      res.json({
        success: true,
        data: {
          isEligible,
          hasConfirmedSession: hasConfirmedSession || user.hasConfirmedSession,
          reflectionCompleted: user.reflectionCompleted,
          reflectionSummary: user.reflectionSummary
        }
      });

    } catch (error) {
      console.error('❌ Error checking reflection eligibility:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check reflection eligibility'
      });
    }
  },

  /**
   * Get reflection questions (first session only)
   */
  getQuestions: async (req, res) => {
    try {
      const userId = req.user.userId;
      
      // Check eligibility first
      const user = await User.findById(userId);
      const hasConfirmedSession = await Booking.exists({
        userId,
        status: 'confirmed'
      });

      if (hasConfirmedSession || user.hasConfirmedSession || user.reflectionCompleted) {
        return res.status(403).json({
          success: false,
          message: 'Reflection quiz is only available for first-time clients'
        });
      }

      // Get active questions in order
      const questions = await ReflectionQuestion.find({ isActive: true })
        .sort({ questionNumber: 1 })
        .select('questionNumber category questionText options');

      if (questions.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No reflection questions available'
        });
      }

      res.json({
        success: true,
        data: {
          questions,
          totalQuestions: questions.length,
          message: 'This short reflection helps us understand you better before your first conversation. It\'s optional and there are no right or wrong answers.'
        }
      });

    } catch (error) {
      console.error('❌ Error fetching reflection questions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch reflection questions'
      });
    }
  },

  /**
   * Submit reflection responses (first session only)
   */
  submitReflection: async (req, res) => {
    try {
      const userId = req.user.userId;
      const { responses } = req.body;

      if (!responses || typeof responses !== 'object') {
        return res.status(400).json({
          success: false,
          message: 'Invalid responses format'
        });
      }

      // Check eligibility
      const user = await User.findById(userId);
      const hasConfirmedSession = await Booking.exists({
        userId,
        status: 'confirmed'
      });

      if (hasConfirmedSession || user.hasConfirmedSession || user.reflectionCompleted) {
        return res.status(403).json({
          success: false,
          message: 'Reflection quiz is only available for first-time clients'
        });
      }

      // Get questions for validation
      const questions = await ReflectionQuestion.find({ isActive: true })
        .sort({ questionNumber: 1 });

      // Validate responses
      const validatedResponses = {};
      for (const question of questions) {
        const questionKey = `q${question.questionNumber}`;
        const response = responses[questionKey];
        
        if (response) {
          // Validate that the response is a valid option
          const validOption = question.options.find(opt => opt.value === response);
          if (validOption) {
            validatedResponses[questionKey] = {
              questionText: question.questionText,
              category: question.category,
              selectedValue: response,
              selectedLabel: validOption.label
            };
          }
        }
      }

      // Generate AI summary
      let aiSummary = null;
      try {
        aiSummary = await geminiService.generateFirstSessionSummary(validatedResponses, questions);
      } catch (aiError) {
        console.error('❌ AI summary generation failed:', aiError);
        // Continue without AI summary - don't fail the entire process
      }

      // Save to user profile (permanent, one-time)
      await User.findByIdAndUpdate(userId, {
        reflectionCompleted: true,
        reflectionResponses: validatedResponses,
        reflectionSummary: aiSummary
      });

      res.json({
        success: true,
        message: 'Reflection completed successfully',
        data: {
          responsesCount: Object.keys(validatedResponses).length,
          summaryGenerated: !!aiSummary
        }
      });

    } catch (error) {
      console.error('❌ Error submitting reflection:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit reflection'
      });
    }
  },

  /**
   * Get user's reflection summary (for admin view)
   */
  getUserReflection: async (req, res) => {
    try {
      const { userId } = req.params;
      
      const user = await User.findById(userId)
        .select('reflectionCompleted reflectionResponses reflectionSummary hasConfirmedSession createdAt');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: {
          hasReflection: user.reflectionCompleted,
          summary: user.reflectionSummary,
          responses: user.reflectionResponses,
          isFirstTimeClient: !user.hasConfirmedSession,
          accountAge: Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)) // days
        }
      });

    } catch (error) {
      console.error('❌ Error fetching user reflection:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user reflection'
      });
    }
  },

  /**
   * Admin: Get all reflection questions
   */
  admin: {
    getQuestions: async (req, res) => {
      try {
        const questions = await ReflectionQuestion.find()
          .sort({ questionNumber: 1 });

        res.json({
          success: true,
          data: questions
        });
      } catch (error) {
        console.error('❌ Error fetching admin questions:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to fetch questions'
        });
      }
    },

    /**
     * Admin: Update question
     */
    updateQuestion: async (req, res) => {
      try {
        const { questionId } = req.params;
        const updateData = req.body;

        const question = await ReflectionQuestion.findByIdAndUpdate(
          questionId,
          updateData,
          { new: true, runValidators: true }
        );

        if (!question) {
          return res.status(404).json({
            success: false,
            message: 'Question not found'
          });
        }

        res.json({
          success: true,
          message: 'Question updated successfully',
          data: question
        });
      } catch (error) {
        console.error('❌ Error updating question:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to update question'
        });
      }
    },

    /**
     * Admin: Add new question
     */
    addQuestion: async (req, res) => {
      try {
        const questionData = req.body;
        
        const question = new ReflectionQuestion(questionData);
        await question.save();

        res.status(201).json({
          success: true,
          message: 'Question added successfully',
          data: question
        });
      } catch (error) {
        console.error('❌ Error adding question:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to add question'
        });
      }
    },

    /**
     * Admin: Delete question
     */
    deleteQuestion: async (req, res) => {
      try {
        const { questionId } = req.params;

        const question = await ReflectionQuestion.findByIdAndDelete(questionId);

        if (!question) {
          return res.status(404).json({
            success: false,
            message: 'Question not found'
          });
        }

        res.json({
          success: true,
          message: 'Question deleted successfully'
        });
      } catch (error) {
        console.error('❌ Error deleting question:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to delete question'
        });
      }
    }
  }
};