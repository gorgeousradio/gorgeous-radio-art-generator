import { useState, useRef, useEffect } from "react";

interface TextSizeSliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
}

export default function TextSizeSlider({ value, onChange, min, max }: TextSizeSliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const percentage = ((value - min) / (max - min)) * 100;

  const updateValue = (clientX: number) => {
    if (!sliderRef.current) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const newPercentage = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const newValue = Math.round(min + (newPercentage / 100) * (max - min));
    
    onChange(newValue);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    updateValue(e.clientX);
    e.preventDefault();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    updateValue(e.touches[0].clientX);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        updateValue(e.clientX);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging) {
        updateValue(e.touches[0].clientX);
        e.preventDefault();
      }
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging]);

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">Text Size</span>
        <span className="text-sm text-gorgeous-pink font-medium">{value}px</span>
      </div>
      
      <div
        ref={sliderRef}
        className="relative w-full h-6 cursor-pointer"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Track */}
        <div className="absolute top-1/2 transform -translate-y-1/2 w-full h-2 bg-gray-200 rounded-full">
          {/* Fill */}
          <div
            className="h-full bg-gradient-to-r from-gorgeous-pink to-gorgeous-pink-dark rounded-full transition-all duration-200"
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        {/* Thumb */}
        <div
          className={`absolute top-1/2 w-5 h-5 bg-white border-3 border-gorgeous-pink rounded-full transform -translate-y-1/2 cursor-grab shadow-lg transition-all duration-200 ${
            isDragging ? 'scale-110 cursor-grabbing' : ''
          }`}
          style={{ left: `${percentage}%`, transform: `translate(-50%, -50%) ${isDragging ? 'scale(1.1)' : ''}` }}
        />
      </div>
      
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>Small</span>
        <span>Large</span>
      </div>
    </div>
  );
}
