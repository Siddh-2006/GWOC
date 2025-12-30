import { PsychoEducation } from '../models/PsychoEducation.model.js';
import mongoose from 'mongoose';

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
        sortBy = 'recent',
        page = 1,
        limit = 20
      } = req.query;

      const userId = req.user?.userId; // Optional user ID for like status

      let query = { isPublished: true };

      if (contentType) query.contentType = contentType;
      if (category) query.category = category;
      if (difficulty) query.difficulty = difficulty;

      if (search) {
        query.$text = { $search: search };
      }

      const skip = (page - 1) * limit;

      // Determine sort order
      let sortOrder = {};
      switch (sortBy) {
        case 'likes':
          // Sort by number of likes (descending)
          sortOrder = { 'likesCount': -1, publishedAt: -1 };
          break;
        case 'recent':
        default:
          // Sort by published date (most recent first)
          sortOrder = { publishedAt: -1 };
          break;
      }

      let content;
      
      if (sortBy === 'likes') {
        // Use aggregation pipeline for likes sorting
        const userObjectId = userId ? new mongoose.Types.ObjectId(userId) : null;
        
        const pipeline = [
          { $match: query },
          {
            $addFields: {
              likesCount: { $size: '$likes' },
              hasLiked: userObjectId ? { $in: [userObjectId, '$likes'] } : false
            }
          },
          { $sort: sortOrder },
          { $skip: skip },
          { $limit: parseInt(limit) },
          {
            $lookup: {
              from: 'mediaattachments',
              localField: 'mediaAttachments',
              foreignField: '_id',
              as: 'mediaAttachments'
            }
          },
          {
            $project: {
              createdBy: 0,
              updatedBy: 0
            }
          }
        ];
        
        content = await PsychoEducation.aggregate(pipeline);
      } else {
        // Use regular find for other sorts
        content = await PsychoEducation.find(query)
          .populate('mediaAttachments')
          .select('-createdBy -updatedBy')
          .sort(sortOrder)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(); // Use lean for better performance

        // Add user-specific like status
        content = content.map(item => ({
          ...item,
          hasLiked: userId && Array.isArray(item.likes) ? item.likes.some(likeId => likeId.toString() === userId.toString()) : false,
          likesCount: Array.isArray(item.likes) ? item.likes.length : (item.likes || 0)
        }));
      }

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
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required to like content'
        });
      }

      const content = await PsychoEducation.findById(contentId);
      if (!content) {
        return res.status(404).json({
          success: false,
          message: 'Content not found'
        });
      }

      // Clean up and ensure proper array format
      if (!Array.isArray(content.likes)) {
        content.likes = [];
      }
      
      // Clean up helpful field if it has invalid data
      if (!Array.isArray(content.helpful)) {
        content.helpful = [];
      } else {
        // Remove any invalid entries
        content.helpful = content.helpful.filter(id => {
          try {
            return mongoose.Types.ObjectId.isValid(id);
          } catch (e) {
            return false;
          }
        });
      }

      const hasLiked = content.likes.includes(userId);
      
      if (hasLiked) {
        // Unlike - remove user ID from likes array
        content.likes = content.likes.filter(id => id.toString() !== userId.toString());
      } else {
        // Like - add user ID to likes array
        content.likes.push(userId);
      }

      // Save to database immediately
      await content.save();
      
      console.log(`✅ ${hasLiked ? 'Unliked' : 'Liked'} content "${content.title}" by user ${userId}`);

      res.json({
        success: true,
        message: hasLiked ? 'Content unliked successfully' : 'Content liked successfully',
        data: { 
          likes: content.likes.length,
          hasLiked: !hasLiked
        }
      });
    } catch (error) {
      console.error('❌ Like content error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to like content',
        error: error.message
      });
    }
  }
};