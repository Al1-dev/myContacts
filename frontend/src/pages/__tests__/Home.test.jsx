import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Home from '../../pages/Home'

vi.stubGlobal('localStorage', {
  getItem: vi.fn((k) => (k === 'isConnected' ? 'false' : null)),
  setItem: vi.fn(),
  removeItem: vi.fn()
})

describe('Home page', () => {
  it('shows login prompt when not connected', () => {
    render(<Home />)
    expect(screen.getByText('This is a website to manage phone contacts, please login')).toBeInTheDocument()
  })
})


