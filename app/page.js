'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '../context/cartcontext'
import Toast, { showToast } from '../components/toast'

const PRODUCTS = [
  {
    id: 'belt-gold',
    name: 'DRICO SIGNATURE BELT',
    variant: 'Black & Gold',
    price: 385000,
    image: '/belt-detail.png',
    imageStyle: { filter: 'brightness(0.75) saturate(0.85)' },
  },
  {
    id: 'belt-silver',
    name: 'DRICO SIGNATURE BELT',
    variant: 'Black & Silver',
    price: 385000,
    image: '/belt-detail.png',
    imageStyle: { filter: 'brightness(0.65) saturate(0.15) contrast(1.1)' },
  },
]

const WHY_ITEMS = [
  { num: '01', name: 'Chrome Zinc Buckle', desc: 'Heavy-duty, anti-rust, precision engineered. Black & Gold finish.' },
  { num: '02', name: 'Croco Pattern', desc: 'Premium faux leather dengan tekstur crocodile yang kuat dan tahan lama.' },
  { num: '03', name: 'One Size Fits Most', desc: 'Strap 113 × 3 cm. Max waist size 42. Buckle 11 × 4 cm.' },
  { num: '04', name: 'Complete Package', desc: 'Include premium box dan pouch. Siap dipakai, siap dijadikan kado.' },
]

const TESTIMONIALS = [
  { q: '"Gila ini belt kelas banget. Buckle-nya solid, beda jauh dari sabuk biasa."', name: '@andi_streetstyle' },
  { q: '"Dipake nongkrong auto naik level. Packaging-nya juga keren, dateng rapi."', name: '@rara.fits' },
  { q: '"Detailnya niat banget. Croco pattern-nya kelihatan premium, worth every penny."', name: '@bima.wears' },
]

function fmt(n) {
  return 'Rp ' + n.toLocaleString('id-ID')
}

export default function HomePage() {
  const { addItem, setIsOpen } = useCart()

  // Custom cursor
  const curRef  = useRef(null)
  const ringRef = useRef(null)
  const ringPos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const move = (e) => {
      if (curRef.current) {
        curRef.current.style.left = e.clientX + 'px'
        curRef.current.style.top  = e.clientY + 'px'
      }
    }
    const loop = () => {
      const rx = ringPos.current.x
      const ry = ringPos.current.y
      // get mouse target from cursor element
      if (curRef.current) {
        const cx = parseFloat(curRef.current.style.left) || 0
        const cy = parseFloat(curRef.current.style.top) || 0
        ringPos.current.x += (cx - rx) * 0.12
        ringPos.current.y += (cy - ry) * 0.12
        if (ringRef.current) {
          ringRef.current.style.left = ringPos.current.x + 'px'
          ringRef.current.style.top  = ringPos.current.y + 'px'
        }
      }
      requestAnimationFrame(loop)
    }
    window.addEventListener('mousemove', move)
    loop()
    return () => window.removeEventListener('mousemove', move)
  }, [])

  // Hover expand ring
  useEffect(() => {
    const els = document.querySelectorAll('a, button')
    const on  = () => ringRef.current?.classList.add('hovered')
    const off = () => ringRef.current?.classList.remove('hovered')
    els.forEach(el => { el.addEventListener('mouseenter', on); el.addEventListener('mouseleave', off) })
    return () => els.forEach(el => { el.removeEventListener('mouseenter', on); el.removeEventListener('mouseleave', off) })
  }, [])

  // Scroll reveal
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.12 }
    )
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  // Parallax hero
  useEffect(() => {
    const onScroll = () => {
      const img = document.querySelector('.hero-img')
      if (img) img.style.transform = `scale(1.04) translateY(${window.scrollY * 0.07}px)`
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleAddToCart = (product) => {
    addItem({ id: product.id, name: product.name, variant: product.variant, price: product.price })
    showToast(product.variant + ' added to cart')
  }

  const [stock] = useState(12)

  return (
    <>
      <div className="cursor"  ref={curRef}  />
      <div className="cursor-ring" ref={ringRef} />
      <Toast />

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-left">
          <div className="hero-eyebrow">New Drop — 2026</div>
          <h1 className="hero-title">
            <span className="l1">DRICO</span>
            <span className="l2">Signature</span>
            <span className="l3">Belt</span>
          </h1>
          <div className="hero-divider" />
          <p className="hero-desc">
            Handmade. Premium faux leather.<br />
            Chrome zinc buckle. Croco pattern.<br />
            Built to outlast the trend.
          </p>
          <div className="hero-limited">
            <div className="live-dot" />
            Limited stock available
          </div>
          <div className="hero-cta">
            <a href="#shop" className="btn-primary">Shop Now</a>
            <a href="#why"  className="btn-secondary">Learn More</a>
          </div>
        </div>
        <div className="hero-right">
          <Image
            src="/belt-hero.png"
            alt="DRICO Signature Belt"
            fill
            priority
            className="hero-img"
            style={{ objectFit: 'cover', objectPosition: 'center' }}
          />
          <div className="hero-overlay" />
          <div className="hero-caption">
            DRICO Signature Belt<br />
            Black &amp; Gold · Black &amp; Silver
          </div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div className="marquee-wrap">
        <div className="marquee-track">
          {['DRICO','SIGNATURE BELT','HANDMADE','PREMIUM FAUX LEATHER','CHROME ZINC BUCKLE','CROCO PATTERN','BLACK & GOLD','LIMITED STOCK',
            'DRICO','SIGNATURE BELT','HANDMADE','PREMIUM FAUX LEATHER','CHROME ZINC BUCKLE','CROCO PATTERN','BLACK & GOLD','LIMITED STOCK'].map((t,i) => (
            <span className="marquee-item" key={i}>{t}<span>·</span></span>
          ))}
        </div>
      </div>

      {/* ── WHY ── */}
      <section className="why-section" id="why">
         <video
            autoPlay
            loop
            muted
            playsInline
            className="why-video"
          >
            <source src="/drico-belt-video.mp4" type="video/mp4" />
          </video>
          <div className="why-overlay" />
        <div>
          <div className="section-tag reveal">Craftsmanship</div>
          <h2 className="section-h reveal reveal-d1">
            Built to last.<br />Made to be <em>seen.</em>
          </h2>
          <p className="why-body reveal reveal-d2">
            Setiap detail dirancang dengan presisi. Dari croco pattern leather
            hingga chrome zinc buckle — ini bukan sekadar sabuk.
          </p>
        </div>
        <div className="why-grid">
          {WHY_ITEMS.map((item, i) => (
            <div className="why-item reveal" key={i}
              style={{ transitionDelay: `${i * 0.08}s` }}>
              <div className="why-num">{item.num}</div>
              <div className="why-name">{item.name}</div>
              <div className="why-desc">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SHOP ── */}
      <section className="shop-section" id="shop">
        <div className="shop-header">
          <div>
            <div className="section-tag reveal">The Collection</div>
            <h2 className="section-h reveal reveal-d1">Pick <em>yours.</em></h2>
          </div>
          <div className="shop-note reveal">Two variants · Limited stock</div>
        </div>
        <div className="product-grid">
          {PRODUCTS.map((p, i) => (
            <div className="product-card" key={p.id}>
              <div className="card-img-zone">
                <Image
                  src={p.image}
                  alt={p.name}
                  fill
                  className="card-img"
                  style={{ objectFit:'cover', objectPosition:'center', ...p.imageStyle }}
                />
                <div className="card-badge">Limited</div>
                <div className="card-variant-tag">{p.variant}</div>
              </div>
              <div className="card-body">
                <div className="card-name">{p.name}</div>
                <div className="card-sub">{p.variant} · One Size · Handmade</div>
                <div className="card-price-row">
                  <div className="card-price">
                    {p.price.toLocaleString('id-ID')}<small>IDR</small>
                  </div>
                  <div className="card-include">Incl. Box &amp; Pouch</div>
                </div>
                <div className="card-actions">
                  <button
                    className="btn-primary flex1"
                    onClick={() => handleAddToCart(p)}
                  >
                    Add to Cart
                  </button>
                  <Link
                    href={`/detail?v=${p.id}`}
                    className="btn-secondary"
                  >
                    Detail →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="testi-section" id="reviews">
        <div className="section-tag reveal">Reviews</div>
        <h2 className="section-h reveal reveal-d1">
          Real talk.<br /><em>No filter.</em>
        </h2>
        <div className="testi-grid">
          {TESTIMONIALS.map((t, i) => (
            <div className="testi-card reveal" key={i}
              style={{ transitionDelay: `${i * 0.12}s` }}>
              <div className="testi-stars">★★★★★</div>
              <div className="testi-q">{t.q}</div>
              <div className="testi-name">{t.name}</div>
              <div className="testi-verified">Verified buyer</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="final-section">
        <div className="final-h reveal">
          The belt<br />that speaks<br /><em>for itself.</em>
        </div>
        <div className="final-sub reveal reveal-d1">
          <div className="live-dot" />
          Limited stock — don&apos;t wait
        </div>
        <a href="#shop" className="btn-primary reveal reveal-d2">
          Get Yours Now
        </a>
        <div className="final-stats">
          {[
            { n: '385K', l: 'Harga IDR' },
            { n: '500+', l: 'Terjual' },
            { n: '5.0 ★', l: 'Rating' },
            { n: stock.toString(), l: 'Sisa Stok', gold: true },
          ].map((s, i) => (
            <div key={i} className="reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
              <div className={`stat-n ${s.gold ? 'gold' : ''}`}>{s.n}</div>
              <div className="stat-l">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer>
        <div className="foot-brand">
          DRICO<small>by jakeable_</small>
        </div>
        <div className="foot-copy">© 2026 DRICO — All Rights Reserved</div>
        <div className="foot-social">
          <a href="https://www.instagram.com/driftcolony?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" className="soc-link">Instagram</a>
          <a href="https://www.tiktok.com/@driftcolony?is_from_webapp=1&sender_device=pc" className="soc-link">TikTok</a>
        </div>
      </footer>

      {/* ── STICKY MOBILE BAR ── */}
      <div className="sticky-bar">
        <div>
          <div className="sb-price">Rp 385.000</div>
          <div className="sb-sub">Include Box &amp; Pouch</div>
        </div>
        <a href="#shop" className="btn-primary">Buy Now</a>
      </div>
    </>
  )
}