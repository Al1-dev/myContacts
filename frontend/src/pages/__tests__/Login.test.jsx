import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Login from '../../pages/Login'
import axios from 'axios'
import { MemoryRouter } from 'react-router-dom'

vi.mock('axios')

describe('Login page', () => {
  it('calls API and stores token on success', async () => {
    axios.post.mockResolvedValueOnce({ data: { token: 't' } })
    const onLogin = vi.fn()
    render(
      <MemoryRouter>
        <Login onLogin={onLogin} />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'a@a.com' } })
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'abcdefghij' } })
    fireEvent.click(screen.getByText('Login'))

    await waitFor(() => expect(onLogin).toHaveBeenCalled())
  })
})


