import React, { useState, useEffect } from 'react';
import { corporateService } from '../../services/corporate.api';
import { useToast } from '../../hooks/useToast';

/**
 * Admin Component for Managing Corporate Inquiries
 * Simple, functional interface for reviewing and updating inquiries
 */
export const CorporateInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    engagementType: 'all'
  });
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [updating, setUpdating] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    fetchInquiries();
  }, [filters]);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const response = await corporateService.admin.getInquiries(filters);
      if (response.success) {
        setInquiries(response.data.inquiries);
      }
    } catch (error) {
      setError('Failed to load inquiries');
      console.error('Error fetching inquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (inquiryId, newStatus, adminNotes = '') => {
    try {
      setUpdating(true);
      const response = await corporateService.admin.updateInquiry(inquiryId, {
        status: newStatus,
        adminNotes
      });
      
      if (response.success) {
        // Update local state
        setInquiries(prev => 
          prev.map(inquiry => 
            inquiry._id === inquiryId 
              ? { ...inquiry, status: newStatus, adminNotes }
              : inquiry
          )
        );
        setSelectedInquiry(null);
        
        // Show success toast
        addToast('Inquiry status updated successfully', 'success');
        
        // Show special message for confirmed status
        if (newStatus === 'confirmed') {
          addToast('Confirmation email sent to client', 'info');
        }
      }
    } catch (error) {
      setError('Failed to update inquiry');
      addToast('Failed to update inquiry status', 'error');
      console.error('Error updating inquiry:', error);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'new': '#ef4444',
      'confirmed': '#f59e0b',
      'in-discussion': '#3b82f6',
      'closed': '#10b981'
    };
    return colors[status] || '#6b7280';
  };

  const getEngagementTypeDisplay = (type) => {
    const displays = {
      'workplace-workshops': 'Workplace Workshops',
      'institutional-education': 'Institutional Education',
      'event-sessions': 'Event Sessions',
      'community-programs': 'Community Programs',
      'other': 'Other'
    };
    return displays[type] || type;
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading inquiries...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h2 style={{ margin: 0, color: '#1e293b' }}>Corporate Inquiries</h2>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            style={{
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px'
            }}
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="confirmed">Confirmed</option>
            <option value="in-discussion">In Discussion</option>
            <option value="closed">Closed</option>
          </select>
          
          <select
            value={filters.engagementType}
            onChange={(e) => setFilters(prev => ({ ...prev, engagementType: e.target.value }))}
            style={{
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px'
            }}
          >
            <option value="all">All Types</option>
            <option value="workplace-workshops">Workplace Workshops</option>
            <option value="institutional-education">Institutional Education</option>
            <option value="event-sessions">Event Sessions</option>
            <option value="community-programs">Community Programs</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {error && (
        <div style={{
          background: '#fef2f2',
          color: '#dc2626',
          padding: '1rem',
          borderRadius: '6px',
          marginBottom: '1rem',
          border: '1px solid #fecaca'
        }}>
          {error}
        </div>
      )}

      <div style={{ 
        display: 'grid', 
        gap: '1rem',
        gridTemplateColumns: selectedInquiry ? '1fr 1fr' : '1fr'
      }}>
        <div>
          {inquiries.length === 0 ? (
            <div style={{
              background: '#f8fafc',
              padding: '3rem',
              textAlign: 'center',
              borderRadius: '8px',
              color: '#64748b'
            }}>
              No inquiries found
            </div>
          ) : (
            inquiries.map((inquiry) => (
              <div
                key={inquiry._id}
                onClick={() => setSelectedInquiry(inquiry)}
                style={{
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  marginBottom: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  borderLeft: `4px solid ${getStatusColor(inquiry.status)}`
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '0.5rem'
                }}>
                  <h3 style={{ 
                    margin: 0, 
                    color: '#1e293b',
                    fontSize: '1.1rem'
                  }}>
                    {inquiry.organizationName}
                  </h3>
                  <span style={{
                    background: getStatusColor(inquiry.status),
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    textTransform: 'capitalize'
                  }}>
                    {inquiry.status}
                  </span>
                </div>
                
                <p style={{ 
                  margin: '0.5rem 0',
                  color: '#64748b',
                  fontSize: '0.9rem'
                }}>
                  <strong>Contact:</strong> {inquiry.contactPerson} ({inquiry.email})
                </p>
                
                <p style={{ 
                  margin: '0.5rem 0',
                  color: '#64748b',
                  fontSize: '0.9rem'
                }}>
                  <strong>Type:</strong> {getEngagementTypeDisplay(inquiry.engagementType)}
                </p>
                
                <p style={{ 
                  margin: '0.5rem 0 0 0',
                  color: '#64748b',
                  fontSize: '0.8rem'
                }}>
                  {new Date(inquiry.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>

        {selectedInquiry && (
          <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '2rem',
            height: 'fit-content',
            position: 'sticky',
            top: '2rem'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ margin: 0, color: '#1e293b' }}>
                Inquiry Details
              </h3>
              <button
                onClick={() => setSelectedInquiry(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>
                {selectedInquiry.organizationName}
              </h4>
              <p style={{ margin: '0.25rem 0', color: '#6b7280' }}>
                <strong>Contact:</strong> {selectedInquiry.contactPerson}
              </p>
              <p style={{ margin: '0.25rem 0', color: '#6b7280' }}>
                <strong>Email:</strong> {selectedInquiry.email}
              </p>
              <p style={{ margin: '0.25rem 0', color: '#6b7280' }}>
                <strong>Type:</strong> {getEngagementTypeDisplay(selectedInquiry.engagementType)}
              </p>
              <p style={{ margin: '0.25rem 0', color: '#6b7280' }}>
                <strong>Date:</strong> {new Date(selectedInquiry.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>Message</h4>
              <div style={{
                background: '#f8fafc',
                padding: '1rem',
                borderRadius: '6px',
                border: '1px solid #e5e7eb'
              }}>
                <p style={{ margin: 0, lineHeight: '1.5', color: '#374151' }}>
                  {selectedInquiry.message}
                </p>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>Status</h4>
              <select
                value={selectedInquiry.status}
                onChange={(e) => handleStatusUpdate(selectedInquiry._id, e.target.value, selectedInquiry.adminNotes)}
                disabled={updating}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px'
                }}
              >
                <option value="new">New</option>
                <option value="confirmed">Confirmed</option>
                <option value="in-discussion">In Discussion</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {selectedInquiry.adminNotes && (
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>Admin Notes</h4>
                <div style={{
                  background: '#fef3c7',
                  padding: '1rem',
                  borderRadius: '6px',
                  border: '1px solid #fbbf24'
                }}>
                  <p style={{ margin: 0, color: '#92400e' }}>
                    {selectedInquiry.adminNotes}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};