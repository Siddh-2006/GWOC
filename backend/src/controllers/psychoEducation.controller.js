import { PsychoEducation } from '../models/PsychoEducation.model.js';

export const psychoEducationController = {
  // Create new psycho-education content
  createContent: async (req, res) => {
    try {
      const {
        title,
        description,
        contentType,
        content,
        tags,
        category,
        difficulty,
        estimatedReadTime,
        mediaAttachments
      } = req.body;

      // Validate content based on type
      if (contentType === 'qa' && (!content.question || !content.answer)) {
        return res.status(400).json({
          success: false,
          message: 'Question and answer are required for Q&A content'
        });
      }

      if ((contentType === 'theory' || contentType === 'article') && !content.body) {
        return res.status(400).json({
          success: false,
          message: 'Body content is required for theory/article content'
        });
      }

      if (contentType === 'quote' && !content.quote) {
        return res.status(400).json({
          success: false,
          message: 'Quote text is required for quote content'
        });
      }

      if ((contentType === 'tip' || contentType === 'exercise') && (!content.steps || content.steps.length === 0)) {
        return res.status(400).json({
          success: false,
          message: 'Steps are required for tip/exercise content'
        });
      }

      const psychoEducation = new PsychoEducation({
        title,
        description,
        contentType,
        content,
        tags: tags || [],
        category,
        difficulty,
        estimatedReadTime,
        mediaAttachments: mediaAttachments || [],
        createdBy: req.user.userId
      });

      await psychoEducation.save();

      res.status(201).json({
        success: true,
        message: 'Psycho-education content created successfully',
        data: psychoEducation
      });
    } catch (error) {
      console.error('Create psycho-education content error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create content',
        error: error.message
      });
    }
  },

  // Get all content (admin)
  getAllContent: async (req, res) => {
    try {
      const {
        contentType,
        category,
        difficulty,
        isPublished,
        search,
        page = 1,
        limit = 20
      } = req.query;

      let query = {};

      if (contentType) query.contentType = contentType;
      if (category) query.category = category;
      if (difficulty) query.difficulty = difficulty;
      if (isPublished !== undefined) query.isPublished = isPublished === 'true';

      if (search) {
        query.$text = { $search: search };
      }

      const skip = (page - 1) * limit;

      const content = await PsychoEducation.find(query)
        .populate('createdBy', 'firstName lastName')
        .populate('updatedBy', 'firstName lastName')
        .populate('mediaAttachments')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await PsychoEducation.countDocuments(query);

      res.json({
        success: true,
        data: content,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get all psycho-education content error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch content',
        error: error.message
      });
    }
  },

  // Get published content (public)
  getPublishedContent: async (req, res) => {
    try {
      const {
        contentType,
        category,
        difficulty,
        search,
        page = 1,
        limit = 20
      } = req.query;

      let query = { isPublished: true };

      if (contentType) query.contentType = contentType;
      if (category) query.category = category;
      if (difficulty) query.difficulty = difficulty;

      if (search) {
        query.$text = { $search: search };
      }

      const skip = (page - 1) * limit;

      const content = await PsychoEducation.find(query)
        .populate('mediaAttachments')
        .select('-createdBy -updatedBy')
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await PsychoEducation.countDocuments(query);

      res.json({
        success: true,
        data: content,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get published psycho-education content error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch content',
        error: error.message
      });
    }
  },

  // Get single content
  getContent: async (req, res) => {
    try {
      const { contentId } = req.params;

      const content = await PsychoEducation.findById(contentId)
        .populate('createdBy', 'firstName lastName')
        .populate('updatedBy', 'firstName lastName')
        .populate('mediaAttachments');

      if (!content) {
        return res.status(404).json({
          success: false,
          message: 'Content not found'
        });
      }

      // Increment views
      content.views += 1;
      await content.save();

      res.json({
        success: true,
        data: content
      });
    } catch (error) {
      console.error('Get psycho-education content error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch content',
        error: error.message
      });
    }
  },

  // Update content
  updateContent: async (req, res) => {
    try {
      const { contentId } = req.params;
      const updates = req.body;

      const content = await PsychoEducation.findById(contentId);
      if (!content) {
        return res.status(404).json({
          success: false,
          message: 'Content not found'
        });
      }

      // Update fields
      Object.keys(updates).forEach(key => {
        if (updates[key] !== undefined) {
          content[key] = updates[key];
        }
      });

      content.updatedBy = req.user.userId;

      // Set published date if publishing
      if (updates.isPublished && !content.publishedAt) {
        content.publishedAt = new Date();
      }

      await content.save();

      res.json({
        success: true,
        message: 'Content updated successfully',
        data: content
      });
    } catch (error) {
      console.error('Update psycho-education content error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update content',
        error: error.message
      });
    }
  },

  // Delete content
  deleteContent: async (req, res) => {
    try {
      const { contentId } = req.params;

      const content = await PsychoEducation.findByIdAndDelete(contentId);
      if (!content) {
        return res.status(404).json({
          success: false,
          message: 'Content not found'
        });
      }

      res.json({
        success: true,
        message: 'Content deleted successfully'
      });
    } catch (error) {
      console.error('Delete psycho-education content error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete content',
        error: error.message
      });
    }
  },

  // Like content
  likeContent: async (req, res) => {
    try {
      const { contentId } = req.params;

      const content = await PsychoEducation.findById(contentId);
      if (!content) {
        return res.status(404).json({
          success: false,
          message: 'Content not found'
        });
      }

      content.likes += 1;
      await content.save();

      res.json({
        success: true,
        message: 'Content liked successfully',
        data: { likes: content.likes }
      });
    } catch (error) {
      console.error('Like content error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to like content',
        error: error.message
      });
    }
  },

  // Mark content as helpful
  markHelpful: async (req, res) => {
    try {
      const { contentId } = req.params;

      const content = await PsychoEducation.findById(contentId);
      if (!content) {
        return res.status(404).json({
          success: false,
          message: 'Content not found'
        });
      }

      content.helpful += 1;
      await content.save();

      res.json({
        success: true,
        message: 'Content marked as helpful',
        data: { helpful: content.helpful }
      });
    } catch (error) {
      console.error('Mark helpful error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark as helpful',
        error: error.message
      });
    }
  }
};