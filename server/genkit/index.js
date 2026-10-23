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

module.exports = {
  ai,
  generateMockExperienceFlow,
}
