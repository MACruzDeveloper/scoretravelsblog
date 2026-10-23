const path = require('path')
const { z } = require('zod')
const mongoose = require('mongoose')

// =============== PRIMITIVES =====================
const objectId = z.string().refine((value) => mongoose.isValidObjectId(value), 'Invalid id')
const text = (max) => z.string().trim().min(1).max(max)
const optionalText = (max) => z.string().trim().max(max).optional()
const email = z.string().trim().email().max(254)
const password = z.string().min(8, 'Password must be at least 8 characters').max(128)
const username = z.string().trim().min(3).max(30)
  .regex(/^[\p{L}\p{N}_.-]+$/u, 'Username can only contain letters, numbers, _ . -')
// 'user': registered visitor who can comment and score; 'admin': manages the site
const role = z.enum(['admin', 'user'])
const score = z.number().int().min(1).max(5)
const filename = z.string().trim().min(1).max(255)
  .refine((value) => value === path.basename(value) && !value.includes('..'), 'Invalid filename')

const CONTINENTS = ['africa', 'antarctica', 'asia', 'europe', 'north-america', 'oceania', 'south-america', 'unknown']

const byId = z.object({ _id: objectId })

// =============== USERS =====================
const register = z.object({
  username,
  email,
  password,
  password2: z.string()
}).refine((data) => data.password === data.password2, { message: 'Passwords must match', path: ['password2'] })

// Login does not enforce the password policy so older accounts can still sign in
const login = z.object({
  email,
  password: z.string().min(1).max(128)
})

const addUser = z.object({ username, email, password, role: role.default('user') })
const updateUser = z.object({ _id: objectId, username: username.optional(), role: role.optional() })

// =============== CATEGORIES =====================
const categoryName = text(50).regex(/^[\p{L}\p{N}\s]+$/u, 'Category can only contain letters, numbers and spaces')
const addCategory = z.object({ name: categoryName, description: optionalText(300) })
const updateCategory = addCategory.extend({ _id: objectId })
const deleteCategory = z.object({ name: categoryName })
const categoryParam = z.object({ category: text(50) })

// =============== CITIES =====================
const addCity = z.object({
  name: text(100),
  country: text(100),
  countryCode: z.string().trim().regex(/^[A-Za-z]{2,3}$/, 'Invalid country code').transform((value) => value.toUpperCase()),
  continent: z.enum(CONTINENTS),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180)
})
const continentParam = z.object({ continent: z.enum(CONTINENTS) })
const countryParam = z.object({ country: text(100) })

// =============== EXPERIENCES =====================
const experienceFields = {
  title: text(150),
  category: optionalText(50),
  city: objectId.nullable().optional(),
  image: z.union([filename, z.literal('')]).optional(),
  images: z.array(filename).max(5).optional(),
  content: optionalText(20000),
  date: z.coerce.date().optional()
}
const addExperience = z.object(experienceFields)
const updateExperience = z.object({ _id: objectId, ...experienceFields, title: experienceFields.title.optional() })
const idParam = z.object({ id: objectId })

// =============== COMMENTS =====================
const addComment = z.object({ experience: objectId, content: text(1000) })
const updateComment = z.object({ _id: objectId, content: text(1000) })

// =============== SCORES =====================
const addScore = z.object({ experience: objectId, score })
const updateScore = z.object({ _id: objectId, score })

// =============== IMAGES =====================
const updateImage = z.object({ _id: objectId, featured: z.boolean() })
const deleteImageParams = z.object({ _id: objectId, filename })
const uploadImage = z.object({ title: optionalText(150) })

// =============== EMAILS =====================
const sendEmail = z.object({
  name: text(100),
  email,
  subject: optionalText(200),
  message: text(5000),
  // Honeypot: hidden field that humans leave empty
  website: z.string().max(200).optional()
})

module.exports = {
  byId,
  register, login, addUser, updateUser,
  addCategory, updateCategory, deleteCategory, categoryParam,
  addCity, continentParam, countryParam,
  addExperience, updateExperience, idParam,
  addComment, updateComment,
  addScore, updateScore,
  updateImage, deleteImageParams, uploadImage,
  sendEmail
}
