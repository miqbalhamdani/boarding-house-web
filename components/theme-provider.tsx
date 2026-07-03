"use client"

import * as React from "react"
 
type Theme = "light" | "dark" | "system"

type ThemeContextValue = {
  theme: Theme
  resolvedTheme: "light" | "dark"
  setTheme: (theme: Theme) => void
}

const STORAGE_KEY = "theme"

const ThemeContext = React.createContext<ThemeContextValue | null>(null)

function getSystemTheme() {
  if (typeof window === "undefined") {
    return "light"
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") {
    return
  }

  const resolved = theme === "system" ? getSystemTheme() : theme
  const root = document.documentElement

  root.classList.remove("light", "dark")
  root.classList.add(resolved)
  root.style.colorScheme = resolved
}

function ThemeProvider({
  children,
  defaultTheme = "system",
}: {
  children: React.ReactNode
  defaultTheme?: Theme
}) {
  const [theme, setThemeState] = React.useState<Theme>(() => {
    if (typeof window === "undefined") {
      return defaultTheme
    }

    const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null
    return stored ?? defaultTheme
  })

  const [systemTheme, setSystemTheme] = React.useState<"light" | "dark">(() =>
    getSystemTheme()
  )

  const resolvedTheme =
    theme === "system" ? systemTheme : (theme as "light" | "dark")

  React.useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const onChange = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? "dark" : "light")
    }

    media.addEventListener("change", onChange)
    return () => {
      media.removeEventListener("change", onChange)
    }
  }, [])

  React.useEffect(() => {
    applyTheme(theme)
  }, [theme, systemTheme])

  const setTheme = React.useCallback((nextTheme: Theme) => {
    setThemeState(nextTheme)
    window.localStorage.setItem(STORAGE_KEY, nextTheme)
  }, [])

  const value = React.useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme]
  )

  return (
    <ThemeContext.Provider value={value}>
      <ThemeHotkey />
      {children}
    </ThemeContext.Provider>
  )
}

function useTheme() {
  const context = React.useContext(ThemeContext)

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider")
  }

  return context
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  )
}

function ThemeHotkey() {
  const { resolvedTheme, setTheme } = useTheme()

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.repeat) {
        return
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return
      }

      if (event.key.toLowerCase() !== "d") {
        return
      }

      if (isTypingTarget(event.target)) {
        return
      }

      setTheme(resolvedTheme === "dark" ? "light" : "dark")
    }

    window.addEventListener("keydown", onKeyDown)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [resolvedTheme, setTheme])

  return null
}

export { ThemeProvider, useTheme }
