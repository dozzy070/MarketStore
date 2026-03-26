// backend/config/passport.js
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import pool from '../db/db.js';
import jwt from 'jsonwebtoken';

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      isVendor: user.is_vendor,
      isAdmin: user.is_admin
    },
    process.env.JWT_SECRET || 'your-secret-key-change-this',
    { expiresIn: '7d' }
  );
};

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
        console.log('Google Profile:', profile);
        
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error('No email found from Google profile'), null);
        }
        
        // Check if user exists
        let userResult = await client.query(
          'SELECT * FROM users WHERE email = $1',
          [email]
        );
        
        let user;
        
        if (userResult.rows.length > 0) {
          user = userResult.rows[0];
          
          // Update Google ID if not set
          if (!user.google_id) {
            await client.query(
              `UPDATE users 
               SET google_id = $1, 
                   avatar = COALESCE($2, avatar),
                   provider = 'google',
                   provider_id = $3,
                   updated_at = NOW()
               WHERE id = $4`,
              [profile.id, profile.photos?.[0]?.value, profile.id, user.id]
            );
          }
        } else {
          // Create new user
          const fullName = profile.displayName || email.split('@')[0];
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
              profile.photos?.[0]?.value || null,
              'user',
              true,
              'google',
              profile.id
            ]
          );
          user = result.rows[0];
        }
        
        // Generate JWT token
        const token = generateToken(user);
        user.token = token;
        
        return done(null, user);
        
      } catch (error) {
        console.error('Google Strategy Error:', error);
        return done(error, null);
      } finally {
        client.release();
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT id, full_name, email, role, is_vendor, is_admin, verified, avatar FROM users WHERE id = $1',
      [id]
    );
    done(null, result.rows[0]);
  } catch (error) {
    done(error, null);
  } finally {
    client.release();
  }
});

export { generateToken };
export default passport;