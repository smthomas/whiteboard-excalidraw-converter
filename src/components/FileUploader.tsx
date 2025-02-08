
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Upload } from "lucide-react";
import { toast } from "sonner";

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
}

export const FileUploader = ({ onFileSelect }: FileUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

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

  const captureImage = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement("video");
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d")?.drawImage(video, 0, 0);

      stream.getTracks().forEach(track => track.stop());

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
          handleFileSelect(file);
        }
      }, "image/jpeg");
    } catch (error) {
      toast.error("Unable to access camera");
    }
  };

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
            onClick={captureImage}
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
