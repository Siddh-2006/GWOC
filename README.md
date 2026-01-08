# MindSettler - Mental Health Platform

A comprehensive mental health platform with AI-powered chatbot and appointment booking system.

## 🚀 Features

- **User Authentication**: Secure signup/login with email verification
- **AI Chatbot**: Mental health support with safety guardrails
- **Appointment Booking**: Schedule sessions with mental health professionals
- **Admin Dashboard**: Manage bookings, users, and content
- **Mental Health Resources**: Articles, videos, and educational content

## 🛠️ Tech Stack

### Frontend
- React 18 with JavaScript
- Vite for fast development
- React Router for navigation
- Zustand for state management
- Axios for API calls
- Tailwind CSS for styling

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT authentication
- Nodemailer for emails
- Joi for validation
- Bcrypt for password hashing

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Siddh-2006/GWOC.git
cd GWOC
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

3. **Frontend Setup** (new terminal)
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your API URL
npm run dev
```

4. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 🔧 Configuration

### Backend Environment Variables (.env)
```env
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/mindsettler
JWT_ACCESS_SECRET=your-jwt-access-secret
JWT_REFRESH_SECRET=your-jwt-refresh-secret
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
SKIP_EMAIL=true  # For development
FRONTEND_URL=http://localhost:3000
```

### Frontend Environment Variables (.env)
```env
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=MindSettler
```

## 📱 Usage

### User Flow
1. **Sign Up**: Create account with email verification
2. **Verify Email**: Enter OTP sent to email (check console in development)
3. **Sign In**: Login with verified credentials
4. **Dashboard**: Access protected features
5. **Book Appointment**: Schedule mental health sessions
6. **Chat Support**: Use AI-powered mental health chatbot

### Admin Features
- Manage user accounts
- Approve/manage bookings
- Create and manage content
- View analytics and reports

## 🔐 Security Features

- Password hashing with bcrypt
- JWT access tokens (15min expiry)
- JWT refresh tokens (7 days expiry)
- Input validation and sanitization
- CORS protection
- Helmet security headers
- Rate limiting on sensitive endpoints
- Protected routes with role-based access

## 🧪 Testing

### Manual Testing
1. Visit http://localhost:3000
2. Create a new account
3. Check backend console for OTP
4. Verify email and login
5. Test protected routes

### API Testing
```bash
# Health check
curl http://localhost:3001/health

# Test signup
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@example.com","password":"Test123456"}'
```

## 📁 Project Structure

```
mindsettler/
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── features/       # Feature-specific components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service functions
│   │   ├── store/          # Zustand state management
│   │   └── App.jsx         # Main app component
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── src/
│   │   ├── api/            # Route definitions
│   │   ├── controllers/    # Request handlers
│   │   ├── models/         # MongoDB schemas
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Auth & validation
│   │   ├── validation/     # Input validation schemas
│   │   └── index.js        # Server entry point
│   └── package.json
└── README.md
```

## 🚀 Deployment

### Production Deployment
This project is production-ready with Vercel deployment configuration.

**Quick Deploy to Vercel:**
1. Fork this repository
2. Connect to Vercel
3. Deploy frontend and backend separately
4. Configure environment variables
5. Follow the [DEPLOYMENT.md](DEPLOYMENT.md) guide

**Files for Production:**
- `frontend/vercel.json` - Frontend deployment config
- `backend/vercel.json` - Backend deployment config
- `DEPLOYMENT.md` - Complete deployment guide
- `PRODUCTION-CHECKLIST.md` - Pre-deployment checklist
- `.env.template` - Environment variables template

### Environment Setup
1. Copy `.env.template` to `.env`
2. Fill in your production values
3. Never commit `.env` files to git

### Build Commands
```bash
# Frontend production build
cd frontend && npm run build:prod

# Backend production preparation
cd backend && npm run lint

# Full production build
./scripts/build-production.sh
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the production checklist

## 🎯 Roadmap

- [ ] Social login (Google, Facebook)
- [ ] Two-factor authentication
- [ ] Mobile app (React Native)
- [ ] Advanced AI features
- [ ] Telehealth video calls
- [ ] Payment integration
- [ ] Multi-language support

---

**MindSettler** - Your mental health companion 🧠💚