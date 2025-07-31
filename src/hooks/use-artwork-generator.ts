import { useState } from "react";
import { useQuery } from '@tanstack/react-query';
import { loadImage, createCanvas, downloadCanvas, drawTextWithShadow } from "@/lib/canvas-utils";
import type { Presenter } from '@shared/schema';

export function useArtworkGenerator() {
  const [guestName, setGuestName] = useState("");
  const [textSize, setTextSize] = useState(20);
  const [textPosition, setTextPosition] = useState(83); // Percentage from top (83% = optimal banner position)
  const [selectedPresenter, setSelectedPresenter] = useState<Presenter | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [croppedImageData, setCroppedImageData] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch presenters for banner image lookup
  const { data: presenters = [] } = useQuery<Presenter[]>({
    queryKey: ['/api/presenters'],
  });

  const generateArtwork = async () => {
    if (!croppedImageData || !selectedPresenter || !guestName.trim()) {
      throw new Error("Missing required data");
    }

    setIsGenerating(true);

    try {
      // Create canvas
      const canvas = createCanvas(1080, 1080);
      const ctx = canvas.getContext('2d')!;

      // Load and draw guest image
      const guestImg = await loadImage(croppedImageData);
      ctx.drawImage(guestImg, 0, 0, 1080, 1080);

      // Load and draw presenter overlay
      try {
        const bannerImageUrl = selectedPresenter?.bannerImageUrl || `/images/presenters/${selectedPresenter?.name}.png`;
        const presenterImg = await loadImage(bannerImageUrl);
        // Draw presenter overlay at bottom (matching design)
        const overlayHeight = 347; // Based on original design
        ctx.drawImage(presenterImg, 0, 1080 - overlayHeight, 1080, overlayHeight);
      } catch (error) {
        console.warn('Could not load presenter overlay:', error);
      }

      // Draw text
      const text = guestName.trim().toUpperCase();
      const fontSize = textSize * 2; // Scale up for high-res canvas
      // Position text using percentage from top
      drawTextWithShadow(ctx, text, 1080 / 2, 1080 * (textPosition / 100), fontSize);

      // Download the result
      const filename = `${guestName.trim().replace(/\s+/g, '_')}_gorgeous_radio.png`;
      downloadCanvas(canvas, filename);

    } finally {
      setIsGenerating(false);
    }
  };

  return {
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
  };
}
