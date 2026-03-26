import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BreakOverlay } from '@/components/timer/BreakOverlay'

describe('BreakOverlay', () => {
  it('renders short_break label', () => {
    render(<BreakOverlay mode="short_break" onSkip={() => {}} />)
    expect(screen.getByText(/Short Break/i)).toBeInTheDocument()
  })

  it('renders Long Break when mode is long_break', () => {
    render(<BreakOverlay mode="long_break" onSkip={() => {}} />)
    expect(screen.getByText(/Long Break/i)).toBeInTheDocument()
  })

  it('calls onSkip when Skip Break button is clicked', () => {
    const onSkip = vi.fn()
    render(<BreakOverlay mode="short_break" onSkip={onSkip} />)
    const skipButton = screen.getByText(/Skip Break/i)
    fireEvent.click(skipButton)
    expect(onSkip).toHaveBeenCalled()
  })
})
