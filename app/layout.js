import { DM_Serif_Display, Syne, DM_Mono } from 'next/font/google'
import { CartProvider } from '../context/cartcontext'
import Navbar from '../components/navbar'
import CartDrawer from '../components/cartdrawer'
import './globals.css'

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
})

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata = {
  title: 'DRICO — Signature Belt',
  description: 'Handmade premium faux leather belt with chrome zinc buckle. Croco pattern. Built to outlast the trend.',
  keywords: 'drico, belt, sabuk, handmade, streetwear, premium, faux leather',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${dmSerif.variable} ${syne.variable} ${dmMono.variable}`}>
      <body>
        <CartProvider>
          <Navbar />
          <CartDrawer />
          {children}
        </CartProvider>
      </body>
    </html>
  )
}