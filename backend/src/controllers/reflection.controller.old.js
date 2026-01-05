import { ReflectionSession } from '../models/ReflectionSession.model.js';
import { ReflectionQuestion } from '../models/ReflectionQuestion.model.js';
import { geminiService } from '../services/gemini-reflection.service.js';
import { contentValidator } from '../services/content-validator.service.js';

export const reflectionController = {
  // Start new reflection session
  startReflection: async (req, res) => {
    try {
      console.log('Reflection start request received from user:', req.user.userId);
      const userId = req.user.userId;
      
      // Check if user has an active reflection session
      console.log('Checking for existing active session...');
      const existingSession = await ReflectionSession.findOne({
        userId,
        status: 'active'
      });

      if (existingSession) {
        console.log('Found existing active session:', existingSession._id);
        
        // Get the next question for the existing session
        const currentQuestionCount = existingSession.responses.length;
        
        if (currentQuestionCount >= 10) {
          // Session should be completed
          return res.json({
            success: true,
            message: 'Reflection session ready to complete',
            data: {
              sessionId: existingSession._id,
              status: existingSession.status,
              questionCount: currentQuestionCount,
              canContinue: false,
              nextAction: 'complete'
            }
          });
        }
        
        // Generate next question for existing session
        try {
          const responses = existingSession.responses.map(r => ({
            questionText: r.questionText,
            answer: r.answer,
            skipped: r.skipped
          }));

          let nextQuestion;
          
          // For Q1-Q2, use fixed questions (instant)
          if (currentQuestionCount + 1 <= 2) {
            console.log(`Using fixed question ${currentQuestionCount + 1} (instant)`);
            nextQuestion = geminiService.getFixedQuestion(currentQuestionCount + 1);
          } else {
            // For Q3+, use AI generation (may take time)
            console.log(`Generating AI question ${currentQuestionCount + 1} (may take time)`);
            const currentThemes = existingSession.responses
              .map(r => r.questionText)
              .join(' ')
              .toLowerCase()
              .includes('feeling') ? ['emotions', 'wellbeing'] : ['general'];

            nextQuestion = await geminiService.generateNextQuestion(
              responses, 
              currentThemes, 
              currentQuestionCount + 1
            );
          }

          // Validate next question (only for AI-generated questions)
          if (currentQuestionCount + 1 > 2) {
            const validation = contentValidator.validateQuestion(nextQuestion.question, nextQuestion.options);
            
            if (!validation.isValid) {
              console.error('Next question validation failed:', validation.violations);
              // Use fallback question
              const fallbackQuestion = geminiService.getFallbackQuestion(currentQuestionCount + 1);
              nextQuestion.question = fallbackQuestion.question;
              nextQuestion.options = fallbackQuestion.options;
            }
          }

          // Store next question
          const nextQuestionDoc = new ReflectionQuestion({
            sessionId: existingSession._id,
            questionNumber: currentQuestionCount + 1,
            questionText: nextQuestion.question,
            questionType: 'multiple_choice',
            options: nextQuestion.options,
            internalThemes: nextQuestion.internalThemes,
            nextFocus: nextQuestion.nextFocus
          });

          await nextQuestionDoc.save();

          return res.json({
            success: true,
            message: 'Active reflection session found',
            data: {
              sessionId: existingSession._id,
              status: existingSession.status,
              startedAt: existingSession.startedAt,
              questionCount: currentQuestionCount,
              question: {
                id: nextQuestionDoc._id,
                number: currentQuestionCount + 1,
                text: nextQuestion.question,
                options: nextQuestion.options,
                type: 'multiple_choice'
              }
            }
          });
        } catch (questionError) {
          console.error('Failed to generate next question for existing session:', questionError);
          
          // Use fallback question
          const fallbackQuestion = geminiService.getFallbackQuestion(currentQuestionCount + 1);
          
          const nextQuestionDoc = new ReflectionQuestion({
            sessionId: existingSession._id,
            questionNumber: currentQuestionCount + 1,
            questionText: fallbackQuestion.question,
            questionType: 'multiple_choice',
            options: fallbackQuestion.options,
            internalThemes: fallbackQuestion.internalThemes,
            nextFocus: fallbackQuestion.nextFocus
          });

          await nextQuestionDoc.save();

          return res.json({
            success: true,
            message: 'Active reflection session found (using fallback question)',
            data: {
              sessionId: existingSession._id,
              status: existingSession.status,
              startedAt: existingSession.startedAt,
              questionCount: currentQuestionCount,
              question: {
                id: nextQuestionDoc._id,
                number: currentQuestionCount + 1,
                text: fallbackQuestion.question,
                options: fallbackQuestion.options,
                type: 'multiple_choice'
              }
            }
          });
        }
      }

      // Create new reflection session
      console.log('Creating new reflection session...');
      const session = new ReflectionSession({
        userId,
        status: 'active',
        startedAt: new Date()
      });

      await session.save();
      console.log('New session created:', session._id);

      // Generate first question (should be instant for Q1-Q2)
      try {
        console.log('Generating first question...');
        
        // For Q1-Q2, use fixed questions immediately (no AI call)
        const firstQuestion = geminiService.getFixedQuestion(1);
        console.log('Using fixed question 1 (instant):', firstQuestion);
        
        // Store the question
        const questionDoc = new ReflectionQuestion({
          sessionId: session._id,
          questionNumber: 1,
          questionText: firstQuestion.question,
          questionType: 'multiple_choice',
          options: firstQuestion.options,
          internalThemes: firstQuestion.internalThemes,
          nextFocus: firstQuestion.nextFocus
        });

        await questionDoc.save();

        res.status(201).json({
          success: true,
          message: 'Reflection session started successfully',
          data: {
            sessionId: session._id,
            question: {
              id: questionDoc._id,
              number: 1,
              text: firstQuestion.question,
              options: firstQuestion.options,
              type: 'multiple_choice'
            }
          }
        });
      } catch (questionError) {
        console.error('Failed to generate first question:', questionError);
        
        // Emergency fallback
        const fallbackQuestion = geminiService.getFallbackQuestion(1);
        
        const questionDoc = new ReflectionQuestion({
          sessionId: session._id,
          questionNumber: 1,
          questionText: fallbackQuestion.question,
          questionType: 'multiple_choice',
          options: fallbackQuestion.options,
          internalThemes: fallbackQuestion.internalThemes,
          nextFocus: fallbackQuestion.nextFocus
        });

        await questionDoc.save();

        res.status(201).json({
          success: true,
          message: 'Reflection session started successfully (using fallback question)',
          data: {
            sessionId: session._id,
            question: {
              id: questionDoc._id,
              number: 1,
              text: fallbackQuestion.question,
              options: fallbackQuestion.options,
              type: 'multiple_choice'
            }
          }
        });
      }
    } catch (error) {
      console.error('Start reflection error:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({
        success: false,
        message: 'Failed to start reflection session',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },
  // Submit answer to current question
  submitAnswer: async (req, res) => {
    try {
      const { sessionId } = req.params;
      const userId = req.user.userId;
      const { questionId, answer, skipped = false } = req.body;

      // Validate input
      if (!questionId) {
        return res.status(400).json({
          success: false,
          message: 'Question ID is required'
        });
      }

      // Find and validate session
      const session = await ReflectionSession.findOne({
        _id: sessionId,
        userId,
        status: 'active'
      });

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Active reflection session not found'
        });
      }

      // Find the question
      const question = await ReflectionQuestion.findById(questionId);
      if (!question || question.sessionId.toString() !== sessionId) {
        return res.status(404).json({
          success: false,
          message: 'Question not found'
        });
      }

      // Add response to session
      await session.addResponse(questionId, question.questionText, answer || '', skipped);

      // Check if we should generate next question (max 10 questions)
      const currentQuestionCount = session.responses.length;
      
      if (currentQuestionCount >= 10) {
        // Session complete, generate summary
        return res.json({
          success: true,
          message: 'Maximum questions reached. Ready to complete reflection.',
          data: {
            sessionId: session._id,
            questionCount: currentQuestionCount,
            canContinue: false,
            nextAction: 'complete'
          }
        });
      }

      // Generate next question
      try {
        const responses = session.responses.map(r => ({
          questionText: r.questionText,
          answer: r.answer,
          skipped: r.skipped
        }));

        let nextQuestion;
        
        // For Q1-Q2, use fixed questions (instant)
        if (currentQuestionCount + 1 <= 2) {
          console.log(`Using fixed question ${currentQuestionCount + 1} (instant)`);
          nextQuestion = geminiService.getFixedQuestion(currentQuestionCount + 1);
        } else {
          // For Q3+, use AI generation (may take time)
          console.log(`Generating AI question ${currentQuestionCount + 1} (may take time)`);
          const currentThemes = session.responses
            .map(r => r.questionText)
            .join(' ')
            .toLowerCase()
            .includes('feeling') ? ['emotions', 'wellbeing'] : ['general'];

          nextQuestion = await geminiService.generateNextQuestion(
            responses, 
            currentThemes, 
            currentQuestionCount + 1
          );
        }

        // Validate next question (only for AI-generated questions)
        if (currentQuestionCount + 1 > 2) {
          const validation = contentValidator.validateQuestion(nextQuestion.question, nextQuestion.options);
          
          if (!validation.isValid) {
            console.error('Next question validation failed:', validation.violations);
            // Use fallback question
            const fallbackQuestion = geminiService.getFallbackQuestion(currentQuestionCount + 1);
            nextQuestion.question = fallbackQuestion.question;
            nextQuestion.options = fallbackQuestion.options;
          }
        }

        // Store next question
        const nextQuestionDoc = new ReflectionQuestion({
          sessionId: session._id,
          questionNumber: currentQuestionCount + 1,
          questionText: nextQuestion.question,
          questionType: 'multiple_choice',
          options: nextQuestion.options,
          internalThemes: nextQuestion.internalThemes,
          nextFocus: nextQuestion.nextFocus
        });

        await nextQuestionDoc.save();

        res.json({
          success: true,
          message: 'Answer submitted successfully',
          data: {
            sessionId: session._id,
            questionCount: currentQuestionCount,
            nextQuestion: {
              id: nextQuestionDoc._id,
              number: currentQuestionCount + 1,
              text: nextQuestion.question,
              options: nextQuestion.options,
              type: 'multiple_choice'
            },
            canContinue: true
          }
        });
      } catch (questionError) {
        console.error('Failed to generate next question:', questionError);
        
        // Use fallback question
        const fallbackQuestion = geminiService.getFallbackQuestion(currentQuestionCount + 1);
        
        const nextQuestionDoc = new ReflectionQuestion({
          sessionId: session._id,
          questionNumber: currentQuestionCount + 1,
          questionText: fallbackQuestion.question,
          questionType: 'multiple_choice',
          options: fallbackQuestion.options,
          internalThemes: fallbackQuestion.internalThemes,
          nextFocus: fallbackQuestion.nextFocus
        });

        await nextQuestionDoc.save();

        res.json({
          success: true,
          message: 'Answer submitted successfully (using fallback question)',
          data: {
            sessionId: session._id,
            questionCount: currentQuestionCount,
            nextQuestion: {
              id: nextQuestionDoc._id,
              number: currentQuestionCount + 1,
              text: fallbackQuestion.question,
              options: fallbackQuestion.options,
              type: 'multiple_choice'
            },
            canContinue: true
          }
        });
      }
    } catch (error) {
      console.error('Submit answer error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit answer',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },
  // Complete reflection session
  completeReflection: async (req, res) => {
    try {
      console.log('🏁 Completing reflection session:', req.params.sessionId);
      const { sessionId } = req.params;
      const userId = req.user.userId;

      // Find and validate session
      const session = await ReflectionSession.findOne({
        _id: sessionId,
        userId,
        status: 'active'
      });

      if (!session) {
        console.log('❌ Active reflection session not found');
        return res.status(404).json({
          success: false,
          message: 'Active reflection session not found'
        });
      }

      console.log(`📊 Session has ${session.responses.length} responses`);

      // Generate AI summary
      try {
        const responses = session.responses
          .filter(r => !r.skipped && r.answer.trim())
          .map(r => ({
            questionText: r.questionText,
            answer: r.answer
          }));

        console.log(`📝 Processing ${responses.length} valid responses for summary`);

        if (responses.length === 0) {
          console.log('⚠️ No responses to summarize, using default summary');
          // No responses to summarize
          await session.completeSession({
            summary: "The client started a reflection session but did not provide responses to summarize.",
            keyThemes: ["Reflection initiated"],
            possibleApproaches: ["Client-Centred Therapy"],
            suggestedQuestions: [
              "What feels most important to talk about today?",
              "How are you feeling about being here?",
              "Where would you like to begin?"
            ]
          });
        } else {
          console.log('🤖 Generating AI summary...');
          const aiSummary = await geminiService.generateSummary(responses);
          console.log('📋 Generated summary:', aiSummary);
          
          // Validate summary
          const validation = contentValidator.validateSummary(aiSummary);
          
          if (!validation.isValid) {
            console.error('❌ Summary validation failed:', validation.violations);
            // Use fallback summary
            const fallbackSummary = geminiService.getFallbackSummary();
            console.log('🔄 Using fallback summary');
            await session.completeSession(fallbackSummary);
          } else {
            console.log('✅ Summary validation passed, saving AI summary');
            await session.completeSession(aiSummary);
          }
        }

        console.log('✅ Reflection session completed successfully');

        res.json({
          success: true,
          message: 'Reflection session completed successfully',
          data: {
            sessionId: session._id,
            status: 'completed',
            completedAt: session.completedAt,
            totalQuestions: session.metadata.totalQuestions,
            questionsAnswered: session.metadata.questionsAnswered,
            questionsSkipped: session.metadata.questionsSkipped,
            duration: session.metadata.sessionDuration
          }
        });
      } catch (summaryError) {
        console.error('Failed to generate summary:', summaryError);
        
        // Complete session with fallback summary
        const fallbackSummary = geminiService.getFallbackSummary();
        await session.completeSession(fallbackSummary);

        res.json({
          success: true,
          message: 'Reflection session completed successfully (using fallback summary)',
          data: {
            sessionId: session._id,
            status: 'completed',
            completedAt: session.completedAt,
            totalQuestions: session.metadata.totalQuestions,
            questionsAnswered: session.metadata.questionsAnswered,
            questionsSkipped: session.metadata.questionsSkipped,
            duration: session.metadata.sessionDuration
          }
        });
      }
    } catch (error) {
      console.error('Complete reflection error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to complete reflection session',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Get reflection session data
  getReflectionSession: async (req, res) => {
    try {
      const { sessionId } = req.params;
      const userId = req.user.userId;

      const session = await ReflectionSession.findOne({
        _id: sessionId,
        userId
      });

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Reflection session not found'
        });
      }

      // Get questions for this session
      const questions = await ReflectionQuestion.find({
        sessionId: session._id
      }).sort({ questionNumber: 1 });

      res.json({
        success: true,
        data: {
          session: {
            id: session._id,
            status: session.status,
            startedAt: session.startedAt,
            completedAt: session.completedAt,
            metadata: session.metadata
          },
          questions: questions.map(q => ({
            id: q._id,
            number: q.questionNumber,
            text: q.questionText,
            type: q.questionType,
            options: q.options
          })),
          responses: session.responses.map(r => ({
            questionId: r.questionId,
            answer: r.answer,
            skipped: r.skipped,
            answeredAt: r.answeredAt
          }))
        }
      });
    } catch (error) {
      console.error('Get reflection session error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get reflection session',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },
  // Abandon reflection session
  abandonReflection: async (req, res) => {
    try {
      const { sessionId } = req.params;
      const userId = req.user.userId;

      const session = await ReflectionSession.findOne({
        _id: sessionId,
        userId,
        status: 'active'
      });

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Active reflection session not found'
        });
      }

      await session.abandonSession();

      res.json({
        success: true,
        message: 'Reflection session abandoned successfully',
        data: {
          sessionId: session._id,
          status: 'abandoned'
        }
      });
    } catch (error) {
      console.error('Abandon reflection error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to abandon reflection session',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Get user's reflection sessions
  getUserReflectionSessions: async (req, res) => {
    try {
      const userId = req.user.userId;
      const { status, limit = 10, page = 1 } = req.query;

      let query = { userId };
      if (status) {
        query.status = status;
      }

      const skip = (page - 1) * limit;

      const sessions = await ReflectionSession.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-responses.questionId -aiSummary'); // Exclude detailed data

      const total = await ReflectionSession.countDocuments(query);

      res.json({
        success: true,
        data: sessions.map(session => ({
          id: session._id,
          status: session.status,
          startedAt: session.startedAt,
          completedAt: session.completedAt,
          metadata: session.metadata,
          createdAt: session.createdAt
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get user reflection sessions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get reflection sessions',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },
  // Admin: Get all reflection sessions
  getAllReflectionSessions: async (req, res) => {
    try {
      const { status, date, page = 1, limit = 10 } = req.query;

      let query = {};
      if (status) query.status = status;
      if (date) {
        const targetDate = new Date(date);
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);
        
        query.createdAt = {
          $gte: targetDate,
          $lt: nextDay
        };
      }

      const skip = (page - 1) * limit;

      const sessions = await ReflectionSession.find(query)
        .populate('userId', 'firstName lastName email')
        .populate('bookingId', 'personalInfo.name slotId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await ReflectionSession.countDocuments(query);

      res.json({
        success: true,
        data: sessions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get all reflection sessions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get reflection sessions',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Admin: Get reflection summary
  getReflectionSummary: async (req, res) => {
    try {
      const { sessionId } = req.params;

      const session = await ReflectionSession.findById(sessionId)
        .populate('userId', 'firstName lastName email')
        .populate('bookingId', 'personalInfo slotId');

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Reflection session not found'
        });
      }

      // Get questions for context
      const questions = await ReflectionQuestion.find({
        sessionId: session._id
      }).sort({ questionNumber: 1 });

      res.json({
        success: true,
        data: {
          session: {
            id: session._id,
            status: session.status,
            startedAt: session.startedAt,
            completedAt: session.completedAt,
            metadata: session.metadata,
            user: session.userId,
            booking: session.bookingId
          },
          questions: questions.map(q => ({
            number: q.questionNumber,
            text: q.questionText,
            type: q.questionType,
            options: q.options
          })),
          responses: session.responses.map(r => ({
            questionText: r.questionText,
            answer: r.answer,
            skipped: r.skipped,
            answeredAt: r.answeredAt
          })),
          aiSummary: session.aiSummary,
          disclaimer: "For preparation only. Human judgment required."
        }
      });
    } catch (error) {
      console.error('Get reflection summary error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get reflection summary',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Admin: Delete reflection session
  deleteReflectionSession: async (req, res) => {
    try {
      const { sessionId } = req.params;

      const session = await ReflectionSession.findById(sessionId);
      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Reflection session not found'
        });
      }

      // Delete associated questions
      await ReflectionQuestion.deleteMany({ sessionId: session._id });
      
      // Delete session
      await ReflectionSession.findByIdAndDelete(sessionId);

      res.json({
        success: true,
        message: 'Reflection session deleted successfully'
      });
    } catch (error) {
      console.error('Delete reflection session error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete reflection session',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};