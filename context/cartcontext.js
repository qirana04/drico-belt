'use client'

import { createContext, useContext, useState, useCallback } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [isOpen, setIsOpen] = useState(false)

  const addItem = useCallback((product) => {
    setItems(prev => {
      const existing = prev.find(
        i => i.id === product.id && i.variant === product.variant
      )
      if (existing) {
        return prev.map(i =>
          i.id === product.id && i.variant === product.variant
            ? { ...i, qty: i.qty + (product.qty || 1) }
            : i
        )
      }
      return [...prev, { ...product, qty: product.qty || 1 }]
    })
  }, [])

  const removeItem = useCallback((id, variant) => {
    setItems(prev => prev.filter(i => !(i.id === id && i.variant === variant)))
  }, [])

  const updateQty = useCallback((id, variant, deltaOrValue) => {
    setItems(prev => prev.map(i => {
      if (i.id === id && i.variant === variant) {
        const nextQty = typeof deltaOrValue === 'function'
          ? deltaOrValue(i.qty)
          : deltaOrValue
        return { ...i, qty: Math.max(1, nextQty) }
      }
      return i
    }))
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0)
  const count = items.reduce((sum, i) => sum + i.qty, 0)

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, updateQty, clearCart,
      total, count, isOpen, setIsOpen
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}