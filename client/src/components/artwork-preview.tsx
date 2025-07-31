import { useEffect, useRef } from "react";
import { User } from "lucide-react";

interface ArtworkPreviewProps {
  guestName: string;
  textSize: number;
  textPosition: number;
  selectedPresenter: string;
  croppedImageData: string | null;
}

export default function ArtworkPreview({
  guestName,
  textSize,
  textPosition,
  selectedPresenter,
  croppedImageData
}: ArtworkPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const displayName = guestName.trim() || 'GUEST NAME';

  useEffect(() => {
    // Auto-adjust text size if it overflows
    if (containerRef.current) {
      const nameElement = containerRef.current.querySelector('.name-overlay') as HTMLDivElement;
      if (nameElement) {
        const containerWidth = containerRef.current.offsetWidth * 0.9;
        const textWidth = nameElement.scrollWidth;
        
        if (textWidth > containerWidth && textSize > 16) {
          const ratio = containerWidth / textWidth;
          const adjustedSize = Math.max(16, Math.floor(textSize * ratio));
          nameElement.style.fontSize = `${adjustedSize}px`;
        } else {
          nameElement.style.fontSize = `${textSize}px`;
        }
      }
    }
  }, [guestName, textSize]);

  return (
    <div ref={containerRef} className="preview-canvas" id="previewCanvas">
      {/* Background */}
      <div className="absolute inset-0 gradient-bg" />
      
      {/* Guest image */}
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{
          backgroundImage: croppedImageData ? `url(${croppedImageData})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {!croppedImageData && (
          <User className="w-16 h-16 text-gray-400" />
        )}
      </div>
      
      {/* Presenter overlay */}
      {selectedPresenter && (
        <img
          src={`/images/presenters/${selectedPresenter}.png`}
          alt="Presenter Overlay"
          className="presenter-overlay"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
      )}
      
      {/* Name overlay */}
      <div 
        className="absolute left-1/2 transform -translate-x-1/2 z-10 text-white gordita-black text-center whitespace-nowrap"
        style={{ 
          fontSize: `${textSize}px`,
          top: `${textPosition}%`,
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
          letterSpacing: '1px',
          lineHeight: '1'
        }}
      >
        {displayName.toUpperCase()}
      </div>
    </div>
  );
}
