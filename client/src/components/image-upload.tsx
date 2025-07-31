import { forwardRef, useRef } from "react";
import { CloudUpload } from "lucide-react";

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
}

const ImageUpload = forwardRef<HTMLInputElement, ImageUploadProps>(
  ({ onImageSelect }, ref) => {
    const internalRef = useRef<HTMLInputElement>(null);
    const fileInputRef = ref || internalRef;

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.currentTarget.classList.remove('dragover');
      
      const files = e.dataTransfer.files;
      if (files.length && files[0].type.startsWith('image/')) {
        onImageSelect(files[0]);
      }
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.currentTarget.classList.add('dragover');
    };

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      e.currentTarget.classList.remove('dragover');
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith('image/')) {
        onImageSelect(file);
      }
    };

    const handleClick = () => {
      if (fileInputRef && 'current' in fileInputRef && fileInputRef.current) {
        fileInputRef.current.click();
      }
    };

    return (
      <div
        className="upload-zone border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer transition-all duration-300 hover:border-gorgeous-pink hover:bg-gorgeous-pink-light/50"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-gorgeous-pink/10 rounded-full flex items-center justify-center">
            <CloudUpload className="w-8 h-8 text-gorgeous-pink" />
          </div>
          <div>
            <p className="text-gray-600 font-medium">Tap to upload or drag & drop</p>
            <p className="text-sm text-gray-500 mt-1">JPG, PNG up to 10MB</p>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    );
  }
);

ImageUpload.displayName = "ImageUpload";

export default ImageUpload;
