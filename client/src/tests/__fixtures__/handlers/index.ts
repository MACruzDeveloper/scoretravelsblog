/**
 * Índice central de todos los handlers MSW
 * Exporta handlers agrupados para uso en tests
 */

import { authHandlers } from './authHandlers'
import { experiencesHandlers } from './experiencesHandlers'
import { categoriesHandlers } from './categoriesHandlers'
import { commentsHandlers } from './commentsHandlers'

export const allHandlers = [
  ...authHandlers,
  ...experiencesHandlers,
  ...categoriesHandlers,
  ...commentsHandlers,
]

export { authHandlers, experiencesHandlers, categoriesHandlers, commentsHandlers }
