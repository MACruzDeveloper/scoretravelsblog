const { genkit, z } = require('genkit')
const { googleAI } = require('@genkit-ai/google-genai')

// Genkit + Google Gemini instance.
// Reads GEMINI_API_KEY from the environment (server/.env).
const ai = genkit({
  plugins: [googleAI()],
  model: googleAI.model('gemini-3.5-flash'),
})

const CONTINENTS = ['africa', 'antarctica', 'asia', 'europe', 'north-america', 'oceania', 'south-america']

const mockExperiencesInputSchema = z.object({
  continent: z.enum(CONTINENTS),
  count: z.number().int().min(1).max(10),
  categories: z.array(z.string()).min(1),
  // Fictional authors: the model writes each experience in the voice of one of them
  authors: z.array(z.object({ username: z.string(), voice: z.string() })).min(2),
  // Places already covered, to avoid repeating them
  avoidPlaces: z.array(z.string()),
  // Another Gemini model when the default one is busy
  model: z.string().optional(),
})

const mockExperiencesOutputSchema = z.object({
  experiences: z.array(
    z.object({
      title: z.string(),
      paragraphs: z.array(z.string()),
      category: z.string(),
      author: z.string(),
      place: z.object({
        name: z.string(),
        country: z.string(),
        countryCode: z.string(),
        kind: z.enum(['city', 'island', 'region', 'country']),
        // Used when OpenStreetMap does not know the place itself
        nearbyTown: z.string(),
      }),
      // Search terms for Wikimedia Commons, most specific first
      photoSearches: z.array(z.string()),
      score: z.number().int().min(1).max(5),
      comments: z.array(z.object({ author: z.string(), text: z.string() })),
    })
  ),
})

// Generates several fictional travel experiences of one continent in ONE request
// (the free tier allows very few requests per day). Used by scripts/seed-experiences.js
const generateMockExperiencesFlow = ai.defineFlow(
  {
    name: 'generateMockExperiences',
    inputSchema: mockExperiencesInputSchema,
    outputSchema: mockExperiencesOutputSchema,
  },
  async (input) => {
    const authors = input.authors.map((a) => `- ${a.username}: ${a.voice}`).join('\n')

    const response = await ai.generate({
      ...(input.model && { model: googleAI.model(input.model) }),
      output: { format: 'json', schema: mockExperiencesOutputSchema },
      prompt: `
You write content for a travel blog where travellers share and rate their trips. Write in ENGLISH.

Write ${input.count} fictional but realistic travel experiences in ${input.continent}, as { "experiences": [ ... ] }.

Rules:
- Each one in a different country when possible, and NOT about: ${input.avoidPlaces.join(', ') || '-'}.
- Mix big cities with islands, regions or a whole country, and well-known places with less obvious ones.
- "place": a real place. "name" in English as OpenStreetMap names it (e.g. "Naples", "Majorca", "Tuscany"); for a whole country, name = country. "countryCode": ISO 3166-1 alpha-2 (e.g. "FJ"). "nearbyTown": the main city or town in or next to it (e.g. "Sigatoka" for the Coral Coast); for a city, the city itself; for a country, its capital.
- "category": exactly ONE of: ${input.categories.join(' | ')}
- "author": the username of ONE of these authors, written in their voice. Use each author at most twice:
${authors}
- "title": specific and attractive, not clickbait.
- "paragraphs": 3 or 4 paragraphs, 180-260 words in total, first person, with concrete details (places, food, prices, mistakes, practical tips). Not every trip is perfect.
- "score": 1 to 5, consistent with the text (mostly 3-5, sometimes lower).
- "photoSearches": 3 search terms for Wikimedia Commons photos of places in the text, most specific first (e.g. "Fushimi Inari-taisha torii", "Gion Kyoto street").
- "comments": 1 to 3 short, natural comments from OTHER authors of the list (questions, own tips, agreement or polite disagreement).
`,
    })
    return response.output
  }
)

const classifyExperiencesInputSchema = z.object({
  categories: z.array(z.string()).min(1),
  experiences: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        content: z.string(),
        // Old category, often a country name, used as a location hint
        hint: z.string().optional(),
      })
    )
    .min(1),
})

const classifyExperiencesOutputSchema = z.object({
  results: z.array(
    z.object({
      id: z.string(),
      category: z.string(),
      city: z.string().nullable(),
      country: z.string().nullable(),
      countryCode: z.string().nullable(),
      continent: z.enum(CONTINENTS).nullable(),
    })
  ),
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
    const posts = input.experiences
      .map((exp) => `### id: ${exp.id}\nTitle: ${exp.title}\nLocation hint: ${exp.hint || '-'}\nText: ${exp.content}`)
      .join('\n\n')

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
  generateMockExperiencesFlow,
  CONTINENTS,
  classifyExperiencesFlow,
}
