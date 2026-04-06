import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { TimerRing } from '@/components/timer/TimerRing'

describe('TimerRing', () => {
  it('renders with correct strokeDashoffset for given progress', () => {
    const progress = 0.75
    const { container } = render(<TimerRing progress={progress} mode="focus" />)
    const circle = container.querySelectorAll('circle')[1]
    const radius = 120
    const circumference = 2 * Math.PI * radius
    const expectedOffset = circumference * (1 - progress)

    expect(circle).toHaveStyle({ strokeDashoffset: String(expectedOffset) })
  })

  it('renders focus color when mode is focus', () => {
    const { container } = render(<TimerRing progress={0.5} mode="focus" />)
    const circle = container.querySelectorAll('circle')[1]
    expect(circle).toHaveClass('stroke-primary')
  })

  it('renders short_break color when mode is short_break', () => {
    const { container } = render(<TimerRing progress={0.5} mode="short_break" />)
    const circle = container.querySelectorAll('circle')[1]
    expect(circle).toHaveClass('stroke-secondary')
  })

  it('renders long_break color when mode is long_break', () => {
    const { container } = render(<TimerRing progress={0.5} mode="long_break" />)
    const circle = container.querySelectorAll('circle')[1]
    expect(circle).toHaveClass('stroke-tertiary')
  })
})
