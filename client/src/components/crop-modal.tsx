import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crop, ZoomIn, ZoomOut, RotateCw } from "lucide-react";

interface CropModalProps {
  isOpen: boolean;
  imageData: string | null;
  onCropComplete: (croppedData: string) => void;
  onClose: () => void;
}

export default function CropModal({ isOpen, imageData, onCropComplete, onClose }: CropModalProps) {
  const [cropper, setCropper] = useState<any>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (isOpen && imageData && imageRef.current) {
      // Dynamically import Cropper.js
      import('cropperjs').then(({ default: Cropper }) => {
        const cropperInstance = new Cropper(imageRef.current!, {
          aspectRatio: 1,
          viewMode: 1,
          dragMode: 'move' as any,
          autoCropArea: 1,
          cropBoxResizable: false,
          cropBoxMovable: false,
          responsive: true,
          scalable: true,
          zoomable: true,
          zoomOnWheel: false,
          zoomOnTouch: true,
          wheelZoomRatio: 0.1,
          minContainerWidth: 200,
          minContainerHeight: 200
        });
        setCropper(cropperInstance);
      });
    }

    return () => {
      if (cropper) {
        cropper.destroy();
        setCropper(null);
      }
    };
  }, [isOpen, imageData]);

  const handleApplyCrop = () => {
    if (!cropper) return;

    const canvas = cropper.getCroppedCanvas({
      width: 1080,
      height: 1080,
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high'
    });

    const croppedData = canvas.toDataURL('image/png', 1.0);
    onCropComplete(croppedData);
  };

  const handleClose = () => {
    if (cropper) {
      cropper.destroy();
      setCropper(null);
    }
    onClose();
  };

  const handleZoomIn = () => {
    if (cropper) {
      cropper.zoom(0.1);
    }
  };

  const handleZoomOut = () => {
    if (cropper) {
      cropper.zoom(-0.1);
    }
  };

  const handleRotate = () => {
    if (cropper) {
      cropper.rotate(90);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl w-full max-h-[95vh] overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center text-xl font-semibold text-gray-800">
            <Crop className="w-5 h-5 mr-2 text-gorgeous-pink" />
            Crop Your Image
          </DialogTitle>
          <p className="text-gray-600 text-sm mt-1">Position and resize your image to fit perfectly</p>
        </DialogHeader>
        
        {/* Zoom Controls */}
        <div className="px-6 pb-4">
          <div className="flex items-center gap-2 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              className="h-8 w-8 p-0"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm text-gray-600 mx-2">Zoom</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              className="h-8 w-8 p-0"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRotate}
              className="h-8 w-8 p-0 ml-4"
            >
              <RotateCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="crop-container px-6 pb-4" style={{ height: '400px' }}>
          {imageData && (
            <img
              ref={imageRef}
              src={imageData}
              alt="Image to crop"
              className="max-w-full max-h-full block mx-auto"
            />
          )}
        </div>
        
        <div className="px-6 pb-6 flex gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
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
