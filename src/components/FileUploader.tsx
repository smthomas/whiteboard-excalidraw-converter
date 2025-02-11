
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
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setShowCameraPreview(true);
    } catch (error) {
      toast.error("Unable to access camera");
      console.error(error);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCameraPreview(false);
  };

  const captureImage = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
        handleFileSelect(file);
        stopCamera();
      }
    }, "image/jpeg");
  };

  if (showCameraPreview) {
    return (
      <div className="relative w-full min-h-[300px] rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
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
          <Button
            variant="outline"
            onClick={startCamera}
            className="flex items-center gap-2"
          >
            <Camera className="w-4 h-4" />
            Take Photo
          </Button>
        </div>
      </div>
    </div>
  );
};
