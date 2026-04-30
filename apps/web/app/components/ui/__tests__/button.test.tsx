import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { Button } from '../button'

describe('Button', () => {
  it('renders children text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click</Button>)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('does not call onClick when disabled', async () => {
    const onClick = vi.fn()
    render(<Button disabled onClick={onClick}>Click</Button>)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('does not call onClick when loading', async () => {
    const onClick = vi.fn()
    render(<Button loading onClick={onClick}>Click</Button>)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('shows loading spinner when loading', () => {
    render(<Button loading>Loading</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Loading')
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('applies variant classes', () => {
    const { rerender } = render(<Button variant="primary">Btn</Button>)
    expect(screen.getByRole('button').className).toContain('bg-primary')

    rerender(<Button variant="destructive">Btn</Button>)
    expect(screen.getByRole('button').className).toContain('red')

    rerender(<Button variant="outline">Btn</Button>)
    expect(screen.getByRole('button').className).toContain('border')

    rerender(<Button variant="ghost">Btn</Button>)
    expect(screen.getByRole('button').className).toContain('hover:bg-primary')
  })

  it('applies size classes', () => {
    const { rerender } = render(<Button size="sm">Btn</Button>)
    expect(screen.getByRole('button').className).toContain('h-9')

    rerender(<Button size="lg">Btn</Button>)
    expect(screen.getByRole('button').className).toContain('h-11')

    rerender(<Button size="icon">Btn</Button>)
    expect(screen.getByRole('button').className).toContain('h-10 w-10')
  })

  it('renders as span when asChild is true', () => {
    render(<Button asChild>Span</Button>)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.getByText('Span').tagName).toBe('SPAN')
  })

  it('forwards ref', () => {
    const ref = vi.fn()
    render(<Button ref={ref}>Btn</Button>)
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLButtonElement))
  })
})
