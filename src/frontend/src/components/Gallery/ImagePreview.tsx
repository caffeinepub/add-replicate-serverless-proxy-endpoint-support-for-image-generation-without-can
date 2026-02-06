import { ExternalBlob } from '../../backend';

interface ImagePreviewProps {
  blob: ExternalBlob;
  alt: string;
}

export default function ImagePreview({ blob, alt }: ImagePreviewProps) {
  const imageUrl = blob.getDirectURL();

  return (
    <div className="aspect-square bg-muted rounded-lg overflow-hidden">
      <img
        src={imageUrl}
        alt={alt}
        className="w-full h-full object-cover"
        loading="lazy"
        onError={(e) => {
          console.error('Image failed to load:', imageUrl);
          e.currentTarget.style.display = 'none';
        }}
      />
    </div>
  );
}
