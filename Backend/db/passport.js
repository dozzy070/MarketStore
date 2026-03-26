// backend/db/passport.js
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import pool from './db.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

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
    process.env.JWT_SECRET || 'your-secret-key-change-this',
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

        const email = profile.emails?.[0]?.value;
        if (!email) {
          console.error('❌ No email found in Google profile');
          return done(new Error('No email found from Google profile'), null);
        }

        // Check if user already exists
        let userResult = await client.query(
          'SELECT * FROM users WHERE email = $1',
          [email]
        );

        let user;

        if (userResult.rows.length > 0) {
          user = userResult.rows[0];
          console.log(`✅ Existing user found: ${email}`);

          // Update Google ID and avatar if they are not set
          const updates = [];
          const values = [];
          let idx = 1;

          if (!user.google_id) {
            updates.push(`google_id = $${idx++}`);
            values.push(profile.id);
          }
          if (!user.avatar && profile.photos?.[0]?.value) {
            updates.push(`avatar = $${idx++}`);
            values.push(profile.photos[0].value);
          }
          if (updates.length) {
            updates.push(`updated_at = NOW()`);
            values.push(user.id);
            await client.query(
              `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx}`,
              values
            );
            // Refresh user data after update
            userResult = await client.query(
              'SELECT * FROM users WHERE id = $1',
              [user.id]
            );
            user = userResult.rows[0];
          }
        } else {
          // Create new user
          const fullName = profile.displayName || email.split('@')[0];
          const avatar = profile.photos?.[0]?.value || null;
          const result = await client.query(
            `INSERT INTO users (
              full_name,
              email,
              google_id,
              avatar,
              role,
              verified,
              provider,
              provider_id,
              created_at,
              updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
            RETURNING *`,
            [
              fullName,
              email,
              profile.id,
              avatar,
              'user',           // default role
              true,              // Google users are automatically verified
              'google',
              profile.id
            ]
          );
          user = result.rows[0];
          console.log(`✅ New user created: ${email}`);
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