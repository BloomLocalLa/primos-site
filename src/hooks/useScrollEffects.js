import { useState, useEffect, useCallback } from 'react'

// Hook for detecting scroll direction and position
export function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState('up')
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    let lastScrollY = window.scrollY

    const updateScrollDirection = () => {
      const currentScrollY = window.scrollY
      const direction = currentScrollY > lastScrollY ? 'down' : 'up'

      if (
        direction !== scrollDirection &&
        Math.abs(currentScrollY - lastScrollY) > 10
      ) {
        setScrollDirection(direction)
      }

      setScrollY(currentScrollY)
      lastScrollY = currentScrollY > 0 ? currentScrollY : 0
    }

    window.addEventListener('scroll', updateScrollDirection)
    return () => window.removeEventListener('scroll', updateScrollDirection)
  }, [scrollDirection])

  return { scrollDirection, scrollY }
}

// Hook for detecting if element is in viewport
export function useInViewport(ref, options = {}) {
  const [isInViewport, setIsInViewport] = useState(false)
  const [hasBeenInViewport, setHasBeenInViewport] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting)
        if (entry.isIntersecting) {
          setHasBeenInViewport(true)
        }
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || '0px',
      }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [ref, options.threshold, options.rootMargin])

  return { isInViewport, hasBeenInViewport }
}

// Hook for parallax scroll effects
export function useParallax(speed = 0.5) {
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setOffset(window.scrollY * speed)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [speed])

  return offset
}

// Hook for detecting preferred reduced motion
export function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mediaQuery.matches)

    const handleChange = (e) => {
      setReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return reducedMotion
}

// Hook for scroll-triggered animations
export function useScrollTrigger(threshold = 100) {
  const [triggered, setTriggered] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setTriggered(window.scrollY > threshold)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Check initial state

    return () => window.removeEventListener('scroll', handleScroll)
  }, [threshold])

  return triggered
}

// Hook for smooth scroll to element
export function useSmoothScroll() {
  const scrollTo = useCallback((elementId, offset = 0) => {
    const element = document.getElementById(elementId)
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({
        top,
        behavior: 'smooth',
      })
    }
  }, [])

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }, [])

  return { scrollTo, scrollToTop }
}
