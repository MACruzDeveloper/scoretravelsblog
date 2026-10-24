// Single place where environment variables are read and validated.
// The rest of the server imports values from here, never from process.env.
require('dotenv').config({ quiet: true })

const path = require('path')
const { z } = require('zod')

const list = (value) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3040),
  ATLAS_URL: z
    .string()
    .min(1, 'is required')
    .regex(/^mongodb(\+srv)?:\/\//, 'must be a MongoDB connection string'),
  JWT_SECRET: z.string().min(1, 'is required'),
  CORS_ORIGINS: z.string().default('http://localhost:5173,http://127.0.0.1:5173').transform(list),
  // Number of reverse proxies in front of the app (e.g. 1 behind nginx); empty means none
  TRUST_PROXY: z
    .string()
    .optional()
    .transform((value) => (value ? Number(value) || 1 : 0)),
  UPLOADS_DIR: z
    .string()
    .optional()
    .transform((value) => value || path.join(__dirname, 'uploads', 'images')),
  // Built client served by Express (the e2e tests use their own build)
  CLIENT_DIST_DIR: z
    .string()
    .optional()
    .transform((value) => value || path.join(__dirname, '..', 'client', 'dist')),
  // Public address of the site for the sitemap and social previews; defaults to the request host
  SITE_URL: z
    .url()
    .optional()
    .transform((value) => value?.replace(/\/+$/, '')),
  SMTP_HOST: z.string().default('smtp-relay.brevo.com'),
  SMTP_PORT: z.coerce.number().int().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
  SMTP_TO: z.string().optional(),
})

// Empty values in .env ("SMTP_USER=") count as not set
const rawEnv = Object.fromEntries(Object.entries(process.env).filter(([, value]) => value !== ''))
const parsed = envSchema.safeParse(rawEnv)

if (!parsed.success) {
  console.error('ERROR: Invalid environment configuration (server/.env):')
  parsed.error.issues.forEach((issue) => console.error(`  - ${issue.path.join('.')}: ${issue.message}`))
  process.exit(1)
}

const env = parsed.data

if (env.JWT_SECRET.length < 32) {
  console.warn('WARNING: JWT_SECRET should be at least 32 characters long')
}

module.exports = {
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',
  port: env.PORT,
  mongoUrl: env.ATLAS_URL,
  jwtSecret: env.JWT_SECRET,
  corsOrigins: env.CORS_ORIGINS,
  trustProxy: env.TRUST_PROXY,
  uploadsDir: env.UPLOADS_DIR,
  clientDistDir: env.CLIENT_DIST_DIR,
  siteUrl: env.SITE_URL,
  smtp: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
    from: env.SMTP_FROM || env.SMTP_USER,
    to: env.SMTP_TO || env.SMTP_FROM || env.SMTP_USER,
  },
}
