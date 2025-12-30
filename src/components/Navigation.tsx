'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BookOpen,
  GraduationCap,
  Brain,
  BarChart3,
  Search,
  Menu,
  X,
  Home,
  Lightbulb,
  ClipboardList,
  Moon,
  Sun,
  Monitor,
  FileText,
  Flame,
  Star,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { SearchModal } from './SearchModal'
import { useTheme } from './ThemeProvider'
import { useGamificationStore } from '@/stores/gamificationStore'

const navigation = [
  { name: 'Accueil', href: '/', icon: Home },
  { name: 'Leçons', href: '/lecons', icon: BookOpen },
  { name: 'Exercices', href: '/exercices', icon: ClipboardList },
  { name: 'Guidés', href: '/exercices-guides', icon: Lightbulb },
  { name: 'Annales', href: '/annales', icon: FileText },
  { name: 'Flashcards', href: '/flashcards', icon: Brain },
  { name: 'Stats', href: '/stats', icon: BarChart3 },
]

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [themeMenuOpen, setThemeMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const { totalPoints, currentStreak, getLevel } = useGamificationStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Close theme menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setThemeMenuOpen(false)
    if (themeMenuOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [themeMenuOpen])

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-slate-700 dark:bg-slate-900/95 dark:supports-[backdrop-filter]:bg-slate-900/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
                  <span className="text-lg font-bold">∑</span>
                </div>
                <span className="hidden text-xl font-bold text-slate-900 dark:text-slate-100 sm:block">
                  Maths<span className="text-primary-600 dark:text-primary-400">Terminale</span>
                </span>
              </Link>
            </div>

            {/* Desktop navigation */}
            <div className="hidden md:flex md:items-center md:gap-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== '/' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                )
              })}
            </div>

            {/* Gamification status */}
            {mounted && (
              <div className="hidden items-center gap-2 md:flex">
                <Link
                  href="/stats"
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-1.5 transition-colors hover:from-amber-100 hover:to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 dark:hover:from-amber-900/50 dark:hover:to-orange-900/50"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-xs font-bold text-white">
                    {getLevel().level}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-primary-500" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{totalPoints}</span>
                  </div>
                  {currentStreak > 0 && (
                    <div className="flex items-center gap-1">
                      <Flame className="h-3.5 w-3.5 text-orange-500" />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{currentStreak}</span>
                    </div>
                  )}
                </Link>
              </div>
            )}

            {/* Search, theme toggle, and mobile menu buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                aria-label="Rechercher"
              >
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">Rechercher</span>
                <kbd className="hidden rounded bg-slate-200 px-1.5 py-0.5 text-xs font-medium text-slate-500 dark:bg-slate-700 dark:text-slate-400 sm:inline">
                  ⌘K
                </kbd>
              </button>

              {/* Theme toggle */}
              <div className="relative">
                <button
                  onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                  className="inline-flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                  aria-label="Changer le thème"
                >
                  {resolvedTheme === 'dark' ? (
                    <Moon className="h-5 w-5" />
                  ) : (
                    <Sun className="h-5 w-5" />
                  )}
                </button>

                {themeMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-36 rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                    <button
                      onClick={() => { setTheme('light'); setThemeMenuOpen(false); }}
                      className={cn(
                        'flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700',
                        theme === 'light' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-700 dark:text-slate-300'
                      )}
                    >
                      <Sun className="h-4 w-4" />
                      Clair
                    </button>
                    <button
                      onClick={() => { setTheme('dark'); setThemeMenuOpen(false); }}
                      className={cn(
                        'flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700',
                        theme === 'dark' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-700 dark:text-slate-300'
                      )}
                    >
                      <Moon className="h-4 w-4" />
                      Sombre
                    </button>
                    <button
                      onClick={() => { setTheme('system'); setThemeMenuOpen(false); }}
                      className={cn(
                        'flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700',
                        theme === 'system' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-700 dark:text-slate-300'
                      )}
                    >
                      <Monitor className="h-4 w-4" />
                      Système
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 md:hidden"
                aria-label="Menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-t border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 md:hidden">
            {/* Mobile gamification status */}
            {mounted && (
              <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-700">
                <Link
                  href="/stats"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 p-3 dark:from-amber-900/30 dark:to-orange-900/30"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-lg font-bold text-white">
                    {getLevel().level}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Niveau {getLevel().level}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-primary-500" />
                        {totalPoints} XP
                      </span>
                      {currentStreak > 0 && (
                        <span className="flex items-center gap-1">
                          <Flame className="h-3 w-3 text-orange-500" />
                          {currentStreak} jours
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            )}
            <div className="space-y-1 px-4 py-3">
              {navigation.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== '/' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium transition-colors',
                      isActive
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </nav>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
