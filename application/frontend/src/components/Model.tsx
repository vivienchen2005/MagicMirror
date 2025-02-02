import * as React from "react";
import { useEffect, useRef, useState } from "react";

interface ModelProps {
  src: string;
  color: string;
  maxWidth?: number;
  maxHeight?: number;
}

const Model: React.FunctionComponent<ModelProps> = ({ src, color, maxWidth, maxHeight }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "Anonymous"; // Prevents CORS issues
    img.src = src;

    img.onload = () => {
      setLoaded(true);

      // Calculate the dimensions while maintaining aspect ratio
      let width = img.width;
      let height = img.height;

      if (maxWidth && maxHeight) {
        const scale = Math.min(maxWidth / width, maxHeight / height);
        width *= scale;
        height *= scale;
      }

      // Update canvas size
      canvas.width = width;
      canvas.height = height;

      // Draw the original image
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      // Apply tint using an offscreen canvas
      const tintCanvas = document.createElement("canvas");
      const tintCtx = tintCanvas.getContext("2d");

      if (!tintCtx) return;

      tintCanvas.width = width;
      tintCanvas.height = height;

      // Fill with the selected color
      tintCtx.fillStyle = color;
      tintCtx.fillRect(0, 0, width, height);

      // Apply image as a mask
      tintCtx.globalCompositeOperation = "destination-atop";
      tintCtx.drawImage(img, 0, 0, width, height);

      // Draw the final tinted image onto the main canvas
      ctx.drawImage(tintCanvas, 0, 0, width, height);
    };
  }, [src, color, maxWidth, maxHeight]);

  return (
    <div className="flex justify-center items-center">
      {!loaded && <p>Loading...</p>}
      <canvas ref={canvasRef} />
    </div>
  );
};

export default Model;
