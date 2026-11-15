// backend/db/passport.js
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import pool from './db.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import dotenv from 'dotenv';
import { getJwtSecret } from '../utils/jwtSecret.js';
import { sendWelcomeEmail } from '../services/emailService.js';

dotenv.config(); // Ensure environment variables are loaded

let googleSchemaPromise;
const ensureGoogleIdentitySchema = () => {
  if (!googleSchemaPromise) {
    googleSchemaPromise = pool.query(
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id TEXT'
    ).then(() => pool.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS users_google_id_unique
       ON users (google_id)
       WHERE google_id IS NOT NULL`
    )).then(() => undefined).catch(error => {
      googleSchemaPromise = undefined;
      throw error;
    });
  }
  return googleSchemaPromise;
};

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
      let client;
      let transactionStarted = false;

      try {
        const email = profile.emails?.[0]?.value?.trim().toLowerCase();
        if (!email || profile._json?.email_verified !== true) {
          return done(null, false);
        }

        await ensureGoogleIdentitySchema();
        client = await pool.connect();
        await client.query('BEGIN');
        transactionStarted = true;

        let userResult = await client.query(`
          SELECT u.*, va.status AS vendor_status
          FROM users u
          LEFT JOIN LATERAL (
            SELECT status
            FROM vendor_applications
            WHERE user_id = u.id
            ORDER BY created_at DESC
            LIMIT 1
          ) va ON true
          WHERE u.email = $1
          FOR UPDATE OF u
        `, [email]);

        let user = userResult.rows[0];
        let created = false;

        if (!user) {
          const randomPassword = await bcrypt.hash(randomBytes(32).toString('hex'), 10);
          userResult = await client.query(`
            INSERT INTO users (full_name, email, password, google_id, role, is_vendor, verified, avatar, created_at)
            VALUES ($1, $2, $3, $4, 'user', false, true, $5, NOW())
            ON CONFLICT (email) DO NOTHING
            RETURNING *, NULL::text AS vendor_status
          `, [profile.displayName || email.split('@')[0], email, randomPassword, profile.id, profile.photos?.[0]?.value || null]);
          user = userResult.rows[0];
          created = Boolean(user);

          if (!user) {
            userResult = await client.query(`
              SELECT u.*, va.status AS vendor_status
              FROM users u
              LEFT JOIN LATERAL (
                SELECT status
                FROM vendor_applications
                WHERE user_id = u.id
                ORDER BY created_at DESC
                LIMIT 1
              ) va ON true
              WHERE u.email = $1
              FOR UPDATE OF u
            `, [email]);
            user = userResult.rows[0];
          }
        }

        if (!user || (user.google_id && user.google_id !== profile.id)) {
          await client.query('ROLLBACK');
          transactionStarted = false;
          return done(null, false);
        }

        if (!user.google_id || (!user.avatar && profile.photos?.[0]?.value)) {
          const updatedUser = await client.query(
            `UPDATE users
             SET google_id = COALESCE(google_id, $1),
                 verified = true,
                 avatar = COALESCE(avatar, $2),
                 updated_at = NOW()
             WHERE id = $3
             RETURNING *`,
            [profile.id, profile.photos?.[0]?.value || null, user.id]
          );
          user = { ...updatedUser.rows[0], vendor_status: user.vendor_status };
        }

        if ((user.role === 'vendor' || user.is_vendor) &&
            (user.vendor_status === 'rejected' ||
             (user.vendor_status !== 'approved' && !(user.vendor_status == null && user.verified)))) {
          await client.query('ROLLBACK');
          transactionStarted = false;
          return done(null, false);
        }

        await client.query('COMMIT');
        transactionStarted = false;

        if (created) {
          sendWelcomeEmail(user).catch(error => console.error('Google registration welcome email failed:', error));
        }

        const token = generateToken(user);
        user.token = token;

        return done(null, user);
      } catch (error) {
        if (transactionStarted) await client.query('ROLLBACK');
        console.error('Google OAuth strategy error:', error);
        return done(error, null);
      } finally {
        client?.release();
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