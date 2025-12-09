import { useEffect, useRef } from 'react';

interface ProtectedImageProps {
  src: string;
  alt: string;
  className?: string;
  onError?: () => void;
  loading?: 'lazy' | 'eager';
}

export default function ProtectedImage({ 
  src, 
  alt, 
  className = '', 
  onError,
  loading = 'lazy'
}: ProtectedImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const image = imageRef.current;
    
    if (!container || !image) return;

    // Prevent right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Prevent drag and drop
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    // Prevent image selection
    const handleSelectStart = (e: Event) => {
      e.preventDefault();
      return false;
    };

    // Prevent keyboard shortcuts (Ctrl+S, Ctrl+P, Print Screen)
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Ctrl+S (Save)
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        return false;
      }
      // Prevent Ctrl+P (Print)
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        return false;
      }
      // Prevent Print Screen (F12, PrtScn)
      if (e.key === 'F12' || e.key === 'PrintScreen') {
        e.preventDefault();
        return false;
      }
    };

    // Prevent copy/paste
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      return false;
    };

    // Add event listeners
    container.addEventListener('contextmenu', handleContextMenu);
    container.addEventListener('dragstart', handleDragStart);
    container.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('copy', handleCopy);

    // Disable image dragging via HTML attribute
    image.draggable = false;

    // Cleanup
    return () => {
      container.removeEventListener('contextmenu', handleContextMenu);
      container.removeEventListener('dragstart', handleDragStart);
      container.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('copy', handleCopy);
    };
  }, []);

  // Additional protection: detect DevTools opening
  useEffect(() => {
    let devToolsOpen = false;
    
    const detectDevTools = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      if (widthThreshold || heightThreshold) {
        if (!devToolsOpen) {
          devToolsOpen = true;
          // Optionally show a warning or blur images when DevTools is detected
          console.warn('Developer tools detected. Image protection is active.');
        }
      } else {
        devToolsOpen = false;
      }
    };

    const interval = setInterval(detectDevTools, 500);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative"
      style={{
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        pointerEvents: 'auto',
        display: 'inline-block',
      }}
    >
      {/* Transparent overlay to prevent direct image access */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background: 'transparent',
          pointerEvents: 'none',
        }}
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
      />
      
      {/* Watermark overlay */}
      <div
        className="absolute inset-0 z-20 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.02) 10px, rgba(0,0,0,0.02) 20px)',
        }}
      />
      
      {/* The actual image */}
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        className={className}
        onError={onError}
        loading={loading}
        draggable={false}
        style={{
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          pointerEvents: 'auto',
          position: 'relative',
          zIndex: 1,
        } as React.CSSProperties}
        onContextMenu={(e: React.MouseEvent) => e.preventDefault()}
        onDragStart={(e: React.DragEvent) => e.preventDefault()}
      />
    </div>
  );
}

