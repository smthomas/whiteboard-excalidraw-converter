
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface FilePreviewProps {
  file: File;
  onDownload?: () => void;
}

export const FilePreview = ({ file, onDownload }: FilePreviewProps) => {
  return (
    <div className="flex flex-col items-center gap-4 p-6 border rounded-lg animate-fade-in">
      <img
        src={URL.createObjectURL(file)}
        alt="Preview"
        className="max-w-full h-auto rounded-lg shadow-lg"
        style={{ maxHeight: "400px" }}
      />
      <div className="flex items-center gap-4">
        <p className="text-sm text-muted-foreground">{file.name}</p>
        {onDownload && (
          <Button
            onClick={onDownload}
            className="flex items-center gap-2"
            variant="outline"
          >
            <Download className="w-4 h-4" />
            Download Excalidraw
          </Button>
        )}
      </div>
    </div>
  );
};
