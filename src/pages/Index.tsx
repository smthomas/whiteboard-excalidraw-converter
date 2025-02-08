
import { useState } from "react";
import { FileUploader } from "@/components/FileUploader";
import { FilePreview } from "@/components/FilePreview";
import { toast } from "sonner";

interface ExcalidrawResponse {
  filename: string;
  contents: object;
}

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [convertedFile, setConvertedFile] = useState<ExcalidrawResponse | null>(
    null
  );
  const [isConverting, setIsConverting] = useState(false);

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setIsConverting(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("https://mastra.cloud/test", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Conversion failed");
      }

      const result: ExcalidrawResponse = await response.json();
      setConvertedFile(result);
      toast.success("Conversion successful!");
    } catch (error) {
      toast.error("Failed to convert image");
      console.error("Error:", error);
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (!convertedFile) return;

    const blob = new Blob([JSON.stringify(convertedFile.contents)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = convertedFile.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-12">
        <div className="space-y-8 animate-fade-up">
          <div className="text-center space-y-4">
            <div className="inline-block px-4 py-1 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4">
              Convert with ease
            </div>
            <h1 className="text-4xl font-bold tracking-tight">
              Whiteboard to Excalidraw Converter
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Transform your whiteboard photos into editable Excalidraw files with
              just a click. Upload an image or take a photo to get started.
            </p>
          </div>

          {!selectedFile ? (
            <FileUploader onFileSelect={handleFileSelect} />
          ) : (
            <FilePreview
              file={selectedFile}
              onDownload={convertedFile ? handleDownload : undefined}
            />
          )}

          {isConverting && (
            <div className="text-center text-sm text-muted-foreground animate-pulse">
              Converting your image...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
