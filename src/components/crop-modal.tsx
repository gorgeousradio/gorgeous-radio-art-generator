import { useRef, useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Crop } from "lucide-react";

interface CropModalProps {
  isOpen: boolean;
  imageData: string | null;
  onCropComplete: (croppedData: string) => void;
  onClose: () => void;
}

export default function CropModal({ isOpen, imageData, onCropComplete, onClose }: CropModalProps) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;
    
    setPosition(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));
    
    setLastMousePos({ x: e.clientX, y: e.clientY });
  }, [isDragging, lastMousePos]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleApplyCrop = () => {
    if (!imageRef.current || !containerRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d')!;

    const container = containerRef.current;
    const img = imageRef.current;
    
    // Container is now 400x400, crop area is inset by 8px (2 * 4px) so 384x384
    const cropSize = 384;
    const containerCenterX = 200; // 400/2
    const containerCenterY = 200; // 400/2
    
    // Calculate the image's position and scale within the container
    const imgRect = img.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    // Image position relative to container center
    const imgCenterX = (imgRect.left + imgRect.width/2) - (containerRect.left + containerRect.width/2);
    const imgCenterY = (imgRect.top + imgRect.height/2) - (containerRect.top + containerRect.height/2);
    
    // Calculate what part of the image to crop (384x384 area from container center)
    const scaleX = img.naturalWidth / imgRect.width;
    const scaleY = img.naturalHeight / imgRect.height;
    
    // Crop from center of container (where the crop frame is)
    const cropHalfSize = cropSize / 2;
    const sourceX = Math.max(0, (img.naturalWidth/2) - (imgCenterX * scaleX) - (cropHalfSize * scaleX));
    const sourceY = Math.max(0, (img.naturalHeight/2) - (imgCenterY * scaleY) - (cropHalfSize * scaleY));
    const sourceWidth = Math.min(img.naturalWidth - sourceX, cropSize * scaleX);
    const sourceHeight = Math.min(img.naturalHeight - sourceY, cropSize * scaleY);

    ctx.drawImage(
      img,
      sourceX, sourceY, sourceWidth, sourceHeight,
      0, 0, 1080, 1080
    );

    const croppedData = canvas.toDataURL('image/png', 1.0);
    onCropComplete(croppedData);
    onClose();
  };

  const resetPosition = () => {
    setPosition({ x: 0, y: 0 });
    setZoom(1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full max-h-[95vh] overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center text-xl font-semibold text-gray-800">
            <Crop className="w-5 h-5 mr-2 text-gorgeous-pink" />
            Crop Your Image
          </DialogTitle>
          <p className="text-gray-600 text-sm mt-1">Drag to position, use slider to zoom</p>
        </DialogHeader>
        
        {/* Zoom Slider */}
        <div className="px-6 pb-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Zoom</span>
              <span className="text-sm text-gray-500">{zoom.toFixed(1)}x</span>
            </div>
            <Slider
              value={[zoom]}
              onValueChange={(value) => setZoom(value[0])}
              min={0.5}
              max={3}
              step={0.1}
              className="w-full"
            />
          </div>
        </div>
        
        {/* Crop Container */}
        <div 
          ref={containerRef}
          className="crop-container mx-6 mb-4 relative overflow-hidden bg-gray-100 rounded-lg"
          style={{ 
            height: '400px', 
            width: '400px', 
            marginLeft: 'auto',
            marginRight: 'auto',
            cursor: isDragging ? 'grabbing' : 'grab' 
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Crop frame overlay - shows the exact crop area */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-2 border-2 border-gorgeous-pink border-dashed rounded-lg"></div>
          </div>
          
          {imageData && (
            <img
              ref={imageRef}
              src={imageData}
              alt="Image to crop"
              className="absolute select-none"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                transformOrigin: 'center center',
                left: '50%',
                top: '50%',
                marginLeft: '-50%',
                marginTop: '-50%',
                maxWidth: 'none',
                maxHeight: 'none'
              }}
              draggable={false}
            />
          )}
        </div>
        
        <div className="px-6 pb-6 flex gap-3">
          <Button
            variant="outline"
            onClick={resetPosition}
            className="flex-1"
          >
            Reset
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleApplyCrop}
            className="flex-1 bg-gorgeous-pink hover:bg-gorgeous-pink-dark text-white"
          >
            Apply Crop
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
