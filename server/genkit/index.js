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
Eres un creador de contenido de viajes. Genera una experiencia de viaje ficticia pero realista y creíble.

Debes elegir UNA ciudad de esta lista: ${citiesList}
Debes elegir UNA categoría de esta lista: ${categoriesList}

Genera un título atractivo, una descripción (contenido) en español de 3-5 frases que describa la experiencia, y una puntuación (score) entre 1 y 5 (2 decimales como mucho) coherente con lo narrado.

Responde únicamente con JSON con esta forma exacta:
{
  "title": "...",
  "content": "...",
  "category": "...",
  "city": "...",
  "score": 4.5
}

IMPORTANTE: "city" y "category" deben ser copiadas EXACTAMENTE de las listas proporcionadas, sin añadir texto extra.
`,
    })

    return response.output
  }
)

module.exports = {
  ai,
  generateMockExperienceFlow,
}
