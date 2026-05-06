'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useCart } from '../context/cartcontext'

const PAYMENT_METHODS = [
  { id: 'gopay',    logo: 'G', name: 'GoPay' },
  { id: 'ovo',      logo: 'O', name: 'OVO' },
  { id: 'dana',     logo: 'D', name: 'DANA' },
  { id: 'shopee',   logo: 'S', name: 'ShopeePay' },
  { id: 'bca',      logo: 'B', name: 'BCA Virtual' },
  { id: 'mandiri',  logo: 'M', name: 'Mandiri' },
]

function fmt(n) {
  return 'Rp ' + n.toLocaleString('id-ID')
}

export default function CartDrawer() {
  const { items, removeItem, clearCart, total, isOpen, setIsOpen } = useCart()

  const [showCheckout, setShowCheckout] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [selectedPay, setSelectedPay] = useState('gopay')
  const [orderId, setOrderId] = useState('')
  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '', city: '', zip: ''
  })
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setErrors(er => ({ ...er, [e.target.name]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim())    e.name = 'Required'
    if (!form.email.trim())   e.email = 'Required'
    if (!form.phone.trim())   e.phone = 'Required'
    if (!form.address.trim()) e.address = 'Required'
    if (!form.city.trim())    e.city = 'Required'
    if (!form.zip.trim())     e.zip = 'Required'
    return e
  }

  const placeOrder = () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    const id = 'DRC-' + Date.now().toString().slice(-6)
    setOrderId(id)
    setShowSuccess(true)
    clearCart()
  }

  const closeAll = () => {
    setIsOpen(false)
    setShowCheckout(false)
    setShowSuccess(false)
    setForm({ name:'', email:'', phone:'', address:'', city:'', zip:'' })
    setErrors({})
  }

  const openCheckout = () => {
    setIsOpen(false)
    setShowCheckout(true)
  }

  const payMethod = PAYMENT_METHODS.find(p => p.id === selectedPay)

  return (
    <>
      {/* Cart overlay + drawer */}
      <div
        className={`cart-overlay ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(false)}
      />
      <div className={`cart-drawer ${isOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <div className="drawer-title">Your Cart</div>
          <button className="drawer-close" onClick={() => setIsOpen(false)}>
            Close ×
          </button>
        </div>

        <div className="cart-items">
          {items.length === 0 ? (
            <div className="cart-empty">Your cart is empty.</div>
          ) : (
            items.map((item, i) => (
              <div className="cart-item" key={`${item.id}-${item.variant}-${i}`}>
                <div className="ci-img">
                  <Image
                    src="/belt-hero.png"
                    alt={item.name}
                    width={68} height={52}
                    style={{ objectFit: 'cover', filter: 'brightness(0.68)', width: '100%', height: '100%' }}
                  />
                </div>
                <div className="ci-info">
                  <div className="ci-name">{item.name}</div>
                  <div className="ci-sub">{item.variant} · Qty {item.qty}</div>
                  <button
                    className="ci-remove"
                    onClick={() => removeItem(item.id, item.variant)}
                  >
                    Remove
                  </button>
                </div>
                <div className="ci-price">{fmt(item.price * item.qty)}</div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-footer">
            <div className="cart-subtotal">
              <span>Subtotal</span>
              <span>{fmt(total)}</span>
            </div>
            <div className="cart-total">
              <div className="ct-label">Total</div>
              <div className="ct-val">{fmt(total)}</div>
            </div>
            <button className="btn-checkout" onClick={openCheckout}>
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>

      {/* Checkout modal */}
      <div className={`modal-overlay ${showCheckout ? 'open' : ''}`}>
        <div className="modal">
          {!showSuccess ? (
            <>
              <div className="modal-h">Checkout</div>
              <div className="modal-sub">Complete your order — DRICO Signature Belt</div>

              {/* Order summary */}
              <div className="modal-order-summary">
                {items.map((item, i) => (
                  <div className="mos-row" key={i}>
                    <span>{item.name} ({item.variant}) × {item.qty}</span>
                    <span>{fmt(item.price * item.qty)}</span>
                  </div>
                ))}
                <div className="mos-row mos-total">
                  <span>Total</span>
                  <span><strong>{fmt(total)}</strong></span>
                </div>
              </div>

              {/* Form */}
              <div className="form-row">
                <label className="form-label">Full Name</label>
                <input
                  className="form-input"
                  name="name" value={form.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  style={errors.name ? { borderColor: '#c0392b' } : {}}
                />
              </div>
              <div className="form-grid2">
                <div className="form-row">
                  <label className="form-label">Email</label>
                  <input
                    className="form-input"
                    name="email" type="email" value={form.email}
                    onChange={handleChange}
                    placeholder="email@domain.com"
                    style={errors.email ? { borderColor: '#c0392b' } : {}}
                  />
                </div>
                <div className="form-row">
                  <label className="form-label">Phone</label>
                  <input
                    className="form-input"
                    name="phone" type="tel" value={form.phone}
                    onChange={handleChange}
                    placeholder="08xx"
                    style={errors.phone ? { borderColor: '#c0392b' } : {}}
                  />
                </div>
              </div>
              <div className="form-row">
                <label className="form-label">Shipping Address</label>
                <input
                  className="form-input"
                  name="address" value={form.address}
                  onChange={handleChange}
                  placeholder="Full address"
                  style={errors.address ? { borderColor: '#c0392b' } : {}}
                />
              </div>
              <div className="form-grid2">
                <div className="form-row">
                  <label className="form-label">City</label>
                  <input
                    className="form-input"
                    name="city" value={form.city}
                    onChange={handleChange}
                    placeholder="City"
                    style={errors.city ? { borderColor: '#c0392b' } : {}}
                  />
                </div>
                <div className="form-row">
                  <label className="form-label">Postal Code</label>
                  <input
                    className="form-input"
                    name="zip" value={form.zip}
                    onChange={handleChange}
                    placeholder="12345"
                    style={errors.zip ? { borderColor: '#c0392b' } : {}}
                  />
                </div>
              </div>

              {/* Payment */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div className="form-label" style={{ marginBottom: '0.8rem' }}>
                  Payment Method
                </div>
                <div className="pay-methods">
                  {PAYMENT_METHODS.map(p => (
                    <div
                      key={p.id}
                      className={`pay-opt ${selectedPay === p.id ? 'selected' : ''}`}
                      onClick={() => setSelectedPay(p.id)}
                    >
                      <span className="pay-check">✓</span>
                      <span className="pay-logo">{p.logo}</span>
                      <span className="pay-name">{p.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button className="btn-submit" onClick={placeOrder}>
                Place Order — {fmt(total)}
              </button>
              <button className="btn-cancel" onClick={() => setShowCheckout(false)}>
                Cancel
              </button>
            </>
          ) : (
            <div className="success-screen">
              <div className="success-icon">✓</div>
              <div className="success-h">Order Placed.</div>
              <div className="success-sub">
                Thank you, {form.name}!<br />
                Pembayaran via <strong>{payMethod?.name}</strong> akan diproses.<br />
                Konfirmasi dikirim ke {form.email}
              </div>
              <div className="order-id">Order ID: {orderId}</div>
              <button className="btn-submit" style={{ maxWidth: 240, margin: '0 auto' }} onClick={closeAll}>
                Back to Shop
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}