import pool from '../db/db.js';

let schemaPromise;

export const ensureStoreSchema = async () => {
  if (!schemaPromise) {
    schemaPromise = pool.query(`
      CREATE TABLE IF NOT EXISTS vendor_stores (
        vendor_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        store_name TEXT,
        store_description TEXT,
        store_logo TEXT,
        store_banner TEXT,
        store_email TEXT,
        store_phone TEXT,
        store_address TEXT,
        store_website TEXT,
        social_media JSONB NOT NULL DEFAULT '{}'::jsonb,
        shipping_policy TEXT,
        payment_methods JSONB NOT NULL DEFAULT '[]'::jsonb,
        established TEXT,
        business_hours JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `).then(() => undefined).catch((error) => {
      schemaPromise = undefined;
      throw error;
    });
  }

  await schemaPromise;
};

export const getVendorStore = async (client, vendorId) => {
  const result = await client.query(`
    SELECT
      u.id,
      COALESCE(NULLIF(BTRIM(vs.store_name), ''), NULLIF(BTRIM(va.business_name), ''), u.full_name) AS store_name,
      COALESCE(NULLIF(BTRIM(vs.store_description), ''), NULLIF(BTRIM(va.description), ''), u.store_description, u.bio, '') AS store_description,
      COALESCE(vs.store_logo, '') AS store_logo,
      COALESCE(vs.store_banner, '') AS store_banner,
      COALESCE(NULLIF(vs.store_email, ''), u.email) AS store_email,
      COALESCE(NULLIF(vs.store_phone, ''), u.phone_number, va.business_phone, '') AS store_phone,
      COALESCE(NULLIF(vs.store_address, ''), va.business_address, u.location, '') AS store_address,
      COALESCE(vs.store_website, '') AS store_website,
      COALESCE(vs.social_media, '{}'::jsonb) AS social_media,
      COALESCE(vs.shipping_policy, '') AS shipping_policy,
      COALESCE(vs.payment_methods, '[]'::jsonb) AS payment_methods,
      COALESCE(vs.established, TO_CHAR(u.created_at, 'YYYY')) AS established,
      COALESCE(vs.business_hours, '{}'::jsonb) AS business_hours,
      COALESCE(va.status = 'approved', u.verified, false) AS verified
    FROM users u
    LEFT JOIN LATERAL (
      SELECT business_name, description, business_phone, business_address, status
      FROM vendor_applications
      WHERE user_id = u.id
      ORDER BY created_at DESC
      LIMIT 1
    ) va ON true
    LEFT JOIN vendor_stores vs ON vs.vendor_id = u.id
    WHERE u.id = $1 AND (u.role = 'vendor' OR u.is_vendor = true)
  `, [vendorId]);

  return result.rows[0] || null;
};
