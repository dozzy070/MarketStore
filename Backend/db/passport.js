// backend/db/passport.js
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import pool from './db.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { getJwtSecret } from '../utils/jwtSecret.js';

dotenv.config(); // Ensure environment variables are loaded

// Check for required environment variables at startup
const requiredEnv = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_CALLBACK_URL'];
requiredEnv.forEach(key => {
  if (!process.env[key]) {
    console.error(`❌ Missing required environment variable: ${key}`);
  }
});

/**
 * Generate a JWT token for the user
 * @param {Object} user - User object from database
 * @returns {string} JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      isVendor: user.is_vendor || false,
      isAdmin: user.is_admin || false
    },
    getJwtSecret(),
    { expiresIn: '7d' }
  );
};

// Configure Google OAuth strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      passReqToCallback: true
    },
    async (req, accessToken, refreshToken, profile, done) => {
      const client = await pool.connect();

      try {
        console.log('📱 Google Profile received:', profile.displayName, profile.emails?.[0]?.value);

        const email = profile.emails?.[0]?.value?.trim().toLowerCase();
        if (!email || profile._json?.email_verified !== true) {
          console.error('❌ No email found in Google profile');
          return done(null, false);
        }

        const userResult = await client.query(`
          SELECT u.*, va.status AS vendor_status
          FROM users u
          LEFT JOIN LATERAL (
            SELECT status
            FROM vendor_applications
            WHERE user_id = u.id
            ORDER BY created_at DESC
            LIMIT 1
          ) va ON true
          WHERE u.email = $1 AND u.google_id = $2
        `, [email, profile.id]);

        const user = userResult.rows[0];
        if (!user) return done(null, false);
        if ((user.role === 'vendor' || user.is_vendor) &&
            (user.vendor_status === 'rejected' ||
             (user.vendor_status !== 'approved' && !(user.vendor_status == null && user.verified)))) {
          return done(null, false);
        }

        if (!user.avatar && profile.photos?.[0]?.value) {
          await client.query(
            'UPDATE users SET avatar = $1, updated_at = NOW() WHERE id = $2',
            [profile.photos[0].value, user.id]
          );
          user.avatar = profile.photos[0].value;
        }

        // Generate JWT token and attach to user object
        const token = generateToken(user);
        user.token = token;

        return done(null, user);
      } catch (error) {
        console.error('❌ Google OAuth Strategy Error:', error);
        return done(error, null);
      } finally {
        client.release();
      }
    }
  )
);

// Serialize user to store only the ID in the session (if you use sessions)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT id, full_name, email, role, is_vendor, is_admin, verified, avatar 
       FROM users WHERE id = $1`,
      [id]
    );
    done(null, result.rows[0] || null);
  } catch (error) {
    done(error, null);
  } finally {
    client.release();
  }
});

// Export the generateToken function if needed elsewhere
export { generateToken };
export default passport;