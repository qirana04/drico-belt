'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useCart } from '../context/cartcontext'

const PAYMENT_METHODS = [
  { id: 'qris', logo: 'QR', name: 'QRIS Instant Payment', desc: 'BCA, Mandiri, BRI, BNI, GoPay, OVO, DANA, ShopeePay & Semua Bank' },
]

function fmt(n) {
  return 'Rp ' + n.toLocaleString('id-ID')
}

function CartItemRow({
  item,
  index,
  activeSwipedKey,
  setActiveSwipedKey,
  onRemove,
  onUpdateQty,
}) {
  const itemKey = `${item.id}-${item.variant}-${index}`
  const [translateX, setTranslateX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const startXRef = useRef(0)
  const startYRef = useRef(0)
  const isHorizontalRef = useRef(null)
  const currentTranslateRef = useRef(0)
  const translateXRef = useRef(0)

  // Sync ref with current state
  useEffect(() => {
    translateXRef.current = translateX
  }, [translateX])

  // If another item was swiped open, close this one
  useEffect(() => {
    if (activeSwipedKey !== itemKey && translateXRef.current !== 0 && !isDeleting) {
      translateXRef.current = 0
      setTranslateX(0)
    }
  }, [activeSwipedKey, itemKey, isDeleting])

  const triggerDelete = () => {
    if (isDeleting) return
    setIsDeleting(true)
    translateXRef.current = -450
    setTranslateX(-450)
    setTimeout(() => {
      onRemove(item.id, item.variant)
    }, 280)
  }

  // --- Touch Gestures ---
  const handleTouchStart = (e) => {
    if (isDeleting) return
    const touch = e.touches[0]
    startXRef.current = touch.clientX
    startYRef.current = touch.clientY
    currentTranslateRef.current = translateXRef.current
    isHorizontalRef.current = null
    setIsDragging(true)
  }

  const handleTouchMove = (e) => {
    if (!isDragging || isDeleting) return
    const touch = e.touches[0]
    const dx = touch.clientX - startXRef.current
    const dy = touch.clientY - startYRef.current

    if (isHorizontalRef.current === null) {
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
        if (Math.abs(dx) > Math.abs(dy)) {
          isHorizontalRef.current = true
          setActiveSwipedKey(itemKey)
        } else {
          isHorizontalRef.current = false
          setIsDragging(false)
          return
        }
      } else {
        return
      }
    }

    if (!isHorizontalRef.current) return

    if (e.cancelable) e.preventDefault()

    let nextX = currentTranslateRef.current + dx
    if (nextX > 0) {
      nextX = nextX * 0.15 // resistance when pulling right
    }
    translateXRef.current = nextX
    setTranslateX(nextX)
  }

  const handleTouchEnd = () => {
    if (!isDragging || isDeleting) return
    setIsDragging(false)

    const finalX = translateXRef.current
    if (finalX < -115) {
      // Swiped far left -> full swipe delete
      triggerDelete()
    } else if (finalX < -40) {
      // Swiped enough to reveal delete action
      translateXRef.current = -80
      setTranslateX(-80)
      setActiveSwipedKey(itemKey)
    } else {
      // Reset
      translateXRef.current = 0
      setTranslateX(0)
      if (activeSwipedKey === itemKey) setActiveSwipedKey(null)
    }
  }

  // --- Mouse Gestures for desktop click-drag ---
  const handleMouseDown = (e) => {
    if (isDeleting || e.button !== 0) return
    startXRef.current = e.clientX
    currentTranslateRef.current = translateXRef.current
    setIsDragging(true)
    setActiveSwipedKey(itemKey)

    const handleMouseMove = (ev) => {
      const dx = ev.clientX - startXRef.current
      let nextX = currentTranslateRef.current + dx
      if (nextX > 0) nextX = nextX * 0.15
      translateXRef.current = nextX
      setTranslateX(nextX)
    }

    const handleMouseUp = (ev) => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      setIsDragging(false)
      const dx = ev.clientX - startXRef.current
      const finalX = currentTranslateRef.current + dx

      if (finalX < -115) {
        triggerDelete()
      } else if (finalX < -40) {
        translateXRef.current = -80
        setTranslateX(-80)
        setActiveSwipedKey(itemKey)
      } else {
        translateXRef.current = 0
        setTranslateX(0)
        if (activeSwipedKey === itemKey) setActiveSwipedKey(null)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  const handleRowClick = () => {
    if (translateXRef.current < 0 && !isDeleting) {
      translateXRef.current = 0
      setTranslateX(0)
      setActiveSwipedKey(null)
    }
  }

  const isSilver = item.variant?.toLowerCase().includes('silver')
  const itemImg = item.image || (isSilver ? '/belt-silver.jpg' : '/belt-hero.png')
  const isPastThreshold = translateX < -115
  const isSwipingOrOpen = translateX < 0

  return (
    <div className={`cart-item-wrapper ${isDeleting ? 'deleting' : ''}`}>
      {/* Background Delete Action - only visible while swiping */}
      <div
        className={`cart-swipe-action ${isSwipingOrOpen ? 'active' : ''}`}
        onClick={(e) => {
          e.stopPropagation()
          triggerDelete()
        }}
      >
        <button
          type="button"
          className={`cart-swipe-btn ${isPastThreshold ? 'active-threshold' : ''}`}
          aria-label="Delete item"
        >
          <svg className="cart-swipe-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
          <span className="cart-swipe-label">{isPastThreshold ? 'Release' : 'Delete'}</span>
        </button>
      </div>

      {/* Foreground Item Card */}
      <div
        className={`cart-item ${isDragging ? 'grabbing' : ''}`}
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isDragging ? 'none' : 'transform 0.28s cubic-bezier(0.2, 0.9, 0.3, 1)',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onDragStart={(e) => e.preventDefault()}
        onClick={handleRowClick}
      >
        <div className="ci-img">
          <Image
            src={itemImg}
            alt={item.name}
            width={68}
            height={52}
            style={{
              objectFit: 'cover',
              objectPosition: isSilver ? 'center 25%' : 'center',
              filter: isSilver ? 'none' : 'brightness(0.68)',
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
            }}
          />
        </div>
        <div className="ci-info">
          <div className="ci-name">{item.name}</div>
          <div className="ci-sub">{item.variant}</div>
          <div className="ci-qty-row">
            <span className="ci-qty-label">QTY</span>
            <div className="ci-qty-ctrl">
              <button
                type="button"
                className="ci-qty-btn"
                disabled={item.qty <= 1}
                onClick={(e) => {
                  e.stopPropagation()
                  onUpdateQty(item.id, item.variant, q => Math.max(1, q - 1))
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="ci-qty-num">{item.qty}</span>
              <button
                type="button"
                className="ci-qty-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  onUpdateQty(item.id, item.variant, q => q + 1)
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>
        </div>
        <div className="ci-price-col">
          <div className="ci-price">{fmt(item.price * item.qty)}</div>
          <button
            type="button"
            className="ci-desktop-delete"
            onClick={(e) => {
              e.stopPropagation()
              triggerDelete()
            }}
            title="Delete item"
            aria-label="Delete item"
          >
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CartDrawer() {
  const { items, removeItem, updateQty, clearCart, total, isOpen, setIsOpen } = useCart()

  const [activeSwipedKey, setActiveSwipedKey] = useState(null)
  const [showCheckout, setShowCheckout] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [selectedPay, setSelectedPay] = useState('qris')
  const [orderId, setOrderId] = useState('')
  const [orderTotal, setOrderTotal] = useState(0)
  const [orderItems, setOrderItems] = useState([])
  const [copied, setCopied] = useState(false)
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
    if (!form.name.trim())    e.name = 'Wajib diisi'
    if (!form.email.trim())   e.email = 'Wajib diisi'
    if (!form.phone.trim())   e.phone = 'Wajib diisi'
    if (!form.address.trim()) e.address = 'Wajib diisi'
    if (!form.city.trim())    e.city = 'Wajib diisi'
    if (!form.zip.trim())     e.zip = 'Wajib diisi'
    return e
  }

  const placeOrder = () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    const id = 'DRC-' + Date.now().toString().slice(-6)
    setOrderId(id)
    setOrderTotal(total)
    setOrderItems([...items])
    setShowSuccess(true)
    clearCart()
  }

  const copyOrderId = () => {
    if (!orderId) return
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(orderId)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const closeAll = () => {
    setIsOpen(false)
    setShowCheckout(false)
    setShowSuccess(false)
    setForm({ name:'', email:'', phone:'', address:'', city:'', zip:'' })
    setErrors({})
    setCopied(false)
  }

  const openCheckout = () => {
    setIsOpen(false)
    setShowCheckout(true)
  }

  const payMethod = PAYMENT_METHODS.find(p => p.id === selectedPay)

  const waItemsText = (orderItems && orderItems.length > 0 ? orderItems : items)
    .map(it => `• ${it.name} (${it.variant}) × ${it.qty} = ${fmt(it.price * it.qty)}`)
    .join('\n')

  const waMessage = `Halo Admin DRICO BELT, saya ingin konfirmasi pembayaran pesanan:

*Order ID:* ${orderId}
*Nama:* ${form.name}
*No. WhatsApp:* ${form.phone}
*Email:* ${form.email}
*Alamat:* ${form.address}, ${form.city} ${form.zip}

*Detail Pesanan:*
${waItemsText}

*Total Tagihan:* ${fmt(orderTotal || total)}
*Metode Pembayaran:* QRIS Instant Payment

Saya sudah melakukan transfer pembayaran via QRIS. Mohon segera dicek dan diproses. Terima kasih!`

  const waUrl = `https://wa.me/6281234567890?text=${encodeURIComponent(waMessage)}`

  return (
    <>
      {/* Cart overlay + drawer */}
      <div
        className={`cart-overlay ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(false)}
      />
      <div className={`cart-drawer ${isOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <div>
            <div className="drawer-title">Your Cart</div>
            {items.length > 0 && (
              <div className="drawer-hint">← Slide to delete</div>
            )}
          </div>
          <button className="drawer-close" onClick={() => setIsOpen(false)}>
            Close ×
          </button>
        </div>

        <div className="cart-items">
          {items.length === 0 ? (
            <div className="cart-empty">Your cart is empty.</div>
          ) : (
            items.map((item, i) => (
              <CartItemRow
                key={`${item.id}-${item.variant}-${i}`}
                item={item}
                index={i}
                activeSwipedKey={activeSwipedKey}
                setActiveSwipedKey={setActiveSwipedKey}
                onRemove={removeItem}
                onUpdateQty={updateQty}
              />
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
                  Metode Pembayaran
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
                      <div className="pay-meta">
                        <span className="pay-name">{p.name}</span>
                        {p.desc && <span className="pay-desc">{p.desc}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button className="btn-submit" onClick={placeOrder}>
                Lanjut ke Pembayaran QRIS — {fmt(total)}
              </button>
              <button className="btn-cancel" onClick={() => setShowCheckout(false)}>
                Batal
              </button>
            </>
          ) : (
            <div className="qris-screen">
              <div className="qris-status-wrap">
                <span className="qris-status-badge">🟡 MENUNGGU PEMBAYARAN</span>
              </div>
              <div className="qris-h">Pembayaran QRIS</div>
              <div className="qris-sub">
                Scan kode QR di bawah menggunakan aplikasi mobile banking atau e-wallet Anda.
              </div>

              {/* Tagihan Box */}
              <div className="qris-invoice-box">
                <div className="qris-inv-row">
                  <span className="qris-inv-label">TOTAL TAGIHAN</span>
                  <span className="qris-inv-amount">{fmt(orderTotal || total)}</span>
                </div>
                <div className="qris-inv-divider" />
                <div className="qris-inv-row">
                  <span className="qris-inv-label">ORDER ID</span>
                  <div className="qris-id-wrapper">
                    <span className="qris-inv-id">{orderId}</span>
                    <button
                      type="button"
                      className="qris-copy-btn"
                      onClick={copyOrderId}
                    >
                      {copied ? 'Tersalin! ✓' : 'Salin'}
                    </button>
                  </div>
                </div>
                <div className="qris-inv-row" style={{ marginTop: '0.35rem' }}>
                  <span className="qris-inv-label">ATAS NAMA</span>
                  <span className="qris-inv-val">{form.name} ({form.phone})</span>
                </div>
              </div>

              {/* QRIS Card */}
              <div className="qris-card">
                <div className="qris-card-head">
                  <span className="qris-merchant-badge">QRIS RESMI</span>
                  <span className="qris-merchant-name">DRICO OFFICIAL STORE</span>
                  <span className="qris-merchant-nmid">NMID: ID1020038472910</span>
                </div>
                <div className="qris-image-wrapper">
                  <Image
                    src="/qris.png"
                    width={220}
                    height={220}
                    alt="QRIS Barcode Pembayaran DRICO"
                    priority
                    className="qris-barcode-img"
                  />
                </div>
                <div className="qris-supported-tags">
                  <span>BCA</span> • <span>Mandiri</span> • <span>BRI</span> • <span>BNI</span> • <span>GoPay</span> • <span>OVO</span> • <span>DANA</span> • <span>ShopeePay</span>
                </div>
              </div>

              {/* Steps */}
              <div className="qris-steps">
                <div className="qris-steps-title">CARA PEMBAYARAN:</div>
                <ol className="qris-steps-list">
                  <li>Buka aplikasi m-Banking atau E-Wallet (BCA, Mandiri, BRI, BNI, GoPay, OVO, DANA, ShopeePay).</li>
                  <li>Pilih menu <strong>Scan QR / Bayar</strong> lalu arahkan kamera ke barcode di atas.</li>
                  <li>Periksa nama penerima <strong>DRICO OFFICIAL STORE</strong> dan nominal <strong>{fmt(orderTotal || total)}</strong>.</li>
                  <li>Selesaikan transaksi lalu klik tombol konfirmasi WhatsApp di bawah.</li>
                </ol>
              </div>

              {/* WhatsApp CTA Button */}
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-wa"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.971.53 1.77.813 2.796.813 3.179 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.768-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.074-1.115-.062-.258-.083-.591-.194-1.017-.381-1.803-.791-2.973-2.617-3.064-2.738-.09-.12-.727-.97-.727-1.85 0-.879.461-1.312.624-1.488.164-.176.357-.22.476-.22.121 0 .241.002.346.007.11.005.258-.042.404.308.149.358.513 1.25.558 1.342.045.093.076.202.016.324-.06.121-.09.197-.18.303-.09.106-.188.236-.269.317-.091.091-.186.19-.08.373.106.183.473.78 1.016 1.264.7.625 1.29.818 1.474.909.183.09.292.079.401-.045.11-.125.468-.545.592-.733.125-.187.25-.157.42-.094.17.062 1.082.51 1.268.604.186.093.31.139.355.217.045.078.045.452-.099.857z"/>
                </svg>
                Konfirmasi Pembayaran via WhatsApp
              </a>

              <div className="qris-note">
                *Pesanan akan diproses otomatis setelah konfirmasi dikirim ke WhatsApp resmi kami.
              </div>

              <button className="btn-secondary-done" onClick={closeAll}>
                Selesai & Kembali ke Toko
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}