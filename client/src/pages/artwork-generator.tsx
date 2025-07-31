import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { User, Mic, Image as ImageIcon, Download, Eye } from "lucide-react";
import TextSizeSlider from "@/components/text-size-slider";
import TextPositionSlider from "@/components/text-position-slider";
import PresenterSelection from "@/components/presenter-selection";
import ImageUpload from "@/components/image-upload";
import ArtworkPreview from "@/components/artwork-preview";
import CropModal from "@/components/crop-modal";
import { useArtworkGenerator } from "@/hooks/use-artwork-generator";

export default function ArtworkGenerator() {
  const { toast } = useToast();
  const {
    guestName,
    setGuestName,
    textSize,
    setTextSize,
    textPosition,
    setTextPosition,
    selectedPresenter,
    setSelectedPresenter,
    uploadedImage,
    setUploadedImage,
    croppedImageData,
    setCroppedImageData,
    isGenerating,
    generateArtwork
  } = useArtworkGenerator();

  const [showCropModal, setShowCropModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedData: string) => {
    setCroppedImageData(croppedData);
    setShowCropModal(false);
    toast({
      title: "Image cropped successfully",
      description: "Your image has been prepared for the artwork."
    });
  };

  const handleGenerate = async () => {
    if (!guestName.trim()) {
      toast({
        title: "Missing guest name",
        description: "Please enter the guest name.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedPresenter) {
      toast({
        title: "No presenter selected",
        description: "Please select a presenter.",
        variant: "destructive"
      });
      return;
    }

    if (!croppedImageData) {
      toast({
        title: "No image uploaded",
        description: "Please upload and crop a guest photo.",
        variant: "destructive"
      });
      return;
    }

    try {
      await generateArtwork();
      toast({
        title: "Artwork generated!",
        description: "Your artwork has been downloaded successfully."
      });
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "There was an error generating your artwork. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="gradient-bg text-white p-4 sticky top-0 z-40">
        <div className="max-w-md mx-auto">
          <h1 className="gordita-black text-2xl md:text-3xl text-center mb-2">
            GORGEOUS RADIO
          </h1>
          <p className="text-center text-sm opacity-90">
            Artwork Generator
          </p>
        </div>
      </header>

      <div className="max-w-md mx-auto p-4 pb-20 space-y-6">
        {/* Guest Name Input */}
        <Card className="glass-card p-6">
          <Label className="flex items-center text-sm font-medium text-gray-700 mb-3">
            <User className="w-4 h-4 mr-2 text-gorgeous-pink" />
            Guest Name
          </Label>
          <Input
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Enter guest name..."
            className="w-full px-4 py-3 bg-white/70 border border-gray-200 rounded-xl focus:border-gorgeous-pink focus:ring-2 focus:ring-gorgeous-pink/20 transition-all duration-200"
          />
        </Card>

        {/* Presenter Selection */}
        <Card className="glass-card p-6">
          <Label className="flex items-center text-sm font-medium text-gray-700 mb-4">
            <Mic className="w-4 h-4 mr-2 text-gorgeous-pink" />
            Select Presenter
          </Label>
          <PresenterSelection
            selected={selectedPresenter}
            onSelect={setSelectedPresenter}
          />
        </Card>

        {/* Image Upload */}
        <Card className="glass-card p-6">
          <Label className="flex items-center text-sm font-medium text-gray-700 mb-4">
            <ImageIcon className="w-4 h-4 mr-2 text-gorgeous-pink" />
            Guest Photo
          </Label>
          <ImageUpload
            onImageSelect={handleImageSelect}
            ref={fileInputRef}
          />
        </Card>

        {/* Live Preview */}
        <Card className="glass-card p-6">
          <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-4 justify-center">
            <Eye className="w-5 h-5 mr-2 text-gorgeous-pink" />
            Live Preview
          </h3>
          <ArtworkPreview
            guestName={guestName}
            textSize={textSize}
            textPosition={textPosition}
            selectedPresenter={selectedPresenter}
            croppedImageData={croppedImageData}
          />
          
          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !guestName.trim() || !selectedPresenter || !croppedImageData}
            className="w-full mt-6 bg-gorgeous-pink hover:bg-gorgeous-pink-dark text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:transform-none"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Generate Artwork
              </>
            )}
          </Button>
        </Card>

        {/* Text Adjustments */}
        <Card className="glass-card p-6 space-y-6">
          <TextSizeSlider
            value={textSize}
            onChange={setTextSize}
            min={16}
            max={60}
          />
          <TextPositionSlider
            value={textPosition}
            onChange={setTextPosition}
            min={50}
            max={90}
          />
        </Card>
      </div>

      {/* Admin Link */}
      <div className="text-center mt-6">
        <a 
          href="/admin" 
          className="text-xs text-gorgeous-pink hover:underline"
        >
          Admin
        </a>
      </div>

      {/* Crop Modal */}
      <CropModal
        isOpen={showCropModal}
        imageData={uploadedImage}
        onCropComplete={handleCropComplete}
        onClose={() => setShowCropModal(false)}
      />
    </div>
  );
}
