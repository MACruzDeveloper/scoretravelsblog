// @ts-nocheck
import { render as rtlRender } from "@testing-library/react"
import { BrowserRouter } from "react-router-dom"

const renderWithProviders = (ui, options = {}) => {
  const Wrapper = ({ children }) => <BrowserRouter>{children}</BrowserRouter>
  return rtlRender(ui, { wrapper: Wrapper, ...options })
}

export * from "@testing-library/react"
export { renderWithProviders as render }
