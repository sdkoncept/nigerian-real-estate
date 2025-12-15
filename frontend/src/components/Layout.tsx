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
        // Only add listeners if not already protected (prevent duplicate listeners)
        if (!img.hasAttribute('data-protected')) {
          // Prevent right-click
          img.addEventListener('contextmenu', (e) => e.preventDefault());
          // Prevent drag
          img.addEventListener('dragstart', (e) => e.preventDefault());
          // Set draggable to false
          img.setAttribute('draggable', 'false');
          img.setAttribute('data-protected', 'true');
        }
      });
    };

    // Run on mount
    protectAllImages();
    
    // Use MutationObserver with debouncing to protect dynamically added images
    let timeoutId: NodeJS.Timeout;
    const observer = new MutationObserver(() => {
      // Debounce to avoid running on every tiny DOM change
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        protectAllImages();
      }, 100); // Wait 100ms before running
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

