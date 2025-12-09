import { useEffect } from 'react';
import type { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  useEffect(() => {
    // Global protection for all images on the page
    const protectAllImages = () => {
      const images = document.querySelectorAll('img');
      images.forEach((img) => {
        // Prevent right-click
        img.addEventListener('contextmenu', (e) => e.preventDefault());
        // Prevent drag
        img.addEventListener('dragstart', (e) => e.preventDefault());
        // Set draggable to false
        img.setAttribute('draggable', 'false');
      });
    };

    // Run on mount and whenever DOM changes
    protectAllImages();
    
    // Use MutationObserver to protect dynamically added images
    const observer = new MutationObserver(() => {
      protectAllImages();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Prevent keyboard shortcuts globally
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Ctrl+S (Save)
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        return false;
      }
      // Prevent Ctrl+Shift+I (DevTools)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        return false;
      }
      // Prevent F12 (DevTools)
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      observer.disconnect();
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}

