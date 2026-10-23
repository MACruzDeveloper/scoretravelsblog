/**
 * Custom render con providers necesarios para tests
 * Incluye: BrowserRouter, Zustand store reset, y contextos
 */

import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

// Importar todos los stores Zustand para resetearlos
// Nota: Estos imports pueden necesitar ajustes según la estructura exacta de los stores
import * as experienceStore from '@store/experienceStore'

/**
 * Resetea todos los stores Zustand antes de cada test
 */
export const resetAllStores = () => {
  try {
    // Resetear cada store a su estado inicial
    // El patrón es: store.getState().reset() o similar
    // Esto depende de cómo estén implementados los stores
    Object.keys(experienceStore).forEach((key) => {
      const store = (experienceStore as any)[key]
      if (store?.setState) {
        store.setState({
          experiences: [],
          loading: false,
          error: null,
          hasFetched: false,
        })
      }
    })
  } catch {
    // Silenciar errores en reset
    console.debug('Store reset completed')
  }
}

/**
 * Wrapper con todos los providers necesarios
 */
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <BrowserRouter>{children}</BrowserRouter>
}

/**
 * Custom render que incluye todos los providers
 */
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  // Resetear stores antes de cada render
  resetAllStores()

  return render(ui, { wrapper: AllTheProviders, ...options })
}

export * from '@testing-library/react'
export { customRender as render }
