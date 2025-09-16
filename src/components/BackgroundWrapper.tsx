/**
 * Background Wrapper Component
 * Provides Minecraft-themed background for the entire application
 */
import { ReactNode } from 'react';
import minecraftBg from '@/assets/minecraft-bg.jpg';

interface BackgroundWrapperProps {
  children: ReactNode;
}

export const BackgroundWrapper = ({ children }: BackgroundWrapperProps) => {
  return (
    <div 
      className="min-h-screen"
      style={{
        backgroundImage: `url(${minecraftBg})`,
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Minecraft-themed overlay */}
      <div className="absolute inset-0 bg-black/10 dark:bg-black/30" 
           style={{
             backgroundImage: `
               linear-gradient(45deg, transparent 48%, rgba(0, 0, 0, 0.05) 49%, rgba(0, 0, 0, 0.05) 51%, transparent 52%),
               linear-gradient(-45deg, transparent 48%, rgba(0, 0, 0, 0.05) 49%, rgba(0, 0, 0, 0.05) 51%, transparent 52%)
             `,
             backgroundSize: '20px 20px',
             pointerEvents: 'none'
           }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};