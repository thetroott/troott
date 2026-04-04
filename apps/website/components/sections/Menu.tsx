'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.nav
      className={`fixed top-0 left-0 z-50 w-full transition-all duration-300 
        ${scrolled ? 'bg-white/90 shadow-md py-2' : 'py-4'} 
      `}
    >
      <div className="container flex items-center justify-between">
        <div className="text-2xl font-bold">YourLogo</div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/">Hero</Link>
          <Link href="/listeners">Listeners</Link>
          <Link href="/preachers">Preachers</Link>
          <Link href="/faqs">FAQs</Link>
          <div className="flex gap-4 ml-6">
            <Button variant="outline">Start Listening</Button>
            <Button>Upload Sermons</Button>
          </div>
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Fullscreen Overlay */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-40 bg-white flex flex-col items-center justify-center gap-8 text-xl"
        >
          <Link href="/" onClick={() => setMenuOpen(false)}>Hero</Link>
          <Link href="/listeners" onClick={() => setMenuOpen(false)}>Listeners</Link>
          <Link href="/preachers" onClick={() => setMenuOpen(false)}>Preachers</Link>
          <Link href="/faqs" onClick={() => setMenuOpen(false)}>FAQs</Link>
          <Button variant="outline" className="w-48" onClick={() => setMenuOpen(false)}>
            Start Listening
          </Button>
          <Button className="w-48" onClick={() => setMenuOpen(false)}>
            Upload Sermons
          </Button>
        </motion.div>
      )}

      {/* Social Icons shrink on scroll */}
      <div className={`fixed bottom-4 left-4 z-40 flex gap-3 transition-all duration-300 
        ${scrolled ? 'scale-90' : 'scale-100'}`}
      >
        <a href="https://x.com" target="_blank" rel="noreferrer">
          <Image src="/icons/x.svg" className="w-6 h-6" alt="X" />
        </a>
        <a href="https://instagram.com" target="_blank" rel="noreferrer">
          <Image src="/icons/ig.svg" className="w-6 h-6" alt="Instagram" />
        </a>
      </div>
    </motion.nav>
  )
}
