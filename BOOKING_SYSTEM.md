# Session Booking System

## Overview
Complete end-to-end session booking system for MindSettler with user authentication, admin confirmation workflow, email notifications, and automated reminders.

## Features

### User Features
- **Authentication Required**: Users must be logged in to book sessions
- **Comprehensive Booking Form**:
  - Personal information (name, email, phone, number of people)
  - Relationship status (single, married, couple, divorced, other)
  - Session content (topics to discuss, concerns, goals)
  - Session mode selection (online/offline)
  - Location preference for offline sessions
- **Movie Theater-Style Slot Selection**: Date picker with available time slots
- **Real-time Pricing**: Different pricing for online (₹1,200) and offline (₹1,500) sessions
- **Booking Status Tracking**: View all bookings with status updates
- **Email Notifications**: Confirmation and reminder emails

### Admin Features
- **Booking Management Dashboard**: View all booking requests
- **Detailed Booking Information**: Complete client and session details
- **Confirmation Workflow**: 
  - Set confirmed date/time
  - Add meeting links for online sessions
  - Add admin notes
- **Email Notifications**: Automatic notifications to admin for new bookings
- **Status Management**: Confirm, cancel, or update booking status

### Automated Features
- **Email Notifications**:
  - Booking request confirmation to user
  - New booking notification to admin
  - Booking confirmation with session details
  - 10-minute reminder before session
- **Slot Management**: Automatic slot availability updates
- **Payment Tracking**: Payment status and amount tracking

## Technical Implementation

### Backend Models

#### Booking Model (`GWOC/backend/src/models/Booking.model.js`)
```javascript
{
  userId: ObjectId,           // Reference to user
  slotId: ObjectId,          // Reference to time slot
  personalInfo: {
    name: String,
    email: String,
    phone: String,
    numberOfPeople: Number,
    relationshipStatus: String,
    relationshipStatusOther: String
  },
  sessionContent: {
    topics: String,           // What to discuss
    concerns: String,         // What they're going through
    goals: String            // Session goals
  },
  sessionMode: String,       // 'online' or 'offline'
  location: String,          // For offline sessions
  status: String,            // 'pending', 'confirmed', 'cancelled', 'completed'
  adminResponse: {
    confirmedDate: Date,
    confirmedTime: String,
    meetingLink: String,
    notes: String,
    confirmedBy: ObjectId,
    confirmedAt: Date
  },
  payment: {
    amount: Number,
    currency: String,
    status: String,
    paymentMethod: String
  },
  notifications: {
    userNotified: Boolean,
    adminNotified: Boolean,
    reminderSent: Boolean,
    confirmationSent: Boolean
  }
}
```

#### Slot Model (`GWOC/backend/src/models/Slot.model.js`)
```javascript
{
  date: Date,
  startTime: String,         // "09:00"
  endTime: String,           // "10:00"
  duration: Number,          // 60 minutes
  isAvailable: Boolean,
  availableModes: [String],  // ['online', 'offline']
  pricing: {
    online: Number,          // 1200
    offline: Number          // 1500
  },
  offlineLocation: {
    address: String,
    instructions: String
  },
  bookingId: ObjectId,       // When booked
  isBlocked: Boolean
}
```

### API Endpoints

#### Public Endpoints
- `GET /api/booking/slots?date=YYYY-MM-DD` - Get available slots

#### Protected Endpoints (User)
- `POST /api/booking` - Create new booking
- `GET /api/booking/user` - Get user's bookings
- `DELETE /api/booking/:bookingId` - Cancel booking

#### Admin Endpoints
- `GET /api/booking/admin/all` - Get all bookings
- `PUT /api/booking/admin/confirm/:bookingId` - Confirm booking

### Frontend Components

#### User Components
- `BookingPage.jsx` - 4-step booking process
- `UserBookings.jsx` - View and manage user's bookings

#### Admin Components
- `AdminDashboard.jsx` - Comprehensive admin interface with booking management

### Email Services

#### Booking Email Service (`GWOC/backend/src/services/booking-email.service.js`)
- `sendBookingConfirmation()` - User confirmation emails
- `sendBookingNotification()` - Admin notification emails
- `sendBookingReminder()` - 10-minute session reminders

## Setup Instructions

### 1. Database Setup
```bash
# Create test slots
cd GWOC/backend
node scripts/create-slots.js
```

### 2. Environment Variables
```env
# Email configuration (required for notifications)
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-app-password
ADMIN_EMAIL=admin@mindsettler.com

# Database
MONGODB_URI=mongodb://localhost:27017/mindsettler
```

### 3. Automated Reminders
Set up a cron job to run reminder script:
```bash
# Run every minute to check for upcoming sessions
* * * * * cd /path/to/GWOC/backend && node scripts/send-reminders.js
```

### 4. Admin User Setup
```bash
# Make a user admin
cd GWOC/backend
node scripts/make-user-admin.js user@example.com
```

## Usage Flow

### User Booking Flow
1. User logs in and navigates to `/booking`
2. Selects date and available time slot
3. Fills personal information form
4. Provides session details (topics, concerns, goals)
5. Chooses session mode (online/offline)
6. Agrees to terms and submits booking
7. Receives confirmation email
8. Can view booking status at `/my-bookings`

### Admin Confirmation Flow
1. Admin receives email notification of new booking
2. Reviews booking details in admin dashboard
3. Confirms booking with:
   - Final date/time
   - Meeting link (for online sessions)
   - Additional notes
4. User receives confirmation email with session details
5. 10-minute reminder sent automatically before session

## Key Features Implemented

✅ **User Authentication**: Login required for booking  
✅ **Comprehensive Form**: All required fields including relationship status  
✅ **Time Slot Selection**: Movie theater-style date/time picker  
✅ **Session Mode**: Online/offline with different pricing  
✅ **Admin Workflow**: Complete booking management dashboard  
✅ **Email Notifications**: All stakeholders notified appropriately  
✅ **Automated Reminders**: 10-minute session reminders  
✅ **Payment Tracking**: Amount and status tracking  
✅ **Status Management**: Complete booking lifecycle  

## Testing

### Test Data
- 40 test slots created for next 5 weekdays
- Time slots: 9 AM - 9 PM with breaks
- Pricing: ₹1,200 (online), ₹1,500 (offline)

### Test Scenarios
1. **User Booking**: Complete booking flow from slot selection to confirmation
2. **Admin Management**: Review and confirm bookings
3. **Email Notifications**: Test all email types
4. **Reminder System**: Test automated reminders
5. **Cancellation**: Test booking cancellation flow

## Future Enhancements

- **Payment Integration**: UPI/Card payment processing
- **Calendar Integration**: Google Calendar sync
- **SMS Notifications**: WhatsApp/SMS reminders
- **Recurring Sessions**: Weekly/monthly session booking
- **Therapist Assignment**: Multiple therapist support
- **Video Call Integration**: Built-in video calling
- **Session Notes**: Post-session notes and feedback
- **Analytics Dashboard**: Booking statistics and insights