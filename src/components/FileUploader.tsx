import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X } from "lucide-react";
import { toast } from "sonner";

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
}

export const FileUploader = ({ onFileSelect }: FileUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showCameraPreview, setShowCameraPreview] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const startCamera = async () => {
    console.log("Starting camera...");
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("MediaDevices API not supported");
        throw new Error("Camera access is not supported in your browser");
      }

      console.log("Requesting camera access...");
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      console.log("Camera access granted", mediaStream.getVideoTracks()[0].label);

      setShowCameraPreview(true); // Set this first to ensure the video element is rendered
      
      if (videoRef.current) {
        console.log("Setting video source...");
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          console.log("Video metadata loaded, playing...");
          videoRef.current?.play().catch(e => {
            console.error("Error playing video:", e);
          });
        };
        setStream(mediaStream);
      } else {
        console.error("Video ref is null");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unable to access camera";
      console.error("Camera error:", error);
      toast.error(errorMessage);
      stopCamera();
    }
  };

  const stopCamera = () => {
    console.log("Stopping camera...");
    if (stream) {
      stream.getTracks().forEach(track => {
        console.log("Stopping track:", track.label);
        track.stop();
      });
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setStream(null);
    }
    setShowCameraPreview(false);
  };

  const captureImage = () => {
    console.log("Attempting to capture image...");
    if (!videoRef.current) {
      console.error("Video ref is null during capture");
      return;
    }

    console.log("Video dimensions:", {
      width: videoRef.current.videoWidth,
      height: videoRef.current.videoHeight
    });

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const context = canvas.getContext("2d");
    
    if (context) {
      console.log("Drawing video frame to canvas...");
      context.drawImage(videoRef.current, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          console.log("Image captured successfully, size:", blob.size);
          const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
          handleFileSelect(file);
          stopCamera();
        } else {
          console.error("Failed to create blob from canvas");
        }
      }, "image/jpeg", 0.8);
    } else {
      console.error("Failed to get canvas context");
    }
  };

  if (showCameraPreview) {
    return (
      <div className="relative w-full min-h-[300px] rounded-lg overflow-hidden bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
          <Button
            variant="destructive"
            onClick={stopCamera}
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </Button>
          <Button
            onClick={captureImage}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600"
          >
            <Camera className="w-4 h-4" />
            Capture
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative flex flex-col items-center justify-center w-full min-h-[300px] border-2 border-dashed rounded-lg transition-colors ${
        isDragging ? "border-primary bg-accent/20" : "border-border"
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
      />

      <div className="flex flex-col items-center gap-4 p-6 text-center animate-fade-up">
        <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
          <Upload className="w-8 h-8 text-accent-foreground" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Upload Whiteboard Image</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Drag and drop or click to upload
          </p>
        </div>
        <div className="flex gap-4 mt-4">
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Choose File
          </Button>
          {/* Temporarily disabled camera functionality
          <Button
            variant="outline"
            onClick={startCamera}
            className="flex items-center gap-2"
          >
            <Camera className="w-4 h-4" />
            Take Photo
          </Button>
          */}
        </div>
      </div>
    </div>
  );
};
