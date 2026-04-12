// @ts-nocheck
import { render } from "@testing-library/react"
import { checkFileSize } from "@utils/utils"

const renderWithContext = (ui, options) =>
  render(ui, { wrapper: checkFileSize, ...options })

// re-export everything
export * from "@testing-library/react"

// override render method
export { renderWithContext as render }
