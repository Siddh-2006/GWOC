import mongoose from 'mongoose';
import { Media } from '../models/Media.model.js';

export const mediaController = {
  // Create new media
  createMedia: async (req, res) => {
    try {
      console.log('📝 Create media request body:', JSON.stringify(req.body, null, 2));
      
      const {
        title,
        description,
        type,
        category,
        fileUrl,
        thumbnailUrl,
        assets,
        tags,
        duration,
        fileSize,
        mimeType,
        isPublished,
        publishedAt
      } = req.body;

      console.log('📝 Extracted fields:', {
        title,
        type,
        fileUrl: fileUrl || 'EMPTY',
        assets: assets || 'EMPTY',
        assetsLength: assets ? assets.length : 0
      });

      const media = new Media({
        title,
        description,
        type,
        category,
        fileUrl,
        thumbnailUrl,
        assets: assets || [],
        tags: tags || [],
        duration,
        fileSize,
        mimeType,
        isPublished: isPublished || false,
        publishedAt: publishedAt || (isPublished ? new Date() : undefined),
        createdBy: req.user.userId
      });

      console.log('📝 Media object before save:', {
        fileUrl: media.fileUrl || 'EMPTY',
        assets: media.assets || 'EMPTY',
        assetsLength: media.assets ? media.assets.length : 0
      });

      await media.save();

      res.status(201).json({
        success: true,
        message: 'Media created successfully',
        data: media
      });
    } catch (error) {
      console.error('Create media error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create media',
        error: error.message
      });
    }
  },

  // Get all media (admin)
  getAllMedia: async (req, res) => {
    try {
      const {
        type,
        category,
        isPublished,
        search,
        page = 1,
        limit = 20
      } = req.query;

      let query = {};

      if (type) query.type = type;
      if (category) query.category = category;
      if (isPublished !== undefined) query.isPublished = isPublished === 'true';

      if (search) {
        query.$text = { $search: search };
      }

      const skip = (page - 1) * limit;

      const media = await Media.find(query)
        .populate('createdBy', 'firstName lastName')
        .populate('updatedBy', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Media.countDocuments(query);

      res.json({
        success: true,
        data: media,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get all media error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch media',
        error: error.message
      });
    }
  },

  // Get published media (public)
  getPublishedMedia: async (req, res) => {
    try {
      const {
        type,
        category,
        search,
        page = 1,
        limit = 20
      } = req.query;

      let query = { isPublished: true };

      if (type) query.type = type;
      if (category) query.category = category;

      if (search) {
        query.$text = { $search: search };
      }

      const skip = (page - 1) * limit;

      const media = await Media.find(query)
        .select('-createdBy -updatedBy')
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Media.countDocuments(query);

      // Add hasLiked status if user is authenticated
      const userId = req.user?.userId;
      const mediaWithLikeStatus = media.map(item => {
        const mediaObj = item.toObject();
        if (userId) {
          mediaObj.hasLiked = mediaObj.likes.some(likeId => likeId.toString() === userId.toString());
        }
        mediaObj.likesCount = mediaObj.likes.length;
        return mediaObj;
      });

      res.json({
        success: true,
        data: mediaWithLikeStatus,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get published media error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch media',
        error: error.message
      });
    }
  },

  // Get single media
  getMedia: async (req, res) => {
    try {
      const { mediaId } = req.params;

      const media = await Media.findById(mediaId)
        .populate('createdBy', 'firstName lastName')
        .populate('updatedBy', 'firstName lastName');

      if (!media) {
        return res.status(404).json({
          success: false,
          message: 'Media not found'
        });
      }

      // Increment views
      media.views += 1;
      await media.save();

      res.json({
        success: true,
        data: media
      });
    } catch (error) {
      console.error('Get media error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch media',
        error: error.message
      });
    }
  },

  // Update media
  updateMedia: async (req, res) => {
    try {
      const { mediaId } = req.params;
      const updates = req.body;

      const media = await Media.findById(mediaId);
      if (!media) {
        return res.status(404).json({
          success: false,
          message: 'Media not found'
        });
      }

      // Update fields
      Object.keys(updates).forEach(key => {
        if (updates[key] !== undefined) {
          media[key] = updates[key];
        }
      });

      media.updatedBy = req.user.userId;

      // Set published date if publishing
      if (updates.isPublished && !media.publishedAt) {
        media.publishedAt = new Date();
      }

      await media.save();

      res.json({
        success: true,
        message: 'Media updated successfully',
        data: media
      });
    } catch (error) {
      console.error('Update media error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update media',
        error: error.message
      });
    }
  },

  // Delete media
  deleteMedia: async (req, res) => {
    try {
      const { mediaId } = req.params;

      const media = await Media.findByIdAndDelete(mediaId);
      if (!media) {
        return res.status(404).json({
          success: false,
          message: 'Media not found'
        });
      }

      res.json({
        success: true,
        message: 'Media deleted successfully'
      });
    } catch (error) {
      console.error('Delete media error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete media',
        error: error.message
      });
    }
  },

  // Like media
  likeMedia: async (req, res) => {
    try {
      const { mediaId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required to like media'
        });
      }

      const media = await Media.findById(mediaId);
      if (!media) {
        return res.status(404).json({
          success: false,
          message: 'Media not found'
        });
      }

      const hasLiked = media.likes.some(likeId => likeId.toString() === userId.toString());
      
      if (hasLiked) {
        // Unlike
        media.likes = media.likes.filter(id => id.toString() !== userId.toString());
      } else {
        // Like
        media.likes.push(userId);
      }

      await media.save();

      res.json({
        success: true,
        message: hasLiked ? 'Media unliked successfully' : 'Media liked successfully',
        data: { 
          likes: media.likes.length,
          hasLiked: !hasLiked,
          likesCount: media.likes.length
        }
      });
    } catch (error) {
      console.error('Like media error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to like media',
        error: error.message
      });
    }
  },

  // Add comment to media
  addComment: async (req, res) => {
    try {
      const { mediaId } = req.params;
      const { content } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required to comment'
        });
      }

      if (!content || !content.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Comment content is required'
        });
      }

      const media = await Media.findById(mediaId);
      if (!media) {
        return res.status(404).json({
          success: false,
          message: 'Media not found'
        });
      }

      const comment = {
        userId,
        content: content.trim(),
        createdAt: new Date()
      };

      media.comments.push(comment);
      await media.save();

      // Populate the comment with user info
      await media.populate('comments.userId', 'firstName lastName');

      res.status(201).json({
        success: true,
        message: 'Comment added successfully',
        data: media.comments[media.comments.length - 1]
      });
    } catch (error) {
      console.error('Add comment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add comment',
        error: error.message
      });
    }
  },

  // Share media (increment share count)
  shareMedia: async (req, res) => {
    try {
      const { mediaId } = req.params;

      const media = await Media.findById(mediaId);
      if (!media) {
        return res.status(404).json({
          success: false,
          message: 'Media not found'
        });
      }

      media.shares += 1;
      await media.save();

      res.json({
        success: true,
        message: 'Media shared successfully',
        data: { shares: media.shares }
      });
    } catch (error) {
      console.error('Share media error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to share media',
        error: error.message
      });
    }
  },

  // Get user's liked media
  getUserLikedMedia: async (req, res) => {
    try {
      const userId = req.user?.userId;
      const {
        type,
        category,
        page = 1,
        limit = 20
      } = req.query;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      let query = { 
        likes: userId,
        isPublished: true 
      };

      if (type) query.type = type;
      if (category) query.category = category;

      const skip = (page - 1) * limit;

      const likedMedia = await Media.find(query)
        .select('title description type category fileUrl thumbnailUrl tags duration views likes comments shares createdAt publishedAt assets')
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Media.countDocuments(query);

      // Add hasLiked flag for each media item
      const mediaWithLikeStatus = likedMedia.map(media => ({
        ...media.toObject(),
        hasLiked: true, // All items in this response are liked by the user
        likesCount: media.likes.length
      }));

      res.json({
        success: true,
        data: mediaWithLikeStatus,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get user liked media error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch liked media',
        error: error.message
      });
    }
  }
};