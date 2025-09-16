/**
 * Theme Provider Component
 * Provides persistent dark/light mode functionality across the application
 * Uses next-themes for seamless theme management
 */
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}