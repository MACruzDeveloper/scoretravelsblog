import { z } from 'zod'

// Same rules the server checks (server/utils/schemas.js), so errors show before sending

export const username = z
  .string()
  .trim()
  .min(3, 'Username must have at least 3 characters')
  .max(30, 'Username can have up to 30 characters')
  .regex(/^[\p{L}\p{N}_.-]+$/u, 'Username can only contain letters, numbers, _ . -')
const email = z.string().trim().min(1, 'Write your email').email('Write a valid email').max(254)
const password = z.string().min(8, 'Password must have at least 8 characters').max(128)

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Write your password').max(128),
})

export const registerSchema = z
  .object({ username, email, password, password2: z.string() })
  .refine((data) => data.password === data.password2, { message: 'Passwords must match', path: ['password2'] })

export const contactSchema = z.object({
  name: z.string().trim().min(1, 'Write your name').max(100),
  email,
  message: z.string().trim().min(1, 'Write a message').max(5000),
  accept: z.literal(true, { errorMap: () => ({ message: 'Accept the privacy policy to continue' }) }),
  // Honeypot: hidden field that people leave empty
  website: z.string().max(200).optional(),
})

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Write the category name')
    .max(50)
    .regex(/^[\p{L}\p{N}\s]+$/u, 'The category can only contain letters, numbers and spaces'),
  description: z.string().trim().max(300).optional(),
})

export const commentSchema = z.object({
  content: z.string().trim().min(1, 'Write a comment').max(1000, 'Comments can have up to 1000 characters'),
})

export const experienceSchema = z.object({
  title: z.string().trim().min(1, 'Write a title').max(150),
  content: z.string().trim().min(1, 'Write the content').max(20000),
  category: z.string().trim().max(50).optional(),
})

export type LoginForm = z.infer<typeof loginSchema>
export type RegisterForm = z.infer<typeof registerSchema>
export type ContactForm = z.infer<typeof contactSchema>
export type CategoryForm = z.infer<typeof categorySchema>
export type CommentForm = z.infer<typeof commentSchema>
export type ExperienceForm = z.infer<typeof experienceSchema>

// First validation message, for places that validate without a form (inline table edits)
export const firstIssue = (result: z.SafeParseReturnType<unknown, unknown>) =>
  result.success ? null : result.error.issues[0]?.message ?? 'Invalid data'
