import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import PasswordInput from '@/components/common/PasswordInput'

describe('PasswordInput', () => {
  it('shows and hides the password', async () => {
    const user = userEvent.setup()
    render(<PasswordInput name="password" placeholder="Password" />)
    const input = screen.getByPlaceholderText('Password')

    expect(input).toHaveAttribute('type', 'password')
    await user.click(screen.getByRole('button', { name: 'Show password' }))
    expect(input).toHaveAttribute('type', 'text')
    expect(screen.getByRole('button', { name: 'Hide password' })).toHaveAttribute('aria-pressed', 'true')
    await user.click(screen.getByRole('button', { name: 'Hide password' }))
    expect(input).toHaveAttribute('type', 'password')
  })

  it('does not submit the form when toggled', async () => {
    const user = userEvent.setup()
    let submitted = false
    render(<form onSubmit={(e) => { e.preventDefault(); submitted = true }}><PasswordInput name="password" /></form>)

    await user.click(screen.getByRole('button', { name: 'Show password' }))
    expect(submitted).toBe(false)
  })
})
