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
          --color-primary: ${safeTheme.primaryColor};
        }

        .outlet-theme {
          font-family: var(--theme-font);
          background-color: var(--theme-background);
          color: var(--theme-text);
        }

        /* Primary color overrides */
        .outlet-theme .text-primary,
        .outlet-theme .text-orange-500,
        .outlet-theme .text-orange-600 {
          color: var(--theme-primary) !important;
        }

        .outlet-theme .bg-primary,
        .outlet-theme .bg-orange-500,
        .outlet-theme .bg-orange-600 {
          background-color: var(--theme-primary) !important;
        }

        .outlet-theme .border-primary,
        .outlet-theme .border-orange-500,
        .outlet-theme .border-orange-400 {
          border-color: var(--theme-primary) !important;
        }

        .outlet-theme .ring-primary {
          --tw-ring-color: var(--theme-primary);
        }

        /* Gradient overrides */
        .outlet-theme .from-orange-500,
        .outlet-theme .bg-gradient-to-r.from-orange-500,
        .outlet-theme .bg-gradient-to-br.from-orange-500 {
          --tw-gradient-from: var(--theme-primary) !important;
        }

        .outlet-theme .to-red-500,
        .outlet-theme .to-orange-500 {
          --tw-gradient-to: var(--theme-secondary) !important;
        }

        /* Background opacity overrides */
        .outlet-theme .bg-orange-50,
        .outlet-theme .bg-orange-100 {
          background-color: color-mix(in srgb, var(--theme-primary) 10%, white) !important;
        }

        .outlet-theme .bg-primary\\/5,
        .outlet-theme .bg-primary\\/10 {
          background-color: color-mix(in srgb, var(--theme-primary) 10%, transparent) !important;
        }

        /* Shadow overrides */
        .outlet-theme .shadow-orange-200,
        .outlet-theme .shadow-orange-300\\/50 {
          --tw-shadow-color: color-mix(in srgb, var(--theme-primary) 30%, transparent);
        }

        /* Focus ring */
        .outlet-theme .focus\\:ring-orange-300:focus,
        .outlet-theme .focus\\:ring-primary:focus {
          --tw-ring-color: color-mix(in srgb, var(--theme-primary) 50%, transparent);
        }

        /* Button hover states */
        .outlet-theme .hover\\:bg-orange-100:hover,
        .outlet-theme .hover\\:bg-orange-50:hover {
          background-color: color-mix(in srgb, var(--theme-primary) 15%, white) !important;
        }

        /* Border overrides */
        .outlet-theme .border-orange-100,
        .outlet-theme .border-orange-200 {
          border-color: color-mix(in srgb, var(--theme-primary) 20%, white) !important;
        }

        /* Animated pulse with theme color */
        .outlet-theme .animate-pulse .bg-primary,
        .outlet-theme .bg-primary.animate-pulse {
          background-color: var(--theme-primary);
        }

        ${safeTheme.customCss || ''}
      `}</style>
      {children}
    </ThemeContext.Provider>
  )
}
