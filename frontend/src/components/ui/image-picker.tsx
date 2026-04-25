import { useRef, useState } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { uploadService } from '@/services/upload.service';
import { Button } from './button';

interface ImagePickerProps {
  value?: string;           // current imageUrl (relative path)
  onChange: (url: string | undefined) => void;
}

export function ImagePicker({ value, onChange }: ImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const url = await uploadService.uploadPostImage(file);
      onChange(url);
    } catch {
      setError('Upload failed. Max 10 MB, JPEG/PNG/WebP only.');
    } finally {
      setUploading(false);
    }
  };

  const resolvedUrl = value ? uploadService.resolve(value) : null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImagePlus className="h-4 w-4" />
          )}
          {value ? 'Change image' : 'Add image'}
        </Button>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-1 text-muted-foreground"
            onClick={() => onChange(undefined)}
          >
            <X className="h-4 w-4" /> Remove
          </Button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = '';
          }}
        />
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {resolvedUrl && (
        <div className="relative w-full overflow-hidden rounded-md border">
          <img
            src={resolvedUrl}
            alt="Post image preview"
            className="max-h-48 w-full object-cover"
          />
        </div>
      )}
    </div>
  );
}
