import { CorporateService } from '../services/corporate.service.js';
import { corporateValidation } from '../validation/corporate.validation.js';

/**
 * Handle corporate inquiry submission
 * Calm, human-centered approach - no rush, no automation
 */
export const createInquiry = async (req, res) => {
  try {
    // Validate input with gentle error messages
    const { error, value } = corporateValidation.createInquiry.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Please check your information and try again',
        errors: error.details.map(detail => detail.message)
      });
    }

    // Create inquiry through service
    const result = await CorporateService.createInquiry(value);

    // Calm success response
    res.status(201).json({
      success: true,
      message: 'Thank you for reaching out. We\'ll be in touch soon to understand your needs better.',
      data: result.inquiry
    });

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('❌ Corporate inquiry error:', error.message);
    }

    // Handle duplicate inquiry gracefully
    if (error.message.includes('inquiry from this email was already submitted')) {
      return res.status(429).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'We\'re experiencing technical difficulties. Please try again in a moment.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get all corporate inquiries (Admin only)
 */
export const getInquiries = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      engagementType: req.query.engagementType
    };

    const options = {
      page: req.query.page || 1,
      limit: req.query.limit || 20,
      sortBy: req.query.sortBy || 'createdAt',
      sortOrder: req.query.sortOrder || 'desc'
    };

    const result = await CorporateService.getInquiries(filters, options);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('❌ Get inquiries error:', error.message);
    }

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve inquiries'
    });
  }
};

/**
 * Get single inquiry by ID (Admin only)
 */
export const getInquiryById = async (req, res) => {
  try {
    const { id } = req.params;
    const inquiry = await CorporateService.getInquiryById(id);

    res.json({
      success: true,
      data: inquiry
    });

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('❌ Get inquiry error:', error.message);
    }

    if (error.message === 'Inquiry not found') {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve inquiry'
    });
  }
};

/**
 * Update inquiry status and notes (Admin only)
 */
export const updateInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate update data
    const { error, value } = corporateValidation.updateInquiry.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid update data',
        errors: error.details.map(detail => detail.message)
      });
    }

    const updatedInquiry = await CorporateService.updateInquiry(id, value);

    res.json({
      success: true,
      message: 'Inquiry updated successfully',
      data: updatedInquiry
    });

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('❌ Update inquiry error:', error.message);
    }

    if (error.message === 'Inquiry not found') {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update inquiry'
    });
  }
};

/**
 * Get inquiry statistics (Admin only)
 */
export const getInquiryStats = async (req, res) => {
  try {
    const stats = await CorporateService.getInquiryStats();

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('❌ Get stats error:', error.message);
    }

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve statistics'
    });
  }
};