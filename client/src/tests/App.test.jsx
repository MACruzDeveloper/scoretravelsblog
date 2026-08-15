import { render, screen } from "@testing-library/react"
//import userEvent from "@testing-library/user-event"
//import { logRoles } from "@testing-library/dom"
import { BrowserRouter } from 'react-router-dom'
import { HttpResponse, http } from 'msw'
import { vi } from 'vitest'
import { server } from "../mocks/server.js"
import Header from '@common/Header.tsx'
import Home from '../components/Home.tsx'
import AllExperiences from '../components/experiences/AllExperiences.tsx'
import { URL } from '../config.js'

// test if there is an accessible heading
test("App contains a main heading", () => {
  const logoutMock = vi.fn()

  render(
    <BrowserRouter>
      <Header isLoggedIn={false} logout={logoutMock} />
    </BrowserRouter>
  )

  const headingElement = screen.getByRole('heading', {
    name: /scoretravelsblog/i,
    level: 1,
  })

  expect(headingElement).toBeInTheDocument()
  expect(screen.getByRole('banner')).toBeInTheDocument()
})


// test if error message appears when server error
test("handle error for AllExperiences component", async () => {
  server.resetHandlers(
    http.get(`${URL}/admin/experiences`, () => {
      return new HttpResponse(null, { status: 500 })
    })
  )

  render(
    <AllExperiences />
  )

  const errorMessage = await screen.findByRole("alert")
  expect(errorMessage).not.toBeEmptyDOMElement()
})


// test if we are logged we can logout

// test if we can add a new experience

// unit testing for some function from utils.js