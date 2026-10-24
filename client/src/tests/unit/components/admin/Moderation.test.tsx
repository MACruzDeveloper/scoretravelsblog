import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'
import { paginated } from '@/mocks/handlers'
import { API } from '@/config'
import Moderation from '@/components/admin/Moderation'

const pendingExperiences = [
  { _id: 'e1', title: 'Beach day', user: 'ana', date: '2024-05-01', content: '<p>Sun and <b>sea</b></p>', status: 'pending' },
  { _id: 'e2', title: 'Night out', user: 'luis', date: '2024-06-01', content: 'Party', status: 'pending' },
]

// Pending list plus the review endpoint, recording every decision
const mockModeration = () => {
  const decisions: Array<{ id: string; body: { status: string; reason?: string } }> = []
  server.use(
    http.get(`${API}/experiences`, ({ request }) => {
      const query = new URL(request.url).searchParams
      expect(query.get('scope')).toBe('all')
      expect(query.get('status')).toBe('pending')
      return HttpResponse.json(paginated(pendingExperiences))
    }),
    http.patch(`${API}/experiences/:id/review`, async ({ params, request }) => {
      const body = (await request.json()) as { status: string; reason?: string }
      decisions.push({ id: String(params.id), body })
      return HttpResponse.json({ updated: { _id: params.id, status: body.status } })
    })
  )
  return decisions
}

const renderModeration = () => render(<MemoryRouter><Moderation /></MemoryRouter>)

describe('Moderation', () => {
  it('lists pending experiences with author and a plain text excerpt', async () => {
    mockModeration()
    renderModeration()

    expect(await screen.findByRole('link', { name: 'Beach day' })).toHaveAttribute('href', '/experience/e1')
    expect(screen.getByText('ana')).toBeInTheDocument()
    expect(screen.getByText('Sun and sea')).toBeInTheDocument()
  })

  it('publishes an experience and removes it from the queue', async () => {
    const user = userEvent.setup()
    const decisions = mockModeration()
    renderModeration()

    await screen.findByText('Beach day')
    await user.click(screen.getAllByRole('button', { name: /Publish/ })[0])

    await waitFor(() => expect(screen.queryByText('Beach day')).not.toBeInTheDocument())
    expect(decisions).toEqual([{ id: 'e1', body: { status: 'published' } }])
  })

  it('rejects an experience with a reason', async () => {
    const user = userEvent.setup()
    const decisions = mockModeration()
    renderModeration()

    await screen.findByText('Night out')
    await user.click(screen.getAllByRole('button', { name: /Reject/ })[1])
    await user.type(screen.getByLabelText(/Reason/), 'Inappropriate content')
    await user.click(screen.getByRole('button', { name: 'Confirm rejection' }))

    await waitFor(() => expect(screen.queryByText('Night out')).not.toBeInTheDocument())
    expect(decisions).toEqual([{ id: 'e2', body: { status: 'rejected', reason: 'Inappropriate content' } }])
  })
})
