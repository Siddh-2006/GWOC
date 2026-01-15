import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import Auth from '../models/Auth.model.js';
import { User } from '../models/User.model.js';

export const configurePassport = () => {
  // Serialize user for session
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await Auth.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Google OAuth Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth/google/callback',
        scope: ['profile', 'email']
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log('🔐 Google OAuth Profile:', {
            id: profile.id,
            email: profile.emails?.[0]?.value,
            name: profile.displayName
          });

          // Check if user already exists with this Google ID
          let user = await Auth.findOne({ googleId: profile.id });

          if (user) {
            // User exists, update last login
            user.lastLogin = new Date();
            await user.save();
            return done(null, user);
          }

          // Check if user exists with this email (local account)
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('No email provided by Google'), null);
          }

          user = await Auth.findOne({ email });

          if (user) {
            // Link Google account to existing local account
            user.googleId = profile.id;
            user.authProvider = 'google';
            user.isEmailVerified = true;
            user.lastLogin = new Date();
            
            // Update avatar if not set
            if (!user.avatar || user.avatar.includes('flaticon')) {
              user.avatar = profile.photos?.[0]?.value || user.avatar;
            }
            
            await user.save();
            return done(null, user);
          }

          // Create new user
          const names = profile.displayName?.split(' ') || ['', ''];
          const firstName = profile.name?.givenName || names[0] || 'User';
          const lastName = profile.name?.familyName || names.slice(1).join(' ') || '';

          const newUser = new Auth({
            email,
            googleId: profile.id,
            authProvider: 'google',
            firstName,
            lastName,
            avatar: profile.photos?.[0]?.value || 'https://cdn-icons-png.flaticon.com/512/1144/1144760.png',
            isEmailVerified: true,
            isActive: true,
            role: 'user',
            lastLogin: new Date()
          });

          await newUser.save();

          // Create corresponding User profile
          await User.create({
            email,
            name: `${firstName} ${lastName}`,
            role: 'user'
          });

          console.log('✅ New user created via Google OAuth:', email);
          return done(null, newUser);

        } catch (error) {
          console.error('❌ Google OAuth error:', error);
          return done(error, null);
        }
      }
    )
  );
};

export default passport;
