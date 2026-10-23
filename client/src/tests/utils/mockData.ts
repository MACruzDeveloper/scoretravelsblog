/**
 * Mock Data Factories
 * Helpers para generar datos de prueba consistentes
 */

export interface MockDataOptions {
  count?: number
  overrides?: Record<string, unknown>
}

/**
 * Genera un ID único para tests
 */
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9)
}

/**
 * Factory para generar arrays de datos
 */
export const generateArray = <T>(
  factory: (index: number) => T,
  count: number = 5
): T[] => {
  return Array.from({ length: count }, (_, index) => factory(index))
}

/**
 * Helper para generar números aleatorios entre min y max
 */
export const randomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Helper para generar emails de prueba
 */
export const generateEmail = (index: number = 0): string => {
  return `user${index}@test.com`
}

/**
 * Helper para generar nombres
 */
export const generateName = (index: number = 0): string => {
  const firstNames = ['John', 'Jane', 'Bob', 'Alice', 'Charlie']
  const lastNames = ['Doe', 'Smith', 'Johnson', 'Williams', 'Brown']
  return `${firstNames[index % firstNames.length]} ${lastNames[index % lastNames.length]}`
}

/**
 * Helper para generar fechas ISO
 */
export const generateDate = (daysAgo: number = 0): string => {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date.toISOString()
}

/**
 * Helper para generar URLs de imágenes
 */
export const generateImageUrl = (index: number = 0): string => {
  return `https://via.placeholder.com/300x200?text=Image+${index}`
}

/**
 * Factory para crear objeto de respuesta de API
 */
export const createApiResponse = <T>(data: T, success: boolean = true) => ({
  success,
  data,
  message: success ? 'Success' : 'Error',
})

/**
 * Factory para error de API
 */
export const createApiError = (message: string, status: number = 500) => ({
  success: false,
  message,
  status,
})
