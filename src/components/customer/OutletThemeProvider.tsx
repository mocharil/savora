'use client'

import { createContext, useContext, ReactNode } from 'react'
import type { OutletTheme, OutletBranding } from '@/types/outlet'

interface ThemeContextType {
  theme: OutletTheme
  branding: OutletBranding
  storeName: string
  outletName: string
  storeSlug: string
  outletSlug: string
}

const ThemeContext = createContext<ThemeContextType | null>(null)

export function useOutletTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useOutletTheme must be used within OutletThemeProvider')
  }
  return context
}

interface Props {
  children: ReactNode
  theme: OutletTheme
  branding: OutletBranding
  storeName: string
  outletName: string
  storeSlug: string
  outletSlug: string
}

export function OutletThemeProvider({
  children,
  theme,
  branding,
  storeName,
  outletName,
  storeSlug,
  outletSlug,
}: Props) {
  // Default theme values
  const safeTheme: OutletTheme = {
    primaryColor: theme?.primaryColor || '#10b981',
    secondaryColor: theme?.secondaryColor || '#059669',
    backgroundColor: theme?.backgroundColor || '#ffffff',
    textColor: theme?.textColor || '#1f2937',
    fontFamily: theme?.fontFamily || 'Inter',
    logoUrl: theme?.logoUrl || null,
    bannerUrl: theme?.bannerUrl || null,
    customCss: theme?.customCss || null,
  }

  const safeBranding: OutletBranding = {
    businessName: branding?.businessName || null,
    tagline: branding?.tagline || null,
    description: branding?.description || null,
    socialLinks: branding?.socialLinks || {},
    contactInfo: branding?.contactInfo || {},
  }

  return (
    <ThemeContext.Provider
      value={{
        theme: safeTheme,
        branding: safeBranding,
        storeName,
        outletName,
        storeSlug,
        outletSlug,
      }}
    >
      <style jsx global>{`
        :root {
          --theme-primary: ${safeTheme.primaryColor};
          --theme-secondary: ${safeTheme.secondaryColor};
          --theme-background: ${safeTheme.backgroundColor};
          --theme-text: ${safeTheme.textColor};
          --theme-font: ${safeTheme.fontFamily}, sans-serif;
        }

        .outlet-theme {
          font-family: var(--theme-font);
          background-color: var(--theme-background);
          color: var(--theme-text);
        }

        .outlet-theme .btn-primary {
          background-color: var(--theme-primary);
          color: white;
        }

        .outlet-theme .btn-primary:hover {
          background-color: var(--theme-secondary);
        }

        .outlet-theme .text-primary {
          color: var(--theme-primary);
        }

        .outlet-theme .bg-primary {
          background-color: var(--theme-primary);
        }

        .outlet-theme .border-primary {
          border-color: var(--theme-primary);
        }

        .outlet-theme .ring-primary {
          --tw-ring-color: var(--theme-primary);
        }

        ${safeTheme.customCss || ''}
      `}</style>
      {children}
    </ThemeContext.Provider>
  )
}
