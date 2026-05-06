'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { useCart } from '../context/cartcontext'

export default function Navbar() {
  const { count, setIsOpen } = useCart()
  const countRef = useRef(null)
  const prevCount = useRef(count)

  useEffect(() => {
    if (count > prevCount.current && countRef.current) {
      countRef.current.classList.add('pop')
      setTimeout(() => countRef.current?.classList.remove('pop'), 300)
    }
    prevCount.current = count
  }, [count])

  return (
    <nav className="nav">
      <Link href="/" className="nav-logo">
        DRICO<small>by jakeable_</small>
      </Link>
      <ul className="nav-links">
        <li><Link href="/#why">Craftsmanship</Link></li>
        <li><Link href="/#shop">Shop</Link></li>
        <li><Link href="/#reviews">Reviews</Link></li>
      </ul>
      <button className="cart-btn" onClick={() => setIsOpen(true)}>
        Cart
        <span className="cart-count" ref={countRef}>{count}</span>
      </button>
    </nav>
  )
}