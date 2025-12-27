import CorporateInquiry from '../models/CorporateInquiry.model.js';

export class CorporateService {
  
  /**
   * Create a new corporate inquiry
   * Human-centered approach - no automation, just careful storage
   */
  static async createInquiry(inquiryData) {
    try {
      // Check for recent duplicate inquiries from same email (prevent spam)
      const recentInquiry = await CorporateInquiry.findOne({
        email: inquiryData.email,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
      });

      if (recentInquiry) {
        throw new Error('An inquiry from this email was already submitted recently. Please wait 24 hours before submitting another.');
      }

      const inquiry = new CorporateInquiry(inquiryData);
      await inquiry.save();

      return {
        success: true,
        inquiry: {
          id: inquiry._id,
          organizationName: inquiry.organizationName,
          engagementType: inquiry.getEngagementTypeDisplay(),
          createdAt: inquiry.createdAt
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all inquiries for admin (with filtering and pagination)
   */
  static async getInquiries(filters = {}, options = {}) {
    try {
      const {
        status,
        engagementType,
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = { ...filters, ...options };

      // Build query
      const query = {};
      if (status && status !== 'all') query.status = status;
      if (engagementType && engagementType !== 'all') query.engagementType = engagementType;

      // Build sort
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Execute query with pagination
      const skip = (page - 1) * limit;
      
      const [inquiries, total] = await Promise.all([
        CorporateInquiry.find(query)
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        CorporateInquiry.countDocuments(query)
      ]);

      return {
        inquiries,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: total,
          limit: parseInt(limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get single inquiry by ID
   */
  static async getInquiryById(inquiryId) {
    try {
      const inquiry = await CorporateInquiry.findById(inquiryId);
      if (!inquiry) {
        throw new Error('Inquiry not found');
      }
      return inquiry;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update inquiry status and admin notes
   */
  static async updateInquiry(inquiryId, updateData) {
    try {
      const inquiry = await CorporateInquiry.findByIdAndUpdate(
        inquiryId,
        { 
          ...updateData,
          updatedAt: new Date()
        },
        { 
          new: true,
          runValidators: true
        }
      );

      if (!inquiry) {
        throw new Error('Inquiry not found');
      }

      return inquiry;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get inquiry statistics for admin dashboard
   */
  static async getInquiryStats() {
    try {
      const stats = await CorporateInquiry.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const engagementStats = await CorporateInquiry.aggregate([
        {
          $group: {
            _id: '$engagementType',
            count: { $sum: 1 }
          }
        }
      ]);

      // Get recent inquiries count (last 30 days)
      const recentCount = await CorporateInquiry.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      });

      return {
        statusBreakdown: stats,
        engagementBreakdown: engagementStats,
        recentInquiries: recentCount,
        totalInquiries: await CorporateInquiry.countDocuments()
      };
    } catch (error) {
      throw error;
    }
  }
}