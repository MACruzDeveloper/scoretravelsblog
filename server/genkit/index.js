const { genkit, z } = require('genkit')
const { googleAI } = require('@genkit-ai/google-genai')

// Genkit + Google Gemini instance.
// Reads GEMINI_API_KEY from the environment (server/.env).
const ai = genkit({
  plugins: [googleAI()],
  model: googleAI.model('gemini-3.5-flash'),
})

const mockExperienceInputSchema = z.object({
  categories: z.array(z.string()),
  cityNames: z.array(z.string()),
})

const mockExperienceOutputSchema = z.object({
  title: z.string(),
  content: z.string(),
  category: z.string(),
  city: z.string(), // must match one of the provided cityNames
  score: z.number().min(1).max(5),
})

// Generates a single plausible mock travel experience based on real
// categories and cities present in the database.
const generateMockExperienceFlow = ai.defineFlow(
  {
    name: 'generateMockExperience',
    inputSchema: mockExperienceInputSchema,
    outputSchema: mockExperienceOutputSchema,
  },
  async (input) => {
    const categoriesList = input.categories.join(', ')
    const citiesList = input.cityNames.join(', ')

    const response = await ai.generate({
      model: ai.model,
      output: { format: 'json', schema: mockExperienceOutputSchema },
      prompt: `
You are a travel content creator. Write in ENGLISH.

Generate a fictional but realistic and credible travel experience.

Choose ONE city from this list: ${citiesList}
Choose ONE category from this list: ${categoriesList}

Requirements:
- Title: an attractive, specific title in English.
- Content: a LONG, detailed description in English of about 200-280 words, split into 3-4 short paragraphs, describing places, food, atmosphere and practical tips.
- Score: a number from 1 to 5 (at most 2 decimals) consistent with what you describe.
- City and Category must be copied EXACTLY from the provided lists, with no extra text.

Respond only with JSON of exactly this shape:
{
  "title": "...",
  "content": "...",
  "category": "...",
  "city": "...",
  "score": 4.5
}
`,
    })

    return response.output
  }
)

const CONTINENTS = ['africa', 'antarctica', 'asia', 'europe', 'north-america', 'oceania', 'south-america']

const classifyExperiencesInputSchema = z.object({
  categories: z.array(z.string()).min(1),
  experiences: z.array(z.object({
    id: z.string(),
    title: z.string(),
    content: z.string(),
    // Old category, often a country name, used as a location hint
    hint: z.string().optional(),
  })).min(1),
})

const classifyExperiencesOutputSchema = z.object({
  results: z.array(z.object({
    id: z.string(),
    category: z.string(),
    city: z.string().nullable(),
    country: z.string().nullable(),
    countryCode: z.string().nullable(),
    continent: z.enum(CONTINENTS).nullable(),
  })),
})

// Suggests a category from the given list and the main place of several existing
// experiences in ONE request (the free tier allows very few requests per day).
// Used by scripts/backfill-experiences.js; results are reviewed by hand.
const classifyExperiencesFlow = ai.defineFlow(
  {
    name: 'classifyExperiences',
    inputSchema: classifyExperiencesInputSchema,
    outputSchema: classifyExperiencesOutputSchema,
  },
  async (input) => {
    const posts = input.experiences.map((exp) =>
      `### id: ${exp.id}\nTitle: ${exp.title}\nLocation hint: ${exp.hint || '-'}\nText: ${exp.content}`
    ).join('\n\n')

    const response = await ai.generate({
      output: { format: 'json', schema: classifyExperiencesOutputSchema },
      prompt: `
You classify travel blog posts. Answer only with JSON: { "results": [ ... ] } with one item per post, keeping its id.

For each post:
1. "category": exactly ONE value from this list, copied exactly: ${input.categories.join(' | ')}
   It describes the kind of trip (leisure, couple, solo, cultural, work...), not the place.
2. "city": the main city, town, island or region the post is about, in English. null only if no place can be identified.
3. "country": its country in English, "countryCode": ISO 3166-1 alpha-2 code (e.g. "ES").
4. "continent": one of ${CONTINENTS.join(', ')}.

Posts:

${posts}
`,
    })
    return response.output
  }
)

module.exports = {
  ai,
  generateMockExperienceFlow,
  classifyExperiencesFlow,
}
