/**
 * Utilidades y helpers compartidos para tests
 * Incluye: mocks para localStorage, Intersection Observer, funciones de formulario
 */

import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

/**
 * Mock localStorage para tests
 */
export const setupLocalStorageMock = () => {
  const store: Record<string, string> = {}

  const mockLocalStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      Object.keys(store).forEach((key) => {
        delete store[key]
      })
    },
    get length() {
      return Object.keys(store).length
    },
    key: (index: number) => Object.keys(store)[index] || null,
  }

  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
  })

  return mockLocalStorage
}

/**
 * Mock Intersection Observer para lazy loading de imágenes
 */
export const setupIntersectionObserverMock = () => {
  class MockIntersectionObserver {
    observe(): void {
      return null
    }
    disconnect(): void {
      return null
    }
    unobserve(): void {
      return null
    }
  }

  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: MockIntersectionObserver,
  })
}

/**
 * Helper para llenar un formulario
 */
export const fillForm = async (
  inputs: Record<string, string>
) => {
  const user = userEvent.setup()
  for (const [label, value] of Object.entries(inputs)) {
    const input = screen.getByLabelText(label)
    await user.clear(input)
    await user.type(input, value)
  }
}

/**
 * Helper para enviar un formulario
 */
export const submitForm = async (buttonText: string = 'Submit') => {
  const user = userEvent.setup()
  const button = screen.getByRole('button', { name: new RegExp(buttonText, 'i') })
  await user.click(button)
}

/**
 * Helper para esperar a que un elemento sea visible
 */
export const waitForElement = async (
  role: string,
  options?: { name?: RegExp | string; timeout?: number }
) => {
  return waitFor(() => screen.getByRole(role, options))
}

/**
 * Helper para verificar que un error se muestra
 */
export const expectErrorMessage = (message: string) => {
  const errorElement = screen.queryByRole('alert')
  if (errorElement) {
    expect(errorElement).toHaveTextContent(message)
  }
}

/**
 * Mock para fetch de API (alternativa a MSW para tests específicos)
 */
export const mockFetch = (
  response: Record<string, any>,
  status: number = 200
) => {
  globalThis.fetch = vi.fn(() =>
    Promise.resolve(
      new Response(JSON.stringify(response), {
        status,
        headers: { 'Content-Type': 'application/json' },
      })
    )
  ) as any
}

/**
 * Restaurar fetch original
 */
export const restoreFetch = () => {
  globalThis.fetch = fetch
}

/**
 * Helper para configuración completa de mocks (localStorage + IntersectionObserver)
 */
export const setupAllMocks = () => {
  setupLocalStorageMock()
  setupIntersectionObserverMock()
}
