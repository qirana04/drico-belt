'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useCart } from '../../context/cartcontext'
import Toast, { showToast } from '../../components/toast'

const VARIANTS = {
  'belt-gold':   { label: 'Black & Gold',   imageStyle: { filter: 'brightness(0.72) saturate(0.88)' } },
  'belt-silver': { label: 'Black & Silver',  imageStyle: { filter: 'brightness(0.62) saturate(0.12) contrast(1.1)' } },
}

const SPECS = [
  { key: 'Type',           val: 'Signature Belt' },
  { key: 'Made',           val: 'Handmade' },
  { key: 'Material',       val: 'Premium Black Faux Leather' },
  { key: 'Pattern',        val: 'Croco Pattern' },
  { key: 'Buckle',         val: 'Chrome Finish Zinc Alloy' },
  { key: 'Buckle Colour',  val: '' },  // filled dynamically
  { key: 'Buckle Size',    val: '11 × 4 cm' },
  { key: 'Belt Strap',     val: '113 × 3 cm' },
  { key: 'Max Waist',      val: 'Size 42' },
  { key: 'Size',           val: 'One Size' },
  { key: 'Package',        val: 'Include Premium Box' },
  { key: 'Accessory',      val: 'Include Pouch' },
]

const THUMB_LABELS = ['Overview', 'Detail', 'Silver', 'Texture']
const THUMB_FILTERS = [
  'brightness(0.72) saturate(0.88)',
  'brightness(0.65) saturate(0.7)',
  'brightness(0.55) saturate(0.1) contrast(1.1)',
  'brightness(0.6) saturate(1.1) contrast(1.15)',
]
const THUMB_IMAGES = ['/belt-hero.png', '/belt-detail.png', '/belt-hero.png', '/belt-detail.png']

function fmt(n) { return 'Rp ' + n.toLocaleString('id-ID') }

export default function DetailPage() {
  const params   = useSearchParams()
  const variantId = params.get('v') || 'belt-gold'
  const variant  = VARIANTS[variantId] || VARIANTS['belt-gold']

  const { addItem, setIsOpen } = useCart()
  const [qty, setQty]         = useState(1)
  const [activeThumb, setActiveThumb] = useState(0)
  const [imgSrc, setImgSrc]   = useState(THUMB_IMAGES[0])
  const [imgFilter, setImgFilter] = useState(THUMB_FILTERS[0])

  const curRef  = useRef(null)
  const ringRef = useRef(null)

  // Cursor
  useEffect(() => {
    const move = (e) => {
      if (curRef.current) {
        curRef.current.style.left = e.clientX + 'px'
        curRef.current.style.top  = e.clientY + 'px'
      }
    }
    let rx = 0, ry = 0
    const loop = () => {
      if (curRef.current && ringRef.current) {
        const cx = parseFloat(curRef.current.style.left) || 0
        const cy = parseFloat(curRef.current.style.top)  || 0
        rx += (cx - rx) * 0.12
        ry += (cy - ry) * 0.12
        ringRef.current.style.left = rx + 'px'
        ringRef.current.style.top  = ry + 'px'
      }
      requestAnimationFrame(loop)
    }
    window.addEventListener('mousemove', move)
    loop()
    return () => window.removeEventListener('mousemove', move)
  }, [])

  const switchThumb = (i) => {
    setActiveThumb(i)
    setImgSrc(THUMB_IMAGES[i])
    setImgFilter(THUMB_FILTERS[i])
  }

  const handleAddToCart = () => {
    addItem({
      id: variantId,
      name: 'DRICO SIGNATURE BELT',
      variant: variant.label,
      price: 385000,
      qty,
    })
    showToast(`${variant.label} × ${qty} added to cart`)
  }

  const handleCheckout = () => {
    handleAddToCart()
    setIsOpen(true)
  }

  const specs = SPECS.map(s =>
    s.key === 'Buckle Colour' ? { ...s, val: variant.label } : s
  )

  return (
    <>
      <div className="cursor"     ref={curRef} />
      <div className="cursor-ring" ref={ringRef} />
      <Toast />

      {/* Detail breadcrumb nav */}
      <div className="detail-nav">
        <Link href="/" className="back-btn">Back to Shop</Link>
        <div className="detail-breadcrumb">DRICO / Signature Belt / {variant.label}</div>
      </div>

      <div className="detail-body">
        {/* ── GALLERY ── */}
        <div className="detail-gallery">
          <div className="gallery-main">
            <Image
              src={imgSrc}
              alt="DRICO Signature Belt"
              fill
              className="gallery-img"
              style={{ objectFit:'cover', objectPosition:'center', filter: imgFilter }}
            />
          </div>
          <div className="gallery-thumbs">
            {THUMB_IMAGES.map((src, i) => (
              <div
                key={i}
                className={`g-thumb ${activeThumb === i ? 'active' : ''}`}
                onClick={() => switchThumb(i)}
              >
                <Image
                  src={src}
                  alt={THUMB_LABELS[i]}
                  fill
                  style={{ objectFit:'cover', objectPosition:'center', filter: THUMB_FILTERS[i] }}
                />
                <div className="g-thumb-label">{THUMB_LABELS[i]}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── INFO ── */}
        <div className="detail-info">
          <div className="detail-brand">DRICO by jakeable_</div>
          <h1 className="detail-title">
            DRICO<br /><em>Signature</em><br />Belt
          </h1>
          <div className="detail-variant">Variant: {variant.label}</div>

          <div className="detail-price-block">
            <div className="detail-price">
              Rp 385.000
              <small>Include Box &amp; Pouch</small>
            </div>
            <div className="detail-stock">
              <div className="live-dot" />
              Limited Stock
            </div>
          </div>

          {/* Specs */}
          <div className="spec-section">
            <div className="spec-label">Product Specifications</div>
            {specs.map((s, i) => (
              <div className="spec-row" key={i}>
                <span className="spec-key">{s.key}</span>
                <span>{s.val}</span>
              </div>
            ))}
          </div>

          {/* Qty */}
          <div className="qty-row">
            <span className="qty-label">Qty</span>
            <div className="qty-ctrl">
              <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
              <span className="qty-num">{qty}</span>
              <button className="qty-btn" onClick={() => setQty(q => q + 1)}>+</button>
            </div>
          </div>

          <button className="btn-cop" onClick={handleAddToCart}>
            Add to Cart — {fmt(385000 * qty)}
          </button>
          <button className="btn-checkout" onClick={handleCheckout}>
            Checkout Now
          </button>

          <div className="trust-row">
            <div className="trust-item">Premium Box</div>
            <div className="trust-item">Pouch Included</div>
            <div className="trust-item">Handmade</div>
            <div className="trust-item">Limited Edition</div>
          </div>
        </div>
      </div>

      <footer>
        <div className="foot-brand">DRICO<small>by jakeable_</small></div>
        <div className="foot-copy">© 2025 DRICO — All Rights Reserved</div>
        <div className="foot-social">
          <a href="#" className="soc-link">Instagram</a>
          <a href="#" className="soc-link">TikTok</a>
        </div>
      </footer>
    </>
  )
}